import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { studentApi } from "@/service"
import { queryKeys } from "@/lib/query"

const DEBOUNCE_MS = 400

/**
 * Server-side preview of a rebate date range (validation + short/long-term
 * split + whether a filled long-term form is needed). Debounced; runs only
 * once both dates are set and in order. A 400 from the server surfaces as `error`.
 */
const useRebatePreview = (startDate, endDate) => {
  const [debounced, setDebounced] = useState({ startDate: "", endDate: "" })
  const ready = Boolean(startDate && endDate && startDate <= endDate)

  useEffect(() => {
    if (!ready) return undefined
    const timer = setTimeout(() => setDebounced({ startDate, endDate }), DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [ready, startDate, endDate])

  const settled = ready && debounced.startDate === startDate && debounced.endDate === endDate
  const query = useQuery({
    queryKey: queryKeys.dining.rebates({ preview: debounced }),
    queryFn: () => studentApi.previewDiningRebate(debounced),
    enabled: settled,
    retry: false,
    staleTime: 0,
    gcTime: 0,
  })

  return {
    ready,
    // Typing/fetching: dates are chosen but the matching preview has not arrived yet.
    isPending: ready && (!settled || query.isFetching),
    preview: ready && settled && !query.isFetching && !query.isError ? query.data || null : null,
    error: ready && settled && !query.isFetching ? query.error : null,
  }
}

export default useRebatePreview
