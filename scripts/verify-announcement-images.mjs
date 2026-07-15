import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { spawn, spawnSync } from "node:child_process";
import siteData from "../src/data/generated/site-data.json" with { type: "json" };

const chromeEndpoint = "http://127.0.0.1:9223";
const localUrl = "http://127.0.0.1:3034";
const baseUrl = (process.env.VERIFY_BASE_URL || localUrl).replace(/\/$/, "");
const shouldStartServer = baseUrl === localUrl;
const runLabel = baseUrl.includes("127.0.0.1") ? "local" : "remote";
const outputDirectory = resolve("artifacts/layout-audit");
const routes = [
  "/announcement",
  "/announcement/page/2",
  ...siteData.announcements.map((item) => `/announcement/${encodeURIComponent(item.slug)}`),
];

function wait(milliseconds) {
  return new Promise((resolveWait) => setTimeout(resolveWait, milliseconds));
}

async function waitForServer(logs) {
  const deadline = Date.now() + 20000;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // Keep waiting.
    }

    await wait(500);
  }

  throw new Error(`Next server did not start.\n${logs.join("")}`);
}

async function createPage() {
  const targetResponse = await fetch(`${chromeEndpoint}/json/new?about:blank`, {
    method: "PUT",
  });
  const target = await targetResponse.json();
  const socket = new WebSocket(target.webSocketDebuggerUrl);

  await new Promise((resolveOpen, rejectOpen) => {
    socket.addEventListener("open", resolveOpen, { once: true });
    socket.addEventListener("error", rejectOpen, { once: true });
  });

  let nextId = 1;
  const pending = new Map();
  const events = [];

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id === undefined) {
      events.push(message);
      return;
    }

    const request = pending.get(message.id);
    if (!request) return;

    pending.delete(message.id);
    if (message.error) {
      request.reject(new Error(message.error.message));
    } else {
      request.resolve(message.result);
    }
  });

  return {
    events,
    send(method, params = {}) {
      return new Promise((resolveSend, rejectSend) => {
        const id = nextId++;
        pending.set(id, { resolve: resolveSend, reject: rejectSend });
        socket.send(JSON.stringify({ id, method, params }));
      });
    },
    close() {
      socket.close();
    },
  };
}

async function evaluate(page, expression) {
  const result = await page.send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });

  return JSON.parse(result.result.value);
}

async function auditRoute(page, route) {
  await page.send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
    screenWidth: 1440,
    screenHeight: 1000,
  });

  const firstEvent = page.events.length;
  await page.send("Page.navigate", { url: `${baseUrl}${route}` });
  await wait(2500);

  const metrics = await evaluate(
    page,
    `JSON.stringify((() => {
      const images = [...document.querySelectorAll(".blog-thum img, .legacy-detail-cover img, .saidbar-post img")];
      const brokenImages = images
        .filter((image) => !image.complete || image.naturalWidth === 0)
        .map((image) => image.currentSrc || image.src);
      const oldWordPressImages = images
        .filter((image) => (image.currentSrc || image.src).includes("stsalumniassociation.com/wp-content"))
        .map((image) => image.currentSrc || image.src);
      return {
        href: location.href,
        imageCount: images.length,
        imageSources: images.map((image) => image.currentSrc || image.src),
        brokenImages,
        oldWordPressImages,
        horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
      };
    })())`,
  );
  const screenshot = await page.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false,
  });
  const browserErrors = page.events
    .slice(firstEvent)
    .filter(
      (event) =>
        event.method === "Log.entryAdded" ||
        event.method === "Runtime.exceptionThrown" ||
        event.method === "Network.loadingFailed",
    )
    .map(
      (event) =>
        event.params.entry?.text ||
        event.params.exceptionDetails?.text ||
        event.params.errorText ||
        event.method,
    )
    .filter((message) => !String(message).includes("net::ERR_ABORTED"));

  const fileName = `${runLabel}-${route.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "")}-announcement-images.png`;
  await writeFile(resolve(outputDirectory, fileName), Buffer.from(screenshot.data, "base64"));

  return {
    route,
    browserErrors,
    screenshot: resolve(outputDirectory, fileName),
    ...metrics,
  };
}

const serverLogs = [];
let server = null;

if (shouldStartServer) {
  server = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "-p", "3034"],
    {
      cwd: process.cwd(),
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  server.stdout.on("data", (data) => serverLogs.push(data.toString()));
  server.stderr.on("data", (data) => serverLogs.push(data.toString()));
}

try {
  await mkdir(outputDirectory, { recursive: true });
  if (shouldStartServer) {
    await waitForServer(serverLogs);
  }

  const page = await createPage();
  await page.send("Page.enable");
  await page.send("Runtime.enable");
  await page.send("Log.enable");
  await page.send("Network.enable");

  const audits = [];
  try {
    for (const route of routes) {
      audits.push(await auditRoute(page, route));
    }
  } finally {
    page.close();
  }

  const failures = audits.filter(
    (audit) =>
      audit.imageCount === 0 ||
      audit.brokenImages.length > 0 ||
      audit.oldWordPressImages.length > 0 ||
      audit.browserErrors.length > 0 ||
      audit.horizontalOverflow !== 0,
  );
  const summary = audits.map((audit) => ({
    baseUrl,
    route: audit.route,
    imageCount: audit.imageCount,
    brokenImageCount: audit.brokenImages.length,
    oldWordPressImageCount: audit.oldWordPressImages.length,
    horizontalOverflow: audit.horizontalOverflow,
    browserErrors: audit.browserErrors,
    screenshot: audit.screenshot,
  }));

  console.log(JSON.stringify(summary, null, 2));

  if (failures.length) {
    console.error(JSON.stringify(failures, null, 2));
    process.exitCode = 1;
  }
} finally {
  if (server?.pid) {
    spawnSync("taskkill", ["/pid", String(server.pid), "/t", "/f"], { stdio: "ignore" });
  }
  server?.stdout.destroy();
  server?.stderr.destroy();
}

process.exit(process.exitCode ?? 0);
