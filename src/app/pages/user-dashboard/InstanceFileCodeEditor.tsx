import { useEffect, useRef, useState } from "react";
import Editor, { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor/editor/editor.api.js";
import "monaco-editor/editor/browser/coreCommands.js";
import "monaco-editor/editor/contrib/tokenization/browser/tokenization.js";
import "monaco-editor/editor/contrib/find/browser/findController.js";
import "monaco-editor/editor/contrib/folding/browser/folding.js";
import "monaco-editor/editor/contrib/bracketMatching/browser/bracketMatching.js";
import "monaco-editor/editor/contrib/suggest/browser/suggestController.js";
import "monaco-editor/editor/contrib/snippet/browser/snippetController2.js";
import "monaco-editor/editor/contrib/contextmenu/browser/contextmenu.js";
import "monaco-editor/languages/definitions/ini/register.js";
import "monaco-editor/languages/definitions/shell/register.js";
import "monaco-editor/languages/definitions/yaml/register.js";
import "monaco-editor/languages/definitions/xml/register.js";
import "monaco-editor/languages/definitions/markdown/register.js";
import "monaco-editor/languages/features/json/register.js";
import EditorWorker from "monaco-editor/editor/editor.worker?worker";
import JsonWorker from "monaco-editor/language/json/json.worker?worker";
import { ArrowLeft, FileCode2, Save, X } from "lucide-react";

// Bundle workers locally so opening a server file never requires a third-party CDN.
self.MonacoEnvironment = {
  getWorker: (_: string, label: string) => label === "json" ? new JsonWorker() : new EditorWorker(),
};
loader.config({ monaco });

type Props = {
  tabs: { path: string; dirty: boolean }[];
  path: string | null;
  value: string;
  dirty: boolean;
  onChange: (value: string) => void;
  onSelect: (path: string) => void;
  onClose: (path: string) => void;
  onSave: () => void;
  onBack: () => void;
};
const filename = (path: string) => path.split("/").pop() || path;
const languageFor = (path: string) => ({ json: "json", sh: "shell", ini: "ini", cfg: "ini", conf: "ini", properties: "ini", yml: "yaml", yaml: "yaml", xml: "xml", md: "markdown" }[path.split(".").pop()?.toLowerCase() || ""] || "plaintext");

export default function InstanceFileCodeEditor({ tabs, path, value, dirty, onChange, onSelect, onClose, onSave, onBack }: Props) {
  const saveRef = useRef(onSave);
  saveRef.current = onSave;
  const cursorSubscription = useRef<monaco.IDisposable | null>(null);
  const [position, setPosition] = useState({ lineNumber: 1, column: 1 });
  useEffect(() => () => cursorSubscription.current?.dispose(), []);

  return <section className="gsd-card ifm-code-workspace" aria-label="代码编辑工作区">
    <header className="ifm-code-toolbar">
      <button className="gsd-button" onClick={onBack}><ArrowLeft size={16} />返回文件列表</button>
      <span className="ifm-code-current" title={path || ""}>{path ? filename(path) : "代码编辑器"}{dirty && <span className="ifm-code-unsaved">未保存</span>}</span>
      <button className="gsd-button primary" disabled={!path || !dirty} onClick={onSave}><Save size={16} />保存文件<span className="ifm-code-shortcut">Ctrl+S</span></button>
    </header>
    <div className="ifm-code-tabs" role="tablist" aria-label="打开的文件">
      {tabs.map(tab => <div key={tab.path} className={`ifm-code-tab${tab.path === path ? " active" : ""}`}>
        <button role="tab" aria-selected={tab.path === path} aria-label={`编辑 ${filename(tab.path)}`} onClick={() => onSelect(tab.path)}><FileCode2 size={15} /><span>{filename(tab.path)}</span>{tab.dirty && <span className="ifm-code-dirty" aria-label="未保存修改" />}</button>
        <button className="ifm-code-close" aria-label={`关闭 ${filename(tab.path)}`} onClick={() => onClose(tab.path)}><X size={14} /></button>
      </div>)}
    </div>
    <div className="ifm-code-surface">
      {path ? <Editor path={path} language={languageFor(path)} value={value} theme="vs" onChange={next => onChange(next ?? "")} loading={<span className="ifm-code-loading" role="status">正在加载代码编辑器…</span>}
        options={{ editContext: false, automaticLayout: true, fontSize: 14, fontFamily: 'Consolas, "Courier New", monospace', lineNumbers: "on", minimap: { enabled: false }, scrollBeyondLastLine: false, tabSize: 2, insertSpaces: true, padding: { top: 16, bottom: 16 }, renderLineHighlight: "all", smoothScrolling: true, ariaLabel: `文件内容 ${filename(path)}` }}
        onMount={editor => {
          editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => saveRef.current());
          cursorSubscription.current?.dispose();
          cursorSubscription.current = editor.onDidChangeCursorPosition(event => setPosition(event.position));
          editor.focus();
        }} /> : <div className="ifm-code-empty"><FileCode2 size={44} /><strong>选择左侧文件开始编辑</strong><span>支持配置文件、脚本和文本文件</span></div>}
    </div>
    <footer className="ifm-code-status"><span>{path ? dirty ? "有未保存的修改" : "已保存" : "未打开文件"}</span><div><span>行 {position.lineNumber}，列 {position.column}</span><span>UTF-8</span><span>{path ? languageFor(path).toUpperCase() : "TEXT"}</span></div></footer>
  </section>;
}
