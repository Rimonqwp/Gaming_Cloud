import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ChevronLeft, ChevronRight, Download, Image as ImageIcon, Maximize, Minimize, PanelRight, Tag, X } from 'lucide-react';
import '../../../styles/cloud-plugin-image-preview.css';

type GalleryImage = { file: string; alt: string };
type Props = { images: GalleryImage[]; activeIndex: number; pluginName: string; onSelect: (index: number) => void };
const imagePath = (image: GalleryImage) => `/console/plugins/details/${image.file}.webp`;
const formatBytes = (bytes: number) => bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;

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
            <div className="gpv-stage">
              <img key={src} src={src} alt={image.alt} onLoad={event => setDimensions({ src, width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })} />
              <button className="gpv-arrow previous" aria-label="预览上一张图片" onClick={() => move(-1)}><ChevronLeft size={24} /></button>
              <button className="gpv-arrow next" aria-label="预览下一张图片" onClick={() => move(1)}><ChevronRight size={24} /></button>
              <span className="gpv-counter" aria-live="polite">{activeIndex + 1} / {images.length}</span>
            </div>
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
