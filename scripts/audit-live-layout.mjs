import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const chromeEndpoint = "http://127.0.0.1:9223";
const outputDirectory = resolve("artifacts/layout-audit");
const auditPath = process.env.AUDIT_PATH || "/";
const routeFileName = auditPath === "/" ? "home" : auditPath.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "");
const navigationWait = Number(process.env.AUDIT_WAIT_MS || 6500);
const targets = [
  { name: "old", url: new URL(auditPath, "https://stsalumniassociation.com/").toString() },
  { name: "new", url: new URL(auditPath, "https://sts-alumni-association.vercel.app/").toString() },
];
if (process.env.AUDIT_LOCAL_URL) {
  targets.push({ name: "local", url: new URL(auditPath, process.env.AUDIT_LOCAL_URL).toString() });
}
if (process.env.AUDIT_TARGET) {
  const selectedTarget = targets.find((target) => target.name === process.env.AUDIT_TARGET);
  if (!selectedTarget) {
    throw new Error(`Unknown audit target: ${process.env.AUDIT_TARGET}`);
  }
  targets.splice(0, targets.length, selectedTarget);
}
const viewports = [
  { name: "desktop", width: 1440, height: 1000, mobile: false },
  { name: "mobile", width: 390, height: 844, mobile: true },
];

function wait(milliseconds) {
  return new Promise((resolveWait) => setTimeout(resolveWait, milliseconds));
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

const auditExpression = `JSON.stringify((() => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const rectangle = (element) => {
    const value = element.getBoundingClientRect();
    return {
      x: Math.round(value.x),
      y: Math.round(value.y),
      width: Math.round(value.width),
      height: Math.round(value.height),
      right: Math.round(value.right),
      bottom: Math.round(value.bottom),
    };
  };
  const style = (element) => {
    const value = getComputedStyle(element);
    return {
      display: value.display,
      visibility: value.visibility,
      position: value.position,
      pointerEvents: value.pointerEvents,
    };
  };
  const controls = [...document.querySelectorAll("a.main-btn, button, .slick-arrow, .navbar-toggler, .sub-nav-toggler")]
    .map((element) => ({
      tag: element.tagName,
      className: typeof element.className === "string" ? element.className : "",
      text: (element.textContent || "").trim().slice(0, 60),
      rectangle: rectangle(element),
      style: style(element),
    }));
  const unreachableControls = controls.filter((control) =>
    control.style.display !== "none" &&
    control.style.visibility !== "hidden" &&
    (control.rectangle.width < 24 || control.rectangle.height < 24 || control.rectangle.right < 0 || control.rectangle.x > viewportWidth)
  );
  const horizontalElements = [...document.querySelectorAll("body *")]
    .filter((element) => {
      const value = element.getBoundingClientRect();
      return getComputedStyle(element).position !== "fixed" &&
        value.width > 0 &&
        (value.right > viewportWidth + 1 || value.x < -1);
    })
    .filter((element) => !element.closest(".slick-track"))
    .slice(0, 30)
    .map((element) => ({
      tag: element.tagName,
      className: typeof element.className === "string" ? element.className : "",
      rectangle: rectangle(element),
    }));
  const sliders = [...document.querySelectorAll(".slick-slider")].map((element) => {
    const list = element.querySelector(".slick-list");
    const track = element.querySelector(".slick-track");
    const slides = [...element.querySelectorAll(":scope .slick-slide")]
      .slice(0, 3)
      .map((slide) => ({
        className: typeof slide.className === "string" ? slide.className : "",
        dataIndex: slide.getAttribute("data-index"),
        rectangle: rectangle(slide),
        display: getComputedStyle(slide).display,
        float: getComputedStyle(slide).float,
        flex: getComputedStyle(slide).flex,
        opacity: getComputedStyle(slide).opacity,
        zIndex: getComputedStyle(slide).zIndex,
        width: getComputedStyle(slide).width,
      }));
    return {
      className: typeof element.className === "string" ? element.className : "",
      rectangle: rectangle(element),
      list: list ? rectangle(list) : null,
      track: track ? rectangle(track) : null,
      display: getComputedStyle(element).display,
      trackDisplay: track ? getComputedStyle(track).display : null,
      slides,
    };
  });
  const overlays = [...document.querySelectorAll(".legacy-lightbox, .mfp-wrap, .mfp-bg")]
    .map((element) => ({
      className: typeof element.className === "string" ? element.className : "",
      rectangle: rectangle(element),
      style: style(element),
    }));
  const layerAtHeroCenter = document.elementsFromPoint(Math.round(viewportWidth / 2), 300)
    .slice(0, 12)
    .map((element) => {
      const computed = getComputedStyle(element);
      const before = getComputedStyle(element, "::before");
      return {
        tag: element.tagName,
        className: typeof element.className === "string" ? element.className : "",
        backgroundColor: computed.backgroundColor,
        backgroundImage: computed.backgroundImage,
        opacity: computed.opacity,
        position: computed.position,
        zIndex: computed.zIndex,
        beforeBackgroundColor: before.backgroundColor,
        beforeOpacity: before.opacity,
        beforePosition: before.position,
        beforeZIndex: before.zIndex,
      };
    });
  const elementMetrics = (selector) => [...document.querySelectorAll(selector)]
    .slice(0, 3)
    .map((element) => {
      const computed = getComputedStyle(element);
      return {
        selector,
        text: (element.textContent || "").trim().slice(0, 80),
        rectangle: rectangle(element),
        display: computed.display,
        color: computed.color,
        fontFamily: computed.fontFamily,
        fontSize: computed.fontSize,
        fontWeight: computed.fontWeight,
        lineHeight: computed.lineHeight,
        margin: computed.margin,
        padding: computed.padding,
      };
    });
  const ancestorMetrics = (selector) => {
    const element = document.querySelector(selector);
    if (!element) return null;

    return [element, element.parentElement, element.parentElement?.parentElement]
      .filter(Boolean)
      .map((node) => ({
        tag: node.tagName,
        className: typeof node.className === "string" ? node.className : "",
        rectangle: rectangle(node),
        display: getComputedStyle(node).display,
        width: getComputedStyle(node).width,
      }));
  };
  return {
    title: document.title,
    href: location.href,
    readyState: document.readyState,
    viewport: { width: viewportWidth, height: viewportHeight },
    documentWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    textLength: document.body.innerText.trim().length,
    header: document.querySelector("#header-part")
      ? rectangle(document.querySelector("#header-part"))
      : null,
    logo: document.querySelector(".logo img")
      ? rectangle(document.querySelector(".logo img"))
      : null,
    headerLogo: document.querySelector("#header-part .navbar-brand img")
      ? rectangle(document.querySelector("#header-part .navbar-brand img"))
      : null,
    nav: document.querySelector(".navbar-collapse")
      ? {
          rectangle: rectangle(document.querySelector(".navbar-collapse")),
          style: style(document.querySelector(".navbar-collapse")),
        }
      : null,
    navLinks: elementMetrics(".navbar-nav > .nav-item > a"),
    hero: document.querySelector(".single-slider")
      ? {
          rectangle: rectangle(document.querySelector(".single-slider")),
          backgroundImage: getComputedStyle(document.querySelector(".single-slider")).backgroundImage,
        }
      : null,
    heroHeadings: elementMetrics("#slider-part .single-slider .slider-cont h1"),
    heroParagraphs: elementMetrics("#slider-part .single-slider .slider-cont p"),
    heroButtons: elementMetrics("#slider-part .single-slider .main-btn"),
    educationHeadings: elementMetrics("#slider-part-edu .single-slider .slider-cont h1"),
    slideBackgrounds: [...document.querySelectorAll(".single-slider")]
      .slice(0, 8)
      .map((element) => ({
        className: typeof element.className === "string" ? element.className : "",
        computedBackgroundImage: getComputedStyle(element).backgroundImage,
        inlineStyle: element.getAttribute("style"),
        rectangle: rectangle(element),
      })),
    imageResources: performance.getEntriesByType("resource")
      .filter((entry) => entry.initiatorType === "img" || entry.initiatorType === "css")
      .map((entry) => ({
        name: entry.name,
        initiatorType: entry.initiatorType,
        responseStatus: entry.responseStatus || null,
      }))
      .filter((entry) =>
        entry.name.includes("r2.dev") ||
        entry.name.includes("r2.cloudflarestorage") ||
        entry.name.includes("Snapseed") ||
        entry.name.includes("wp-content"),
      ),
    categoryCards: elementMetrics(".category-slied .singel-category"),
    categoryIcons: elementMetrics(".category-slied .singel-category .icon img"),
    categoryLabels: elementMetrics(".category-slied .singel-category .cont > span"),
    categoryLinks: elementMetrics(".category-slied a"),
    categoryAncestors: ancestorMetrics(".category-slied .singel-category"),
    courseCards: elementMetrics(".course-slied .singel-course"),
    courseAncestors: ancestorMetrics(".course-slied .singel-course"),
    courseImages: elementMetrics(".course-slied .image img"),
    testimonials: elementMetrics(".testimonial-slied .singel-testimonial"),
    partners: elementMetrics(".patnar-slied .singel-patnar img"),
    partnerAncestors: ancestorMetrics(".patnar-slied .singel-patnar img"),
    controls,
    unreachableControls,
    horizontalElements,
    sliders,
    overlays,
    layerAtHeroCenter,
  };
})())`;

async function auditPage(page, target, viewport) {
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
  await page.send("Page.navigate", { url: target.url });
  await wait(navigationWait);

  const evaluation = await page.send("Runtime.evaluate", {
    expression: auditExpression,
    returnByValue: true,
    awaitPromise: true,
  });
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
    );

  const fileName = `${target.name}-${routeFileName}-${viewport.name}.png`;
  await writeFile(resolve(outputDirectory, fileName), Buffer.from(screenshot.data, "base64"));

  return {
    target: target.name,
    viewport: viewport.name,
    browserErrors,
    screenshot: resolve(outputDirectory, fileName),
    ...JSON.parse(evaluation.result.value),
  };
}

await mkdir(outputDirectory, { recursive: true });
const page = await createPage();
await page.send("Page.enable");
await page.send("Runtime.enable");
await page.send("Log.enable");
await page.send("Network.enable");

try {
  const audits = [];
  for (const target of targets) {
    for (const viewport of viewports) {
      audits.push(await auditPage(page, target, viewport));
    }
  }
  await writeFile(
    resolve(outputDirectory, "summary.json"),
    JSON.stringify(audits, null, 2),
  );
  console.log(
    JSON.stringify(
      audits.map((audit) => ({
        target: audit.target,
        viewport: audit.viewport,
        horizontalOverflow: audit.horizontalOverflow,
        browserErrors: audit.browserErrors,
        unreachableControlCount: audit.unreachableControls.length,
        horizontalElementCount: audit.horizontalElements.length,
        sliderGeometry: audit.sliders.map((slider) => ({
          className: slider.className,
          width: slider.rectangle.width,
          height: slider.rectangle.height,
        })),
      })),
      null,
      2,
    ),
  );
} finally {
  page.close();
}
