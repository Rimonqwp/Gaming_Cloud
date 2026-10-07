type MovableEntry = { path: string; folder: boolean; modified: string };
const within = (path: string, parent: string) => path === parent || path.startsWith(parent + "/");

export function planFileMove<T extends MovableEntry>(entries: T[], paths: string[], destination: string, root: string, modified: string) {
  if (!within(destination, root) || !entries.some(entry => entry.path === destination && entry.folder)) throw new Error("请选择有效的目标文件夹");
  const selected = entries.filter(entry => paths.includes(entry.path));
  if (selected.some(entry => entry.path === root || !within(entry.path, root))) throw new Error("不能移动服务器根目录");
  const sources = selected.filter(entry => !selected.some(parent => parent.folder && parent.path !== entry.path && within(entry.path, parent.path)));
  if (sources.some(entry => entry.folder && within(destination, entry.path))) throw new Error("不能将文件夹移入自身或它的子文件夹");
  const moves = sources.map(entry => ({ from: entry.path, to: destination + "/" + entry.path.split("/").pop() })).filter(move => move.from !== move.to);
  const relocate = (path: string) => {
    const move = moves.find(item => within(path, item.from));
    return move ? move.to + path.slice(move.from.length) : path;
  };
  const occupied = new Set<string>();
  for (const entry of entries) {
    const path = relocate(entry.path);
    if (occupied.has(path)) throw new Error("目标文件夹已有同名项目：" + path.split("/").pop());
    occupied.add(path);
  }
  return {
    entries: entries.map(entry => relocate(entry.path) === entry.path ? entry : { ...entry, path: relocate(entry.path), modified }),
    paths: sources.map(entry => relocate(entry.path)),
    count: moves.length,
    relocate,
  };
}
