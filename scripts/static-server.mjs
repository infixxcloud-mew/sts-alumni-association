import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const outRoot = path.join(projectRoot, "out");
const port = Number(process.env.PORT || 3000);

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".bmp": "image/bmp",
};

function resolveRequestPath(urlPathname) {
  const decoded = decodeURIComponent(urlPathname);
  const cleanPath = decoded.replace(/^\/+/, "");
  const candidate = path.resolve(outRoot, cleanPath);

  if (!candidate.startsWith(outRoot)) {
    return null;
  }

  if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
    return candidate;
  }

  const htmlPath = path.join(candidate, "index.html");
  if (fs.existsSync(htmlPath)) return htmlPath;

  const extensionHtmlPath = `${candidate}.html`;
  if (fs.existsSync(extensionHtmlPath)) return extensionHtmlPath;

  const notFoundPath = path.join(outRoot, "404.html");
  if (fs.existsSync(notFoundPath)) return notFoundPath;

  return null;
}

http
  .createServer((request, response) => {
    const url = new URL(request.url || "/", `http://${request.headers.host}`);
    const filePath = resolveRequestPath(url.pathname);

    if (!filePath) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    response.writeHead(filePath.endsWith("404.html") ? 404 : 200, {
      "Content-Type": contentTypes[ext] || "application/octet-stream",
    });
    fs.createReadStream(filePath).pipe(response);
  })
  .listen(port, () => {
    console.log(`Static server ready on http://localhost:${port}`);
  });
