/**
 * Updater factories for useOptimisticMutation's updateFn.
 *
 * Each returns (previousCache, variables) => nextCache. Caches are matched by
 * shape: either a bare array of items or the standard API envelope
 * ({ data: { items: [...] } }). Anything else is returned untouched.
 */

const selectItems = (cache) => {
  if (Array.isArray(cache)) return cache
  if (Array.isArray(cache?.data?.items)) return cache.data.items
  return null
}

const withItems = (cache, items) => {
  if (Array.isArray(cache)) return items
  if (cache && Array.isArray(cache.data)) {
    // envelope variant where data itself is the list
    return { ...cache, data: items }
  }
  if (cache && typeof cache === "object") {
    return { ...cache, data: { ...cache.data, items } }
  }
  return cache
}

export const patchItemById = (pickId, getPatch) => {
  return (previous, variables) => {
    const items = selectItems(previous)
    if (!items) return previous
    const index = items.findIndex((item) => item !== null && item !== undefined && pickId(item) === pickId(variables))
    if (index === -1) return previous
    const next = [...items]
    next[index] = { ...next[index], ...getPatch(variables) }
    return withItems(previous, next)
  }
}

export const prependItem = (getItem) => {
  return (previous, variables) => {
    const items = selectItems(previous)
    const item = getItem(variables)
    if (!item || !items) return previous
    return withItems(previous, [item, ...items])
  }
}

export const removeItemById = (pickId) => {
  return (previous, variables) => {
    const items = selectItems(previous)
    if (!items) return previous
    return withItems(previous, items.filter((item) => item !== null && item !== undefined && pickId(item) !== pickId(variables)))
  }
}
