import { useEffect, useLayoutEffect, useRef, useState, type MutableRefObject } from 'react';
import { ArrowLeft, BadgeCheck, Box, Check, ChevronDown, ChevronLeft, ChevronRight, Clock3, Coins, Download, Flame, Gift, Layers, MoreVertical, Package, Puzzle, RefreshCw, Search, ShieldCheck, ShoppingBag, Star, Tag, Timer, Trash2, Upload, type LucideIcon } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { pluginFeatures, pluginIntroduction, pluginVersions, marketplacePlugins, type InstalledPlugin, type MarketplacePlugin } from './gameServerPluginsData';
import { PluginImagePreview } from './PluginImagePreview';
import '../../../styles/cloud-plugin-details.css';

type Props = {
  plugin: MarketplacePlugin; plugins: MarketplacePlugin[]; installed: InstalledPlugin[];
  categories: { name: string; icon: LucideIcon; tone: string }[];
  query: string; category: string; platform: string; transitioning: boolean;
  listScrollMemory: MutableRefObject<{ filters: string; top: number }>;
  onQuery: (value: string) => void; onCategory: (value: string) => void; onPlatform: (value: string) => void;
  onSelect: (id: string) => void; onBack: () => void; onReset: () => void;
  onInstall: (plugin: MarketplacePlugin) => void; onUpdate: (id: string) => void;
  onManage: () => void; onToggle: (id: string) => void; onUninstall: (id: string) => void;
};
const gallery = [
  { file: 'village', alt: 'Minecraft 日落河畔村庄' },
  { file: 'commands', alt: 'Minecraft 插件指令界面' },
  { file: 'interior', alt: 'Minecraft 木屋内景' },
  { file: 'garden', alt: 'Minecraft 村庄花园' },
  { file: 'town', alt: 'Minecraft 村庄与传送点' },
];
const detailTabs = ['详情', '版本', '更新日志', '评论'];
const platformIcons: Record<string, string> = {
  Paper: '/console/server-platforms/paper.svg',
  Spigot: '/console/server-platforms/spigot.png',
  Purpur: '/console/server-platforms/purpur.svg',
};

function PlatformIcons({ platforms }: { platforms: string[] }) {
  return <dt className="gpd-platform-icons">{Array.from(new Set([...platforms, 'Purpur'])).map(name => (
    <span key={name} className={`gpd-platform-icon${name === 'Paper' ? ' paper' : ''}`} title={name}>
      {platformIcons[name] ? <img src={platformIcons[name]} alt={name} width={28} height={24} /> : name}
    </span>
  ))}</dt>;
}

function PluginBadge({ plugin }: { plugin: MarketplacePlugin }) {
  return plugin.badge ? <span className={`gsp-badge ${plugin.badge === '推荐' ? 'green' : 'orange'}`}>{plugin.badge === '推荐' ? <Puzzle size={13} /> : <Flame size={13} />}{plugin.badge}</span> : null;
}
function PluginIcon({ id, name, large = false }: { id: string; name?: string; large?: boolean }) {
  const match = marketplacePlugins.find(p => p.id === id || p.name === name);
  return match ? <img src={large && id === 'essentials' ? '/console/plugins/details/essentials-icon.png' : `/console/plugins/${match.id}.png`} alt="" /> : <span className="gpd-icon-fallback"><Package size={23} /></span>;
}

export function GameServerPluginDetails(props: Props) {
  const { plugin: p, plugins, installed, onSelect, onInstall, onUpdate } = props;
  const favoriteKey = `cloud-plugin-favorite-demo-v1:${p.id}`;
  const [favorited, setFavorited] = useState(() => {
    try { return localStorage.getItem(favoriteKey) === 'true'; }
    catch { return false; }
  });
  useEffect(() => {
    try { localStorage.setItem(favoriteKey, String(favorited)); }
    catch { /* 存储不可用时仍可在当前页面切换收藏。 */ }
  }, [favoriteKey, favorited]);
  const [tab, setTab] = useState('详情');
  const [activeImage, setActiveImage] = useState(0);
  const [relatedOffset, setRelatedOffset] = useState(0);
  const [showAllUpdates, setShowAllUpdates] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const layout = useRef<HTMLDivElement>(null);
  const browser = useRef<HTMLElement>(null);
  const browserControls = useRef<HTMLDivElement>(null);
  const categoryRow = useRef<HTMLElement>(null);
  const pluginList = useRef<HTMLDivElement>(null);
  const listContent = useRef<HTMLDivElement>(null);
  const filters = JSON.stringify([props.query, props.category, props.platform]);
  useLayoutEffect(() => {
    const row = categoryRow.current!;
    let disposed = false;
    const fitOptions = () => {
      const options = Array.from(row.children) as HTMLElement[];
      // 每次先恢复全部选项测量，扩大容器时也能重新显示之前隐藏的项。
      options.forEach(option => { option.hidden = false; });
      const gap = Number.parseFloat(getComputedStyle(row).columnGap) || 0;
      let usedWidth = 0;
      let fits = true;
      options.forEach((option, index) => {
        const width = option.matches('.gsp-select') ? Number.parseFloat(getComputedStyle(option).minWidth) : option.offsetWidth;
        usedWidth += width + (index ? gap : 0);
        fits = fits && usedWidth <= row.clientWidth;
        option.hidden = index > 0 && !fits;
        if (option.hidden && option.contains(document.activeElement)) options[0].focus({ preventScroll: true });
      });
    };
    fitOptions();
    const observer = new ResizeObserver(fitOptions);
    observer.observe(row);
    window.addEventListener('resize', fitOptions);
    document.fonts.ready.then(() => { if (!disposed) fitOptions(); });
    return () => { disposed = true; observer.disconnect(); window.removeEventListener('resize', fitOptions); };
  }, [props.categories, props.category, props.platform]);
  useLayoutEffect(() => {
    const panel = browser.current!;
    const chrome = panel.closest('.cloud-shell')?.querySelector<HTMLElement>('.cloud-console-chrome');
    const updateHeight = () => {
      if (window.matchMedia('(max-width: 700px)').matches) {
        panel.style.removeProperty('--gpd-browser-height');
        panel.style.removeProperty('--gpd-browser-top');
        return;
      }
      const scale = Number.parseFloat(getComputedStyle(panel).getPropertyValue('--console-display-scale')) || 1;
      const toolbarBottom = chrome && getComputedStyle(chrome).position === 'sticky' ? chrome.getBoundingClientRect().bottom : 0;
      const stickyTop = Math.max(12, toolbarBottom + 12);
      const top = Math.max(stickyTop, layout.current!.getBoundingClientRect().top);
      panel.style.setProperty('--gpd-browser-top', `${stickyTop / scale}px`);
      panel.style.setProperty('--gpd-browser-height', `${Math.max(0, window.innerHeight - top - 12) / scale}px`);
    };
    let frame = 0;
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(() => { frame = 0; updateHeight(); });
    };
    updateHeight();
    const observer = new ResizeObserver(schedule);
    observer.observe(browserControls.current!);
    observer.observe(listContent.current!);
    observer.observe(layout.current!);
    if (chrome) observer.observe(chrome);
    window.addEventListener('resize', schedule);
    window.addEventListener('scroll', schedule, { passive: true });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('scroll', schedule);
    };
  }, []);
  useLayoutEffect(() => {
    const memory = props.listScrollMemory;
    const top = memory.current.filters === filters ? memory.current.top : 0;
    memory.current = { filters, top };
    pluginList.current!.scrollTop = top;
  }, [filters, props.listScrollMemory]);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, []);
  const current = installed.find(row => row.id === p.id);
  const canUpdate = current && (current.update || current.version !== pluginVersions[p.id]);
  const features = pluginFeatures[p.id] || [...p.tags, '灵活配置', '多语言支持', '稳定运行', '持续维护'];
  const related = marketplacePlugins.filter(row => row.id !== p.id).sort((a, b) => Number(b.categories.some(c => p.categories.includes(c))) - Number(a.categories.some(c => p.categories.includes(c))));
  const recent = ['essentials', 'coreprotect', 'worldedit', 'luckperms', 'worldguard'].map(id => marketplacePlugins.find(row => row.id === id)!);
  const installedPreview = [...installed].sort((a, b) => Number(marketplacePlugins.some(row => row.id === b.id)) - Number(marketplacePlugins.some(row => row.id === a.id))).slice(0, 5);
  const installButton = (row: MarketplacePlugin) => {
    const exists = installed.some(item => item.id === row.id);
    return <button className="gsp-install" disabled={exists} onClick={() => onInstall(row)} aria-label={`${exists ? '已安装' : row.price ? '购买' : '安装'} ${row.name}`}>{exists ? <><BadgeCheck size={14} />已安装</> : row.price ? `￥${row.price.toFixed(2)} 购买` : '一键安装'}</button>;
  };
  return <div className="gpd-layout" ref={layout}>
    <section className="gsd-card gpd-browser" aria-label="插件列表" ref={browser}>
      <div className="gpd-browser-controls" ref={browserControls}>
      <div className="gpd-search-row"><button className="gpd-back" onClick={props.onBack} aria-label="返回插件广场" title="返回插件广场"><ArrowLeft size={17} /></button><label className="gsp-search"><Search size={17} /><input aria-label="搜索插件" placeholder="搜索插件名称、功能或作者，如：Essentials、经济、传送..." value={props.query} onChange={e => props.onQuery(e.target.value)} /></label></div>
      <nav className="gsp-categories gpd-categories" aria-label="详情页插件分类" ref={categoryRow}>{props.categories.slice(0, 5).map(c => <button key={c.name} className={`${c.tone}${props.category === c.name ? ' active' : ''}`} aria-pressed={props.category === c.name} onClick={() => props.onCategory(c.name)}><c.icon size={15} />{c.name}</button>)}<label className="gsp-select"><select aria-label="详情页插件服务端" value={props.platform} onChange={e => props.onPlatform(e.target.value)}><option value="all">全部服务端</option><option>Paper</option><option>Spigot</option></select></label></nav>
      </div>
      <div className="gpd-plugin-list" ref={pluginList} role="region" aria-label="插件列表内容" tabIndex={0} onScroll={event => { props.listScrollMemory.current = { filters, top: event.currentTarget.scrollTop }; }}>
      <div className="gpd-plugin-list-content" ref={listContent}>{plugins.map(row => <article key={row.id} className={`gpd-list-plugin${row.id === p.id ? ' selected' : ''}`} style={{ viewTransitionName: props.transitioning ? `plugin-card-${row.id}` : undefined }}>
        <PluginIcon id={row.id} /><div className="gpd-list-copy"><h3><button className="gpd-select-plugin" onClick={() => onSelect(row.id)} aria-label={`查看 ${row.name} 插件详情（${row.price ? `付费 ￥${row.price.toFixed(2)}` : '免费'}）`} aria-current={row.id === p.id ? 'page' : undefined}><span className={`gpd-price-icon ${row.price ? 'paid' : 'free'}`} title={row.price ? `付费插件 · ￥${row.price.toFixed(2)}` : '免费插件'} aria-hidden="true">{row.price ? <Coins size={16} /> : <Gift size={16} />}</span><span>{row.name}</span></button><PluginBadge plugin={row} />{installed.some(item => item.id === row.id) && <span className="gsp-badge green">已安装</span>}</h3><p>{row.description}</p><div className="gpd-list-bottom"><div className="gsp-meta"><span><Tag size={13} />{row.minVersion} - 1.21</span><span><Star size={15} />{row.rating} ({row.reviews})</span><span><Download size={15} />{row.downloads}万+</span></div>{installButton(row)}</div></div>
      </article>)}
      {!plugins.length && <div className="gsp-empty"><Search size={26} /><h3>未找到匹配的插件</h3><p>试试其他关键词或分类。</p><button className="gsd-button" onClick={props.onReset}>重置筛选</button></div>}
      </div></div>
    </section>
    <section className="gsd-card gpd-detail" aria-label={`${p.name} 插件详情`}>
      <header className="gpd-summary"><div className="gpd-identity"><PluginIcon id={p.id} large /><div><h2 ref={heading} tabIndex={-1}>{p.name}<PluginBadge plugin={p} />{current && <span className="gsp-badge green">已安装</span>}</h2><p className="gpd-author">作者：{p.author}<BadgeCheck size={14} /></p><p>{p.id === 'essentials' ? '最受欢迎的基础功能插件，提供传送、家、经济、商店、TPA 等服务器核心功能，是大多数 Minecraft 服务器的必备插件。' : p.description}</p></div></div><div className="gpd-primary-actions"><button className="gsd-button primary" disabled={!!current && !canUpdate} onClick={() => current ? onUpdate(p.id) : onInstall(p)}>{current ? <Upload size={17} /> : <Download size={17} />}{current ? canUpdate ? '升级插件' : '已是最新版本' : p.price ? `￥${p.price.toFixed(2)} 购买` : '一键安装'}</button><DropdownMenu><DropdownMenuTrigger asChild><button className="gsd-button">更多操作<ChevronDown size={15} /></button></DropdownMenuTrigger><DropdownMenuContent align="end">{current && <><DropdownMenuItem onSelect={() => props.onToggle(p.id)}><ShieldCheck size={15} />{current.enabled ? '停用插件' : '启用插件'}</DropdownMenuItem><DropdownMenuItem onSelect={() => props.onUninstall(p.id)}><Trash2 size={15} />卸载插件</DropdownMenuItem></>}<DropdownMenuItem onSelect={props.onManage}><Box size={15} />管理已安装插件</DropdownMenuItem><DropdownMenuItem onSelect={props.onBack}><ArrowLeft size={15} />返回插件广场</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></header>
      <dl className="gpd-facts"><div><button type="button" className={`gpd-favorite${favorited ? ' active' : ''}`} aria-label={`${favorited ? '取消收藏' : '收藏'} ${p.name}`} aria-pressed={favorited} title={favorited ? '已收藏，点击取消收藏' : '未收藏，点击收藏'} onClick={() => setFavorited(previous => !previous)}><Star className="gpd-star" size={24} /></button><div><dd>({p.reviews}条评论)</dd><dt>{p.rating}</dt></div></div><div><Download size={23} /><div><dd>下载</dd><dt>{p.downloads}万+</dt></div></div><div><Timer size={23} /><div><dd>最新版本</dd><dt>{pluginVersions[p.id]}</dt></div></div><div><ShieldCheck size={22} /><div><dd>支持版本</dd><dt>{p.minVersion} - 1.21</dt></div></div><div><Layers size={22} /><div><dd>支持服务端</dd><PlatformIcons platforms={p.platforms} /></div></div></dl>
      <nav className="gpd-tabs" role="tablist" aria-label="插件详情标签">{detailTabs.map((name, index) => <button key={name} id={`gpd-tab-${index}`} role="tab" aria-selected={tab === name} aria-controls="gpd-content" tabIndex={tab === name ? 0 : -1} className={tab === name ? 'active' : ''} onClick={() => setTab(name)} onKeyDown={e => { const next = e.key === 'ArrowRight' ? (index + 1) % 4 : e.key === 'ArrowLeft' ? (index + 3) % 4 : e.key === 'Home' ? 0 : e.key === 'End' ? 3 : -1; if (next >= 0) { e.preventDefault(); setTab(detailTabs[next]); document.getElementById(`gpd-tab-${next}`)?.focus(); } }}>{name}{name === '评论' ? `（${p.reviews}）` : ''}</button>)}</nav>
      <div className="gpd-content" id="gpd-content" role="tabpanel" aria-labelledby={`gpd-tab-${detailTabs.indexOf(tab)}`}>
        {tab === '详情' && <><div className="gpd-gallery" aria-label="插件图片预览"><div className="gpd-hero-image"><PluginImagePreview images={gallery} activeIndex={activeImage} pluginName={p.name} onSelect={setActiveImage} /><button className="gpd-gallery-arrow previous" aria-label="上一张插件图片" onClick={() => setActiveImage(index => (index + gallery.length - 1) % gallery.length)}><ChevronLeft size={21} /></button><button className="gpd-gallery-arrow next" aria-label="下一张插件图片" onClick={() => setActiveImage(index => (index + 1) % gallery.length)}><ChevronRight size={21} /></button></div><div className="gpd-thumbnails">{gallery.map((item, index) => <button key={item.file} className={activeImage === index ? 'active' : ''} aria-label={`预览图片 ${index + 1}：${item.alt}`} aria-pressed={activeImage === index} onClick={() => setActiveImage(index)}><img src={`/console/plugins/details/${item.file}.webp`} alt="" /></button>)}</div></div><h3>插件介绍</h3><p className="gpd-introduction">{pluginIntroduction(p)}</p><h3>主要功能</h3><ul className="gpd-features">{features.map(feature => <li key={feature}><Check size={15} />{feature}</li>)}</ul><div className="gpd-install-guide"><h3>安装与使用</h3><p>选择“一键安装”将插件加入当前服务器，随后在插件管理中查看版本与启用状态。插件配置可在文件管理的 plugins 目录中调整。</p><span>当前页面为本地演示，安装与管理操作不会连接真实服务器。</span></div></>}
        {tab === '版本' && <div className="gpd-version-panel"><h3>可用版本</h3><p>选择适配当前服务器的插件版本。</p><article><div><strong>{p.name} {pluginVersions[p.id]}</strong><span className="gsp-badge green">最新版本</span><p>Minecraft {p.minVersion} - 1.21 · {p.platforms.join(' / ')} · {p.size.toFixed(1)} MB</p><small>{current ? `当前已安装：v${current.version}` : '当前服务器尚未安装此插件'}</small></div><button className="gsd-button primary" disabled={!!current && !canUpdate} onClick={() => current ? onUpdate(p.id) : onInstall(p)}>{current ? canUpdate ? '升级至此版本' : '已安装此版本' : '安装此版本'}</button></article></div>}
        {tab === '更新日志' && <div className="gpd-changelog"><h3>{p.name} {pluginVersions[p.id]}</h3><span className="gsp-badge green">最新版本</span><ul><li>优化 {p.tags[0]} 的配置与使用体验。</li><li>改善服务端兼容性与运行稳定性。</li><li>完善多语言提示和管理操作。</li></ul><p>以上为插件广场的演示更新说明。</p></div>}
        {tab === '评论' && <div className="gpd-reviews"><div className="gpd-review-summary"><strong>{p.rating}</strong><span><span className="gpd-rating-stars">{Array.from({ length: 5 }, (_, i) => <Star size={19} fill="currentColor" key={i} />)}</span>{p.reviews} 条评论</span></div>{['方块世界管理员', '生存服服主', 'Minecraft 玩家'].map((name, index) => <article key={name}><div><ShieldCheck size={20} /><strong>{name}</strong><span className="gpd-rating-stars">{Array.from({ length: 5 }, (_, i) => <Star size={12} fill="currentColor" key={i} />)}</span></div><p>{[`${p.name} 的配置清晰，${p.tags[0]}功能很实用。`, '安装方便，在生存服务器上运行稳定，推荐使用。', '管理体验很好，和现有插件配合起来也很方便。'][index]}</p><small>演示评论</small></article>)}</div>}
      </div>
    </section>
    <aside className="gpd-sidebar">
      <section className="gsd-card"><header><h2><Box size={21} />已安装插件</h2><button className="gpd-text-button" onClick={props.onManage}>管理</button></header><div className="gpd-installed">{installedPreview.map(row => <div className="gpd-installed-row" key={row.id}><PluginIcon id={row.id} name={row.name} /><div><strong>{row.name}</strong><small>v{row.version}</small></div><span className={`gsp-badge ${row.enabled ? 'green' : 'orange'}`}>{row.enabled ? '已启用' : '已停用'}</span><DropdownMenu><DropdownMenuTrigger asChild><button className="gpd-more" aria-label={`管理 ${row.name}`}><MoreVertical size={18} /></button></DropdownMenuTrigger><DropdownMenuContent align="end">{marketplacePlugins.some(item => item.id === row.id) && <DropdownMenuItem onSelect={() => onSelect(row.id)}>查看插件详情</DropdownMenuItem>}<DropdownMenuItem onSelect={() => props.onToggle(row.id)}>{row.enabled ? '停用插件' : '启用插件'}</DropdownMenuItem>{row.update && <DropdownMenuItem onSelect={() => onUpdate(row.id)}>更新插件</DropdownMenuItem>}<DropdownMenuItem onSelect={() => props.onUninstall(row.id)}>卸载插件</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>)}{!installed.length && <p>暂无已安装插件，选择插件开始安装。</p>}</div></section>
      <section className="gsd-card"><header><h2><Clock3 size={20} />最近更新的插件</h2><button className="gpd-text-button" onClick={() => setShowAllUpdates(!showAllUpdates)}>{showAllUpdates ? '收起' : '查看更多'}<ChevronRight size={14} /></button></header>{recent.slice(0, showAllUpdates ? 5 : 3).map((row, index) => <div className="gpd-recent-row" key={row.id}><PluginIcon id={row.id} /><div><button className="gpd-text-button ink" onClick={() => { onSelect(row.id); if (p.id === row.id) setTab('版本'); }}>{row.name}</button><small>{pluginVersions[row.id]}</small></div>{installed.some(item => item.id === row.id && (item.update || item.version !== pluginVersions[row.id])) && <span className="gpd-new-version">有新版本</span>}<time>2024-01-{15 - index * 2}</time></div>)}</section>
      <section className="gsd-card"><header><h2><ShoppingBag size={20} />相关插件推荐</h2><button className="gpd-text-button" onClick={() => setRelatedOffset(index => (index + 2) % related.length)}><RefreshCw size={14} />换一批</button></header>{[related[relatedOffset], related[(relatedOffset + 1) % related.length]].map(row => <article className="gpd-related" key={row.id}><PluginIcon id={row.id} /><div><h3><button className="gpd-text-button ink" onClick={() => onSelect(row.id)}>{row.name}</button></h3><p>{row.description}</p><footer><span><Star size={14} />{row.rating} ({row.reviews})</span><span><Download size={14} />{row.downloads}万+</span>{installButton(row)}</footer></div></article>)}</section>
    </aside>
  </div>;
}
