export type MarketplacePlugin = {
  id: string; name: string; description: string; tags: string[]; categories: string[];
  minVersion: string; rating: number; reviews: string; downloads: number; price: number;
  author: string; platforms: string[]; size: number; badge?: string;
};

const plugin = (id: string, name: string, description: string, tags: string[], categories: string[], minVersion: string, rating: number, reviews: string, downloads: number, price = 0, badge?: string): MarketplacePlugin => ({ id, name, description, tags, categories, minVersion, rating, reviews, downloads, price, badge, author: name === 'EssentialsX' ? 'EssentialsX Team' : `${name} Team`, platforms: id === 'itemsadder' ? ['Paper'] : ['Paper', 'Spigot'], size: id === 'itemsadder' ? 8.4 : 2.1 });

export const marketplacePlugins = [
  plugin('essentials', 'EssentialsX', '最受欢迎的基础功能插件，提供传送、家、经济等核心功能。', ['基础功能', '传送', '经济'], ['必备推荐', '经济', '实用工具'], '1.8', 4.9, '2.1万', 520, 0, '热门'),
  plugin('luckperms', 'LuckPerms', '强大的权限管理插件，轻量高效，适用于各类服务器。', ['权限管理', '用户组', '权限系统'], ['必备推荐', '权限', '管理'], '1.8', 4.8, '1.6万', 380, 0, '推荐'),
  plugin('vault', 'Vault', '经济、权限等插件的前置 API，众多插件依赖的基础库。', ['前置插件', 'API', '兼容'], ['必备推荐', '经济', '权限'], '1.7', 4.6, '8,219', 320),
  plugin('worldedit', 'WorldEdit', '强大的地图编辑工具，轻松创建宏伟建筑与地形。', ['地图编辑', '建造工具', '管理'], ['必备推荐', '地图', '管理'], '1.13', 4.8, '9,620', 280),
  plugin('worldguard', 'WorldGuard', '世界领地保护插件，防止破坏和盗取，保护你的服务器世界。', ['领地保护', '防爆', '区域管理'], ['地图', '管理'], '1.8', 4.7, '1.2万', 260),
  plugin('coreprotect', 'CoreProtect', '记录方块变化历史，支持回滚，帮助管理员追踪破坏行为。', ['日志记录', '回滚', '管理工具'], ['管理', '实用工具'], '1.13', 4.6, '6,398', 180),
  plugin('itemsadder', 'ItemsAdder', '自定义物品、方块、模型和材质，为服务器添加独特内容。', ['自定义物品', '材质', '装饰'], ['装饰', '小游戏'], '1.16', 4.8, '7,542', 120, 68),
  plugin('bossshop', 'BossShopPro', '强大的商店插件，支持多种经济系统和丰富的商店类型。', ['经济系统', '商店', '交易'], ['经济'], '1.8', 4.7, '4,921', 150, 49),
  plugin('mcmmo', 'mcMMO', '经典的 RPG 技能系统，让玩家在生存中获得更多成长乐趣。', ['RPG', '技能', '生存增强'], ['生存增强', '小游戏'], '1.8', 4.6, '1.1万', 210),
  plugin('jobs', 'Jobs Reborn', '完善的职业系统，让玩家通过工作赚取金钱，增加游戏可玩性。', ['职业系统', '经济', '生存增强'], ['经济', '生存增强'], '1.8', 4.5, '8,732', 95),
  plugin('citizens', 'Citizens', '创建高度自定义的 NPC，适用于任务、商店和剧情等场景。', ['NPC', '任务', '交互'], ['聊天社交', '小游戏'], '1.8', 4.4, '6,315', 110),
  plugin('homes', 'AdvancedHomes', '更强大的家系统，支持多世界、多家设置和传送冷却。', ['传送', '家', '实用工具'], ['实用工具', '生存增强'], '1.8', 4.6, '4,208', 90),
];

export const pluginVersions: Record<string, string> = {
  essentials: '2.21.0', luckperms: '5.4.102', vault: '1.7.3', worldedit: '7.3.4',
  worldguard: '7.0.9', coreprotect: '22.4', itemsadder: '3.6.3', bossshop: '2.0.9',
  mcmmo: '2.2.0', jobs: '5.2.2', citizens: '2.0.35', homes: '1.2.0',
};

export const pluginFeatures: Record<string, string[]> = {
  essentials: ['/tpa 传送请求', '/home 家系统', '/warp 传送点', '/spawn 出生点', '基础经济系统', '/back 返回位置', '/msg 私聊', '/kit 工具箱', '/repair 修复工具', '多语言支持', '高度可配置', '轻量稳定', '长期维护更新'],
  luckperms: ['精细权限管理', '用户组与继承', '网页权限编辑器', '临时权限', '权限上下文', '多服务器同步', '数据库存储', '权限查询与审计', '前缀与后缀', '多语言支持', '轻量高效', '实时权限生效'],
  vault: ['统一经济接口', '权限接口', '聊天接口', '插件兼容', '轻量基础库'],
  worldedit: ['区域选择', '批量方块编辑', '复制与粘贴', '地形生成', '笔刷工具', '操作撤销'],
  worldguard: ['领地保护', '区域权限', '防爆设置', '玩家访问控制', '区域标记', '多世界支持'],
  coreprotect: ['方块记录', '容器记录', '精准回滚', '操作查询', '数据恢复', '管理审计'],
};

export const pluginIntroduction = (p: MarketplacePlugin) => p.id === 'essentials'
  ? 'EssentialsX 是目前最受欢迎的 Minecraft 服务器基础插件，提供一系列实用的基础功能，包括传送、家、经济系统、传送请求、服务器公告、玩家管理等。它功能强大且配置简单，适用于几乎所有类型的服务器，从生存服到大型社区服都不可或缺。'
  : p.id === 'luckperms'
    ? 'LuckPerms 是一款功能强大的 Minecraft 权限管理插件，帮助管理员轻松管理玩家权限、用户组和继承关系。通过直观的网页编辑器配置权限，支持临时权限、上下文与多服务器同步，适用于从小型生存服到大型服务器网络的各类场景。'
    : `${p.name} 是一款实用的 Minecraft 服务器插件。${p.description}通过灵活的配置与 ${p.tags.join('、')}功能，为管理员和玩家提供更便捷的服务器体验。`;

export type InstalledPlugin = { id: string; name: string; version: string; size: number; enabled: boolean; update: boolean };
export const initialInstalledPlugins: InstalledPlugin[] = ['ProtocolLib', 'PlaceholderAPI', 'Geyser', 'Floodgate', 'ViaVersion', 'ViaBackwards', 'TAB', 'SkinsRestorer', 'DiscordSRV', 'spark', 'Chunky', 'BlueMap'].map((name, index) => ({ id: `installed-${index}`, name, version: index < 3 ? '1.0.0' : '1.2.0', size: index === 11 ? 4.1 : 3.5, enabled: true, update: index < 3 }));
