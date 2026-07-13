import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const projectRoot = process.cwd();
const outPath = path.join(projectRoot, "dev-server.out.log");
const errPath = path.join(projectRoot, "dev-server.err.log");

const cleanEnv = {};
let pathValue = "";

for (const [key, value] of Object.entries(process.env)) {
  if (key.toLowerCase() === "path") {
    pathValue ||= value || "";
    continue;
  }
  cleanEnv[key] = value;
}

cleanEnv.Path = pathValue;

const out = fs.openSync(outPath, "a");
const err = fs.openSync(errPath, "a");

const child = spawn(
  "C:\\Progra~1\\nodejs\\npm.cmd",
  ["run", "dev", "--", "--port", "3000"],
  {
    cwd: projectRoot,
    env: cleanEnv,
    detached: true,
    shell: true,
    windowsHide: true,
    stdio: ["ignore", out, err],
  },
);

child.unref();
console.log(child.pid);
