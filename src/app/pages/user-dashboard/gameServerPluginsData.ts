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

export type InstalledPlugin = { id: string; name: string; version: string; size: number; enabled: boolean; update: boolean };
export const initialInstalledPlugins: InstalledPlugin[] = ['ProtocolLib', 'PlaceholderAPI', 'Geyser', 'Floodgate', 'ViaVersion', 'ViaBackwards', 'TAB', 'SkinsRestorer', 'DiscordSRV', 'spark', 'Chunky', 'BlueMap'].map((name, index) => ({ id: `installed-${index}`, name, version: index < 3 ? '1.0.0' : '1.2.0', size: index === 11 ? 4.1 : 3.5, enabled: true, update: index < 3 }));
