import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { deployedStats, graphStats, resources } from '../lib/data.js'

/*
 * 全站命令面板 — ⌘K / Ctrl+K 或 `/` 唤起，IT-Tools 的搜索优先 + Dashy 的键盘
 * 导航：一个输入框同时是站点搜索（名称 / 描述 / 标签 / 域名，模糊匹配）和页面
 * 跳转器（前三条是三个页面本身），方向键选择、回车直达、Esc 关闭。没有依赖，
 * 没有虚拟列表——186 条过滤后渲染前 12 条，DOM 小到不值得优化。
 */

const QUICK_ACTIONS = [
  { id: 'page:home', label: '导航页', hint: '全部资源卡片', to: '/' },
  { id: 'page:graph', label: '知识图谱', hint: `${graphStats.tools} 个工具 · ${graphStats.edges} 条关系`, to: '/graph/' },
  {
    id: 'page:deployed',
    label: '自部署服务',
    hint: `${deployedStats.resources} 个在跑 · ${deployedStats.instances} 个实例`,
    to: '/deployed/',
  },
  { id: 'page:github', label: 'GitHub 仓库', hint: '提 issue / 贡献', href: 'https://github.com/StanlySGY/FOSS-Atlas' },
]

/*
 * 名字精确开头 > 名字包含 > 标签 / 域名包含 > 描述包含 > 分类名包含。全小写
 * 的子串匹配而不是编辑距离：对这个体量，前缀分档已经把想要的排到最前，而真正的
 * 模糊算法会为「输错一个字母」付出三分之一的代码和难读的得分。
 */
function scoreResource(r, q) {
  const name = r.name.toLowerCase()
  if (name.startsWith(q)) return 100
  if (name.includes(q)) return 80
  if (r.tags.some((t) => t.toLowerCase().includes(q))) return 60
  if (hostOf(r).includes(q)) return 55
  if (r.description.toLowerCase().includes(q)) return 40
  if ((r.category_name ?? '').toLowerCase().includes(q)) return 30
  return -1
}

function hostOf(r) {
  try {
    return new URL(r.url).hostname
  } catch {
    return r.url
  }
}

/*
 * 挂载即打开：父层用 `{open && <CommandPalette/>}` 渲染，每次唤起都是一次全新
 * 挂载——query / active 不需要任何「重置」逻辑，焦点与滚动锁在 effect 的两端
 * 各处理一次。
 */
export default function CommandPalette({ onClose }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const restoreTo = document.activeElement
    document.body.style.overflow = 'hidden'
    const t = setTimeout(() => inputRef.current?.focus(), 10)
    return () => {
      clearTimeout(t)
      document.body.style.overflow = previousOverflow
      restoreTo?.focus?.()
    }
  }, [])

  const items = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) {
      // 空查询：三个页面 + GitHub，下面不再铺 186 张卡——那是首页的工作。
      return QUICK_ACTIONS
    }
    const matched = resources
      .map((r) => ({ r, s: scoreResource(r, q) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s || a.r.name.localeCompare(b.r.name))
      .slice(0, 12)
      .map(({ r }) => ({
        id: `res:${r.id}`,
        label: r.name,
        hint: r.description,
        meta: r.category_name,
        deployed: (r.instances?.length ?? 0) > 0,
        to: `/wiki/${r.id}/`,
      }))
    // 页面跳转永远参与过滤：输 "部" 也能到自部署页。
    const pages = QUICK_ACTIONS.filter((a) => `${a.label} ${a.hint}`.toLowerCase().includes(q)).map(
      (a) => ({ ...a, page: true }),
    )
    return [...pages, ...matched]
  }, [query])

  /*
   * 选中的下标在渲染期收进结果集边界：过滤把列表收窄后，旧下标自然落回最后
   * 一项，不需要 effect 再补一次 setState。
   */
  const clampedActive = items.length ? Math.min(active, items.length - 1) : 0

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${clampedActive}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [clampedActive, items])

  const run = (item) => {
    onClose()
    if (item.href) window.open(item.href, '_blank', 'noopener,noreferrer')
    else if (item.to) navigate(item.to)
  }

  const onKey = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive(Math.min(clampedActive + 1, Math.max(0, items.length - 1)))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive(Math.max(clampedActive - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const item = items[clampedActive]
      if (item) run(item)
    }
  }

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="命令面板">
      <button
        type="button"
        tabIndex={-1}
        aria-label="关闭命令面板"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-black/55"
      />
      <div
        role="document"
        onKeyDown={onKey}
        className="fa-page absolute inset-x-3 top-[12vh] mx-auto max-w-xl overflow-hidden rounded-[10px] border border-[var(--line-strong)] bg-[var(--ink-raised)] shadow-[0_24px_64px_rgba(0,0,0,0.55)]"
      >
        <div className="flex items-center gap-2.5 border-b border-[var(--line)] px-3.5">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4 shrink-0 text-[var(--text-faint)]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.2-3.2" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
            }}
            placeholder="搜索资源，或输入页面名跳转…"
            role="combobox"
            aria-expanded="true"
            aria-controls="fa-palette-list"
            className="w-full bg-transparent py-3 text-sm text-[var(--text)] placeholder:text-[var(--text-faint)] focus:outline-none"
          />
          <kbd className="mono shrink-0 rounded-[3px] border border-[var(--line)] px-1.5 py-0.5 text-[10px] text-[var(--text-faint)]">
            Esc
          </kbd>
        </div>

        <ul id="fa-palette-list" ref={listRef} role="listbox" className="max-h-[52vh] overflow-y-auto p-1.5">
          {items.length === 0 ? (
            <li className="px-3 py-6 text-center text-xs text-[var(--text-faint)]">
              没有匹配的资源或页面。
            </li>
          ) : (
            items.map((item, i) => (
              <li key={item.id} role="option" aria-selected={i === clampedActive}>
                <button
                  type="button"
                  data-index={i}
                  data-active={i === clampedActive}
                  onMouseMove={() => setActive(i)}
                  onClick={() => run(item)}
                  className={[
                    'flex w-full items-center gap-3 rounded-[6px] px-2.5 py-2 text-left transition-colors',
                    i === clampedActive
                      ? 'bg-[var(--accent)]/12 text-[var(--text-strong)]'
                      : 'text-[var(--text-dim)]',
                  ].join(' ')}
                >
                  {item.page ? (
                    <span
                      aria-hidden="true"
                      className="grid h-6 w-6 shrink-0 place-items-center rounded-[4px] border border-[var(--accent)]/40 text-[10px] text-[var(--accent)]"
                    >
                      ↗
                    </span>
                  ) : (
                    <span
                      aria-hidden="true"
                      className="mono grid h-6 w-6 shrink-0 place-items-center rounded-[4px] bg-[var(--ink-tint)] text-[10px] text-[var(--text-faint)]"
                    >
                      {item.label.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{item.label}</span>
                    <span className="block truncate text-[11px] text-[var(--text-faint)]">
                      {item.hint}
                    </span>
                  </span>
                  {item.deployed ? (
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--own)]"
                      title="已自部署"
                    />
                  ) : null}
                  {item.meta ? (
                    <span className="mono shrink-0 text-[10px] text-[var(--text-faint)]">
                      {item.meta}
                    </span>
                  ) : null}
                </button>
              </li>
            ))
          )}
        </ul>

        <div className="flex items-center justify-between border-t border-[var(--line)] px-3.5 py-2 text-[10px] text-[var(--text-faint)]">
          <span className="flex items-center gap-2">
            <kbd className="mono rounded-[3px] border border-[var(--line)] px-1 py-0.5">↑↓</kbd>
            选择
            <kbd className="mono rounded-[3px] border border-[var(--line)] px-1 py-0.5">↵</kbd>
            打开
          </span>
          <span className="mono">FOSS-Atlas · {resources.length} 条</span>
        </div>
      </div>
    </div>
  )
}
