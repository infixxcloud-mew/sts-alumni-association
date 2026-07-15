import { spawn, spawnSync } from "node:child_process";

const route =
  "/gallery/%E6%A0%A1%E5%8F%8B%E4%BC%9A21%E5%91%A8%E5%B9%B4%E6%84%9F%E6%81%A9%E5%AE%B4";
const localUrl = "http://127.0.0.1:3032";
const chromeEndpoint = "http://127.0.0.1:9223";

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
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

  throw new Error(`Next preview did not start.\n${logs.join("")}`);
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

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id === undefined) return;

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

const serverLogs = [];
const server = spawn("cmd.exe", ["/c", "npm.cmd", "start", "--", "-p", "3032"], {
  cwd: process.cwd(),
  stdio: ["ignore", "pipe", "pipe"],
});

server.stdout.on("data", (data) => serverLogs.push(data.toString()));
server.stderr.on("data", (data) => serverLogs.push(data.toString()));

try {
  await waitForServer(serverLogs);
  const page = await createPage();
  await page.send("Page.enable");
  await page.send("Runtime.enable");
  await page.send("Emulation.setDeviceMetricsOverride", {
    width: 1157,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
    screenWidth: 1157,
    screenHeight: 900,
  });
  await page.send("Page.navigate", { url: `${localUrl}${route}` });
  await wait(2500);

  const result = await evaluate(
    page,
    `(async () => {
      const rect = (element) => {
        const value = element.getBoundingClientRect();
        return {
          x: Math.round(value.x),
          y: Math.round(value.y),
          width: Math.round(value.width),
          right: Math.round(value.right)
        };
      };
      const cover = document.querySelector(".legacy-detail-cover img");
      const coverBox = document.querySelector(".legacy-detail-cover");
      const first = document.querySelector(".legacy-photo");
      first?.click();
      await new Promise((resolve) => setTimeout(resolve, 400));
      const zoomIn = document.querySelector(".legacy-lightbox-zoom-in");
      const zoomOut = document.querySelector(".legacy-lightbox-zoom-out");
      const next = document.querySelector(".legacy-lightbox-next");
      const prev = document.querySelector(".legacy-lightbox-prev");
      const imageBefore = document.querySelector(".legacy-lightbox-image")?.src || "";
      zoomIn?.click();
      await new Promise((resolve) => setTimeout(resolve, 80));
      const transformAfterZoom = getComputedStyle(document.querySelector(".legacy-lightbox-image")).transform;
      next?.click();
      await new Promise((resolve) => setTimeout(resolve, 120));
      const imageAfterNext = document.querySelector(".legacy-lightbox-image")?.src || "";

      return {
        horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        captionCount: document.querySelectorAll(".legacy-photo span").length,
        photoCount: document.querySelectorAll(".legacy-photo").length,
        groupedPhotoCount: document.querySelectorAll(".legacy-photo[data-legacy-lightbox-group]").length,
        cover: cover ? rect(cover) : null,
        coverBox: coverBox ? rect(coverBox) : null,
        coverCenterDelta: cover && coverBox
          ? Math.round((cover.getBoundingClientRect().left + cover.getBoundingClientRect().width / 2) - (coverBox.getBoundingClientRect().left + coverBox.getBoundingClientRect().width / 2))
          : null,
        lightboxOpen: Boolean(document.querySelector(".legacy-lightbox")),
        controls: {
          prev: Boolean(prev),
          next: Boolean(next),
          zoomIn: Boolean(zoomIn),
          zoomOut: Boolean(zoomOut)
        },
        imageChangedOnNext: imageBefore !== imageAfterNext,
        transformAfterZoom
      };
    })().then((result) => JSON.stringify(result))`,
  );

  page.close();

  if (
    result.horizontalOverflow !== 0 ||
    result.captionCount !== 0 ||
    result.photoCount === 0 ||
    result.groupedPhotoCount !== result.photoCount ||
    Math.abs(result.coverCenterDelta ?? 999) > 1 ||
    !result.lightboxOpen ||
    !result.controls.prev ||
    !result.controls.next ||
    !result.controls.zoomIn ||
    !result.controls.zoomOut ||
    !result.imageChangedOnNext ||
    result.transformAfterZoom === "none"
  ) {
    console.error(JSON.stringify(result, null, 2));
    process.exitCode = 1;
  } else {
    console.log(JSON.stringify(result, null, 2));
  }
} finally {
  spawnSync("taskkill", ["/PID", String(server.pid), "/T", "/F"], {
    encoding: "utf8",
  });
}
