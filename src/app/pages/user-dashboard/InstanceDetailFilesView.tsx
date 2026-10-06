import { lazy, Suspense, useRef, useState } from "react";
import { unzip, zip } from "fflate";
import { ArrowDown, ArrowUp, ArrowUpDown, ArchiveRestore, Braces, ChevronDown, ChevronRight, ChevronUp, Copy, Download, File as FileIcon, FilePenLine, FileText, Folder, FolderOpen, FolderPlus, House, ListTree, LoaderCircle, PlusCircle, RefreshCw, Search, Settings, Terminal, Trash2, Upload, UserRound, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../../components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import "../../../styles/cloud-files.css";

const InstanceFileCodeEditor = lazy(() => import("./InstanceFileCodeEditor"));

type Entry = { path: string; folder: boolean; bytes: number; modified: string; created: string; permission: string; content?: Uint8Array; tags?: string[] };
type FileDialog = { kind: "file" | "folder" | "rename" | "delete" | "extract"; target?: Entry; paths?: string[] };
type FileDraft = { value: string; saved: string; isNew?: boolean };
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const rootDirectory = "/home/server";
const parentPath = (path: string) => path.slice(0, path.lastIndexOf("/")) || "/";
const baseName = (path: string) => path.split("/").pop() || "/";
const timestamp = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).format(new Date());
const sizeLabel = (bytes: number) => bytes < 1024 ? `${bytes} B` : bytes < 1024 ** 2 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 ** 2).toFixed(1)} MB`;
const typeLabel = (entry: Entry) => entry.folder ? "文件夹" : ({ cfg: "CFG 文件", ini: "配置文件", sh: "Shell 脚本", json: "JSON 文件", zip: "ZIP 压缩包", log: "日志文件" }[baseName(entry.path).split(".").pop() || ""] || "文件");
const isEditable = (entry: Entry) => !entry.folder && /\.(cfg|ini|sh|json|log|txt|yml|yaml|xml|properties|md|conf|csv)$/i.test(entry.path) && entry.bytes <= 1024 ** 2;
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
  const ext = entry.path.split(".").pop();
  const Icon = entry.folder ? Folder : ext === "sh" ? Terminal : ext === "json" ? Braces : ext === "ini" ? Settings : FileText;
  return <Icon size={large ? 32 : 23} strokeWidth={1.8} className={`ifm-file-icon ${entry.folder ? "folder" : ext === "sh" ? "shell" : ext === "json" ? "json" : ext === "ini" ? "config" : "document"}`} />;
}

export function InstanceDetailFilesView({ onNotice }: { onNotice: (message: string) => void }) {
  const [entries, setEntries] = useState<Entry[]>(seedEntries);
  const [directory, setDirectory] = useState(rootDirectory);
  const [expanded, setExpanded] = useState<string[]>([rootDirectory]);
  const [treeOpen, setTreeOpen] = useState(true);
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
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [trash, setTrash] = useState<Entry[]>([]);
  const [manualCopyPath, setManualCopyPath] = useState<string | null>(null);
  const [leavePromptOpen, setLeavePromptOpen] = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null);
  const detailsTriggerRef = useRef<HTMLButtonElement | null>(null);
  const dragDepth = useRef(0);
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
  const navigate = (path: string) => {
    if (path !== rootDirectory && !path.startsWith(`${rootDirectory}/`)) return;
    setDirectory(path); setQuery(""); setChecked([]); setActivePath(null); setDetailsOpen(false);
    const ancestors = path.split("/").filter(Boolean).map((_, index, parts) => `/${parts.slice(0, index + 1).join("/")}`).filter(ancestor => ancestor === rootDirectory || ancestor.startsWith(`${rootDirectory}/`));
    setExpanded(previous => [...new Set([...previous, ...ancestors])]);
  };
  const openDialog = (kind: FileDialog["kind"], target?: Entry, paths?: string[]) => {
    setDialog({ kind, target, paths }); setName(kind === "rename" && target ? baseName(target.path) : "");
    setText(target?.content ? decoder.decode(target.content).trimEnd() : ""); setError("");
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
  const download = async (entry: Entry) => {
    setBusy(true);
    try {
      let data = entry.content || new Uint8Array();
      if (entry.folder) {
        const files: Record<string, Uint8Array> = Object.create(null);
        for (const child of entries.filter(item => item.path.startsWith(`${entry.path}/`))) files[child.path.slice(entry.path.length + 1) + (child.folder ? "/" : "")] = child.content || new Uint8Array();
        if (!Object.keys(files).length) files[`${baseName(entry.path)}/`] = new Uint8Array();
        data = await new Promise<Uint8Array>((resolve, reject) => zip(files, (err, result) => err ? reject(err) : resolve(result)));
      }
      const url = URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a"); link.href = url; link.download = baseName(entry.path) + (entry.folder ? ".zip" : "");
      document.body.append(link); link.click(); link.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      onNotice("下载已开始");
    } catch { onNotice("下载失败，请重试"); } finally { setBusy(false); }
  };
  const upload = async (files: File[]) => {
    if (!files.length) return;
    setBusy(true);
    try {
      const existing = new Set(entries.map(entry => entry.path)); const additions: Entry[] = [];
      for (const file of files) {
        if (file.size > 50 * 1024 ** 2) throw new Error("单个文件不能超过 50 MB");
        let filename = file.name; let index = 1;
        while (existing.has(`${directory}/${filename}`)) { const dot = file.name.lastIndexOf("."); filename = dot > 0 ? `${file.name.slice(0, dot)} (${index++})${file.name.slice(dot)}` : `${file.name} (${index++})`; }
        const entry: Entry = { path: `${directory}/${filename}`, folder: false, bytes: file.size, modified: timestamp(), created: timestamp(), permission: "-rw-r--r--", content: new Uint8Array(await file.arrayBuffer()) };
        additions.push(entry); existing.add(entry.path);
      }
      setEntries(previous => [...previous, ...additions]); setActivePath(additions[0].path);
      onNotice(`已上传 ${additions.length} 个文件（本地演示）`);
    } catch (err) { onNotice(err instanceof Error ? err.message : "上传失败，请重试"); } finally { setBusy(false); }
  };
  const extract = async (file: File) => {
    setBusy(true); setError("");
    try {
      if (file.size > 50 * 1024 ** 2) throw new Error("压缩包不能超过 50 MB");
      const data = new Uint8Array(await file.arrayBuffer()); let total = 0; let count = 0; let invalid = false;
      const result = await new Promise<Record<string, Uint8Array>>((resolve, reject) => unzip(data, { filter: entry => {
        total += entry.originalSize; count++;
        const safe = !entry.name.startsWith("/") && !entry.name.includes("\\") && !entry.name.split("/").includes("..") && !/[\x00-\x1f:]/.test(entry.name);
        if (!safe || total > 100 * 1024 ** 2 || count > 1000) invalid = true;
        return safe && !invalid;
      } }, (err, files) => err ? reject(err) : resolve(files)));
      if (invalid) throw new Error("压缩包包含无效路径，或超过解压上限（100 MB / 1000 项）");
      const additions: Entry[] = []; const existing = new Map(entries.map(entry => [entry.path, entry]));
      for (const [relative, content] of Object.entries(result)) {
        const parts = relative.split("/").filter(Boolean); let path = directory;
        for (let index = 0; index < parts.length; index++) {
          path += `/${parts[index]}`; const folder = index < parts.length - 1 || relative.endsWith("/");
          if (existing.has(path)) { if (!folder || !existing.get(path)?.folder) throw new Error(`同名项目已存在：${path}，请重命名后重试`); continue; }
          const entry: Entry = { path, folder, bytes: folder ? 0 : content.length, content: folder ? undefined : content, modified: timestamp(), created: timestamp(), permission: folder ? "drwxr-xr-x" : "-rw-r--r--" };
          additions.push(entry); existing.set(path, entry);
        }
      }
      if (!additions.length) throw new Error("压缩包中没有可解压的项目");
      setEntries(previous => [...previous, ...additions]);
      onNotice(`已解压 ${additions.length} 个项目（本地演示）`); setDialog(null);
    } catch (err) { setError(err instanceof Error ? err.message : "无法读取 ZIP 压缩包"); } finally { setBusy(false); }
  };
  const submit = () => {
    if (!dialog) return; const target = dialog.target;
    if (dialog.kind === "delete") {
      const paths = dialog.paths || (target ? [target.path] : []);
      const removed = entries.filter(entry => paths.some(path => entry.path === path || entry.path.startsWith(`${path}/`)));
      setTrash(removed); setEntries(previous => previous.filter(entry => !removed.includes(entry))); setChecked([]);
      if (removed.some(entry => entry.path === activePath)) { setActivePath(null); setDetailsOpen(false); }
      setEditorTabs(previous => previous.filter(path => !removed.some(entry => entry.path === path)));
      setDrafts(previous => Object.fromEntries(Object.entries(previous).filter(([path]) => !removed.some(entry => entry.path === path))));
      if (removed.some(entry => entry.path === editorPath)) setEditorPath(null);
      onNotice(`已移除 ${paths.length} 项，可通过“撤销删除”恢复`);
    } else {
      const value = name.trim();
      if (!value || value === "." || value === ".." || /[\\/\x00-\x1f]/.test(value)) { setError("请输入有效名称，不包含路径分隔符"); return; }
      const path = `${dialog.kind === "rename" && target ? parentPath(target.path) : directory}/${value}`;
      if (entries.some(entry => entry.path === path && entry.path !== target?.path)) { setError("此目录已存在同名文件或文件夹"); return; }
      if (dialog.kind === "rename" && target) {
        setEntries(previous => previous.map(entry => entry.path === target.path || entry.path.startsWith(`${target.path}/`) ? { ...entry, path: path + entry.path.slice(target.path.length), modified: timestamp() } : entry));
        setExpanded(previous => previous.map(item => item === target.path || item.startsWith(`${target.path}/`) ? path + item.slice(target.path.length) : item));
        const renamedPath = (item: string) => item === target.path || item.startsWith(`${target.path}/`) ? path + item.slice(target.path.length) : item;
        setEditorTabs(previous => previous.map(renamedPath));
        setDrafts(previous => Object.fromEntries(Object.entries(previous).map(([item, draft]) => [renamedPath(item), draft])));
        setEditorPath(previous => previous ? renamedPath(previous) : null);
        setActivePath(path); setChecked(previous => previous.map(item => item === target.path ? path : item));
      } else {
        const folder = dialog.kind === "folder"; const content = folder ? undefined : encoder.encode(text);
        const entry: Entry = { path, folder, content, bytes: content?.length || 0, modified: timestamp(), created: timestamp(), permission: folder ? "drwxr-xr-x" : "-rw-r--r--" };
        setEntries(previous => [...previous, entry]); setActivePath(path);
      }
      onNotice("操作已完成（本地演示）");
    }
    setDialog(null);
  };
  const renderTree = (path: string, depth: number) => {
    // Keep the reference's frequently used directories first; all folders remain accessible in the file list.
    const children = entries.filter(entry => (editorMode || entry.folder) && parentPath(entry.path) === path).sort((a, b) => {
      if (editorMode) return Number(b.folder) - Number(a.folder) || baseName(a.path).localeCompare(baseName(b.path), "zh-CN", { sensitivity: "base" });
      const order = ["config", "mods", "logs", "backups", "plugins", "savegame", "worlddata"];
      return path === rootDirectory ? order.indexOf(baseName(a.path)) - order.indexOf(baseName(b.path)) : 0;
    });
    return <div key={path}><div className={`ifm-tree-row${directory === path && !editorMode ? " active" : ""}`} style={{ paddingLeft: 8 + depth * 20 }}><button className="ifm-tree-toggle" aria-label={`${expanded.includes(path) ? "收起" : "展开"} ${baseName(path)}`} aria-expanded={expanded.includes(path)} onClick={() => setExpanded(previous => previous.includes(path) ? previous.filter(item => item !== path) : [...previous, path])}>{expanded.includes(path) ? <ChevronDown size={15} /> : <ChevronRight size={15} />}</button><button className="ifm-tree-label" onClick={() => { if (editorMode) setExpanded(previous => [...new Set([...previous, path])]); else navigate(path); }} aria-current={directory === path && !editorMode ? "location" : undefined}>{directory === path ? <FolderOpen size={19} /> : <Folder size={19} />}<span>{baseName(path)}</span></button></div>{expanded.includes(path) && <div className={path === rootDirectory ? "ifm-server-children" : undefined}>{children.map(entry => entry.folder ? renderTree(entry.path, depth + 1) : <div key={entry.path} className={`ifm-tree-row ifm-tree-file${editorPath === entry.path ? " active" : ""}`} style={{ paddingLeft: 8 + (depth + 1) * 20 }}><span className="ifm-tree-toggle-space" /><button className="ifm-tree-label" title={baseName(entry.path)} onClick={() => openEditor(entry)} aria-current={editorPath === entry.path ? "true" : undefined}><EntryIcon entry={entry} /><span>{baseName(entry.path)}</span>{isDraftDirty(drafts[entry.path]) && <span className="ifm-tree-dirty" aria-label="未保存修改" />}</button></div>)}</div>}</div>;
  };
  return <div className={`ifm-layout${detailsVisible ? " has-details" : ""}${editorMode ? " editor-mode" : ""}`}>
    <aside className="gsd-card ifm-tree"><header><h2><ListTree size={20} />目录结构</h2><div><button className="ifm-add-directory" aria-label="新建目录" onClick={() => openDialog("folder")}><PlusCircle size={16} /></button><button aria-label={treeOpen ? "收起目录结构" : "展开目录结构"} aria-expanded={treeOpen} onClick={() => setTreeOpen(!treeOpen)}>{treeOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</button></div></header>{treeOpen && <nav aria-label="文件目录" className="ifm-tree-scroll">{renderTree(rootDirectory, 0)}</nav>}</aside>
    {editorMode ? <Suspense fallback={<section className="gsd-card ifm-code-workspace ifm-code-loading" role="status">正在加载代码编辑器…</section>}><InstanceFileCodeEditor
      tabs={editorTabs.map(path => ({ path, dirty: isDraftDirty(drafts[path]) }))}
      path={editorPath} value={editorDraft?.value || ""} dirty={editorDirty}
      onChange={value => { if (editorPath) setDrafts(previous => ({ ...previous, [editorPath]: { ...previous[editorPath], value } })); }}
      onSelect={setEditorPath} onClose={closeEditorTab} onSave={saveEditor} onCreateScratch={openScratchEditor}
      onBack={requestExitEditor}
    /></Suspense> : <section className={`gsd-card ifm-browser${dragging ? " dragging" : ""}`} aria-label="文件列表" onDragEnter={event => { event.preventDefault(); dragDepth.current++; setDragging(true); }} onDragOver={event => event.preventDefault()} onDragLeave={() => { if (--dragDepth.current <= 0) setDragging(false); }} onDrop={event => { event.preventDefault(); dragDepth.current = 0; setDragging(false); if (!busy) void upload(Array.from(event.dataTransfer.files)); }}>
      <div className="ifm-path-row">
        <nav className="ifm-path" aria-label="当前文件路径"><button aria-label="打开根目录" onClick={() => navigate(rootDirectory)}><House size={16} /></button><span>/</span>{breadcrumbParts.map((part, index, parts) => <span key={index}><button onClick={() => navigate(index === 0 ? rootDirectory : `${rootDirectory}/${parts.slice(1, index + 1).join("/")}`)}>{part}</button><span>/</span></span>)}<button aria-label="复制当前目录路径" onClick={() => void copy(`${directory}/`)}><Copy size={15} /></button></nav>
        {checked.length > 0 && <div className="ifm-selection"><span>已选择 {checked.length} 项</span><button onClick={() => setChecked([])}>取消选择</button><button className="ifm-selection-delete" onClick={() => openDialog("delete", undefined, checked)}><Trash2 size={14} />删除所选</button></div>}
      </div>
      <div className="ifm-toolbar"><label className="ifm-search"><Search size={18} /><input aria-label="搜索文件或文件夹" placeholder="搜索文件或文件夹（支持名称、扩展名）" value={query} onChange={event => setQuery(event.target.value)} /></label><div className="ifm-tools"><button className="gsd-button primary" disabled={busy} onClick={() => uploadRef.current?.click()}>{busy ? <LoaderCircle className="ifm-spin" size={18} /> : <Upload size={18} />}上传文件</button><button className="gsd-button" onClick={() => openDialog("folder")}><FolderPlus size={18} />新建文件夹</button><button className="gsd-button" onClick={() => openDialog("file")}><FileIcon size={18} />新建文件</button><button className="gsd-button" disabled={busy} onClick={() => openDialog("extract")}><ArchiveRestore size={18} />解压缩</button><button className="gsd-button ifm-refresh" disabled={busy} onClick={() => { setQuery(""); onNotice("文件列表已刷新"); }}><RefreshCw size={18} />刷新</button></div></div>
      <input ref={uploadRef} type="file" multiple hidden onChange={event => { void upload(Array.from(event.target.files || [])); event.target.value = ""; }} />
      {trash.length > 0 && <div className="ifm-selection"><button onClick={() => { if (trash.some(entry => entries.some(item => item.path === entry.path))) { onNotice("原路径已有同名项目，请先重命名后恢复"); return; } setEntries(previous => [...previous, ...trash]); setTrash([]); onNotice("已恢复最近删除的项目"); }}>撤销删除</button></div>}
      <div className="ifm-files-scroll"><table className="ifm-files-table"><colgroup><col /><col /><col /><col /><col /><col /><col /></colgroup><thead><tr><th><input type="checkbox" aria-label="选择当前目录全部文件" checked={rows.length > 0 && rows.every(entry => checked.includes(entry.path))} ref={element => { if (element) element.indeterminate = rows.some(entry => checked.includes(entry.path)) && !rows.every(entry => checked.includes(entry.path)); }} onChange={event => setChecked(event.target.checked ? rows.map(entry => entry.path) : [])} /></th><th aria-sort={sort?.key === "name" ? sort.direction === 1 ? "ascending" : "descending" : "none"}><button onClick={() => setSort({ key: "name", direction: sort?.key === "name" && sort.direction === 1 ? -1 : 1 })}>名称{sort.key === "name" ? sort.direction === 1 ? <ArrowUp size={10} /> : <ArrowDown size={10} /> : <ArrowUpDown size={10} />}</button></th><th>类型</th><th>大小</th><th aria-sort={sort?.key === "modified" ? sort.direction === 1 ? "ascending" : "descending" : "none"}><button onClick={() => setSort({ key: "modified", direction: sort?.key === "modified" && sort.direction === -1 ? 1 : -1 })}>修改时间{sort.key === "modified" ? sort.direction === 1 ? <ArrowUp size={14} /> : <ArrowDown size={14} /> : <ArrowUpDown size={14} />}</button></th><th>权限</th><th>操作</th></tr></thead><tbody>{rows.map(entry => <tr key={entry.path} className={checked.includes(entry.path) ? "checked" : undefined} onDoubleClick={() => entry.folder ? navigate(entry.path) : isEditable(entry) && openEditor(entry)}><td><input type="checkbox" aria-label={`选择 ${baseName(entry.path)}`} checked={checked.includes(entry.path)} onClick={event => event.stopPropagation()} onChange={event => setChecked(previous => event.target.checked ? [...previous, entry.path] : previous.filter(path => path !== entry.path))} /></td><td><span className="ifm-entry-name"><EntryIcon entry={entry} /><span>{baseName(entry.path)}</span></span></td><td>{typeLabel(entry)}</td><td>{entry.folder ? "-" : sizeLabel(entry.bytes)}</td><td>{entry.modified.slice(0, 16)}</td><td className="ifm-permission">{entry.permission}</td><td><div className="ifm-row-actions">{entry.folder ? <button onClick={event => { event.stopPropagation(); navigate(entry.path); }}>打开</button> : <><button disabled={busy} onClick={event => { event.stopPropagation(); void download(entry); }}>下载</button>{isEditable(entry) && <button onClick={() => openEditor(entry)}>编辑</button>}</>}<DropdownMenu><DropdownMenuTrigger asChild><button aria-label={`${baseName(entry.path)} 更多操作`} onClick={event => { detailsTriggerRef.current = event.currentTarget; }}>更多<ChevronDown size={13} /></button></DropdownMenuTrigger><DropdownMenuContent className="ifm-menu" align="end"><DropdownMenuItem onSelect={() => { setActivePath(entry.path); setDetailsOpen(true); }}><FileText size={15} />查看详情</DropdownMenuItem><DropdownMenuItem onSelect={() => openDialog("rename", entry)}><FilePenLine size={15} />重命名</DropdownMenuItem><DropdownMenuItem onSelect={() => void copy(entry.path)}><Copy size={15} />复制路径</DropdownMenuItem>{entry.folder && <DropdownMenuItem onSelect={() => void download(entry)}><Download size={15} />下载压缩包</DropdownMenuItem>}<DropdownMenuItem className="ifm-danger" onSelect={() => openDialog("delete", entry)}><Trash2 size={15} />删除</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></td></tr>)}</tbody></table>{!rows.length && <div className="ifm-empty"><FolderOpen size={32} /><strong>{query ? "没有匹配的文件或文件夹" : "此文件夹为空"}</strong><button onClick={() => query ? setQuery("") : openDialog("file")}>{query ? "清除搜索" : "新建文件"}</button></div>}</div>{dragging && <div className="ifm-drop-hint"><Upload size={28} /><strong>松开以上传到当前目录</strong></div>}
    </section>}
    {detailsVisible && <aside className="ifm-sidebar" aria-label="文件详情"><section className="gsd-card ifm-details"><header className="ifm-details-header"><h2><FileText size={20} />文件详情</h2><button aria-label="关闭文件详情" onClick={() => { setDetailsOpen(false); detailsTriggerRef.current?.focus(); }}><X size={18} /></button></header>{selected ? <><div className="ifm-detail-heading"><span><EntryIcon entry={selected} large /></span><div><h3>{baseName(selected.path)}</h3><p>{typeLabel(selected)}{!selected.folder && ` · ${sizeLabel(selected.bytes)}`}</p></div></div><dl><div><dt>位置</dt><dd><span title={selected.path}>{selected.path}</span><button aria-label="复制文件位置" onClick={() => void copy(selected.path)}><Copy size={16} /></button></dd></div><div><dt>大小</dt><dd>{selected.folder ? `${entries.filter(entry => parentPath(entry.path) === selected.path).length} 个项目` : `${selected.bytes.toLocaleString("en-US")} 字节（${sizeLabel(selected.bytes)}）`}</dd></div><div><dt>修改时间</dt><dd>{selected.modified}</dd></div><div><dt>创建时间</dt><dd>{selected.created}</dd></div><div><dt>最后修改者</dt><dd><UserRound size={16} />Rimon12</dd></div><div><dt>权限</dt><dd><code>{selected.permission}（{selected.permission === "-rw-r--r--" ? "644" : "755"}）</code></dd></div><div><dt>标签</dt><dd className="ifm-tags">{(selected.tags || [selected.folder ? "目录" : typeLabel(selected)]).map((tag, index) => <span key={tag} className={index === 1 ? "green" : ""}>{tag}</span>)}</dd></div></dl><div className="ifm-detail-actions"><button className="gsd-button primary" disabled={busy} onClick={() => void download(selected)}><Download size={19} />{selected.folder ? "下载文件夹" : "下载文件"}</button><button className="gsd-button" onClick={() => void copy(selected.path)}><Copy size={18} />复制路径</button></div></> : <div className="ifm-detail-empty"><FileText size={35} /><p>选择文件或文件夹查看详情</p></div>}</section></aside>}
    <Dialog open={!!dialog} onOpenChange={open => { if (!open && !busy) setDialog(null); }}><DialogContent className="cloud-modal ifm-dialog"><DialogTitle>{{ file: "新建文件", folder: "新建文件夹", rename: "重命名", delete: "删除所选项目", extract: "解压缩 ZIP 文件" }[dialog?.kind || "file"]}</DialogTitle><DialogDescription>当前目录：{directory}/。操作仅保存在本地演示会话中，不会修改真实服务器。</DialogDescription>{dialog?.kind === "delete" ? <p>确认将 {dialog.target ? baseName(dialog.target.path) : `${dialog.paths?.length} 个项目`} 移入本地回收区？文件夹内的内容也会一起移除。</p> : dialog?.kind === "extract" ? <><p>选择 ZIP 压缩包，解压到当前目录。同名文件不会被覆盖。</p><input type="file" accept=".zip,application/zip" aria-label="选择 ZIP 压缩包" disabled={busy} onChange={event => { const file = event.target.files?.[0]; if (file) void extract(file); event.target.value = ""; }} /></> : <>{<label className="ifm-field">{dialog?.kind === "folder" ? "文件夹名称" : "文件名称"}<input autoFocus aria-label="名称" value={name} onChange={event => setName(event.target.value)} placeholder={dialog?.kind === "folder" ? "例如：new-folder" : "例如：config.txt"} onKeyDown={event => { if (event.key === "Enter") submit(); }} /></label>}{dialog?.kind === "file" && <label className="ifm-field">文件内容<textarea aria-label="文件内容" spellCheck={false} value={text} onChange={event => setText(event.target.value)} /></label>}</>}{error && <p className="ifm-error" role="alert">{error}</p>}<footer><button className="gsd-button" disabled={busy} onClick={() => setDialog(null)}>取消</button>{dialog?.kind !== "extract" && <button className={`gsd-button ${dialog?.kind === "delete" ? "ifm-delete-button" : "primary"}`} onClick={submit}>{dialog?.kind === "delete" ? "确认删除" : "确认"}</button>}{busy && <span role="status"><LoaderCircle size={16} className="ifm-spin" />正在处理...</span>}</footer></DialogContent></Dialog>
    <Dialog open={leavePromptOpen} onOpenChange={open => { if (!open) setLeavePromptOpen(false); }}><DialogContent className="cloud-modal ifm-dialog"><DialogTitle>存在未保存的修改</DialogTitle><DialogDescription>以下文件有未保存的修改：{dirtyEditorPaths.map(path => baseName(path).replace(/^\.untitled-\d+\.txt$/, "未命名.txt")).join("、")}</DialogDescription><p>返回文件列表后，未保存内容会保留在当前编辑会话中，不会写入服务器。</p><footer><button className="gsd-button" onClick={() => setLeavePromptOpen(false)}>继续编辑</button><button className="gsd-button primary" onClick={confirmExitEditor}>返回文件列表</button></footer></DialogContent></Dialog>
    <Dialog open={manualCopyPath !== null} onOpenChange={open => { if (!open) setManualCopyPath(null); }}><DialogContent className="cloud-modal ifm-dialog"><DialogTitle>复制路径</DialogTitle><DialogDescription>浏览器未允许自动复制，请按 Ctrl+C 或 Command+C 复制已选中的路径。</DialogDescription><label className="ifm-field">路径<input aria-label="待复制路径" readOnly value={manualCopyPath || ""} autoFocus onFocus={event => event.currentTarget.select()} /></label><footer><button className="gsd-button primary" onClick={() => setManualCopyPath(null)}>完成</button></footer></DialogContent></Dialog>
  </div>;
}
