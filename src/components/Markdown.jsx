import ReactMarkdown from 'react-markdown'
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

/**
 * Renders markdown, routing internal /wiki/* links through React Router.
 *
 * `node` is injected by react-markdown for every component override; it must be
 * destructured out so it is never spread onto a DOM element.
 */
export default function Markdown({ children }) {
  /*
   * `h2`/`h3` get anchor ids so the article's own table of contents (see
   * headingsFromMarkdown in lib/wiki.js) can point at them. The counter is made
   * fresh per render: the only way two renders could disagree is if they walked
   * the same body in a different order.
   */
  const seen = new Map()
  const Heading = ({ level, ...props }) => {
    const Tag = level === 2 ? 'h2' : 'h3'
    return <Tag id={headingSlug(textOf(props.children), seen)}>{props.children}</Tag>
  }

  return (
    <div className="md">
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
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
