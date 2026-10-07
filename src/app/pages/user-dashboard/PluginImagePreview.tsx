import { useEffect, useRef, useState, type ReactNode, type SyntheticEvent } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ChevronLeft, ChevronRight, Download, Image as ImageIcon, Maximize, Minimize, PanelRight, Tag, X } from 'lucide-react';
import '../../../styles/cloud-plugin-image-preview.css';
import { zoomAtPoint, type ImageTransform } from './imagePreviewTransform';

type GalleryImage = { file: string; alt: string };
type Props = { images: GalleryImage[]; activeIndex: number; pluginName: string; onSelect: (index: number) => void };
const imagePath = (image: GalleryImage) => `/console/plugins/details/${image.file}.webp`;
const formatBytes = (bytes: number) => bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;

function ZoomablePluginImage({ src, alt, onLoad, children }: {
  src: string; alt: string; onLoad: (event: SyntheticEvent<HTMLImageElement>) => void; children: ReactNode;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const transform = useRef<ImageTransform>({ scale: 1, x: 0, y: 0 });
  const drag = useRef<{ id: number; clientX: number; clientY: number; x: number; y: number } | null>(null);
  const [view, setView] = useState(transform.current);
  const [dragging, setDragging] = useState(false);
  const update = (next: ImageTransform) => { transform.current = next; setView(next); };
  const reset = () => { update({ scale: 1, x: 0, y: 0 }); drag.current = null; setDragging(false); };

  useEffect(() => {
    const element = stage.current!;
    const wheel = (event: WheelEvent) => {
      if ((event.target as Element).closest('button') || event.deltaY === 0) return;
      event.preventDefault();
      const rect = element.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      // 使用元素自身坐标，兼容控制台缩放及全屏/侧栏布局变化。
      const point = { x: (event.clientX - rect.left) * element.clientWidth / rect.width, y: (event.clientY - rect.top) * element.clientHeight / rect.height };
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.clientHeight : 1);
      update(zoomAtPoint(transform.current, Math.exp(-Math.max(-120, Math.min(120, delta)) * 0.002), point));
    };
    element.addEventListener('wheel', wheel, { passive: false });
    const observer = new ResizeObserver(reset);
    observer.observe(element);
    return () => { element.removeEventListener('wheel', wheel); observer.disconnect(); };
  }, []);

  return <div ref={stage} className={`gpv-stage${view.scale > 1 ? ' is-zoomed' : ''}${dragging ? ' is-dragging' : ''}`} onPointerDown={event => {
    if (event.button !== 0 || !event.isPrimary || view.scale <= 1 || (event.target as Element).closest('button')) return;
    event.preventDefault();
    drag.current = { id: event.pointerId, clientX: event.clientX, clientY: event.clientY, x: transform.current.x, y: transform.current.y };
    event.currentTarget.setPointerCapture(event.pointerId); setDragging(true);
  }} onPointerMove={event => {
    const origin = drag.current;
    if (!origin || origin.id !== event.pointerId) return;
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    const { scale } = transform.current;
    update({ scale,
      x: Math.max(-element.clientWidth * (scale - 1), Math.min(0, origin.x + (event.clientX - origin.clientX) * element.clientWidth / rect.width)),
      y: Math.max(-element.clientHeight * (scale - 1), Math.min(0, origin.y + (event.clientY - origin.clientY) * element.clientHeight / rect.height)),
    });
  }} onPointerUp={event => {
    if (drag.current?.id !== event.pointerId) return;
    event.currentTarget.releasePointerCapture(event.pointerId); drag.current = null; setDragging(false);
  }} onPointerCancel={() => { drag.current = null; setDragging(false); }} onLostPointerCapture={() => { drag.current = null; setDragging(false); }}>
    <img src={src} alt={alt} draggable={false} onLoad={onLoad} style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }} />
    {children}
    <span className="gpv-zoom-hint">滚轮缩放 · 放大后拖动</span>
    <div className="gpv-zoom-controls"><output aria-label="图片缩放比例">{Math.round(view.scale * 100)}%</output><button onClick={reset} disabled={view.scale === 1} aria-label="重置图片缩放">重置</button></div>
  </div>;
}

export function PluginImagePreview({ images, activeIndex, pluginName, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [dimensions, setDimensions] = useState<{ src: string; width: number; height: number } | null>(null);
  const [fileSize, setFileSize] = useState<{ src: string; bytes: number } | null>(null);
  const image = images[activeIndex];
  const src = imagePath(image);
  const resolution = dimensions?.src === src ? `${dimensions.width} × ${dimensions.height}` : '读取中…';
  const size = fileSize?.src === src ? formatBytes(fileSize.bytes) : '—';
  const move = (step: number) => onSelect((activeIndex + step + images.length) % images.length);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    fetch(src, { signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error('图片读取失败'); return response.blob(); })
      .then(blob => setFileSize({ src, bytes: blob.size }))
      .catch(() => { /* 文件大小不可用时保留占位，不影响图片预览。 */ });
    return () => controller.abort();
  }, [open, src]);

  return <Dialog.Root open={open} onOpenChange={value => {
    setOpen(value);
    if (value) { setDetailsOpen(false); setExpanded(false); }
  }}>
    <Dialog.Trigger asChild>
      <button className="gpd-hero-open" aria-label={`打开图片预览：${image.alt}`}>
        <img src={src} alt={image.alt} />
        <span className="gpd-hero-preview-hint"><Maximize size={16} />点击查看大图</span>
      </button>
    </Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay className="gpv-overlay" />
      <Dialog.Content className={`gpv-dialog${expanded ? ' is-expanded' : ''}`} onKeyDown={event => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1);
        }
      }}>
        <header className="gpv-header">
          <span className="gpv-file-icon"><ImageIcon size={25} /></span>
          <div className="gpv-heading">
            <Dialog.Title>{image.alt}</Dialog.Title>
            <Dialog.Description>{pluginName} · {activeIndex + 1} / {images.length}<span>图片预览</span></Dialog.Description>
          </div>
          <div className="gpv-actions">
            <a href={src} download={`${image.file}.webp`} className="gpv-action"><Download size={17} /><span>下载</span></a>
            <button className="gpv-action" onClick={() => setExpanded(value => !value)} aria-label={expanded ? '退出全屏查看' : '全屏查看'}>{expanded ? <Minimize size={17} /> : <Maximize size={17} />}<span>{expanded ? '退出全屏' : '全屏查看'}</span></button>
            <button className={`gpv-action${detailsOpen ? ' active' : ''}`} aria-expanded={detailsOpen} aria-controls="gpv-file-details" onClick={() => setDetailsOpen(value => !value)}><PanelRight size={17} /><span>文件信息</span></button>
            <Dialog.Close className="gpv-close" aria-label="关闭图片预览"><X size={21} /></Dialog.Close>
          </div>
        </header>
        <div className={`gpv-body${detailsOpen ? ' details-open' : ''}`}>
          <div className="gpv-gallery">
            <ZoomablePluginImage key={src} src={src} alt={image.alt} onLoad={event => setDimensions({ src, width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })}>
              <button className="gpv-arrow previous" aria-label="预览上一张图片" onClick={() => move(-1)}><ChevronLeft size={24} /></button>
              <button className="gpv-arrow next" aria-label="预览下一张图片" onClick={() => move(1)}><ChevronRight size={24} /></button>
              <span className="gpv-counter" aria-live="polite">{activeIndex + 1} / {images.length}</span>
            </ZoomablePluginImage>
            <nav className="gpv-thumbnails" aria-label="预览图片列表">{images.map((item, index) => <button key={item.file} className={activeIndex === index ? 'active' : ''} aria-label={`查看第 ${index + 1} 张：${item.alt}`} aria-pressed={activeIndex === index} onClick={() => onSelect(index)}><img src={imagePath(item)} alt="" /></button>)}</nav>
          </div>
          <aside className="gpv-details" id="gpv-file-details" aria-hidden={!detailsOpen} {...(!detailsOpen ? { inert: '' } : {})}>
            <div className="gpv-details-inner">
              <section><h3><ImageIcon size={18} />文件信息</h3><dl>
                <div><dt>文件名</dt><dd>{image.file}.webp</dd></div>
                <div><dt>文件类型</dt><dd>WebP 图片</dd></div>
                <div><dt>文件大小</dt><dd>{size}</dd></div>
                <div><dt>分辨率</dt><dd>{resolution}</dd></div>
                <div><dt>所属插件</dt><dd>{pluginName}</dd></div>
                <div><dt>文件路径</dt><dd className="gpv-path">{src}</dd></div>
              </dl></section>
              <section><h3><Tag size={18} />图片标签</h3><div className="gpv-tags"><span>Minecraft</span><span>插件展示</span></div></section>
              <section><h3><ImageIcon size={18} />图片描述</h3><p>{image.alt}</p></section>
            </div>
          </aside>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
