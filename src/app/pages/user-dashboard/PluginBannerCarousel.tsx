import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

const slides = [
  {
    image: 'banner.png', alt: 'Minecraft 玩家与村庄', background: '#e6f2fc',
    title: '丰富的插件生态，让你的服务器更精彩！',
    description: '从实用工具到趣味玩法，海量优质插件一键安装，轻松打造专属的 Minecraft 服务器。',
  },
  {
    image: 'banner-survival.webp', alt: 'Minecraft 河畔农场与生存玩家', background: '#e9f6ee',
    title: '从第一块木头开始，开启生存新篇章！',
    description: '领地保护、技能成长、家园传送，让每一次探索都有收获，让每一份建设都被守护。',
  },
  {
    image: 'banner-build.webp', alt: 'Minecraft 城堡与创意建筑', background: '#fff2e5',
    title: '把脑海中的奇思妙想，建成方块世界！',
    description: '地图编辑、建筑辅助、自定义装饰，让创造更轻松，和伙伴一起打造理想中的世界。',
  },
  {
    image: 'banner-adventure.webp', alt: 'Minecraft 水晶矿洞与探险玩家', background: '#f0ecfc',
    title: '深入未知秘境，解锁属于你的冒险！',
    description: '任务剧情、自定义物品、丰富的成长玩法，为服务器加入惊喜，让探索永远充满期待。',
  },
  {
    image: 'banner-minigames.webp', alt: 'Minecraft 云端浮岛与跑酷乐园', background: '#e9f5ff',
    title: '快乐不止一种，和朋友玩出新花样！',
    description: '跑酷挑战、趣味小游戏、多样竞技玩法，把你的服务器变成大家都想再来的欢乐乐园。',
  },
  {
    image: 'banner-community.webp', alt: 'Minecraft 樱花村庄与玩家集会', background: '#fceef3',
    title: '相聚在方块世界，让热爱有个家！',
    description: '聊天社交、玩家商店、社区互动，让每位玩家找到伙伴，让你的服务器每天都有新故事。',
  },
];

export function PluginBannerCarousel() {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const reducedMotion = useReducedMotion();
  const slide = slides[active];

  useEffect(() => {
    slides.forEach(item => { const image = new Image(); image.src = `/console/plugins/${item.image}`; });
  }, []);

  useEffect(() => {
    if (hovered) return;
    const timer = window.setTimeout(() => setActive(index => (index + 1) % slides.length), 10_000);
    return () => window.clearTimeout(timer);
  }, [active, hovered]);

  return <section className="gsp-banner" aria-label="Minecraft 插件推荐" aria-roledescription="轮播"
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
    <AnimatePresence initial={false}>
      <motion.div key={active} className="gsp-banner-slide" role="group" aria-roledescription="幻灯片"
        aria-label={`${active + 1} / ${slides.length}`} style={{ backgroundColor: slide.background }}
        initial={{ x: reducedMotion ? 0 : '100%', opacity: reducedMotion ? 0 : 1 }}
        animate={{ x: 0, opacity: 1 }} exit={{ x: reducedMotion ? 0 : '-100%', opacity: reducedMotion ? 0 : 1 }}
        transition={{ duration: reducedMotion ? 0 : .65, ease: [.22, 1, .36, 1] }}>
        <img src={`/console/plugins/${slide.image}`} alt={slide.alt} />
        <div className="gsp-banner-copy"><h2>{slide.title}</h2><p>{slide.description}</p></div>
      </motion.div>
    </AnimatePresence>
  </section>;
}
