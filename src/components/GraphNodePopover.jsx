import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { TYPE_META } from '../lib/graphStyle.js'
import { graphPopoverLayout } from '../lib/graphPopoverLayout.js'

/**
 * The single-click "peek" bubble. It is a plain DOM element rather than an
 * ECharts tooltip so the button inside it can be a real button (focusable,
 * tappable) — and so interacting with it never reaches the canvas underneath.
 */
export default function GraphNodePopover({
  node,
  point,
  description,
  tags,
  instances = [],
  actionLabel,
  onAction,
  onLocalGraph,
  onExploreFrom,
  onDismiss,
}) {
  const bubbleRef = useRef(null)
  const [bubbleHeight, setBubbleHeight] = useState(0)
  const layout = graphPopoverLayout(point, bubbleHeight)

  useLayoutEffect(() => {
    const el = bubbleRef.current
    if (!el) return
    const next = el.getBoundingClientRect().height
    setBubbleHeight((prev) => (Math.abs(prev - next) > 0.5 ? next : prev))
  }, [node, description, tags, instances, actionLabel])

  // The canvas host is focused immediately before this preview opens. Restoring
  // to it keeps the keyboard position stable after close; when another node is
  // selected, re-run this effect so focus enters the updated preview as well.
  useEffect(() => {
    const restoreTo = document.activeElement
    bubbleRef.current?.focus({ preventScroll: true })
    return () => {
      if (restoreTo && typeof restoreTo.focus === 'function') {
        restoreTo.focus({ preventScroll: true })
      }
    }
  }, [node.id])

  // The chart resizes its coordinate system with the canvas. A stored click point
  // belongs to the old size, so dismiss rather than leave a bubble pointing at
  // the wrong place after a window, panel, or device-orientation resize.
  useEffect(() => {
    const canvas = bubbleRef.current?.parentElement
    if (!canvas || typeof ResizeObserver === 'undefined') return undefined
    let previous = canvas.getBoundingClientRect()
    const observer = new ResizeObserver(([entry]) => {
      const next = entry.contentRect
      const changed = Math.abs(previous.width - next.width) > 0.5 || Math.abs(previous.height - next.height) > 0.5
      previous = { width: next.width, height: next.height }
      if (changed) onDismiss?.()
    })
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [onDismiss])

  const kind = TYPE_META[node.type]?.label ?? node.type

  return (
    <div
      ref={bubbleRef}
      role="dialog"
      aria-label={`${node.name} 速览`}
      tabIndex={-1}
      style={{
        left: layout.left,
        top: layout.top,
        width: layout.width,
        maxWidth: layout.maxWidth,
        maxHeight: layout.maxHeight,
        overflowY: 'auto',
        overscrollBehavior: 'contain',
      }}
      // A tap that lands on the bubble must not be mistaken for a tap on the
      // canvas, which would dismiss the bubble before the button gets the click.
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      className="absolute z-20 rounded-[6px] border border-[var(--line)] bg-[var(--ink-card)] shadow-[0_14px_36px_rgba(0,0,0,0.6)] outline-none"
    >
      <span
        aria-hidden="true"
        style={{ left: layout.caretX - 6, [layout.flipped ? 'bottom' : 'top']: -5 }}
        className="absolute h-2.5 w-2.5 rotate-45 border-b border-l border-[var(--line)] bg-[var(--ink-card)]"
      />
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-[var(--text-strong)]">{node.name}</h3>
            {/* The kind is already the node's colour in the canvas; here it is
                the one line that says which type you are reading, so it is set
                as plain small type — mono + uppercase + letter-spacing on a
                10px Chinese label is decoration the reader cannot use. */}
            <p className="mt-0.5 text-[11px] text-[var(--text-faint)]">{kind}</p>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="关闭"
            className="-mr-1 -mt-0.5 shrink-0 rounded-[3px] px-1.5 py-0.5 text-[var(--text-faint)] transition-colors hover:bg-[var(--ink-tint)] hover:text-[var(--text-strong)]"
          >
            ✕
          </button>
        </div>

        <p className="mt-2 text-xs leading-relaxed text-[var(--text-dim)]">{description}</p>

        {tags.length > 0 && (
          <ul className="mt-2.5 flex flex-wrap gap-1">
            {tags.map((tag) => (
              <li
                key={tag}
                className="rounded-[3px] border border-[var(--line)] bg-[var(--ink-chip)] px-1.5 py-0.5 text-[10px] text-[var(--text-dim)]"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}

        {instances.length > 0 && (
          /*
           * "我运行着的实例" — the line that makes the graph and the 自部署服务
           * page one thing: the node you are looking at has services behind it,
           * named, with the group they belong to and a link to each. The header
           * hands the reader to that page's own rows (each row carries the same
           * instance id as its anchor).
           */
          /* The panel gets its own plate rather than sitting on the card, because
           * the instance dots are the only 1.5px marks in this bubble and
           * --own measures 2.65:1 on --ink-card — under the 3:1 floor for a dot.
           * On --own-well the same dot is 3.34:1, and the well is 1.262:1 / ΔE76
           * 8.7 away from the card, so it reads as a inset panel rather than a
           * stain on it. Text on the well: --own-text 8.6, --text 10.03,
           * --text-faint 8.76; the 50% --own-text border is 3.29:1, so the panel
           * edge is a mark-grade line, not a decorative one. */
          <div className="mt-2.5 rounded-[4px] border border-[var(--own-text)]/50 bg-[var(--own-well)] p-2.5">
            <div className="flex items-baseline justify-between gap-2">
              <h4 className="text-[11px] font-semibold text-[var(--own-text)]">
                我运行着的实例{" "}
                <span className="mono text-[var(--text-faint)]">· {instances.length}</span>
              </h4>
              <Link
                to={`/deployed/#${instances[0].id}`}
                className="mono text-[10px] text-[var(--text-faint)] transition-colors hover:text-[var(--own-text)]"
              >
                自部署页 →
              </Link>
            </div>            <ul className="mt-1 space-y-1">
              {instances.map((i) => (
                <li key={i.id} className="flex items-baseline gap-1.5 text-[11px] leading-snug">
                  <span
                    className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: 'var(--own)' }}
                    aria-hidden="true"
                  />
                  <a
                    href={i.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-w-0 flex-1 truncate text-[var(--text)] underline decoration-[var(--line-strong)] underline-offset-2 hover:text-[var(--accent-text)]"
                  >
                    {i.id}
                  </a>
                  <span className="shrink-0 text-[10px] text-[var(--text-faint)]">{i.group}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <button
          type="button"
          onClick={onAction}
          className="mt-3 flex w-full items-center justify-center rounded-[4px] border border-[var(--line-strong)] bg-[var(--ink-tint)] px-2.5 py-1.5 text-xs font-semibold text-[var(--accent-text)] transition-colors hover:border-[var(--line-hover)] hover:bg-[var(--ink-tint-hover)]"
        >
          {actionLabel}
        </button>
        {onExploreFrom ? (
          <button
            type="button"
            onClick={onExploreFrom}
            className="mt-1.5 flex w-full items-center justify-center rounded-[4px] border border-[var(--accent)]/45 bg-[var(--accent)]/8 px-2.5 py-1.5 text-[11px] text-[var(--accent-text)] transition-colors hover:bg-[var(--accent)]/12"
          >
            从这里开始漫游
          </button>
        ) : null}
        {onLocalGraph ? (
          <button
            type="button"
            onClick={onLocalGraph}
            className="mt-1.5 flex w-full items-center justify-center rounded-[4px] border border-[var(--line)] px-2.5 py-1.5 text-[11px] text-[var(--text-dim)] transition-colors hover:border-[var(--line-strong)] hover:bg-[var(--ink-tint)] hover:text-[var(--text-strong)]"
          >
            查看此节点的局部关系图
          </button>
        ) : null}
      </div>
    </div>
  )
}
