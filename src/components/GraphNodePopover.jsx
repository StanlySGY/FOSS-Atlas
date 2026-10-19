import { useEffect, useLayoutEffect, useRef, useState } from 'react'
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
 */
const ESTIMATED_HEIGHT = 172

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
  }, [node, description, tags, actionLabel])

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
            <h3 className="truncate text-sm font-semibold text-neutral-100">{node.name}</h3>
            <p className="mono mt-0.5 text-[10px] uppercase tracking-wider text-neutral-500">
              {kind}
            </p>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="关闭"
            className="-mr-1 -mt-0.5 shrink-0 rounded-[3px] px-1.5 py-0.5 text-neutral-500 transition-colors hover:bg-[var(--ink-tint)] hover:text-neutral-200"
          >
            ✕
          </button>
        </div>

        <p className="mt-2 text-xs leading-relaxed text-neutral-400">{description}</p>

        {tags.length > 0 && (
          <ul className="mt-2.5 flex flex-wrap gap-1">
            {tags.map((tag) => (
              <li
                key={tag}
                className="rounded-[3px] border border-[var(--line)] bg-[var(--ink-chip)] px-1.5 py-0.5 text-[10px] text-neutral-400"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          onClick={onAction}
          className="mt-3 flex w-full items-center justify-center rounded-[4px] border border-[var(--line-strong)] bg-[var(--ink-tint)] px-2.5 py-1.5 text-xs font-medium text-[var(--accent)] transition-colors hover:border-[var(--line-hover)] hover:bg-[var(--ink-tint-hover)]"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  )
}
