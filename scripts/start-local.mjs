import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const vitePath = path.join(projectRoot, "node_modules/vite/bin/vite.js");
const pageUrl = "http://127.0.0.1:3000/dashboard";
const children = [];
let stopping = false;

const services = [
  {
    name: "后端",
    url: "http://127.0.0.1:8787/api/auth/session",
    args: ["server/auth-server.mjs"],
    matches: (status, body) =>
      status === 401 && body.includes("Session expired or missing."),
  },
  {
    name: "前端",
    url: "http://127.0.0.1:3000/@vite/client",
    args: [vitePath, "--host", "127.0.0.1", "--port", "3000", "--strictPort"],
    matches: (status, body) => status === 200 && body.includes("[vite]"),
  },
];

function shutdown() {
  stopping = true;
  for (const child of children) {
    if (child.exitCode === null && !child.killed) child.kill();
  }
}

process.on("exit", shutdown);
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    shutdown();
    process.exit(0);
  });
}

async function isReady(service) {
  let response;
  let body;
  try {
    response = await fetch(service.url, { signal: AbortSignal.timeout(2000) });
    body = await response.text();
  } catch (error) {
    if (error.cause?.code === "ECONNREFUSED") return false;
    throw new Error(`${service.name}连接失败：${error.message}`);
  }
  if (!service.matches(response.status, body)) {
    throw new Error(`${service.name}端口已被其他服务占用：${service.url}`);
  }
  return true;
}

function startService(service) {
  console.log(`[启动] ${service.name}`);
  const child = spawn(process.execPath, service.args, {
    cwd: projectRoot,
    stdio: "inherit",
    env: { ...process.env, ADMIN_AUTH_PORT: "8787" },
  });
  children.push(child);
  child.on("error", (error) => {
    console.error(`[失败] ${service.name}：${error.message}`);
    process.exit(1);
  });
  child.on("exit", (code) => {
    if (!stopping) {
      console.error(`[失败] ${service.name}已退出，退出码：${code}`);
      process.exit(1);
    }
  });
}

async function waitUntilReady(service) {
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    if (await isReady(service)) return;
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`${service.name}在 30 秒内未能启动，请查看上方日志。`);
}

async function main() {
  if (Number(process.versions.node.split(".")[0]) < 20) {
    throw new Error("需要 Node.js 20 或更新版本。");
  }
  if (!existsSync(vitePath)) {
    throw new Error(`依赖尚未安装。请在 ${projectRoot} 中运行 npm install。`);
  }

  const ready = await Promise.all(services.map(isReady));
  services.forEach((service, index) => {
    if (ready[index]) console.log(`[复用] ${service.name}已运行。`);
    else startService(service);
  });
  await Promise.all(services.map(waitUntilReady));
  console.log(`\n项目已启动：${pageUrl}`);
  if (children.length) console.log("请保留此窗口；按 Ctrl+C 停止本窗口启动的服务。\n");

  if (!process.argv.includes("--no-open")) {
    const browser = spawn(process.env.ComSpec || "cmd.exe", ["/d", "/c", "start", "", pageUrl], {
      stdio: "ignore",
      windowsHide: true,
    });
    browser.on("error", () => console.log(`请手动打开：${pageUrl}`));
  }
}

main().catch((error) => {
  console.error(`[失败] ${error.message}`);
  process.exit(1);
});
