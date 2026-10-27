import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { TYPE_META } from '../lib/graphStyle.js'

const POPOVER_WIDTH = 264
// Gap between the node and the bubble, and the minimum distance the bubble keeps
// from the edges of the canvas.
const GAP = 12
const MARGIN = 8
/*
 * Only used for the very first frame, before the bubble has been measured. A
 * tool's `description` can run to ~200px of wrapped text, so a fixed estimate
 * alone would let a bubble near the bottom edge push its button out of the
 * clipped card. The real height is measured in a layout effect (i.e. before
 * paint, so the correction is never visible).
 *
 * The estimate only has to be safe for the first frame, and the bubble flips
 * when it would overflow — so it errs long. A deployed tool adds an instances
 * block, and that block can hold two rows (a tool deployed on both the edge and
 * Docker), so the estimate carries room for them rather than flipping twice.
 */
const ESTIMATED_HEIGHT = 232

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
  onDismiss,
}) {
  const { x, y, width, height } = point
  const bubbleRef = useRef(null)
  const [bubbleHeight, setBubbleHeight] = useState(0)

  useLayoutEffect(() => {
    const el = bubbleRef.current
    if (!el) return
    const next = el.getBoundingClientRect().height
    setBubbleHeight((prev) => (Math.abs(prev - next) > 0.5 ? next : prev))
  }, [node, description, tags, instances, actionLabel])

  /*
   * A non-modal dialog still owes the reader somewhere for focus to land, and
   * somewhere for it to return to. The element that opened the bubble is the
   * canvas, so focus normally goes back to `<body>` — harmless.
   */
  useEffect(() => {
    const restoreTo = document.activeElement
    bubbleRef.current?.focus({ preventScroll: true })
    return () => {
      if (restoreTo && typeof restoreTo.focus === 'function') {
        restoreTo.focus({ preventScroll: true })
      }
    }
  }, [])

  const left = Math.min(Math.max(x + GAP, MARGIN), Math.max(MARGIN, width - POPOVER_WIDTH - MARGIN))
  const flip = (bubbleHeight || ESTIMATED_HEIGHT) + y + GAP > height
  const vertical = flip
    ? { bottom: Math.max(MARGIN, height - y + GAP) }
    : { top: Math.min(y + GAP, Math.max(MARGIN, height - MARGIN)) }
  // Keep the caret pointing at the node even when the bubble is clamped to an edge.
  const caretX = Math.min(Math.max(x - left, 14), POPOVER_WIDTH - 14)
  const kind = TYPE_META[node.type]?.label ?? node.type

  return (
    <div
      ref={bubbleRef}
      role="dialog"
      aria-label={`${node.name} 速览`}
      tabIndex={-1}
      style={{ left, width: POPOVER_WIDTH, ...vertical }}
      // A tap that lands on the bubble must not be mistaken for a tap on the
      // canvas, which would dismiss the bubble before the button gets the click.
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      className="absolute z-20 rounded-[6px] border border-[var(--line)] bg-[var(--ink-card)] shadow-[0_14px_36px_rgba(0,0,0,0.6)] outline-none"
    >
      <span
        aria-hidden="true"
        style={{ left: caretX - 6, [flip ? 'bottom' : 'top']: -5 }}
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
      </div>
    </div>
  )
}
