/**
 * Which graph nodes a given view keeps, and which tools a category contains.
 *
 * Lives here rather than inside GraphView because the page needs the same answer
 * twice: the canvas hides everything outside the view, and the aside has to state
 * counts and list tools for the view it is describing. Computed in two places
 * they drift, and a legend that counts the whole graph while the canvas shows a
 * subgraph is the drift you can see.
 */

/**
 * What stays on the canvas. Both filters work the same way — they name the ids
 * to keep, and everything else is hidden by the node mapper (opacity 0, never
 * removed) so the coordinate space the framing is expressed in never changes.
 *
 * - A 一级分类 keeps its own node, its sub-categories and its tools.
 * - 只看我部署了的 keeps every running service, plus only the structure those
 *   services need to be read: the sub-category and category each one hangs
 *   off, and a tag only when it joins *two or more* of them. A tag touching a
 *   single running tool links it to nothing the filter kept, so it would add
 *   visual weight and no information; with that rule 15 of the 40 tags and
 *   116 of the 338 标签 edges survive, over ~100 visible nodes instead of all
 *   283. 标签:开源 survives with 58 of those edges — kept deliberately: it is
 *   a real node with real coordinates in the frozen layout, not a hub minted
 *   for this view, and dropping it would make the subgraph read as if the
 *   services running here were not open source.
 *
 * `null` means no filter: the whole graph is on screen.
 */
export function visibleNodeIds(graph, { focusedCategory, deployedOnly }) {
  if (deployedOnly) {
    const running = new Set(graph.nodes.filter((n) => n.deployed).map((n) => n.id))
    if (running.size === 0) return null
    const keep = new Set(running)
    const subcategories = new Set()
    const isTag = new Map(graph.nodes.map((n) => [n.id, n.type === 'tag']))
    /*
     * How many *running* tools each tag touches. A tagged edge always has a tag
     * at one end and a tool at the other, so the running end names the tool and
     * the other end names the tag — counting the tag itself would let a tag that
     * touches no running service at all earn its place from three ordinary
     * tools, and would keep every multi-tagged tool that does not run here.
     */
    const tagWeight = new Map()
    for (const e of graph.edges) {
      if (e.type === 'belongs_to') {
        if (running.has(e.source)) subcategories.add(e.target)
        continue
      }
      if (e.type !== 'tagged') continue
      const tool = running.has(e.source) ? e.source : running.has(e.target) ? e.target : null
      if (tool === null) continue
      const tag = tool === e.source ? e.target : e.source
      if (!isTag.get(tag)) continue
      tagWeight.set(tag, (tagWeight.get(tag) ?? 0) + 1)
    }
    for (const [id, weight] of tagWeight) {
      if (weight >= 2) keep.add(id)
    }
    // Sub-category nodes know their category; keeping it anchors each cluster
    // instead of leaving it floating unlabelled.
    for (const n of graph.nodes) {
      if (subcategories.has(n.id) && n.category) keep.add(`cat:${n.category}`)
    }
    for (const id of subcategories) keep.add(id)
    return keep
  }
  if (!focusedCategory) return null
  const catNodeId = `cat:${focusedCategory}`
  const keep = new Set()
  for (const n of graph.nodes) {
    if (n.id === catNodeId) keep.add(n.id)
    else if (n.category === focusedCategory) keep.add(n.id)
  }
  return keep
}

/**
 * Tools and 自建 services inside a category, as catalogue records.
 *
 * Both node types are accepted: the generator puts Atlas-owned services under
 * their own 分类 (Atlas 自建), and a predicate matching only `tool` reads 0 for
 * that category and hides 12 running services from every list they belong to.
 */
export function toolsInCategory(graph, categoryId) {
  return graph.nodes
    .filter((n) => (n.type === 'tool' || n.type === 'own') && n.category === categoryId)
    .map((n) => n.id)
}

/** Node counts per type inside one view; pass no view to count the whole graph. */
export function countByType(graph, visibleIds) {
  const acc = {}
  for (const n of graph.nodes) {
    if (visibleIds && !visibleIds.has(n.id)) continue
    acc[n.type] = (acc[n.type] ?? 0) + 1
  }
  return acc
}
