import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, Folder, Globe2, Pencil, Puzzle, Server, X } from "lucide-react";

const directories = [
  { label: "服务器目录", path: "/home/server", icon: Server },
  { label: "插件目录", path: "/minecraft/plugins", icon: Puzzle },
  { label: "世界目录", path: "/minecraft/world", icon: Globe2 },
];

export function BackupPathPicker({ value, onChange }: { value: string; onChange: (path: string) => void }) {
  const [custom, setCustom] = useState(false);
  const [customPath, setCustomPath] = useState("");
  const [error, setError] = useState("");
  const [restoreFocus, setRestoreFocus] = useState(false);
  const errorId = useId();
  const reducedMotion = useReducedMotion();
  const view = custom ? "custom" : value ? "selected" : "choices";
  const transition = { duration: reducedMotion ? 0 : 0.16 };
  const choose = (path: string) => {
    setRestoreFocus(true);
    setCustom(false);
    setError("");
    onChange(path);
  };
  const applyCustom = () => {
    const path = customPath.trim();
    if (!path.startsWith("/")) { setError("请输入以 / 开头的目录地址。"); return; }
    choose(path);
  };
  const cancelCustom = () => { setCustom(false); setError(""); setRestoreFocus(true); };

  return <motion.div layout className="gsbs-path-picker" transition={transition}>
    <AnimatePresence initial={false} mode="wait">
      <motion.div key={view} initial={{ opacity: 0, y: reducedMotion ? 0 : 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reducedMotion ? 0 : -6 }} transition={transition}>
        {view === "choices" && <div className="gsbs-path-choices" role="group" aria-label="选择备份路径">
          {directories.map(({ label, path, icon: Icon }, index) => <button key={path} type="button" autoFocus={restoreFocus && index === 0} onClick={() => choose(path)}><Icon size={16} /><span>{label}</span></button>)}
          <button type="button" onClick={() => { setCustomPath(""); setCustom(true); }}><Pencil size={16} /><span>自定义</span></button>
        </div>}
        {view === "selected" && <div className="gsbs-source-path">
          <div className="gsbs-selected-path"><Folder size={16} /><output aria-label="备份路径" title={value}>{value}</output></div>
          <button type="button" autoFocus={restoreFocus} aria-label="清除备份路径" onClick={() => choose("")}><X size={15} /><span>清除</span></button>
        </div>}
        {view === "custom" && <>
          <div className="gsbs-custom-path">
            <input autoFocus aria-label="自定义备份路径" placeholder="请输入目录地址，例如 /minecraft/world" value={customPath} aria-invalid={!!error} aria-describedby={error ? errorId : undefined} onChange={event => { setCustomPath(event.target.value); setError(""); }} onKeyDown={event => {
              if (event.key === "Enter") { event.preventDefault(); applyCustom(); }
              if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); cancelCustom(); }
            }} />
            <button type="button" aria-label="确认备份路径" onClick={applyCustom}><Check size={16} /></button>
            <button type="button" aria-label="取消自定义备份路径" onClick={cancelCustom}><X size={16} /></button>
          </div>
          {error && <p id={errorId} className="gsbs-path-error" role="alert">{error}</p>}
        </>}
      </motion.div>
    </AnimatePresence>
  </motion.div>;
}
