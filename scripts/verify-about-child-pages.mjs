import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { spawn, spawnSync } from "node:child_process";

const chromeEndpoint = "http://127.0.0.1:9223";
const localUrl = "http://127.0.0.1:3033";
const outputDirectory = resolve("artifacts/layout-audit");
const routes = ["/quote", "/consultant", "/bursary", "/feedback"];
const viewports = [
  { name: "desktop", width: 1440, height: 1000, mobile: false },
  { name: "mobile", width: 390, height: 844, mobile: true },
];

function wait(milliseconds) {
  return new Promise((resolveWait) => setTimeout(resolveWait, milliseconds));
}

async function waitForServer(logs) {
  const deadline = Date.now() + 20000;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(localUrl);
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

function slugName(route) {
  return route.replace(/^\//, "");
}

async function auditRoute(page, route, viewport) {
  await page.send("Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    mobile: viewport.mobile,
    screenWidth: viewport.width,
    screenHeight: viewport.height,
  });
  await page.send("Emulation.setTouchEmulationEnabled", { enabled: viewport.mobile });

  const firstEvent = page.events.length;
  await page.send("Page.navigate", { url: `${localUrl}${route}` });
  await wait(route === "/bursary" ? 7000 : 3000);

  const metrics = await evaluate(
    page,
    `JSON.stringify((() => {
      const viewportWidth = window.innerWidth;
      const rectangle = (element) => {
        const value = element.getBoundingClientRect();
        return {
          x: Math.round(value.x),
          y: Math.round(value.y),
          width: Math.round(value.width),
          height: Math.round(value.height),
          right: Math.round(value.right),
          bottom: Math.round(value.bottom)
        };
      };
      const visible = (element) => {
        if (!element) return false;
        const value = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return style.display !== "none" &&
          style.visibility !== "hidden" &&
          value.width >= 24 &&
          value.height >= 24 &&
          value.right > 0 &&
          value.x < viewportWidth;
      };
      const horizontalElements = [...document.querySelectorAll("body *")]
        .filter((element) => {
          const value = element.getBoundingClientRect();
          return getComputedStyle(element).position !== "fixed" &&
            value.width > 0 &&
            (value.right > viewportWidth + 1 || value.x < -1);
        })
        .filter((element) => !element.closest(".slick-track"))
        .slice(0, 20)
        .map((element) => ({
          tag: element.tagName,
          className: typeof element.className === "string" ? element.className : "",
          rectangle: rectangle(element)
        }));
      const brokenImages = [...document.images]
        .filter((image) => image.currentSrc && (!image.complete || image.naturalWidth === 0))
        .slice(0, 20)
        .map((image) => image.currentSrc);
      const backgroundElements = [...document.querySelectorAll("#page-banner, #bursary-banner .single-slider")]
        .slice(0, 6)
        .map((element) => ({
          className: typeof element.className === "string" ? element.className : "",
          backgroundImage: getComputedStyle(element).backgroundImage,
          rectangle: rectangle(element)
        }));
      const controls = [...document.querySelectorAll("a.main-btn, button, .slick-arrow, .navbar-toggler, .sub-nav-toggler")]
        .map((element) => ({
          tag: element.tagName,
          text: (element.textContent || "").trim(),
          className: typeof element.className === "string" ? element.className : "",
          rectangle: rectangle(element),
          visible: visible(element)
        }));
      const overlays = [...document.querySelectorAll(".legacy-lightbox, .mfp-wrap, .mfp-bg")]
        .map((element) => ({
          className: typeof element.className === "string" ? element.className : "",
          rectangle: rectangle(element),
          display: getComputedStyle(element).display,
          visibility: getComputedStyle(element).visibility
        }));

      return {
        title: document.title,
        href: location.href,
        text: document.body.innerText,
        horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        horizontalElements,
        brokenImages,
        backgroundElements,
        controls,
        overlays,
        quoteCard: document.querySelector(".quote-name") ? rectangle(document.querySelector(".quote-name")) : null,
        consultantListCount: document.querySelectorAll(".previous-committee-wrapper li").length,
        bursarySlideCount: document.querySelectorAll("#bursary-banner .single-slider").length,
        feedbackContact: Boolean(document.querySelector(".web-feedback-contact a[href^='tel:']"))
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
  const fileName = `local-${slugName(route)}-${viewport.name}-after-about-pages.png`;
  await writeFile(resolve(outputDirectory, fileName), Buffer.from(screenshot.data, "base64"));

  return {
    route,
    viewport: viewport.name,
    browserErrors,
    screenshot: resolve(outputDirectory, fileName),
    ...metrics,
  };
}

const serverLogs = [];
const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "-p", "3033"],
  {
    cwd: process.cwd(),
    stdio: ["ignore", "pipe", "pipe"],
  },
);

server.stdout.on("data", (data) => serverLogs.push(data.toString()));
server.stderr.on("data", (data) => serverLogs.push(data.toString()));

try {
  await mkdir(outputDirectory, { recursive: true });
  await waitForServer(serverLogs);

  const page = await createPage();
  await page.send("Page.enable");
  await page.send("Runtime.enable");
  await page.send("Log.enable");
  await page.send("Network.enable");

  const audits = [];
  try {
    for (const route of routes) {
      for (const viewport of viewports) {
        audits.push(await auditRoute(page, route, viewport));
      }
    }
  } finally {
    page.close();
  }

  const failures = audits.filter((audit) => {
    const requiredText =
      audit.route === "/quote"
        ? audit.text.includes("拿督斯里范长锡国会议员") && audit.text.includes("献词")
        : audit.route === "/consultant"
          ? audit.consultantListCount === 50 && audit.text.includes("泗里街高级(华侨)中学校友会顾问团名单")
          : audit.route === "/bursary"
            ? audit.bursarySlideCount >= 3 && audit.text.includes("共筑梦想 扶助未来")
            : audit.feedbackContact && audit.text.includes("开发团队感言");

    return (
      audit.horizontalOverflow !== 0 ||
      audit.horizontalElements.length > 0 ||
      audit.brokenImages.length > 0 ||
      audit.browserErrors.length > 0 ||
      !requiredText
    );
  });

  const summary = audits.map((audit) => ({
    route: audit.route,
    viewport: audit.viewport,
    horizontalOverflow: audit.horizontalOverflow,
    horizontalElementCount: audit.horizontalElements.length,
    brokenImageCount: audit.brokenImages.length,
    browserErrors: audit.browserErrors,
    consultantListCount: audit.consultantListCount,
    bursarySlideCount: audit.bursarySlideCount,
    feedbackContact: audit.feedbackContact,
    screenshot: audit.screenshot,
  }));

  console.log(JSON.stringify(summary, null, 2));

  if (failures.length) {
    console.error(JSON.stringify(failures, null, 2));
    process.exitCode = 1;
  }
} finally {
  if (server.pid) {
    spawnSync("taskkill", ["/pid", String(server.pid), "/t", "/f"], { stdio: "ignore" });
  }
  server.stdout.destroy();
  server.stderr.destroy();
}

process.exit(process.exitCode ?? 0);
