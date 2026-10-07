type ArchiveEntry = { path: string; folder: boolean; content?: Uint8Array };

export function createArchiveFiles(entries: ArchiveEntry[], paths: string[], base: string) {
  const files: Record<string, Uint8Array> = Object.create(null);
  for (const entry of entries) {
    if (!paths.some(path => entry.path === path || entry.path.startsWith(`${path}/`))) continue;
    const relative = entry.path.slice(base.length + 1);
    if (relative) files[relative + (entry.folder ? "/" : "")] = entry.content || new Uint8Array();
  }
  return files;
}

export function selectFilePaths(visible: string[], checked: string[], path: string, anchor: string | null, options: { toggle?: boolean; shift?: boolean }) {
  const start = anchor ? visible.indexOf(anchor) : -1;
  const end = visible.indexOf(path);
  if (options.shift && start >= 0 && end >= 0) {
    const range = visible.slice(Math.min(start, end), Math.max(start, end) + 1);
    return options.toggle ? [...new Set([...checked, ...range])] : range;
  }
  if (options.toggle) return checked.includes(path) ? checked.filter(item => item !== path) : [...checked, path];
  return [path];
}
