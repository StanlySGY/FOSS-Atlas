/**
 * Separate generated catalogue prose into an optional overview and the parts
 * a reader may need while actually using the service. Hand-written Wiki pages
 * retain their original structure and ordering.
 */
export function presentWikiMarkdown(markdown, generated = false) {
  if (!generated) {
    return { overviewMarkdown: '', practicalMarkdown: markdown, hasActionableGuide: false }
  }

  const sections = String(markdown ?? '').split(/(?=^##\s+)/m).filter((part) => part.trim())
  const overview = []
  const practical = []

  for (const section of sections) {
    const heading = section.match(/^##\s+([^\n]+)/)?.[1]?.trim() ?? ''
    // The page header already contains the catalogue summary; graph relations
    // and alternatives have their own navigable panel lower on the page.
    if (heading === '一句话总结' || heading === '同类推荐') continue
    if (/核心功能|适用场景/.test(heading)) overview.push(section)
    else practical.push(section)
  }

  const overviewMarkdown = overview.join('\n\n').trim()
  const practicalMarkdown = practical.join('\n\n').trim()
  return {
    overviewMarkdown,
    practicalMarkdown,
    hasActionableGuide: /快速上手|API 调用示例/.test(practicalMarkdown),
  }
}
