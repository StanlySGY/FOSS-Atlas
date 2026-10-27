/*
 * 每个一级分类一个色相 — homepage.dev / Homarr 的服务卡片之所以一眼可辨，
 * 靠的就是「品牌色长在图标上」。这里给 11 个分类各配一个深色面板下成立的
 * 低饱和色，供三处共用：首页分类 chip、卡片 / Wiki 的图标底、以及子类行。
 * 它们既是 mark（描边、底色、图标），也允许作为 chip 上 11-12px 的标签，
 * 所以每个色相同时按两条下限选：作为文本 ≥4.5:1，作为 mark ≥3:1。
 *
 * 色值统一按下限选。新的 --ink-card（#3d394d, L* 25.1）上作为 10-12px 文本
 * 实测 5.02–7.30:1（最差 cn-ai），页面地面 #2f2b3b 上 6.20–9.02:1，图谱画布
 * --ink-sunken 上 7.27–10.57:1；作为描边 mark 见 categoryRing。**不能**当作
 * 文本放在更亮的小面板上：--ink-tint 4.46、--ink-raised 4.08、--ink-tab 3.87、
 * --ink-tint-hover 3.50（均为最差的 cn-ai），四条都掉到 AA 以下——分类色只允许
 * 出现在 card / chip / hover / ground / sunken 这几块板上。
 *
 * atlas 与 --own-text（自建紫）是同一族：这个文件原来写的就是「atlas 直接沿用
 * --own-text」。这次 --own-text 抬到 #cfc5ef 后两者只差 ΔE76 11.3（红绿色盲模拟
 * 下 12.1），**没有**把它们拉开到彼此无关：atlas 分类说的就是「本站自己维护的
 * 条目」，和「跑在我自己的基础设施上」是同一个主张，同一个色相是作者本意。真正的
 * 区别在承载形式上——分类色永远和分类中文名、条目数一起出现（rail chip / 卡片
 * 图标），自建色只出现在 badge 与图谱节点上。反过来把 atlas 直接改成 #cfc5ef 也
 * 不行：那样 api(#76d8f5) 与 atlas 在红绿色盲模拟下只剩 ΔE76 3.8，比现在的
 * api/atlas 10.5 更糟。
 *
 * 分类之间的分辨力：正常视觉最小 ΔE76 16.9（saas/atlas），红绿色盲模拟最小 6.0
 * （saas/proxy，正常视觉下这对是 22.4），另有 api/atlas 10.5、vps/gear 12.8、
 * saas/api 13.3、selfhost/cn-ai 14.8。6.0 不是这轮改出来的——旧的 11 个色相在旧
 * 底上同一对是 4.3，api/atlas 是 0.1（同一个点），selfhost/cn-ai 4.0。这轮把最差
 * 对从 0.1 抬到 6.0。仍然要说明白：6–13 是「能分但不轻松」的区间，所以颜色从来
 * 不是唯一的线索——rail chip 带中文分类名与计数，卡片带图标与名称，图谱节点带
 * 标签与尺寸。
 */
const CATEGORY_COLORS = {
  ai: '#e3b341', // 与品牌琥珀同族，AI 是最大的分类，让它承接主色的近亲
  saas: '#8db4f0',
  selfhost: '#70dfb3',
  api: '#76d8f5',
  security: '#ef9a79',
  ebook: '#d9c06a',
  proxy: '#aaa5ff',
  vps: '#7be3d6',
  'cn-ai': '#ff8c9c',
  gear: '#e497c9',
  atlas: '#b6a8da',
}

export function categoryColor(id) {
  return CATEGORY_COLORS[id] ?? 'var(--accent)'
}

/*
 * color-mix 把色相稀释成底色。18% 在新的 --ink-card（L* 25.1）上是
 * 1.362–1.514:1 的分层——仍然是「染过色」而不是「涂了色」；字母
 * （categoryColor 本体）在这层染上 3.387–3.661:1（最差 proxy 在 --ink-card-hover
 * 上），作为 aria-hidden 的装饰 mark 过 3:1 下限。稀释比例不动。
 */
export function categorySoft(id) {
  return `color-mix(in srgb, ${categoryColor(id)} 18%, transparent)`
}

/*
 * 图标 / Wiki 图标的描边。这个文件开头写着的下限是「mark ≥3:1」。38% 实测只有
 * 1.94–2.49:1 —— 它没兑现自己声明的标准；62% 在旧底上是 3.24–4.63:1，但底色抬到
 * L* 25.1 后同一批 62% 混色只剩 2.72–3.82:1，cn-ai（2.86 / 2.72 / 2.80 三层板）
 * 与 security（2.72）掉到 3:1 以下。重测后 70% 在三块卡片板上是 3.08–4.44:1：
 * --ink-card 3.26–4.44、--ink-card-hover 3.08–4.15、--ink-chip 3.19–4.34，最差的
 * 一格也过了 3:1；它仍然比 categoryColor 本体暗，所以读到的还是「这一类 的颜色」
 * 而不是「一圈高亮」。
 */
export function categoryRing(id) {
  return `color-mix(in srgb, ${categoryColor(id)} 70%, transparent)`
}
