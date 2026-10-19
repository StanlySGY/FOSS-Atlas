import ReactMarkdown from 'react-markdown'
import { Link } from 'react-router-dom'
import remarkGfm from 'remark-gfm'

/**
 * Renders markdown, routing internal /wiki/* links through React Router.
 *
 * `node` is injected by react-markdown for every component override; it must be
 * destructured out so it is never spread onto a DOM element.
 */
export default function Markdown({ children }) {
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
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
