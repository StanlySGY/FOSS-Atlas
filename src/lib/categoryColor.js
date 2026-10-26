/*
 * 每个一级分类一个色相 — homepage.dev / Homarr 的服务卡片之所以一眼可辨，
 * 靠的就是「品牌色长在图标上」。这里给 11 个分类各配一个深色面板下成立的
 * 低饱和色，供三处共用：首页分类 chip 的激活态、卡片 / Wiki 的图标底、
 * 以及子类行。只作为 *mark*（描边、底色、图标），长文本仍然走 --text 层。
 *
 * 色值统一按下限选：在 --ink-card 上作为 6-10px 文本时 ≥4.5:1，作为
 * 底色/描边 mark 时 ≥3:1。atlas 直接沿用 --own-text（自建紫），与图谱
 * 的自建节点同一语言。
 */
const CATEGORY_COLORS = {
  ai: '#e3b341', // 与品牌琥珀同族，AI 是最大的分类，让它承接主色的近亲
  saas: '#6aa5e8',
  selfhost: '#52c48f',
  api: '#5cc0dd',
  security: '#e08a68',
  ebook: '#d9c06a',
  proxy: '#a08ff2',
  vps: '#54d2c2',
  'cn-ai': '#e5798a',
  gear: '#d98fbf',
  atlas: '#b3a7df',
}

export function categoryColor(id) {
  return CATEGORY_COLORS[id] ?? 'var(--accent)'
}

/*
 * color-mix 把色相稀释成底色：14% 浓度落在深色面板上是「染过色」而不是
 * 「涂了色」，图标和 chip 的可读文本仍由 categoryColor 本体承担。
 */
export function categorySoft(id) {
  return `color-mix(in srgb, ${categoryColor(id)} 14%, transparent)`
}
