import { spawn } from "node:child_process";

const children = [];

function start(scriptName) {
  const child =
    process.platform === "win32"
      ? spawn("cmd.exe", ["/d", "/s", "/c", `npm run ${scriptName}`], {
          stdio: "inherit",
          env: process.env,
        })
      : spawn("npm", ["run", scriptName], {
          stdio: "inherit",
          env: process.env,
        });

  children.push(child);
  child.on("exit", (code) => {
    if (code && code !== 0) {
      process.exitCode = code;
      shutdown();
    }
  });
}

function shutdown() {
  while (children.length) {
    const child = children.pop();
    if (child && !child.killed) {
      child.kill();
    }
  }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

start("dev:api");
start("dev:web");
