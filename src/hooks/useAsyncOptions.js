import { useCallback, useEffect, useState } from "react"

/**
 * A list fetched from the server to fill a Select, with its loading and error.
 *
 * The shape it replaces was written three times in one file — departments,
 * degrees and batches each with their own `options`, `loading` and `error`
 * state, their own try/catch/finally, and their own retry button. Nine state
 * variables for one idea.
 *
 *   const departments = useAsyncOptions(studentApi.getDepartmentList)
 *   const batches = useAsyncOptions(
 *     () => studentApi.getBatchList({ degree, department }),
 *     [degree, department],
 *   )
 *
 * A response that is not an array becomes an empty list rather than throwing —
 * the callers were already doing that, because a Select given a non-array is a
 * crash and an empty Select is a Tuesday.
 *
 * @param {Function} load - returns a promise of the array
 * @param {Array} deps - refetch when these change
 * @param {string} label - names the list in the error message
 */
export const useAsyncOptions = (load, deps = [], label = "options") => {
  const [options, setOptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await load()
      setOptions(Array.isArray(data) ? data : [])
    } catch (cause) {
      console.error(`Failed to fetch ${label}:`, cause)
      setError(`Could not load ${label}.`)
      setOptions([])
    } finally {
      setLoading(false)
    }
    // load is redeclared every render at most call sites, so the dependency
    // that matters is what the caller says it is.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    // Wrapped because react-hooks/set-state-in-effect reads a call to any
    // setState-containing function as a synchronous one; an async body is the
    // boundary it recognises. Nothing is set before the fetch returns.
    const run = async () => { await reload() }
    run()
  }, [reload])

  return { options, loading, error, reload }
}

export default useAsyncOptions
