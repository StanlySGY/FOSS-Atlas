import ReactMarkdown from 'react-markdown'
import { memo, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import remarkGfm from 'remark-gfm'
import { headingSlug } from '../lib/wiki.js'

/** Flatten whatever react-markdown hands back into the heading's text. */
function textOf(node) {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (typeof node === 'object' && node.props) return textOf(node.props.children)
  return ''
}

function MarkdownCodeBlock({ children, ...props }) {
  const [copyState, setCopyState] = useState('idle')
  const resetTimer = useRef(null)
  const source = textOf(children)

  useEffect(() => () => clearTimeout(resetTimer.current), [])

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(source)
      setCopyState('copied')
    } catch {
      setCopyState('failed')
    }
    clearTimeout(resetTimer.current)
    resetTimer.current = setTimeout(() => setCopyState('idle'), 1600)
  }

  return (
    <div className="fa-markdown-code">
      <button
        type="button"
        className="fa-code-copy"
        onClick={copyCode}
        aria-label={copyState === 'copied' ? '代码已复制' : copyState === 'failed' ? '代码复制失败' : '复制代码块'}
        aria-live="polite"
        title={copyState === 'copied' ? '已复制到剪贴板' : '复制代码'}
      >
        {copyState === 'copied' ? '已复制 ✓' : copyState === 'failed' ? '复制失败' : '复制代码'}
      </button>
      <pre {...props}>{children}</pre>
    </div>
  )
}

/**
 * Renders markdown, routing internal /wiki/* links through React Router.
 *
 * `node` is injected by react-markdown for every component override; it must be
 * destructured out so it is never spread onto a DOM element.
 */
function Markdown({ children }) {
  /*
   * `h2`/`h3` get anchor ids so the article's own table of contents (see
   * headingsFromMarkdown in lib/wiki.js) can point at them. The counter is made
   * fresh per render: the only way two renders could disagree is if they walked
   * the same body in a different order.
   */
  const seen = new Map()
  const Heading = ({ level, ...props }) => {
    const Tag = level === 2 ? 'h2' : 'h3'
    // Fragment targets must be programmatically focusable. This moves the
    // reading cursor to the section when a reader follows the TOC, instead of
    // leaving keyboard / assistive-technology focus behind on the TOC link.
    return <Tag id={headingSlug(textOf(props.children), seen)} tabIndex={-1}>{props.children}</Tag>
  }

  return (
    <div className="md max-w-[78ch]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a({ href, children: kids, node: _node, ...props }) {
            const target = href || ''
            if (target.startsWith('/wiki/') || target.startsWith('/?q=')) {
              return (
                <Link to={target} {...props}>
                  {kids}
                </Link>
              )
            }
            return (
              <a href={target} target="_blank" rel="noreferrer" {...props}>
                {kids}
              </a>
            )
          },
          h2({ node: _node, ...props }) {
            return <Heading level={2} {...props} />
          },
          h3({ node: _node, ...props }) {
            return <Heading level={3} {...props} />
          },
          pre({ node: _node, children: code, ...props }) {
            return <MarkdownCodeBlock {...props}>{code}</MarkdownCodeBlock>
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}

// TOC highlighting updates the page while scrolling. Keep the reading DOM
// stable so focused headings and text selections survive those updates.
export default memo(Markdown)
