import { lazy, Suspense, useRef, useState, type ReactNode } from "react";
import { unzip, zip } from "fflate";
import { ArrowDown, ArrowUp, ArrowUpDown, Archive, ArchiveRestore, Braces, ChevronDown, ChevronRight, ChevronUp, Copy, Download, File as FileIcon, FileArchive, FilePenLine, FileText, Folder, FolderOpen, FolderPlus, House, ListTree, LoaderCircle, RefreshCw, Search, Settings, Terminal, Trash2, Upload, UserRound, X, Scissors, ClipboardPaste, CheckSquare } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../../components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "../../components/ui/context-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../components/ui/tooltip";
import "../../../styles/cloud-files.css";
import { archiveBase, createArchiveFiles, selectFilePaths } from "./instanceFileOperations";
import { useFileGestures } from "./useFileGestures";
import { planFileMove } from "./fileGestureMoves";
import { captureFileClipboard, containsPath, duplicatePath, planFileTransfer, selectedRoots, validateTransferDestination, type FileClipboard, type TransferDecisions, type TransferConflict, type ConflictChoice } from "./fileClipboard";
import { fileMenuGroups, contextSelection, isArchiveEntry, isZipEntry, canEditEntry, type FileAction } from "./fileMenuRules";

const InstanceFileCodeEditor = lazy(() => import("./InstanceFileCodeEditor"));

type Entry = { path: string; folder: boolean; bytes: number; modified: string; created: string; permission: string; content?: Uint8Array; tags?: string[] };
type FileDialog = { kind: "file" | "rename" | "delete" | "extract"; target?: Entry; paths?: string[]; directory?: string };
type FolderDraft = { directory: string; name: string; error: string };
type PasteRequest = { clipboard: FileClipboard<Entry>; destination: string; decisions: TransferDecisions };
type FileDraft = { value: string; saved: string; isNew?: boolean };
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const rootDirectory = "/home/server";
const parentPath = (path: string) => path.slice(0, path.lastIndexOf("/")) || "/";
const baseName = (path: string) => path.split("/").pop() || "/";
const timestamp = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).format(new Date());
const sizeLabel = (bytes: number) => bytes < 1024 ? `${bytes} B` : bytes < 1024 ** 2 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 ** 2).toFixed(1)} MB`;
const typeLabel = (entry: Entry) => entry.folder ? "文件夹" : ({ cfg: "CFG 文件", ini: "配置文件", sh: "Shell 脚本", json: "JSON 文件", zip: "ZIP 压缩包", log: "日志文件" }[baseName(entry.path).split(".").pop() || ""] || "文件");
const isZip = isZipEntry;
const downloadLabel = (entry: Entry) => entry.folder ? "下载文件夹" : /\.(zip|rar|7z|tar|gz|tgz|bz2|xz)$/i.test(entry.path) ? "下载压缩包" : "下载文件";
const isEditable = canEditEntry;
function seedFile(name: string, bytes: number, modified: string, text: string, permission = "-rw-r--r--"): Entry {
  const data = encoder.encode(text);
  return { path: `/home/server/${name}`, folder: false, bytes, modified: `${modified}:12`, created: "2024-10-20 16:33:45", permission, content: data };
}
const seedEntries: Entry[] = [
  { ...seedFile("server.cfg", 2457, "2024-10-26 14:28", "# Server configuration\nserver_name=Game Server\nmax_players=32\nport=8211\nautosave=true\npvp=true\n"), tags: ["配置文件", "核心配置"] },
  seedFile("start.sh", 876, "2024-10-25 20:13", "#!/bin/sh\ncd /home/server\n./PalServer.sh -port=8211 -players=32\n", "-rwxr-xr-x"),
  seedFile("PalWorldSettings.ini", 4198, "2024-10-26 11:20", "[/Script/Pal.PalGameWorldSettings]\nOptionSettings=(ServerName=\"Game Server\",ServerPlayerMaxNum=32,PublicPort=8211)\n"),
  seedFile("mods.json", 1331, "2024-10-26 13:56", '{\n  "mods": [],\n  "enabled": true\n}\n'),
  ...["savegame", "worlddata", "logs", "config", "mods", "backups", "plugins"].map((name, index): Entry => ({ path: `/home/server/${name}`, folder: true, bytes: 0, modified: ["2024-10-26 14:05:12", "2024-10-25 18:50:12", "2024-10-26 13:56:12"][index % 3], created: "2024-10-20 16:33:45", permission: "drwxr-xr-x" })),
  ...["server", "steam", "steamapps", "Palworld", "temp", "scripts"].map((name): Entry => ({ path: `/home/${name}`, folder: true, bytes: 0, modified: "2024-10-26 14:28:12", created: "2024-10-20 16:33:45", permission: "drwxr-xr-x" })),
];
function EntryIcon({ entry, large = false }: { entry: Entry; large?: boolean }) {
  const ext = entry.path.split(".").pop()?.toLowerCase();
  const Icon = entry.folder ? Folder : isArchiveEntry(entry) ? FileArchive : ext === "sh" ? Terminal : ext === "json" ? Braces : ext === "ini" ? Settings : FileText;
  return <Icon size={large ? 32 : 23} strokeWidth={1.8} className={`ifm-file-icon ${entry.folder ? "folder" : ext === "sh" ? "shell" : ext === "json" ? "json" : ext === "ini" ? "config" : "document"}`} />;
}

export function InstanceDetailFilesView({ onNotice }: { onNotice: (message: string) => void }) {
  const [entries, setEntries] = useState<Entry[]>(seedEntries);
  const [directory, setDirectory] = useState(rootDirectory);
  const [expanded, setExpanded] = useState<string[]>([rootDirectory]);
  const [treeOpen, setTreeOpen] = useState(true);
  const [showTreeFiles, setShowTreeFiles] = useState(false);
  const [activePath, setActivePath] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editorMode, setEditorMode] = useState(false);
  const [editorPath, setEditorPath] = useState<string | null>(null);
  const [editorTabs, setEditorTabs] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<Record<string, FileDraft>>({});
  const [checked, setChecked] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: "name" | "modified"; direction: 1 | -1 }>({ key: "name", direction: 1 });
  const [dialog, setDialog] = useState<FileDialog | null>(null);
  const [folderDraft, setFolderDraft] = useState<FolderDraft | null>(null);
  const folderDraftRef = useRef(folderDraft);
  folderDraftRef.current = folderDraft;
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [trash, setTrash] = useState<Entry[]>([]);
  const [manualCopyPath, setManualCopyPath] = useState<string | null>(null);
  const [leavePromptOpen, setLeavePromptOpen] = useState(false);
  const [clipboard, setClipboard] = useState<FileClipboard<Entry> | null>(null);
  const [transferConflict, setTransferConflict] = useState<{ request: PasteRequest; conflict: TransferConflict } | null>(null);
  const [overwritePrompt, setOverwritePrompt] = useState<{ request: PasteRequest; paths: string[] } | null>(null);
  const [applyAllConflicts, setApplyAllConflicts] = useState(false);
  const operationLocked = busy || !!transferConflict || !!overwritePrompt;
  const uploadDestination = useRef(rootDirectory);
  const uploadRef = useRef<HTMLInputElement>(null);
  const detailsTriggerRef = useRef<HTMLButtonElement | null>(null);
  const dragDepth = useRef(0);
  const selectionAnchor = useRef<string | null>(null);
  const selected = entries.find(entry => entry.path === activePath);
  const detailsVisible = !editorMode && detailsOpen && !!selected;
  const editorDraft = editorPath ? drafts[editorPath] : undefined;
  const isDraftDirty = (draft?: FileDraft) => !!draft && (draft.isNew === true || draft.value !== draft.saved);
  const editorDirty = isDraftDirty(editorDraft);
  const dirtyEditorPaths = editorTabs.filter(path => isDraftDirty(drafts[path]));
  const breadcrumbParts = [baseName(rootDirectory), ...directory.slice(rootDirectory.length).split("/").filter(Boolean)];
  const rows = entries.filter(entry => parentPath(entry.path) === directory && baseName(entry.path).toLowerCase().includes(query.trim().toLowerCase()));
  rows.sort((a, b) => {
    if (a.folder !== b.folder) return a.folder ? -1 : 1;
    const nameOrder = baseName(a.path).localeCompare(baseName(b.path), "zh-CN", { sensitivity: "base" });
    return sort.direction * (sort.key === "name" ? nameOrder : a.modified.localeCompare(b.modified) || nameOrder);
  });
  const selectEntry = (path: string, options: { toggle?: boolean; shift?: boolean }) => {
    const anchor = selectionAnchor.current;
    setChecked(previous => selectFilePaths(rows.map(entry => entry.path), previous, path, anchor, options));
    if (!options.shift || !rows.some(entry => entry.path === selectionAnchor.current)) selectionAnchor.current = path;
  };
  const clearSelection = () => { setChecked([]); selectionAnchor.current = null; };
  const navigate = (path: string) => {
    if (path !== rootDirectory && !path.startsWith(`${rootDirectory}/`)) return;
    setDirectory(path); setQuery(""); clearSelection(); setActivePath(null); setDetailsOpen(false);
    const ancestors = path.split("/").filter(Boolean).map((_, index, parts) => `/${parts.slice(0, index + 1).join("/")}`).filter(ancestor => ancestor === rootDirectory || ancestor.startsWith(`${rootDirectory}/`));
    setExpanded(previous => [...new Set([...previous, ...ancestors])]);
  };
  const openDialog = (kind: FileDialog["kind"], target?: Entry, paths?: string[]) => {
    if (operationLocked) return;
    setDialog({ kind, target, paths, directory: kind === "file" && target?.folder ? target.path : directory }); setName(kind === "rename" && target ? baseName(target.path) : "");
    setText(target?.content ? decoder.decode(target.content).trimEnd() : ""); setError("");
  };
  const startFolder = (destination: string) => {
    if (operationLocked) return;
    clearSelection(); setTreeOpen(true);
    const ancestors = destination.split("/").filter(Boolean).map((_, index, parts) => `/${parts.slice(0, index + 1).join("/")}`).filter(path => containsPath(path, rootDirectory));
    setExpanded(previous => [...new Set([...previous, ...ancestors])]);
    setFolderDraft({ directory: destination, name: "", error: "" });
    requestAnimationFrame(() => {
      folderInputRef.current?.focus();
      folderInputRef.current?.scrollIntoView({ block: "nearest" });
    });
  };
  const cancelFolder = () => { folderDraftRef.current = null; setFolderDraft(null); };
  const submitFolder = () => {
    const draft = folderDraftRef.current;
    if (!draft || operationLocked) return;
    const value = draft.name.trim();
    if (!value) { cancelFolder(); return; }
    if (value === "." || value === ".." || /[\\/\x00-\x1f]/.test(value)) {
      setFolderDraft({ ...draft, error: "名称不能为 . 或 ..，或包含路径分隔符、控制字符" }); return;
    }
    const path = `${draft.directory}/${value}`;
    if (entries.some(entry => entry.path === path)) {
      setFolderDraft({ ...draft, error: "此目录已存在同名文件或文件夹" }); return;
    }
    if (!entries.some(entry => entry.folder && entry.path === draft.directory)) { cancelFolder(); onNotice("目标文件夹已不存在，请重新创建"); return; }
    const now = timestamp();
    cancelFolder();
    setEntries(previous => [...previous, { path, folder: true, bytes: 0, modified: now, created: now, permission: "drwxr-xr-x" }]);
    setActivePath(path); setChecked([path]);
    onNotice(`已创建文件夹：${value}（本地演示）`);
  };
  const focusFolderAfterMenu = (event: Event) => {
    if (!folderInputRef.current) return;
    event.preventDefault(); folderInputRef.current.focus();
  };
  const openEditor = (entry: Entry) => {
    if (!isEditable(entry)) { onNotice("此文件类型或大小不支持在线编辑，请下载后查看"); return; }
    const value = entry.content ? decoder.decode(entry.content) : "";
    setDrafts(previous => previous[entry.path] ? previous : { ...previous, [entry.path]: { value, saved: value } });
    setEditorTabs(previous => previous.includes(entry.path) ? previous : [...previous, entry.path]);
    setEditorPath(entry.path); setEditorMode(true); setDetailsOpen(false); setTreeOpen(true);
    setExpanded(previous => [...new Set([...previous, rootDirectory, parentPath(entry.path)])]);
  };
  const openScratchEditor = () => {
    let index = 1;
    let path = `${directory}/.untitled-${index}.txt`;
    while (entries.some(entry => entry.path === path) || editorTabs.includes(path)) path = `${directory}/.untitled-${++index}.txt`;
    setDrafts(previous => ({ ...previous, [path]: { value: "", saved: "", isNew: true } }));
    setEditorTabs(previous => [...previous, path]);
    setEditorPath(path); setEditorMode(true); setDetailsOpen(false); setTreeOpen(true);
    setExpanded(previous => [...new Set([...previous, rootDirectory, directory])]);
  };
  const saveEditor = () => {
    if (operationLocked) return;
    if (!editorPath || !editorDraft || !editorDirty) return;
    const content = encoder.encode(editorDraft.value);
    if (content.length > 1024 ** 2) { onNotice("在线编辑文件不能超过 1 MB"); return; }
    if (editorDraft.isNew) {
      const directoryPath = parentPath(editorPath);
      const base = "未命名";
      let index = 0;
      let savedPath = `${directoryPath}/${base}.txt`;
      while (entries.some(entry => entry.path === savedPath) || editorTabs.some(path => path === savedPath)) {
        index += 1;
        savedPath = `${directoryPath}/${base} (${index}).txt`;
      }
      const now = timestamp();
      const entry: Entry = { path: savedPath, folder: false, content, bytes: content.length, modified: now, created: now, permission: "-rw-r--r--" };
      setEntries(previous => [...previous, entry]);
      setEditorTabs(previous => previous.map(path => path === editorPath ? savedPath : path));
      setEditorPath(previous => previous === editorPath ? savedPath : previous);
      setDrafts(previous => {
        const next = { ...previous, [savedPath]: { value: editorDraft.value, saved: editorDraft.value } };
        delete next[editorPath];
        return next;
      });
      onNotice(`文件已保存到当前目录：${baseName(savedPath)}`);
      return;
    }
    setEntries(previous => previous.map(entry => entry.path === editorPath ? { ...entry, content, bytes: content.length, modified: timestamp() } : entry));
    setDrafts(previous => ({ ...previous, [editorPath]: { value: editorDraft.value, saved: editorDraft.value } }));
    onNotice("文件已保存（本地演示）");
  };
  const exitEditor = () => {
    const path = editorPath;
    setEditorMode(false);
    if (path) navigate(parentPath(path));
  };
  const requestExitEditor = () => {
    if (dirtyEditorPaths.length) setLeavePromptOpen(true);
    else exitEditor();
  };
  const confirmExitEditor = () => {
    setLeavePromptOpen(false);
    exitEditor();
  };
  const closeEditorTab = (path: string) => {
    const remaining = editorTabs.filter(item => item !== path);
    setEditorTabs(remaining);
    if (editorPath === path) setEditorPath(remaining.at(-1) || null);
    if (isDraftDirty(drafts[path]) && !drafts[path]?.isNew) onNotice("未保存的修改已保留在草稿中，重新打开文件可继续编辑");
  };
  const copy = async (path: string) => {
    try { await navigator.clipboard.writeText(path); onNotice("路径已复制"); }
    catch {
      const field = document.createElement("textarea");
      field.value = path; field.setAttribute("aria-hidden", "true"); field.style.cssText = "position:fixed;left:-9999px;top:0";
      document.body.append(field); field.select();
      let copied = false;
      try { copied = document.execCommand("copy"); } catch { /* The manual copy dialog remains available. */ }
      field.remove();
      if (copied) onNotice("路径已复制"); else setManualCopyPath(path);
    }
  };
  const archiveSelection = (paths: string[]) => {
    const sources = selectedRoots(entries, paths, rootDirectory);
    const base = archiveBase(sources.map(entry => entry.path));
    return createArchiveFiles(entries, sources.map(entry => entry.path), base);
  };
  const downloadBytes = (data: Uint8Array, filename: string) => {
    const url = URL.createObjectURL(new Blob([data]));
    const link = document.createElement("a"); link.href = url; link.download = filename;
    document.body.append(link); link.click(); link.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const packFolder = async (entry: Entry) => {
    const files = createArchiveFiles(entries, [entry.path], entry.path);
    return new Promise<Uint8Array>((resolve, reject) => zip(files, (err, result) => err ? reject(err) : resolve(result)));
  };
  const compress = async (paths: string[]) => {
    if (operationLocked || !paths.length) return;
    const targets = entries.filter(entry => paths.includes(entry.path));
    if (!targets.length) return;
    setBusy(true);
    try {
      const single = targets.length === 1 ? targets[0] : undefined;
      const directoryPath = single ? parentPath(single.path) : directory;
      const files = single?.folder ? createArchiveFiles(entries, [single.path], single.path) : archiveSelection(targets.map(entry => entry.path));
      const content = await new Promise<Uint8Array>((resolve, reject) => zip(files, (err, result) => err ? reject(err) : resolve(result)));
      const stem = single ? baseName(single.path) : `${baseName(directoryPath)}-所选文件`;
      let filename = stem + ".zip"; let index = 1;
      while (entries.some(item => item.path === directoryPath + "/" + filename)) filename = stem + " (" + index++ + ").zip";
      const path = directoryPath + "/" + filename; const now = timestamp();
      const archive: Entry = { path, folder: false, bytes: content.length, content, modified: now, created: now, permission: "-rw-r--r--" };
      setEntries(previous => [...previous, archive]); setActivePath(path);
      onNotice("已生成压缩包：" + path + "（本地演示）");
    } catch (err) { onNotice(err instanceof Error ? err.message : "压缩失败，请重试"); } finally { setBusy(false); }
  };
  const download = async (entry: Entry) => {
    if (operationLocked) return;
    setBusy(true);
    try {
      const data = entry.folder ? await packFolder(entry) : entry.content || new Uint8Array();
      downloadBytes(data, baseName(entry.path) + (entry.folder ? ".zip" : ""));
      onNotice("下载已开始");
    } catch { onNotice("下载失败，请重试"); } finally { setBusy(false); }
  };
  const upload = async (files: File[], destination = directory) => {
    if (operationLocked || !files.length) return;
    setBusy(true);
    try {
      const existing = new Set(entries.map(entry => entry.path)); const additions: Entry[] = [];
      for (const file of files) {
        if (file.size > 50 * 1024 ** 2) throw new Error("单个文件不能超过 50 MB");
        let filename = file.name; let index = 1;
        while (existing.has(`${destination}/${filename}`)) { const dot = file.name.lastIndexOf("."); filename = dot > 0 ? `${file.name.slice(0, dot)} (${index++})${file.name.slice(dot)}` : `${file.name} (${index++})`; }
        const entry: Entry = { path: `${destination}/${filename}`, folder: false, bytes: file.size, modified: timestamp(), created: timestamp(), permission: "-rw-r--r--", content: new Uint8Array(await file.arrayBuffer()) };
        additions.push(entry); existing.add(entry.path);
      }
      setEntries(previous => [...previous, ...additions]); setActivePath(additions[0].path);
      if (!editorMode && destination !== directory) navigate(destination);
      onNotice(`已上传 ${additions.length} 个文件（本地演示）`);
    } catch (err) { onNotice(err instanceof Error ? err.message : "上传失败，请重试"); } finally { setBusy(false); }
  };
  const prepareExtraction = async (file: File | Entry, working: Entry[]) => {
    const localFile = file instanceof File;
    if ((localFile ? file.size : file.bytes) > 50 * 1024 ** 2) throw new Error("压缩包不能超过 50 MB");
    const data = localFile ? new Uint8Array(await file.arrayBuffer()) : file.content;
    if (!data) throw new Error("无法读取 ZIP 压缩包内容");
    let destination = directory;
    if (!localFile) {
      const stem = baseName(file.path).replace(/\.zip$/i, "");
      const parent = parentPath(file.path); let index = 1;
      destination = parent + "/" + stem;
      while (working.some(entry => entry.path === destination)) destination = parent + "/" + stem + " (" + index++ + ")";
    }
    let total = 0; let count = 0; let invalid = false;
    const result = await new Promise<Record<string, Uint8Array>>((resolve, reject) => unzip(data, { filter: entry => {
      total += entry.originalSize; count++;
      const safe = !entry.name.startsWith("/") && !entry.name.includes("\\") && !entry.name.split("/").includes("..") && !/[\x00-\x1f:]/.test(entry.name);
      if (!safe || total > 100 * 1024 ** 2 || count > 1000) invalid = true;
      return safe && !invalid;
    } }, (err, files) => err ? reject(err) : resolve(files)));
    if (invalid) throw new Error("压缩包包含无效路径，或超过解压上限（100 MB / 1000 项）");
    const additions: Entry[] = []; const existing = new Map(working.map(entry => [entry.path, entry]));
    if (!localFile) {
      const folder: Entry = { path: destination, folder: true, bytes: 0, modified: timestamp(), created: timestamp(), permission: "drwxr-xr-x" };
      additions.push(folder); existing.set(destination, folder);
    }
    for (const [relative, content] of Object.entries(result)) {
      const parts = relative.split("/").filter(Boolean); let path = destination;
      for (let index = 0; index < parts.length; index++) {
        path += `/${parts[index]}`; const folder = index < parts.length - 1 || relative.endsWith("/");
        if (existing.has(path)) { if (!folder || !existing.get(path)?.folder) throw new Error(`同名项目已存在：${path}，请重命名后重试`); continue; }
        const entry: Entry = { path, folder, bytes: folder ? 0 : content.length, content: folder ? undefined : content, modified: timestamp(), created: timestamp(), permission: folder ? "drwxr-xr-x" : "-rw-r--r--" };
        additions.push(entry); existing.set(path, entry);
      }
    }
    if (!additions.length) throw new Error("压缩包中没有可解压的项目");
    return { additions, destination };
  };
  const extract = async (files: File | Entry | Entry[]) => {
    if (operationLocked) return;
    setBusy(true); setError("");
    try {
      let working = entries; const destinations: string[] = [];
      for (const file of Array.isArray(files) ? files : [files]) {
        const result = await prepareExtraction(file, working);
        working = [...working, ...result.additions]; destinations.push(result.destination);
      }
      setEntries(working); setDialog(null);
      onNotice(`已解压到 ${destinations.join("、")}（本地演示）`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "无法读取 ZIP 压缩包";
      setError(message); onNotice(message);
    } finally { setBusy(false); }
  };
  const submit = () => {
    if (!dialog || operationLocked) return; const target = dialog.target;
    if (dialog.kind === "delete") {
      const paths = dialog.paths || (target ? [target.path] : []);
      const removed = entries.filter(entry => paths.some(path => entry.path === path || entry.path.startsWith(`${path}/`)));
      const deletedCutSource = clipboard?.mode === "cut" && clipboard.paths.some(path => removed.some(entry => entry.path === path));
      setTrash(removed); setEntries(previous => previous.filter(entry => !removed.includes(entry))); clearSelection();
      let remainingDirectory = directory;
      while (removed.some(entry => entry.path === remainingDirectory)) remainingDirectory = parentPath(remainingDirectory);
      if (remainingDirectory !== directory) navigate(remainingDirectory);
      if (removed.some(entry => entry.path === activePath)) { setActivePath(null); setDetailsOpen(false); }
      setEditorTabs(previous => previous.filter(path => !removed.some(entry => entry.path === path)));
      setDrafts(previous => Object.fromEntries(Object.entries(previous).filter(([path]) => !removed.some(entry => entry.path === path))));
      if (removed.some(entry => entry.path === editorPath)) setEditorPath(null);
      onNotice(`已移除 ${paths.length} 项，可通过“撤销删除”恢复${deletedCutSource ? "；剪切来源已删除，请重新选择后剪切" : ""}`);
    } else {
      const value = name.trim();
      if (!value || value === "." || value === ".." || /[\\/\x00-\x1f]/.test(value)) { setError("请输入有效名称，不包含路径分隔符"); return; }
      const destination = dialog.directory || directory;
      const path = `${dialog.kind === "rename" && target ? parentPath(target.path) : destination}/${value}`;
      if (entries.some(entry => entry.path === path && entry.path !== target?.path)) { setError("此目录已存在同名文件或文件夹"); return; }
      if (dialog.kind === "rename" && target) {
        setEntries(previous => previous.map(entry => entry.path === target.path || entry.path.startsWith(`${target.path}/`) ? { ...entry, path: path + entry.path.slice(target.path.length), modified: timestamp() } : entry));
        setExpanded(previous => previous.map(item => item === target.path || item.startsWith(`${target.path}/`) ? path + item.slice(target.path.length) : item));
        const renamedPath = (item: string) => item === target.path || item.startsWith(`${target.path}/`) ? path + item.slice(target.path.length) : item;
        setDirectory(renamedPath);
        setEditorTabs(previous => previous.map(renamedPath));
        setDrafts(previous => Object.fromEntries(Object.entries(previous).map(([item, draft]) => [renamedPath(item), draft])));
        setEditorPath(previous => previous ? renamedPath(previous) : null);
        setClipboard(previous => previous?.mode === "cut" ? { ...previous, paths: previous.paths.map(renamedPath) } : previous);
        setActivePath(path); setChecked(previous => previous.map(renamedPath));
      } else {
        const content = encoder.encode(text);
        const entry: Entry = { path, folder: false, content, bytes: content.length, modified: timestamp(), created: timestamp(), permission: "-rw-r--r--" };
        setEntries(previous => [...previous, entry]); setActivePath(path);
        setExpanded(previous => [...new Set([...previous, destination])]);
        if (destination !== directory && !editorMode) navigate(destination);
      }
      onNotice("操作已完成（本地演示）");
    }
    setDialog(null);
  };
  const captureClipboard = (paths: string[], mode: "copy" | "cut") => {
    if (operationLocked) return;
    try {
      const next = captureFileClipboard(entries, paths, mode, rootDirectory);
      setClipboard(next); onNotice(`已${mode === "copy" ? "复制" : "剪切"} ${next.paths.length} 项，请在目标文件夹粘贴`);
    } catch (err) { onNotice((err as Error).message); }
  };
  const isCut = (path: string) => clipboard?.mode === "cut" && clipboard.paths.some(source => containsPath(path, source));
  const canPaste = (destination: string) => {
    if (!clipboard || operationLocked) return false;
    try { validateTransferDestination(entries, clipboard, destination, rootDirectory); return true; } catch { return false; }
  };
  const remapView = (relocate: (path: string) => string, destination: string) => {
    setDirectory(previous => relocate(previous));
    setActivePath(previous => previous ? relocate(previous) : null);
    setEditorPath(previous => previous ? relocate(previous) : null);
    setEditorTabs(previous => [...new Set(previous.map(relocate))]);
    const ancestors = destination.split("/").filter(Boolean).map((_, index, parts) => "/" + parts.slice(0, index + 1).join("/")).filter(path => containsPath(path, rootDirectory));
    setExpanded(previous => [...new Set([...previous.map(relocate), ...ancestors])]);
  };
  const runTransfer = (request: PasteRequest, working = entries, dirtyApproved = false) => {
    try {
      const result = planFileTransfer(working, request.clipboard, request.destination, rootDirectory, timestamp(), request.decisions);
      if (result.kind === "conflict") { setTransferConflict({ request, conflict: result.conflict }); return; }
      const dirty = result.overwritten.filter(path => isDraftDirty(drafts[path]));
      if (dirty.length && !dirtyApproved) { setOverwritePrompt({ request, paths: dirty }); return; }
      if (!result.count) { onNotice("所选项目已经位于目标目录，位置未变化"); return; }
      setEntries(result.entries); setChecked(result.paths); remapView(result.relocate, request.destination);
      setDrafts(previous => {
        const next: Record<string, FileDraft> = {};
        for (const [path, draft] of Object.entries(previous)) {
          if (result.relocate(path) !== path) continue;
          const value = decoder.decode(result.entries.find(entry => entry.path === path)?.content || new Uint8Array());
          next[path] = result.overwritten.includes(path) ? { value, saved: value } : draft;
        }
        for (const [path, draft] of Object.entries(previous)) if (result.relocate(path) !== path) next[result.relocate(path)] = draft;
        return next;
      });
      if (request.clipboard.mode === "cut") setClipboard(null);
      onNotice(`已${request.clipboard.mode === "copy" ? "复制" : "移动"} ${result.count} 项到 ${request.destination}（本地演示）`);
    } catch (err) { onNotice((err as Error).message); }
  };
  const pasteFiles = (destination: string) => {
    if (operationLocked || !clipboard) return;
    setApplyAllConflicts(false);
    runTransfer({ clipboard, destination, decisions: { choices: {} } });
  };
  const resolveConflict = (choice: ConflictChoice) => {
    if (!transferConflict) return;
    const { request, conflict } = transferConflict;
    const decisions = { choices: { ...request.decisions.choices, [conflict.key]: choice }, all: applyAllConflicts ? choice : request.decisions.all };
    setTransferConflict(null); runTransfer({ ...request, decisions });
  };
  const approveOverwrite = (save: boolean) => {
    if (!overwritePrompt) return;
    let working = entries;
    if (save) {
      const preview = planFileTransfer(entries, overwritePrompt.request.clipboard, overwritePrompt.request.destination, rootDirectory, timestamp(), overwritePrompt.request.decisions);
      if (preview.kind !== "ready") { onNotice("粘贴目标已变化，请重新粘贴"); return; }
      const occupied = new Set([...entries, ...preview.entries].map(entry => entry.path));
      for (const path of overwritePrompt.paths) {
        const original = entries.find(entry => entry.path === path)!;
        const backup = duplicatePath(path, false, occupied); occupied.add(backup);
        const content = encoder.encode(drafts[path].value);
        if (content.length > 1024 ** 2) { onNotice("修改副本超过在线编辑的 1 MB 上限，请先处理后再粘贴"); return; }
        working = [...working, { ...original, path: backup, content, bytes: content.length, created: timestamp(), modified: timestamp() }];
      }
    }
    const request = overwritePrompt.request; setOverwritePrompt(null); runTransfer(request, working, true);
  };
  const chooseUpload = (destination: string) => { uploadDestination.current = destination; uploadRef.current?.click(); };
  const visibleTreePaths = () => entries.filter(entry => {
    if (entry.path === rootDirectory || !containsPath(entry.path, rootDirectory) || (!showTreeFiles && !entry.folder)) return false;
    let ancestor = parentPath(entry.path);
    while (containsPath(ancestor, rootDirectory)) {
      if (!expanded.includes(ancestor)) return false;
      ancestor = parentPath(ancestor);
    }
    return true;
  }).map(entry => entry.path);
  const downloadBatch = async (paths: string[]) => {
    if (operationLocked) return;
    setBusy(true);
    try {
      const targets = selectedRoots(entries, paths, rootDirectory);
      const files = archiveSelection(targets.map(entry => entry.path));
      const content = await new Promise<Uint8Array>((resolve, reject) => zip(files, (err, data) => err ? reject(err) : resolve(data)));
      downloadBytes(content, `${baseName(directory)}-所选文件.zip`); onNotice("打包下载已开始");
    } catch (err) { onNotice((err as Error).message); } finally { setBusy(false); }
  };
  const actionIcons = { open: FolderOpen, edit: FilePenLine, extract: ArchiveRestore, cut: Scissors, copy: Copy, paste: ClipboardPaste, folder: FolderPlus, file: FileIcon, upload: Upload, compress: Archive, download: Download, rename: FilePenLine, path: Copy, details: FileText, delete: Trash2, selectAll: CheckSquare, refresh: RefreshCw, cancel: X };
  const menuItems = (entry?: Entry, dropdown = false, surface: "tree" | "list" = "list") => {
    const Item = dropdown ? DropdownMenuItem : ContextMenuItem;
    const Separator = dropdown ? DropdownMenuSeparator : ContextMenuSeparator;
    const paths = contextSelection(checked, entry, rootDirectory);
    const selection = paths.map(path => entries.find(item => item.path === path)!).filter(Boolean);
    const destination = entry?.folder ? entry.path : surface === "tree" ? rootDirectory : directory;
    const visible = surface === "tree" ? visibleTreePaths() : rows.map(item => item.path);
    const groups = fileMenuGroups({ entry, selection, root: rootDirectory, busy: operationLocked, canPaste: canPaste(destination), visibleCount: visible.length });
    const dispatch = (action: FileAction) => {
      switch (action) {
        case "open": navigate(entry!.path); break;
        case "edit": openEditor(entry!); break;
        case "extract": void extract(selection); break;
        case "cut": captureClipboard(paths, "cut"); break;
        case "copy": captureClipboard(paths, "copy"); break;
        case "paste": pasteFiles(destination); break;
        case "folder": startFolder(destination); break;
        case "file": openDialog("file", entries.find(item => item.path === destination)); break;
        case "upload": chooseUpload(destination); break;
        case "compress": void compress(paths); break;
        case "download": if (paths.length > 1) void downloadBatch(paths); else void download(entry!); break;
        case "rename": openDialog("rename", entry); break;
        case "path": void copy(paths.length > 1 ? paths.join("\n") : entry?.path || destination); break;
        case "details": setActivePath(entry!.path); setDetailsOpen(true); break;
        case "delete": openDialog("delete", undefined, paths); break;
        case "cancel": clearSelection(); break;
        case "selectAll": setChecked(visible); selectionAnchor.current = null; break;
        case "refresh": setQuery(""); onNotice("文件列表已刷新"); break;
      }
    };
    return groups.map((group, index) => <span key={index} style={{ display: "contents" }}>{index > 0 && <Separator />}{group.map(item => { const Icon = actionIcons[item.action]; return <Item key={item.action} disabled={item.disabled} className={item.danger ? "ifm-danger" : undefined} onSelect={() => dispatch(item.action)}><Icon size={15} />{item.label}</Item>; })}</span>);
  };
  const entryMenuItems = (entry: Entry, dropdown = false, surface: "tree" | "list" = "list") => menuItems(entry, dropdown, surface);
  const treeContextMenu = (entry: Entry, content: ReactNode) => <ContextMenu key={entry.path} modal={false}>
    <ContextMenuTrigger asChild onContextMenu={event => { event.stopPropagation(); setChecked(contextSelection(checked, entry, rootDirectory)); }}>{content}</ContextMenuTrigger>
    <ContextMenuContent className="ifm-menu" onCloseAutoFocus={focusFolderAfterMenu} aria-label={checked.includes(entry.path) && checked.length > 1 ? `所选 ${checked.length} 项的批量操作` : `${baseName(entry.path)} 的目录树操作`}>{entryMenuItems(entry, false, "tree")}</ContextMenuContent>
  </ContextMenu>;
  const fileRowContextMenu = (entry: Entry, content: ReactNode) => <ContextMenu key={entry.path} modal={false}>
    <ContextMenuTrigger asChild onContextMenu={event => { event.stopPropagation(); setChecked(contextSelection(checked, entry, rootDirectory)); }}>{content}</ContextMenuTrigger>
    <ContextMenuContent className="ifm-menu" onCloseAutoFocus={focusFolderAfterMenu} aria-label={checked.includes(entry.path) && checked.length > 1 ? `所选 ${checked.length} 项的批量操作` : `${baseName(entry.path)} 的文件操作`}>
      {entryMenuItems(entry)}
    </ContextMenuContent>
  </ContextMenu>;
  const moveFiles = (paths: string[], destination: string) => {
    if (operationLocked) return;
    try {
      const result = planFileMove(entries, paths, destination, rootDirectory, timestamp());
      if (!result.count) return;
      setClipboard(previous => previous?.mode === "cut" ? { ...previous, paths: previous.paths.map(result.relocate) } : previous);
      setEntries(result.entries); setChecked(result.paths);
      setDirectory(previous => result.relocate(previous));
      setActivePath(previous => previous ? result.relocate(previous) : null);
      const ancestors = destination.split("/").filter(Boolean).map((_, index, parts) => "/" + parts.slice(0, index + 1).join("/")).filter(path => path === rootDirectory || path.startsWith(rootDirectory + "/"));
      setExpanded(previous => [...new Set([...previous.map(result.relocate), ...ancestors])]);
      setEditorPath(previous => previous ? result.relocate(previous) : null);
      setEditorTabs(previous => previous.map(result.relocate));
      setDrafts(previous => Object.fromEntries(Object.entries(previous).map(([path, draft]) => [result.relocate(path), draft])));
      onNotice(`已移动 ${result.count} 项到 ${destination}（本地演示）`);
    } catch (err) { onNotice(err instanceof Error ? err.message : "移动失败，请重试"); }
  };
  const gestures = useFileGestures({
    selected: checked, setSelected: setChecked, disabled: operationLocked || !!dialog || !!folderDraft || leavePromptOpen || manualCopyPath !== null, anchor: selectionAnchor,
    canMove: (paths, destination) => { try { return planFileMove(entries, paths, destination, rootDirectory, "").count > 0; } catch { return false; } },
    onMove: moveFiles, onDelete: paths => openDialog("delete", undefined, paths),
    onCopy: paths => captureClipboard(paths, "copy"), onCut: paths => captureClipboard(paths, "cut"), onPaste: pasteFiles,
  });
  const renderTree = (path: string, depth: number) => {
    // Keep the reference's frequently used directories first; all folders remain accessible in the file list.
    const children = entries.filter(entry => (showTreeFiles || entry.folder) && parentPath(entry.path) === path).sort((a, b) => {
      if (editorMode || !a.folder || !b.folder) return Number(b.folder) - Number(a.folder) || baseName(a.path).localeCompare(baseName(b.path), "zh-CN", { sensitivity: "base" });
      const order = ["config", "mods", "logs", "backups", "plugins", "savegame", "worlddata"];
      return path === rootDirectory ? order.indexOf(baseName(a.path)) - order.indexOf(baseName(b.path)) : 0;
    });
    const folderRow = <div role="treeitem" aria-level={depth + 1} aria-expanded={expanded.includes(path)} aria-selected={checked.includes(path)} data-file-path={path} data-file-root={path === rootDirectory ? "true" : undefined} data-folder-path={path} className={`ifm-tree-row${directory === path && !editorMode ? " active" : ""}${checked.includes(path) ? " checked" : ""}${isCut(path) ? " ifm-cut" : ""}${gestures.target === path ? " ifm-move-target" : ""}`} style={{ paddingLeft: 8 + depth * 20 }}>
      <button className="ifm-tree-toggle" aria-label={`${expanded.includes(path) ? "收起" : "展开"} ${baseName(path)}`} aria-expanded={expanded.includes(path)} onClick={() => setExpanded(previous => previous.includes(path) ? previous.filter(item => item !== path) : [...previous, path])}>{expanded.includes(path) ? <ChevronDown size={15} /> : <ChevronRight size={15} />}</button>
      <button className="ifm-tree-label" onClick={() => { if (editorMode) setExpanded(previous => [...new Set([...previous, path])]); else navigate(path); }} aria-current={directory === path && !editorMode ? "location" : undefined}>{directory === path ? <FolderOpen size={19} /> : <Folder size={19} />}<span>{baseName(path)}</span></button>
    </div>;
    const folderEntry: Entry = { path, folder: true, bytes: 0, modified: "", created: "", permission: "drwxr-xr-x" };
    const childRows = children.map(entry => {
      if (entry.folder) return renderTree(entry.path, depth + 1);
      const fileRow = <div role="treeitem" aria-level={depth + 2} aria-selected={checked.includes(entry.path)} data-file-path={entry.path} className={`ifm-tree-row ifm-tree-file${editorPath === entry.path ? " active" : ""}${checked.includes(entry.path) ? " checked" : ""}${isCut(entry.path) ? " ifm-cut" : ""}`} style={{ paddingLeft: 8 + (depth + 1) * 20 }}><span className="ifm-tree-toggle-space" /><button className="ifm-tree-label" title={baseName(entry.path)} onClick={() => openEditor(entry)} aria-current={editorPath === entry.path ? "true" : undefined}><EntryIcon entry={entry} /><span>{baseName(entry.path)}</span>{isDraftDirty(drafts[entry.path]) && <span className="ifm-tree-dirty" aria-label="未保存修改" />}</button></div>;
      return treeContextMenu(entry, fileRow);
    });
    const newFolderRow = folderDraft?.directory === path && <div className="ifm-tree-draft" key="new-folder">
      <div role="treeitem" aria-level={depth + 2} aria-selected="true" className="ifm-tree-row checked" style={{ paddingLeft: 8 + (depth + 1) * 20 }} onContextMenu={event => event.stopPropagation()}>
        <ChevronRight size={15} className="ifm-tree-toggle-space" />
        <label className="ifm-tree-label"><Folder size={19} /><input ref={folderInputRef} aria-label="新建文件夹名称" aria-invalid={!!folderDraft.error} aria-describedby={folderDraft.error ? "ifm-folder-error" : undefined} title="Enter 创建，Esc 取消" className="ifm-tree-name-input" value={folderDraft.name} onChange={event => setFolderDraft({ ...folderDraft, name: event.target.value, error: "" })} onBlur={submitFolder} onKeyDown={event => {
          event.stopPropagation();
          if (event.nativeEvent.isComposing) return;
          if (event.key === "Enter") { event.preventDefault(); submitFolder(); }
          if (event.key === "Escape") { event.preventDefault(); cancelFolder(); }
        }} /></label>
      </div>
      {folderDraft.error && <p id="ifm-folder-error" role="alert" className="ifm-folder-error" style={{ paddingLeft: 32 + (depth + 1) * 20 }}>{folderDraft.error}</p>}
    </div>;
    return <div key={path}>{treeContextMenu(folderEntry, folderRow)}{expanded.includes(path) && <div role="group" className={path === rootDirectory ? "ifm-server-children" : undefined}>{newFolderRow}{childRows}</div>}</div>;
  };
  return <div className={`ifm-layout${detailsVisible ? " has-details" : ""}${editorMode ? " editor-mode" : ""}`}>
    <input ref={uploadRef} type="file" multiple hidden onChange={event => { void upload(Array.from(event.target.files || []), uploadDestination.current); event.target.value = ""; }} />
    <aside className="gsd-card ifm-tree"><header><h2><ListTree size={20} />目录结构</h2><div><label className="ifm-show-files"><Tooltip><TooltipTrigger asChild><input type="checkbox" aria-label="显示文件" checked={showTreeFiles} onChange={event => setShowTreeFiles(event.target.checked)} /></TooltipTrigger><TooltipContent side="right" sideOffset={8}>开启后显示文件和文件夹，关闭后仅显示文件夹。</TooltipContent></Tooltip><span>显示文件</span></label><button aria-label={treeOpen ? "收起目录结构" : "展开目录结构"} aria-expanded={treeOpen} onClick={() => setTreeOpen(!treeOpen)}>{treeOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</button></div></header>{treeOpen && <ContextMenu modal={false}><ContextMenuTrigger asChild onContextMenu={clearSelection}><nav role="tree" aria-label="文件目录" aria-multiselectable="true" className="ifm-tree-scroll" tabIndex={0} data-file-surface="tree" data-drop-directory={rootDirectory} {...gestures.handlers}>{renderTree(rootDirectory, 0)}</nav></ContextMenuTrigger><ContextMenuContent className="ifm-menu" onCloseAutoFocus={focusFolderAfterMenu} aria-label="目录树空白区域操作">{menuItems(undefined, false, "tree")}<ContextMenuSeparator /><ContextMenuItem disabled={operationLocked || !expanded.some(path => path !== rootDirectory)} onSelect={() => { cancelFolder(); setExpanded([rootDirectory]); }}><ChevronUp size={15} />收起全部文件夹</ContextMenuItem></ContextMenuContent></ContextMenu>}</aside>
    {editorMode ? <Suspense fallback={<section className="gsd-card ifm-code-workspace ifm-code-loading" role="status">正在加载代码编辑器…</section>}><InstanceFileCodeEditor
      tabs={editorTabs.map(path => ({ path, dirty: isDraftDirty(drafts[path]) }))}
      path={editorPath} value={editorDraft?.value || ""} dirty={editorDirty}
      onChange={value => { if (editorPath) setDrafts(previous => ({ ...previous, [editorPath]: { ...previous[editorPath], value } })); }}
      onSelect={setEditorPath} onClose={closeEditorTab} onSave={saveEditor} onCreateScratch={openScratchEditor}
      onBack={requestExitEditor}
    /></Suspense> : <section className={`gsd-card ifm-browser${dragging ? " dragging" : ""}`} aria-label="文件列表" onDragEnter={event => { event.preventDefault(); dragDepth.current++; setDragging(true); }} onDragOver={event => event.preventDefault()} onDragLeave={() => { if (--dragDepth.current <= 0) setDragging(false); }} onDrop={event => { event.preventDefault(); dragDepth.current = 0; setDragging(false); if (!operationLocked) void upload(Array.from(event.dataTransfer.files)); }}>
      <div className="ifm-path-row">
        <nav className="ifm-path" aria-label="当前文件路径"><button aria-label="打开根目录" onClick={() => navigate(rootDirectory)}><House size={16} /></button><span>/</span>{breadcrumbParts.map((part, index, parts) => <span key={index}><button onClick={() => navigate(index === 0 ? rootDirectory : `${rootDirectory}/${parts.slice(1, index + 1).join("/")}`)}>{part}</button><span>/</span></span>)}<button aria-label="复制当前目录路径" onClick={() => void copy(`${directory}/`)}><Copy size={15} /></button></nav>
        {checked.length > 0 && <div className="ifm-selection"><span>已选择 {checked.length} 项</span><button disabled={operationLocked} onClick={() => void compress(checked)}><Archive size={14} />压缩所选</button><button onClick={clearSelection}>取消选择</button><button disabled={operationLocked} className="ifm-selection-delete" onClick={() => openDialog("delete", undefined, checked)}><Trash2 size={14} />删除所选</button></div>}
        {trash.length > 0 && <button disabled={operationLocked} className="ifm-undo-delete" onClick={() => { if (trash.some(entry => entries.some(item => item.path === entry.path))) { onNotice("原路径已有同名项目，请先重命名后恢复"); return; } setEntries(previous => [...previous, ...trash]); setTrash([]); onNotice("已恢复最近删除的项目"); }}>撤销删除</button>}
      </div>
      <div className="ifm-toolbar"><label className="ifm-search"><Search size={18} /><input aria-label="搜索文件或文件夹" placeholder="搜索文件或文件夹（支持名称、扩展名）" value={query} onChange={event => setQuery(event.target.value)} /></label><div className="ifm-tools"><button className="gsd-button primary" disabled={operationLocked} onClick={() => chooseUpload(directory)}>{busy ? <LoaderCircle className="ifm-spin" size={18} /> : <Upload size={18} />}上传文件</button><button className="gsd-button" disabled={operationLocked} onClick={() => startFolder(directory)}><FolderPlus size={18} />新建文件夹</button><button className="gsd-button" disabled={operationLocked} onClick={() => openDialog("file")}><FileIcon size={18} />新建文件</button><button className="gsd-button" disabled={operationLocked} onClick={() => openDialog("extract")}><ArchiveRestore size={18} />解压缩</button><button className="gsd-button ifm-refresh" disabled={operationLocked} onClick={() => { setQuery(""); onNotice("文件列表已刷新"); }}><RefreshCw size={18} />刷新</button></div></div>
      <ContextMenu modal={false}><ContextMenuTrigger asChild onContextMenu={clearSelection}><div className="ifm-files-scroll" tabIndex={0} data-file-surface="list" data-drop-directory={directory} {...gestures.handlers}><table role="grid" className="ifm-files-table" aria-label="文件和文件夹" aria-multiselectable="true"><colgroup><col /><col /><col /><col /><col /><col /><col /></colgroup><thead><tr><th><input type="checkbox" aria-label="选择当前目录全部文件" checked={rows.length > 0 && rows.every(entry => checked.includes(entry.path))} ref={element => { if (element) element.indeterminate = rows.some(entry => checked.includes(entry.path)) && !rows.every(entry => checked.includes(entry.path)); }} onChange={event => { setChecked(event.target.checked ? rows.map(entry => entry.path) : []); selectionAnchor.current = null; }} /></th><th aria-sort={sort?.key === "name" ? sort.direction === 1 ? "ascending" : "descending" : "none"}><button onClick={() => setSort({ key: "name", direction: sort?.key === "name" && sort.direction === 1 ? -1 : 1 })}>名称{sort.key === "name" ? sort.direction === 1 ? <ArrowUp size={10} /> : <ArrowDown size={10} /> : <ArrowUpDown size={10} />}</button></th><th>类型</th><th>大小</th><th aria-sort={sort?.key === "modified" ? sort.direction === 1 ? "ascending" : "descending" : "none"}><button onClick={() => setSort({ key: "modified", direction: sort?.key === "modified" && sort.direction === -1 ? 1 : -1 })}>修改时间{sort.key === "modified" ? sort.direction === 1 ? <ArrowUp size={14} /> : <ArrowDown size={14} /> : <ArrowUpDown size={14} />}</button></th><th>权限</th><th>操作</th></tr></thead><tbody>{rows.map(entry => fileRowContextMenu(entry, <tr data-file-path={entry.path} data-folder-path={entry.folder ? entry.path : undefined} className={`${checked.includes(entry.path) ? "checked" : ""}${isCut(entry.path) ? " ifm-cut" : ""}${gestures.target === entry.path ? " ifm-move-target" : ""}`} aria-selected={checked.includes(entry.path)} onDoubleClick={event => { if ((event.target as Element).closest("button, input, a") || event.ctrlKey || event.metaKey || event.shiftKey) return; if (entry.folder) navigate(entry.path); else if (isEditable(entry)) openEditor(entry); }}><td><input type="checkbox" aria-label={`选择 ${baseName(entry.path)}`} checked={checked.includes(entry.path)} onClick={event => event.stopPropagation()} onChange={event => selectEntry(entry.path, { toggle: true, shift: (event.nativeEvent as MouseEvent).shiftKey })} /></td><td><span className="ifm-entry-name"><EntryIcon entry={entry} /><span>{baseName(entry.path)}</span></span></td><td>{typeLabel(entry)}</td><td>{entry.folder ? "-" : sizeLabel(entry.bytes)}</td><td>{entry.modified.slice(0, 16)}</td><td className="ifm-permission">{entry.permission}</td><td><div className="ifm-row-actions">{entry.folder ? <button onClick={event => { event.stopPropagation(); navigate(entry.path); }}>打开</button> : <><button disabled={operationLocked} onClick={event => { event.stopPropagation(); void download(entry); }}>下载</button>{isEditable(entry) && <button onClick={() => openEditor(entry)}>编辑</button>}</>}<DropdownMenu><DropdownMenuTrigger asChild><button aria-label={`${baseName(entry.path)} 更多操作`} onClick={event => { detailsTriggerRef.current = event.currentTarget; setChecked(contextSelection(checked, entry, rootDirectory)); }}>更多<ChevronDown size={13} /></button></DropdownMenuTrigger><DropdownMenuContent className="ifm-menu" onCloseAutoFocus={focusFolderAfterMenu} align="end">{entryMenuItems(entry, true)}</DropdownMenuContent></DropdownMenu></div></td></tr>))}</tbody></table>{!rows.length && <div className="ifm-empty"><FolderOpen size={32} /><strong>{query ? "没有匹配的文件或文件夹" : "此文件夹为空"}</strong><button onClick={() => query ? setQuery("") : openDialog("file")}>{query ? "清除搜索" : "新建文件"}</button></div>}</div></ContextMenuTrigger>
      <ContextMenuContent className="ifm-menu" onCloseAutoFocus={focusFolderAfterMenu} aria-label="当前目录操作">{menuItems()}</ContextMenuContent>
      </ContextMenu>{dragging && <div className="ifm-drop-hint"><Upload size={28} /><strong>松开以上传到当前目录</strong></div>}
    </section>}
    {gestures.overlay}
    {detailsVisible && <aside className="ifm-sidebar" aria-label="文件详情"><section className="gsd-card ifm-details"><header className="ifm-details-header"><h2><FileText size={20} />文件详情</h2><button aria-label="关闭文件详情" onClick={() => { setDetailsOpen(false); detailsTriggerRef.current?.focus(); }}><X size={18} /></button></header>{selected ? <><div className="ifm-detail-heading"><span><EntryIcon entry={selected} large /></span><div><h3>{baseName(selected.path)}</h3><p>{typeLabel(selected)}{!selected.folder && ` · ${sizeLabel(selected.bytes)}`}</p></div></div><dl><div><dt>位置</dt><dd><span title={selected.path}>{selected.path}</span><button aria-label="复制文件位置" onClick={() => void copy(selected.path)}><Copy size={16} /></button></dd></div><div><dt>大小</dt><dd>{selected.folder ? `${entries.filter(entry => parentPath(entry.path) === selected.path).length} 个项目` : `${selected.bytes.toLocaleString("en-US")} 字节（${sizeLabel(selected.bytes)}）`}</dd></div><div><dt>修改时间</dt><dd>{selected.modified}</dd></div><div><dt>创建时间</dt><dd>{selected.created}</dd></div><div><dt>最后修改者</dt><dd><UserRound size={16} />Rimon12</dd></div><div><dt>权限</dt><dd><code>{selected.permission}（{selected.permission === "-rw-r--r--" ? "644" : "755"}）</code></dd></div><div><dt>标签</dt><dd className="ifm-tags">{(selected.tags || [selected.folder ? "目录" : typeLabel(selected)]).map((tag, index) => <span key={tag} className={index === 1 ? "green" : ""}>{tag}</span>)}</dd></div></dl><div className="ifm-detail-actions"><button className="gsd-button primary" disabled={operationLocked} onClick={() => void download(selected)}><Download size={19} />{downloadLabel(selected)}</button><button className="gsd-button" onClick={() => void copy(selected.path)}><Copy size={18} />复制路径</button></div></> : <div className="ifm-detail-empty"><FileText size={35} /><p>选择文件或文件夹查看详情</p></div>}</section></aside>}
    <Dialog open={!!dialog} onOpenChange={open => { if (!open && !busy) setDialog(null); }}><DialogContent className="cloud-modal ifm-dialog"><DialogTitle>{{ file: "新建文件", rename: "重命名", delete: "删除所选项目", extract: "解压缩 ZIP 文件" }[dialog?.kind || "file"]}</DialogTitle><DialogDescription>当前目录：{dialog?.directory || directory}/。操作仅保存在本地演示会话中，不会修改真实服务器。</DialogDescription>{dialog?.kind === "delete" ? <p>确认将 {dialog.target ? baseName(dialog.target.path) : `${dialog.paths?.length} 个项目`} 移入本地回收区？文件夹内的内容也会一起移除。</p> : dialog?.kind === "extract" ? <><p>选择 ZIP 压缩包，解压到当前目录。同名文件不会被覆盖。</p><input type="file" accept=".zip,application/zip" aria-label="选择 ZIP 压缩包" disabled={operationLocked} onChange={event => { const file = event.target.files?.[0]; if (file) void extract(file); event.target.value = ""; }} /></> : <>{<label className="ifm-field">{dialog?.kind === "rename" && dialog.target?.folder ? "文件夹名称" : "文件名称"}<input autoFocus aria-label="名称" value={name} onChange={event => setName(event.target.value)} placeholder={dialog?.kind === "rename" && dialog.target?.folder ? "例如：new-folder" : "例如：config.txt"} onKeyDown={event => { if (event.key === "Enter") submit(); }} /></label>}{dialog?.kind === "file" && <label className="ifm-field">文件内容<textarea aria-label="文件内容" spellCheck={false} value={text} onChange={event => setText(event.target.value)} /></label>}</>}{error && <p className="ifm-error" role="alert">{error}</p>}<footer><button className="gsd-button" disabled={operationLocked} onClick={() => setDialog(null)}>取消</button>{dialog?.kind !== "extract" && <button disabled={operationLocked} className={`gsd-button ${dialog?.kind === "delete" ? "ifm-delete-button" : "primary"}`} onClick={submit}>{dialog?.kind === "delete" ? "确认删除" : "确认"}</button>}{busy && <span role="status"><LoaderCircle size={16} className="ifm-spin" />正在处理...</span>}</footer></DialogContent></Dialog>
    <Dialog open={!!transferConflict} onOpenChange={open => { if (!open) setTransferConflict(null); }}><DialogContent className="cloud-modal ifm-dialog"><DialogTitle>目标已有同名项目</DialogTitle><DialogDescription>{transferConflict?.conflict.target}</DialogDescription><p>{transferConflict?.conflict.folder ? "合并会保留目标文件夹中的其他内容，仅替换同名文件。" : transferConflict?.conflict.canReplace ? "替换将覆盖目标文件的内容，也可以保留两份。" : "文件与文件夹类型不同，请保留两份或取消。"}</p><label className="ifm-conflict-all"><input type="checkbox" checked={applyAllConflicts} onChange={event => setApplyAllConflicts(event.target.checked)} />应用于本次全部冲突</label><footer><button className="gsd-button" onClick={() => setTransferConflict(null)}>取消</button><button className="gsd-button" onClick={() => resolveConflict("keep")}>保留两份</button>{transferConflict?.conflict.canReplace && <button className="gsd-button primary" onClick={() => resolveConflict("replace")}>{transferConflict.conflict.folder ? "合并并替换同名文件" : "替换"}</button>}</footer></DialogContent></Dialog>
    <Dialog open={!!overwritePrompt} onOpenChange={open => { if (!open) setOverwritePrompt(null); }}><DialogContent className="cloud-modal ifm-dialog"><DialogTitle>覆盖目标存在未保存修改</DialogTitle><DialogDescription>{overwritePrompt?.paths.map(baseName).join("、")}</DialogDescription><p>粘贴会覆盖这些文件。可先将修改另存为副本，再继续粘贴。</p><footer><button className="gsd-button" onClick={() => setOverwritePrompt(null)}>取消</button><button className="gsd-button" onClick={() => approveOverwrite(false)}>放弃修改并继续</button><button className="gsd-button primary" onClick={() => approveOverwrite(true)}>保存修改副本并继续</button></footer></DialogContent></Dialog>
    <Dialog open={leavePromptOpen} onOpenChange={open => { if (!open) setLeavePromptOpen(false); }}><DialogContent className="cloud-modal ifm-dialog"><DialogTitle>存在未保存的修改</DialogTitle><DialogDescription>以下文件有未保存的修改：{dirtyEditorPaths.map(path => baseName(path).replace(/^\.untitled-\d+\.txt$/, "未命名.txt")).join("、")}</DialogDescription><p>返回文件列表后，未保存内容会保留在当前编辑会话中，不会写入服务器。</p><footer><button className="gsd-button" onClick={() => setLeavePromptOpen(false)}>继续编辑</button><button className="gsd-button primary" onClick={confirmExitEditor}>返回文件列表</button></footer></DialogContent></Dialog>
    <Dialog open={manualCopyPath !== null} onOpenChange={open => { if (!open) setManualCopyPath(null); }}><DialogContent className="cloud-modal ifm-dialog"><DialogTitle>复制路径</DialogTitle><DialogDescription>浏览器未允许自动复制，请按 Ctrl+C 或 Command+C 复制已选中的路径。</DialogDescription><label className="ifm-field">路径<input aria-label="待复制路径" readOnly value={manualCopyPath || ""} autoFocus onFocus={event => event.currentTarget.select()} /></label><footer><button className="gsd-button primary" onClick={() => setManualCopyPath(null)}>完成</button></footer></DialogContent></Dialog>
  </div>;
}
