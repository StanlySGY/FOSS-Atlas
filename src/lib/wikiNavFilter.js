const matches = (value, query) => String(value ?? '').toLocaleLowerCase().includes(query)

/** Filter the Wiki tree while preserving the category/subcategory ancestry of matches. */
export function filterWikiNavTree(tree, rawQuery) {
  const query = String(rawQuery ?? '').trim().toLocaleLowerCase()
  if (!query) return tree

  return tree.map((category) => {
    const categoryMatches = matches(category.name, query) || matches(category.id, query)
    const subs = category.subs
      .map((sub) => {
        const subMatches = categoryMatches || matches(sub.name, query) || matches(sub.id, query)
        const tools = subMatches
          ? sub.tools
          : sub.tools.filter((tool) => matches(tool.name, query) || matches(tool.id, query))
        return { ...sub, tools, count: tools.length }
      })
      .filter((sub) => sub.tools.length > 0)

    if (!subs.length) return null
    return {
      ...category,
      subs,
      count: subs.reduce((total, sub) => total + sub.tools.length, 0),
    }
  }).filter(Boolean)
}

export function countWikiNavTools(tree) {
  return tree.reduce(
    (categoryTotal, category) => categoryTotal + category.subs.reduce((subTotal, sub) => subTotal + sub.tools.length, 0),
    0,
  )
}
