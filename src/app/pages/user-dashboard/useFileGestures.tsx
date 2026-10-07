import { useEffect, useRef, useState, type Dispatch, type SetStateAction, type PointerEvent, type MouseEvent, type KeyboardEvent, type ClipboardEvent, type MutableRefObject } from "react";
import { createPortal } from "react-dom";

type Point = { x: number; y: number };
type Box = Point & { width: number; height: number };
type Gesture = {
  pointerId: number; surface: HTMLElement; start: Point; point: Point; contentStart: Point;
  paths: string[]; before: string[]; additive: boolean; source?: string; moved: boolean;
};
type Options = {
  selected: string[]; setSelected: Dispatch<SetStateAction<string[]>>; disabled: boolean;
  anchor?: MutableRefObject<string | null>;
  canMove: (paths: string[], target: string) => boolean;
  onMove: (paths: string[], target: string) => void;
  onDelete: (paths: string[]) => void;
  onCopy?: (paths: string[]) => void;
  onCut?: (paths: string[]) => void;
  onPaste?: (destination: string) => void;
};

export function useFileGestures(options: Options) {
  const latest = useRef(options); latest.current = options;
  const gesture = useRef<Gesture | null>(null);
  const fallbackAnchor = useRef<string | null>(null);
  const anchor = options.anchor || fallbackAnchor;
  const suppressClick = useRef(false);
  const frame = useRef<number | null>(null);
  const [box, setBox] = useState<Box | null>(null);
  const [moving, setMoving] = useState<{ point: Point; count: number; target: string | null; valid: boolean } | null>(null);
  const visiblePaths = (surface: HTMLElement) => Array.from(surface.querySelectorAll<HTMLElement>('[data-file-path]:not([data-file-root])')).map(row => row.dataset.filePath!);
  const targetAt = (point: Point) => {
    const node = document.elementFromPoint(point.x, point.y)?.closest<HTMLElement>('[data-folder-path], [data-drop-directory]');
    return node?.dataset.folderPath || node?.dataset.dropDirectory || null;
  };
  const update = () => {
    const current = gesture.current;
    if (!current?.moved) return;
    const surface = current.source ? document.elementFromPoint(current.point.x, current.point.y)?.closest<HTMLElement>('[data-file-surface]') : current.surface;
    if (surface) {
      const bounds = surface.getBoundingClientRect();
      if (current.point.x >= bounds.left && current.point.x <= bounds.right && current.point.y >= bounds.top - 24 && current.point.y <= bounds.bottom + 24) {
        const vertical = current.point.y < bounds.top + 24 ? -10 : current.point.y > bounds.bottom - 24 ? 10 : 0;
        const horizontal = current.point.x < bounds.left + 24 ? -10 : current.point.x > bounds.right - 24 ? 10 : 0;
        surface.scrollTop += vertical; surface.scrollLeft += horizontal;
      }
    }
    if (current.source) {
      const target = targetAt(current.point);
      setMoving({ point: current.point, count: current.paths.length, target, valid: !!target && latest.current.canMove(current.paths, target) });
    } else {
      const bounds = current.surface.getBoundingClientRect();
      const origin = { x: bounds.left + current.contentStart.x - current.surface.scrollLeft, y: bounds.top + current.contentStart.y - current.surface.scrollTop };
      const left = Math.max(bounds.left, Math.min(origin.x, current.point.x));
      const top = Math.max(bounds.top, Math.min(origin.y, current.point.y));
      const right = Math.min(bounds.right, Math.max(origin.x, current.point.x));
      const bottom = Math.min(bounds.bottom, Math.max(origin.y, current.point.y));
      setBox({ x: left, y: top, width: Math.max(0, right - left), height: Math.max(0, bottom - top) });
      const hits = Array.from(current.surface.querySelectorAll<HTMLElement>('[data-file-path]:not([data-file-root])')).filter(row => {
        const rect = row.getBoundingClientRect();
        return right > rect.left && left < rect.right && bottom > rect.top && top < rect.bottom;
      }).map(row => row.dataset.filePath!);
      const paths = current.additive ? [...new Set([...current.before, ...hits])] : hits;
      latest.current.setSelected(previous => previous.length === paths.length && previous.every((path, index) => path === paths[index]) ? previous : paths);
    }
  };
  const finish = () => {
    const current = gesture.current; gesture.current = null;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    if (current?.surface.hasPointerCapture(current.pointerId)) current.surface.releasePointerCapture(current.pointerId);
    setBox(null); setMoving(null);
  };
  useEffect(() => () => { if (frame.current !== null) cancelAnimationFrame(frame.current); }, []);
  const animate = () => { update(); if (gesture.current?.moved) frame.current = requestAnimationFrame(animate); };
  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    // Portaled menus bubble through React, but their clicks are not file-surface gestures.
    if (!event.currentTarget.contains(event.target as Node)) return;
    if (event.button !== 0 || !event.isPrimary) return;
    suppressClick.current = false;
    if (latest.current.disabled) return;
    const target = event.target as Element;
    if (target.closest('input, a, .ifm-tree-toggle, .ifm-row-actions, thead') || (target.closest('button') && !target.closest('.ifm-tree-label'))) return;
    const row = target.closest<HTMLElement>('[data-file-path]');
    if (row?.hasAttribute('data-file-root')) return;
    const source = row?.dataset.filePath;
    const before = latest.current.selected;
    const additive = event.ctrlKey || event.metaKey || event.shiftKey;
    let paths = source ? (before.includes(source) && !additive ? before : [source]) : [];
    if (source && event.shiftKey && anchor.current) {
      const visible = visiblePaths(event.currentTarget); const start = visible.indexOf(anchor.current); const end = visible.indexOf(source);
      if (start >= 0 && end >= 0) paths = visible.slice(Math.min(start, end), Math.max(start, end) + 1);
      if (event.ctrlKey || event.metaKey) paths = [...new Set([...before, ...paths])];
    } else if (source && (event.ctrlKey || event.metaKey)) paths = before.includes(source) ? before.filter(path => path !== source) : [...before, source];
    if (source && !event.shiftKey) anchor.current = source;
    latest.current.setSelected(source ? paths : additive ? before : []);
    const bounds = event.currentTarget.getBoundingClientRect();
    gesture.current = {
      pointerId: event.pointerId, surface: event.currentTarget, start: { x: event.clientX, y: event.clientY }, point: { x: event.clientX, y: event.clientY },
      contentStart: { x: event.clientX - bounds.left + event.currentTarget.scrollLeft, y: event.clientY - bounds.top + event.currentTarget.scrollTop },
      before, paths, additive, source, moved: false,
    };
    // Blank-space gestures need capture immediately; row gestures capture only after crossing the drag threshold so button clicks still work.
    if (!source) { event.preventDefault(); event.currentTarget.focus({ preventScroll: true }); event.currentTarget.setPointerCapture(event.pointerId); }
  };
  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    const current = gesture.current;
    if (!current || current.pointerId !== event.pointerId) return;
    current.point = { x: event.clientX, y: event.clientY };
    if (!current.moved && Math.hypot(event.clientX - current.start.x, event.clientY - current.start.y) >= 5) {
      current.moved = true; suppressClick.current = true;
      current.surface.setPointerCapture(event.pointerId); event.preventDefault();
      animate();
    }
    if (current.moved) update();
  };
  const onPointerUp = (event: PointerEvent<HTMLElement>) => {
    const current = gesture.current;
    if (!current || current.pointerId !== event.pointerId) return;
    if (current.moved) {
      current.point = { x: event.clientX, y: event.clientY }; update();
      if (current.source) {
        const target = targetAt(current.point);
        if (target) latest.current.onMove(current.paths, target);
      }
    }
    finish();
  };
  const onClickCapture = (event: MouseEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.target as Node)) return;
    if (suppressClick.current) { suppressClick.current = false; event.preventDefault(); event.stopPropagation(); return; }
    const row = (event.target as Element).closest<HTMLElement>('[data-file-path]');
    if (!row || row.hasAttribute('data-file-root') || (event.target as Element).closest('input, .ifm-tree-toggle, .ifm-row-actions')) return;
    if (event.ctrlKey || event.metaKey || event.shiftKey) { event.preventDefault(); event.stopPropagation(); return; }
    latest.current.setSelected([row.dataset.filePath!]);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.target as Node)) return;
    if ((event.target as Element).closest('input:not([type="checkbox"]), textarea, [contenteditable="true"], [role="textbox"]')) return;
    if (latest.current.disabled) return;
    if (event.ctrlKey || event.metaKey) {
      const key = event.key.toLowerCase();
      if (key === 'c' || key === 'x') {
        event.preventDefault();
        if (latest.current.selected.length) (key === 'c' ? latest.current.onCopy : latest.current.onCut)?.(latest.current.selected);
        return;
      }
      if (key === 'v') { event.preventDefault(); latest.current.onPaste?.(event.currentTarget.dataset.dropDirectory!); return; }
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') { event.preventDefault(); latest.current.setSelected(visiblePaths(event.currentTarget)); }
    if (event.key === 'Escape') { event.preventDefault(); finish(); latest.current.setSelected([]); }
    if (event.key === 'Delete' && latest.current.selected.length) { event.preventDefault(); latest.current.onDelete(latest.current.selected); }
  };
  const onClipboard = (event: ClipboardEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.target as Node) || latest.current.disabled) return;
    if ((event.target as Element).closest('input:not([type="checkbox"]), textarea, [contenteditable="true"], [role="textbox"]')) return;
    event.preventDefault();
    if (event.type === 'paste') latest.current.onPaste?.(event.currentTarget.dataset.dropDirectory!);
    else if (latest.current.selected.length) (event.type === 'copy' ? latest.current.onCopy : latest.current.onCut)?.(latest.current.selected);
  };
  return {
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: finish, onLostPointerCapture: finish, onClickCapture, onKeyDown, onCopy: onClipboard, onCut: onClipboard, onPaste: onClipboard, onDragStart: (event: MouseEvent<HTMLElement>) => event.preventDefault() },
    target: moving?.valid ? moving.target : null,
    overlay: box || moving ? createPortal(<>
      {box && <div className="ifm-marquee" style={{ left: box.x, top: box.y, width: box.width, height: box.height }} />}
      {moving && <div className={`ifm-move-preview${moving.valid ? '' : ' invalid'}`} style={{ left: moving.point.x + 16, top: moving.point.y + 16 }}>{moving.count} 项 · {moving.valid ? '移入 ' + moving.target?.split('/').pop() : '请选择目标文件夹'}</div>}
    </>, document.body) : null,
  };
}
