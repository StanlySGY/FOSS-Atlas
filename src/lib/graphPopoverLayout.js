const DEFAULT_WIDTH = 264
const DEFAULT_HEIGHT = 232
const GAP = 12
const MARGIN = 8

const finiteOr = (value, fallback) => (Number.isFinite(value) ? value : fallback)
const clamp = (value, min, max) => Math.min(Math.max(value, min), Math.max(min, max))

/** Keep a node preview inside its canvas, preferring the side with more room. */
export function graphPopoverLayout(point, measuredHeight, options = {}) {
  const width = Math.max(0, finiteOr(point?.width, 0))
  const height = Math.max(0, finiteOr(point?.height, 0))
  const x = finiteOr(point?.x, width / 2)
  const y = finiteOr(point?.y, height / 2)
  const preferredWidth = Math.max(0, finiteOr(options.width, DEFAULT_WIDTH))
  const gap = Math.max(0, finiteOr(options.gap, GAP))
  const margin = Math.max(0, finiteOr(options.margin, MARGIN))
  const availableWidth = Math.max(0, width - margin * 2)
  const availableHeight = Math.max(0, height - margin * 2)
  const popoverWidth = Math.min(preferredWidth, availableWidth)
  const popoverHeight = Math.min(
    Math.max(0, finiteOr(measuredHeight, DEFAULT_HEIGHT) || DEFAULT_HEIGHT),
    availableHeight,
  )

  const right = x + gap
  const left = x - gap - popoverWidth
  const rightSpace = width - margin - right
  const leftSpace = x - gap - margin
  const fitsRight = rightSpace >= popoverWidth
  const fitsLeft = leftSpace >= popoverWidth
  const preferLeft = !fitsRight && (fitsLeft || leftSpace > rightSpace)
  const wantedLeft = preferLeft ? left : right
  const maxLeft = Math.max(margin, width - popoverWidth - margin)
  const leftPosition = clamp(wantedLeft, margin, maxLeft)

  const belowSpace = height - margin - (y + gap)
  const aboveSpace = y - gap - margin
  let flipped = false
  let wantedTop
  if (popoverHeight <= belowSpace) {
    wantedTop = y + gap
  } else if (popoverHeight <= aboveSpace) {
    flipped = true
    wantedTop = y - gap - popoverHeight
  } else {
    flipped = aboveSpace > belowSpace
    wantedTop = flipped ? y - gap - popoverHeight : y + gap
  }
  const maxTop = Math.max(margin, height - popoverHeight - margin)
  const top = clamp(wantedTop, margin, maxTop)

  const caretInset = Math.min(14, popoverWidth / 2)
  const caretX = clamp(x - leftPosition, caretInset, popoverWidth - caretInset)

  return {
    left: leftPosition,
    top,
    width: popoverWidth,
    maxWidth: availableWidth,
    maxHeight: availableHeight,
    caretX,
    flipped,
  }
}
