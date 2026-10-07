export type MenuEntry = { path: string; folder: boolean; bytes?: number };
export type FileAction = "open" | "edit" | "extract" | "cut" | "copy" | "paste" | "folder" | "file" | "upload" | "compress" | "download" | "rename" | "path" | "details" | "delete" | "cancel" | "selectAll" | "refresh";
export type MenuAction = { action: FileAction; label: string; disabled?: boolean; danger?: boolean };
export const isArchiveEntry = (entry: MenuEntry) => !entry.folder && /\.(zip|rar|7z|tar|gz|tgz|bz2|xz)$/i.test(entry.path);
export const isZipEntry = (entry: MenuEntry) => !entry.folder && /\.zip$/i.test(entry.path);
export const canEditEntry = (entry: MenuEntry) => !entry.folder && /\.(cfg|ini|sh|json|log|txt|yml|yaml|xml|properties|md|conf|csv)$/i.test(entry.path) && (entry.bytes || 0) <= 1024 ** 2;
export const contextSelection = (paths: string[], entry?: MenuEntry, root?: string) => !entry || entry.path === root ? [] : paths.includes(entry.path) ? paths : [entry.path];

export function fileMenuGroups(context: { entry?: MenuEntry; selection: MenuEntry[]; root: string; busy: boolean; canPaste: boolean; visibleCount: number }): MenuAction[][] {
  const { entry, selection, root, busy, canPaste, visibleCount } = context;
  const item = (action: FileAction, label: string, disabled = false): MenuAction => ({ action, label, disabled, danger: action === "delete" });
  const create = [item("folder", "新建文件夹", busy), item("file", "新建文件", busy)];
  const paste = item("paste", "粘贴", busy || !canPaste);
  if (!entry) return [ [...create, item("upload", "上传文件", busy)], [paste], [item("selectAll", "全选", !visibleCount || busy), item("refresh", "刷新", busy)], [item("path", "复制当前目录路径")] ];
  if (entry.path === root) return [[item("open", "打开文件夹", busy)], [...create, item("upload", "上传文件", busy)], [paste], [item("path", "复制路径"), item("details", "查看详情")]];
  if (selection.length > 1) {
    const count = selection.length;
    return [[item("cut", `剪切所选 ${count} 项`, busy), item("copy", `复制所选 ${count} 项`, busy)], [
      ...(selection.every(isZipEntry) ? [item("extract", "分别解压到新文件夹", busy)] : []),
      item("compress", `压缩所选 ${count} 项为 ZIP`, busy), item("download", `打包下载所选 ${count} 项`, busy)
    ], [item("path", "复制所选路径"), item("cancel", "取消选择")], [item("delete", `删除所选 ${count} 项`, busy)]];
  }
  return [
    entry.folder ? [item("open", "打开文件夹", busy)] : isZipEntry(entry) ? [item("extract", "解压到新文件夹", busy)] : canEditEntry(entry) ? [item("edit", "编辑文件", busy)] : [],
    [item("cut", "剪切", busy), item("copy", "复制", busy), ...(entry.folder ? [paste] : [])],
    entry.folder ? create : [],
    [...(!isArchiveEntry(entry) ? [item("compress", "压缩为 ZIP", busy)] : []), item("download", entry.folder ? "下载文件夹" : isArchiveEntry(entry) ? "下载压缩包" : "下载文件", busy)],
    [item("rename", "重命名", busy), item("path", "复制路径"), item("details", "查看详情")], [item("delete", "删除", busy)]
  ].filter(group => group.length);
}
