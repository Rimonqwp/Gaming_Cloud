const [major] = process.versions.node.split(".").map(Number);

const isUnsupportedWindowsNode = process.platform === "win32" && major >= 24;

if (isUnsupportedWindowsNode) {
  console.warn("");
  console.warn("[dev-check] Node.js 24+ on Windows: official support is Node 22 LTS.");
  console.warn("[dev-check] Current version:", process.version, "— continuing; if native deps fail, use Node 22.");
  console.warn("");
}
