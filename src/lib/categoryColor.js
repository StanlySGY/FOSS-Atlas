/*
 * 每个一级分类一个色相 — homepage.dev / Homarr 的服务卡片之所以一眼可辨，
 * 靠的就是「品牌色长在图标上」。这里给 11 个分类各配一个深色面板下成立的
 * 低饱和色，供三处共用：首页分类 chip 的激活态、卡片 / Wiki 的图标底、
 * 以及子类行。只作为 *mark*（描边、底色、图标），长文本仍然走 --text 层。
 *
 * 色值统一按下限选：在 --ink-card 上作为 6-10px 文本时 ≥4.5:1（实测
 * 6.55–10.31:1），作为底色/描边 mark 时 ≥3:1（见 categoryRing）。atlas 直接
 * 沿用 --own-text（自建紫），与图谱的自建节点同一语言。
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
 * color-mix 把色相稀释成底色。14% 在旧的近黑底色上是「染过色」，但底色换了
 * 有色相的阶梯之后它只剩 1.02–1.11:1 的分层，肉眼等于没染。18% 落在
 * --ink-card 上是 1.31–1.45:1 —— 仍然是「染过色」而不是「涂了色」，而字母
 * （categoryColor 本体）在它上面 5.00–7.13:1，全部过 AA。
 */
export function categorySoft(id) {
  return `color-mix(in srgb, ${categoryColor(id)} 18%, transparent)`
}

/*
 * 图标 / Wiki 图标的描边。这个文件开头写着的下限是「mark ≥3:1」，而 38% 实测
 * 只有 1.94–2.49:1 —— 它没兑现自己声明的标准。62% 是 3.24–4.63:1，最差的
 * cn-ai 也过了 3:1；它仍然比 categoryColor 本体暗，所以读到的还是「这一类
 * 的颜色」而不是「一圈高亮」。
 */
export function categoryRing(id) {
  return `color-mix(in srgb, ${categoryColor(id)} 62%, transparent)`
}
