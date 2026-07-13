import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const projectRoot = process.cwd();
const out = fs.openSync(path.join(projectRoot, "static-server.out.log"), "a");
const err = fs.openSync(path.join(projectRoot, "static-server.err.log"), "a");

const child = spawn(process.execPath, ["scripts/static-server.mjs"], {
  cwd: projectRoot,
  detached: true,
  windowsHide: true,
  stdio: ["ignore", out, err],
});

child.unref();
console.log(child.pid);
