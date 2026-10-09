import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function BackupDescription({ description }: { description: string }) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const tooltipId = useId();
  const [truncated, setTruncated] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const text = textRef.current;
    if (!text) return;
    const mobile = window.matchMedia("(max-width: 760px), (hover: none)");
    const measure = () => {
      setTruncated(!mobile.matches && text.scrollWidth > text.clientWidth);
      setPosition(null);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(text);
    mobile.addEventListener("change", measure);
    measure();
    return () => { observer.disconnect(); mobile.removeEventListener("change", measure); };
  }, [description]);

  useEffect(() => {
    if (!position) return;
    const dismiss = () => setPosition(null);
    window.addEventListener("scroll", dismiss, true);
    window.addEventListener("resize", dismiss);
    return () => { window.removeEventListener("scroll", dismiss, true); window.removeEventListener("resize", dismiss); };
  }, [position !== null]);

  useLayoutEffect(() => {
    if (position && tooltipRef.current) setHeight(tooltipRef.current.offsetHeight);
  }, [position !== null, description]);

  const width = position ? Math.min(320, window.innerWidth - 16) : 320;
  return <>
    <p ref={textRef} className="gsb-detail-description" tabIndex={truncated ? 0 : undefined}
      aria-describedby={position ? tooltipId : undefined}
      onPointerMove={event => { if (truncated && event.pointerType === "mouse") setPosition({ x: event.clientX, y: event.clientY + 14 }); }}
      onPointerLeave={() => setPosition(null)}
      onFocus={event => { if (truncated && event.currentTarget.matches(":focus-visible")) { const rect = event.currentTarget.getBoundingClientRect(); setPosition({ x: rect.left, y: rect.bottom + 8 }); } }}
      onBlur={() => setPosition(null)}
      onKeyDown={event => { if (event.key === "Escape" && position) { event.stopPropagation(); setPosition(null); } }}>
      {description}
    </p>
    {position && truncated && createPortal(<div ref={tooltipRef} id={tooltipId} role="tooltip" className="gsb-description-tooltip"
      style={{ width, left: Math.max(8, Math.min(position.x, window.innerWidth - width - 8)), top: Math.max(8, Math.min(position.y, window.innerHeight - height - 8)) }}>{description}</div>, document.body)}
  </>;
}
