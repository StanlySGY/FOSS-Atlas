/** Shared page title and section heading primitives for the whole app. */
export function PageHeader({ eyebrow, title, description, actions, aside, className = '' }) {
  return (
    <header className={['fa-page-header', className].filter(Boolean).join(' ')}>
      <div className="fa-page-heading">
        {eyebrow ? <p className="fa-page-eyebrow">{eyebrow}</p> : null}
        <h1 className="fa-page-title">{title}</h1>
        {description ? <p className="fa-page-description">{description}</p> : null}
        {actions ? <div className="fa-page-actions">{actions}</div> : null}
      </div>
      {aside ? <div className="fa-page-header-aside">{aside}</div> : null}
    </header>
  )
}

export function SectionHeading({ eyebrow, title, description, meta, actions, className = '' }) {
  return (
    <div className={['fa-section-heading', className].filter(Boolean).join(' ')}>
      <div className="min-w-0">
        {eyebrow ? <p className="fa-section-eyebrow">{eyebrow}</p> : null}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h2 className="fa-section-title">{title}</h2>
          {meta ? <span className="fa-section-meta">{meta}</span> : null}
        </div>
        {description ? <p className="fa-section-description">{description}</p> : null}
      </div>
      {actions ? <div className="fa-section-actions">{actions}</div> : null}
    </div>
  )
}
