export type TransferEntry = { path: string; folder: boolean; modified: string; created?: string; content?: Uint8Array; tags?: string[] };
export type FileClipboard<T extends TransferEntry> = { mode: "copy" | "cut"; paths: string[]; snapshot: T[] };
export type ConflictChoice = "replace" | "keep";
export type TransferConflict = { key: string; source: string; target: string; folder: boolean; canReplace: boolean };
export type TransferDecisions = { choices: Record<string, ConflictChoice>; all?: ConflictChoice };
export const containsPath = (path: string, parent: string) => path === parent || path.startsWith(parent + "/");
const parent = (path: string) => path.slice(0, path.lastIndexOf("/"));
const name = (path: string) => path.split("/").pop()!;
const clone = <T extends TransferEntry>(entry: T): T => ({ ...entry, content: entry.content?.slice(), tags: entry.tags?.slice() });

export function selectedRoots<T extends TransferEntry>(entries: T[], paths: string[], root: string): T[] {
  if (!paths.length || paths.some(path => path === root || !containsPath(path, root))) throw new Error("不能复制或剪切服务器根目录或范围外的项目");
  const selected = [...new Set(paths)].map(path => {
    const entry = entries.find(item => item.path === path);
    if (!entry) throw new Error("来源项目已不存在，请重新选择");
    return entry;
  });
  return selected.filter(entry => !selected.some(other => other.folder && other.path !== entry.path && containsPath(entry.path, other.path)));
}

export function captureFileClipboard<T extends TransferEntry>(entries: T[], paths: string[], mode: "copy" | "cut", root: string): FileClipboard<T> {
  const sources = selectedRoots(entries, paths, root);
  return { mode, paths: sources.map(entry => entry.path), snapshot: mode === "copy" ? entries.filter(entry => sources.some(source => containsPath(entry.path, source.path))).map(clone) : [] };
}

export function duplicatePath(path: string, folder: boolean, occupied: Set<string>) {
  const basename = name(path); const dot = folder ? -1 : basename.lastIndexOf(".");
  const stem = dot > 0 ? basename.slice(0, dot) : basename; const extension = dot > 0 ? basename.slice(dot) : "";
  let index = 1; let result: string;
  do { result = parent(path) + "/" + stem + " - 副本" + (index === 1 ? "" : ` (${index})`) + extension; index++; } while (occupied.has(result));
  return result;
}

export function validateTransferDestination<T extends TransferEntry>(entries: T[], clipboard: FileClipboard<T>, destination: string, root: string) {
  if (!containsPath(destination, root) || !entries.some(entry => entry.path === destination && entry.folder)) throw new Error("请选择有效的目标文件夹");
  const sourceEntries = clipboard.mode === "copy" ? clipboard.snapshot : entries;
  const sources = selectedRoots(sourceEntries, clipboard.paths, root);
  if (sources.some(entry => entry.folder && containsPath(destination, entry.path))) throw new Error("不能将文件夹复制或移动到自身或子文件夹");
  return { sourceEntries, sources };
}

export function planFileTransfer<T extends TransferEntry>(entries: T[], clipboard: FileClipboard<T>, destination: string, root: string, now: string, decisions: TransferDecisions = { choices: {} }) {
  const { sourceEntries, sources } = validateTransferDestination(entries, clipboard, destination, root);
  const moving = sources.filter(entry => clipboard.mode === "copy" || parent(entry.path) !== destination);
  const result = new Map(entries.filter(entry => clipboard.mode !== "cut" || !moving.some(source => containsPath(entry.path, source.path))).map(entry => [entry.path, entry]));
  const mappings = new Map<string, string>(); const overwritten = new Set<string>(); const paths: string[] = [];
  let conflict: TransferConflict | undefined;
  const place = (source: T, proposed: string, inheritedReplace = false): string | undefined => {
    let target = proposed; const existing = result.get(target);
    if (existing) {
      const key = source.path + "\0" + target;
      let choice = decisions.choices[key] || decisions.all || (inheritedReplace ? "replace" : undefined);
      if (clipboard.mode === "copy" && source.path === target) choice = "keep";
      if (choice === "replace" && existing.folder !== source.folder) choice = undefined;
      if (!choice) { conflict = { key, source: source.path, target, folder: source.folder && existing.folder, canReplace: source.folder === existing.folder }; return; }
      if (choice === "keep") target = duplicatePath(target, source.folder, new Set(result.keys()));
      else if (!source.folder) overwritten.add(target);
      else inheritedReplace = true;
    }
    mappings.set(source.path, target);
    if (!source.folder || !result.has(target)) result.set(target, { ...clone(source), path: target, modified: now, ...(clipboard.mode === "copy" ? { created: now } : {}) });
    if (source.folder) {
      for (const child of sourceEntries.filter(entry => parent(entry.path) === source.path)) {
        place(child, target + "/" + name(child.path), inheritedReplace);
        if (conflict) return;
      }
    }
    return target;
  };
  for (const source of moving) {
    const target = place(source, destination + "/" + name(source.path));
    if (conflict) return { kind: "conflict" as const, conflict };
    if (target) paths.push(target);
  }
  const orderedMappings = [...mappings].sort(([a], [b]) => b.length - a.length);
  const relocate = (path: string) => {
    if (clipboard.mode !== "cut") return path;
    const mapping = orderedMappings.find(([source]) => containsPath(path, source));
    return mapping ? mapping[1] + path.slice(mapping[0].length) : path;
  };
  return { kind: "ready" as const, entries: [...result.values()], paths, count: moving.length, overwritten: [...overwritten], relocate };
}
