import { useEffect, useRef, useState } from 'react';
import { Link as RouterLink, useSearchParams, useViewTransitionState } from 'react-router';
import { useReducedMotion } from 'motion/react';
import { ArrowUp, ArrowUpDown, Box, Check, ChevronRight, Compass, Download, FileText, Flame, Gamepad2, Layers, LayoutGrid, Link, List, Map, MessageCircle, Package, Puzzle, Search, Shield, Sparkles, Star, Tag, Trash2, Upload, Wrench } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../../components/ui/dialog';
import { Switch } from '../../components/ui/switch';
import type { ConsoleInstance } from './cloudDashboardData';
import { initialInstalledPlugins, marketplacePlugins, pluginVersions, type InstalledPlugin, type MarketplacePlugin } from './gameServerPluginsData';
import '../../../styles/cloud-plugins.css';
import { PluginBannerCarousel } from './PluginBannerCarousel';
import { GameServerPluginDetails } from './GameServerPluginDetails';

const categories = [
  { name: '全部', icon: Box, tone: 'blue' }, { name: '必备推荐', icon: Flame, tone: 'orange' },
  { name: '经济', icon: Package, tone: 'green' }, { name: '权限', icon: Shield, tone: 'blue' },
  { name: '地图', icon: Map, tone: 'orange' }, { name: '管理', icon: Link, tone: 'blue' },
  { name: '小游戏', icon: Gamepad2, tone: 'purple' }, { name: '装饰', icon: Puzzle, tone: 'green' },
  { name: '生存增强', icon: Sparkles, tone: 'purple' }, { name: '聊天社交', icon: MessageCircle, tone: 'cyan' },
  { name: '实用工具', icon: Wrench, tone: 'purple' },
];
function readInstalled(key: string): InstalledPlugin[] {
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null');
    if (Array.isArray(value) && value.every(p => typeof p.id === 'string' && typeof p.name === 'string' && typeof p.version === 'string' && typeof p.size === 'number' && Number.isFinite(p.size) && p.size >= 0 && typeof p.enabled === 'boolean' && typeof p.update === 'boolean')) return value;
  } catch { /* 本地演示存储不可用时仍可在当前会话操作。 */ }
  return initialInstalledPlugins;
}
const versions = ['1.21', '1.20.4', '1.19.4', '1.16.5', '1.8.8'];
const versionNumber = (v: string) => Number(v.split('.')[1]);
const needsUpdate = (p: InstalledPlugin) => p.update || !!pluginVersions[p.id] && p.version !== pluginVersions[p.id];
const tagTones: Record<string, string[]> = {
  essentials: ['purple', 'purple', 'purple'], luckperms: ['orange', 'purple', 'purple'],
  vault: ['green', 'purple', 'purple'], worldedit: ['blue', 'orange', 'orange'],
  worldguard: ['purple', 'orange', 'orange'], coreprotect: ['purple', 'purple', 'purple'],
  itemsadder: ['green', 'pink', 'purple'], bossshop: ['green', 'blue', 'orange'],
  mcmmo: ['green', 'blue', 'purple'], jobs: ['green', 'orange', 'pink'],
  citizens: ['purple', 'pink', 'orange'], homes: ['green', 'blue', 'purple'],
};

export function GameServerPlugins({ server, onNotice }: { server: ConsoleInstance; onNotice: (message: string) => void }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const reduceMotion = useReducedMotion();
  const transitioning = useViewTransitionState('.');
  const selected = marketplacePlugins.find(p => p.id === searchParams.get('plugin'));
  const pluginUrl = (id: string) => { const next = new URLSearchParams(searchParams); next.set('plugin', id); return `?${next}`; };
  const openPlugin = (id: string) => { const next = new URLSearchParams(searchParams); next.set('plugin', id); setSearchParams(next, { viewTransition: !selected && !reduceMotion }); };
  const backToCatalog = () => { const next = new URLSearchParams(searchParams); next.delete('plugin'); next.set('view', 'plugins'); setSearchParams(next, { viewTransition: !reduceMotion }); };
  const storageKey = `cloud-plugins-demo-v1:${server.id}`;
  const [installed, setInstalled] = useState(() => readInstalled(storageKey));
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('全部');
  const [platform, setPlatform] = useState('all');
  const listScrollMemory = useRef({ filters: '', top: 0 });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [version, setVersion] = useState('all');
  const [sort, setSort] = useState('default');
  const [modal, setModal] = useState<'manage' | 'upload' | 'ranking' | null>(null);
  const [purchase, setPurchase] = useState<MarketplacePlugin | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  useEffect(() => { try { localStorage.setItem(storageKey, JSON.stringify(installed)); } catch { /* 存储失败不影响会话内交互。 */ } }, [installed, storageKey]);
  const updates = installed.filter(needsUpdate).length;
  const size = installed.reduce((sum, p) => sum + p.size, 0);
  const ranking = [...marketplacePlugins].sort((a, b) => b.downloads - a.downloads);
  const filtered = marketplacePlugins.filter(p => `${p.name} ${p.description} ${p.tags.join(' ')} ${p.author}`.toLowerCase().includes(query.trim().toLowerCase()) && (category === '全部' || p.categories.includes(category)) && (platform === 'all' || p.platforms.includes(platform)) && (version === 'all' || versionNumber(version) >= versionNumber(p.minVersion)));
  if (sort === 'downloads') filtered.sort((a, b) => b.downloads - a.downloads);
  if (sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);
  if (sort === 'price') filtered.sort((a, b) => a.price - b.price);
  const install = (p: MarketplacePlugin) => {
    setInstalled(previous => previous.some(row => row.id === p.id) ? previous : [...previous, { id: p.id, name: p.name, version: pluginVersions[p.id], size: p.size, enabled: true, update: false }]);
    setPurchase(null); onNotice(`${p.name} 已安装（演示操作）`);
  };
  const updatePlugin = (id: string) => { setInstalled(rows => rows.map(p => p.id === id ? { ...p, version: pluginVersions[id] || '1.2.0', update: false } : p)); onNotice('插件已更新（演示操作）'); };
  const updateAll = () => { setInstalled(previous => previous.map(p => needsUpdate(p) ? { ...p, version: pluginVersions[p.id] || '1.2.0', update: false } : p)); onNotice(`已更新 ${updates} 个插件（演示操作）`); };
  const reset = () => { setQuery(''); setCategory('全部'); setPlatform('all'); setVersion('all'); setSort('default'); };
  return <div className={selected ? 'gsp-detail-root' : 'gsp-layout'} data-plugin-transition={transitioning || undefined}>
    {selected ? <GameServerPluginDetails key={selected.id} plugin={selected} plugins={filtered} installed={installed} categories={categories}
      sidebarCollapsed={sidebarCollapsed} onSidebarToggle={() => setSidebarCollapsed(previous => !previous)}
      query={query} category={category} platform={platform} transitioning={transitioning} listScrollMemory={listScrollMemory} onQuery={setQuery} onCategory={setCategory} onPlatform={setPlatform}
      onSelect={openPlugin} onBack={backToCatalog} onReset={reset} onInstall={p => p.price ? setPurchase(p) : install(p)} onUpdate={updatePlugin}
      onManage={() => setModal('manage')} onToggle={id => setInstalled(rows => rows.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p))}
      onUninstall={id => { setInstalled(rows => rows.filter(p => p.id !== id)); onNotice('插件已卸载（演示操作）'); }} /> : <>
    <div className="gsp-main">
      <PluginBannerCarousel />
      <section className="gsp-catalog" aria-label="插件目录">
        <div className="gsp-filters">
          <label className="gsp-search"><Search size={18} /><input aria-label="搜索插件" placeholder="搜索插件名称、功能或作者（如：Essentials、领地、传送...）" value={query} onChange={e => setQuery(e.target.value)} /></label>
          <label className="gsp-select"><LayoutGrid size={16} /><select aria-label="插件分类" value={category} onChange={e => setCategory(e.target.value)}>{categories.map(c => <option key={c.name} value={c.name}>{c.name === '全部' ? '全部分类' : c.name}</option>)}</select></label>
          <label className="gsp-select"><Layers size={17} /><select aria-label="插件服务端" value={platform} onChange={e => setPlatform(e.target.value)}><option value="all">全部服务端</option><option>Paper</option><option>Spigot</option></select></label>
          <label className="gsp-select"><Tag size={16} /><select aria-label="插件游戏版本" value={version} onChange={e => setVersion(e.target.value)}><option value="all">全部版本</option>{versions.map(v => <option key={v}>{v}</option>)}</select></label>
          <label className="gsp-select"><ArrowUpDown size={16} /><select aria-label="插件排序" value={sort} onChange={e => setSort(e.target.value)}><option value="default">综合排序</option><option value="downloads">下载最多</option><option value="rating">评分最高</option><option value="price">价格最低</option></select></label>
        </div>
        <nav className="gsp-categories" aria-label="插件快捷分类">{categories.map(c => <button key={c.name} className={`${c.tone}${category === c.name ? ' active' : ''}`} aria-pressed={category === c.name} onClick={() => setCategory(c.name)}><c.icon size={16} />{c.name}</button>)}</nav>
        <div className="gsp-grid">{filtered.map(p => {
          const exists = installed.some(row => row.id === p.id);
          return <article className="gsp-plugin" key={p.id} aria-label={p.name} style={{ viewTransitionName: transitioning ? `plugin-card-${p.id}` : undefined }}>
            <div className="gsp-plugin-top"><img src={`/console/plugins/${p.id}.png`} alt={`${p.name} 图标`} /><div><h3><RouterLink className="gsp-detail-link" to={pluginUrl(p.id)} viewTransition={!reduceMotion} aria-label={`查看 ${p.name} 插件详情`}>{p.name}</RouterLink>{p.badge && <span className={`gsp-badge ${p.badge === '推荐' ? 'green' : 'orange'}`}>{p.badge === '推荐' ? <Puzzle size={13} /> : <Flame size={13} />}{p.badge}</span>}</h3><p>{p.description}</p><div className="gsp-tags">{p.tags.map((t, i) => <span key={t} className={`tag-${tagTones[p.id]?.[i] || 'purple'}`}>{t}</span>)}</div></div></div>
            <div className="gsp-meta"><span><Compass size={13} />{p.minVersion} - 1.21</span><span><Star size={14} />{p.rating} ({p.reviews})</span><span><Download size={15} />{p.downloads}万+</span></div>
            <footer><strong className={p.price ? 'paid' : ''}>{p.price ? `￥${p.price.toFixed(2)}` : '免费'}</strong><button className={`gsp-install${p.price && !exists ? ' paid' : ''}`} disabled={exists} onClick={() => p.price ? setPurchase(p) : install(p)} aria-label={`${exists ? '已安装' : p.price ? '购买' : '安装'} ${p.name}`}>{exists ? <><Check size={14} />已安装</> : p.price ? '立即购买' : '一键安装'}</button></footer>
          </article>;
        })}</div>
        {!filtered.length && <div className="gsp-empty"><Search size={30} /><h3>未找到匹配的插件</h3><p>试试其他关键词，或调整分类、服务端和版本。</p><button className="gsd-button" onClick={reset}>重置筛选</button></div>}
      </section>
    </div>
    <aside className="gsp-sidebar">
      <section className="gsd-card gsp-overview"><h2><Box size={20} />插件概览</h2><div className="gsp-stats"><div className="green"><Puzzle size={27} /><div><span>已安装插件</span><strong>{installed.length}<small>个</small></strong></div></div><div className="blue"><Sparkles size={27} /><div><span>可更新插件</span><strong>{updates}<small>个</small></strong></div></div></div><dl><div><dt><Layers size={17} />服务端类型</dt><dd>Paper (Spigot)</dd></div><div><dt><Box size={17} />游戏版本</dt><dd>1.20.4</dd></div><div><dt><FileText size={17} />总插件文件大小</dt><dd>{size.toFixed(1)} MB</dd></div></dl></section>
      <section className="gsd-card gsp-actions"><h2><Box size={20} />快捷操作</h2><button className="gsd-button primary" disabled={!updates} onClick={updateAll}><ArrowUp size={18} />批量更新插件{updates > 0 && <span className="gsp-update-count">{updates}</span>}</button><button className="gsd-button" onClick={() => { setFile(null); setFileError(''); setModal('upload'); }}><Upload size={18} />上传插件文件</button><button className="gsd-button" onClick={() => setModal('manage')}><List size={18} />插件管理</button></section>
      <section className="gsd-card gsp-ranking"><header><h2><Flame size={20} />热门插件排行</h2><button onClick={() => setModal('ranking')}>查看全部<ChevronRight size={14} /></button></header><ol>{ranking.slice(0, 10).map((p, i) => <li key={p.id}><span className={`gsp-rank rank-${i}`}>{i + 1}</span><button onClick={() => { reset(); setQuery(p.name); }}>{p.name}</button><span>{p.downloads}万+</span></li>)}</ol></section>
    </aside>
    </>}
    <Dialog open={modal !== null} onOpenChange={open => { if (!open) setModal(null); }}><DialogContent className="cloud-modal gsd-dialog gsp-dialog"><DialogTitle>{modal === 'manage' ? '插件管理' : modal === 'upload' ? '上传插件文件' : '热门插件排行榜'}</DialogTitle><DialogDescription>{modal === 'manage' ? `${server.name} · ${installed.length} 个已安装插件。启停、更新与卸载均为本地演示。` : modal === 'upload' ? '选择 .jar 插件文件（最大 50 MB）。此演示仅保存文件信息，不会上传到服务器。' : '按下载量排序，发现热门插件（演示数据）。'}</DialogDescription>
      {modal === 'manage' && <div className="gsp-manage-list">{installed.map(p => <div className="gsp-manage-row" key={p.id}><div><strong>{p.name}</strong><small>v{p.version} · {p.size.toFixed(1)} MB{needsUpdate(p) ? ' · 可更新' : ''}</small></div><Switch className="gsd-switch" aria-label={`${p.name} 启用状态`} checked={p.enabled} onCheckedChange={enabled => setInstalled(rows => rows.map(row => row.id === p.id ? { ...row, enabled } : row))} />{needsUpdate(p) && <button className="gsd-button" aria-label={`更新 ${p.name}`} onClick={() => updatePlugin(p.id)}><ArrowUp size={16} /></button>}<button className="gsd-button danger" aria-label={`卸载 ${p.name}`} onClick={() => { setInstalled(rows => rows.filter(row => row.id !== p.id)); onNotice(`${p.name} 已卸载（演示操作）`); }}><Trash2 size={16} /></button></div>)}{!installed.length && <p>暂无已安装插件，可以前往广场安装。</p>}</div>}
      {modal === 'upload' && <form className="gsp-upload" onSubmit={e => { e.preventDefault(); if (!file || fileError) return; const name = file.name.replace(/\.jar$/i, ''); if (installed.some(p => p.name.toLowerCase() === name.toLowerCase())) { setFileError('已安装同名插件，请先在插件管理中卸载。'); return; } setInstalled(rows => [...rows, { id: `upload-${crypto.randomUUID()}`, name, size: file.size / 1048576, version: '本地文件', enabled: true, update: false }]); setModal(null); onNotice(`${file.name} 已加入插件列表（演示操作）`); }}><label>插件文件<input type="file" accept=".jar" aria-label="选择插件文件" onChange={e => { const selected = e.target.files?.[0] || null; setFile(selected); setFileError(selected && !/\.jar$/i.test(selected.name) ? '请选择 .jar 格式的插件文件。' : selected && selected.size > 50 * 1048576 ? '文件不能超过 50 MB。' : selected && selected.size === 0 ? '插件文件不能为空。' : ''); }} /></label>{file && <p>{file.name} · {(file.size / 1048576).toFixed(2)} MB</p>}{fileError && <p className="gsp-error" role="alert">{fileError}</p>}<button className="gsd-button primary" disabled={!file || !!fileError}><Upload size={17} />添加插件</button></form>}
      {modal === 'ranking' && <ol className="gsp-all-ranking">{ranking.map((p, i) => <li key={p.id}><span>{i + 1}</span><img src={`/console/plugins/${p.id}.png`} alt="" /><button onClick={() => { reset(); setQuery(p.name); setModal(null); }}>{p.name}</button><small>{p.downloads}万+ 下载</small></li>)}</ol>}
    </DialogContent></Dialog>
    <Dialog open={purchase !== null} onOpenChange={open => { if (!open) setPurchase(null); }}><DialogContent className="cloud-modal gsd-dialog gsp-dialog"><DialogTitle>购买插件</DialogTitle><DialogDescription>本地演示不会扣费或创建订单，确认后可体验安装结果。</DialogDescription>{purchase && <><div className="gsp-purchase"><img src={`/console/plugins/${purchase.id}.png`} alt="" /><div><strong>{purchase.name}</strong><p>{purchase.description}</p></div><strong>￥{purchase.price.toFixed(2)}</strong></div><button className="gsd-button primary" onClick={() => install(purchase)}>确认演示安装</button></>}</DialogContent></Dialog>
  </div>;
}
