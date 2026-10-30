import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query"
import { diningMenuApi } from "@/service"

/**
 * Resolved menu days for a date range (≤ 62 days). A caterer login reads its own kitchen; Admin and
 * the Dining Office read the kitchen `catererId`.
 */
const useMenuRange = ({ readOnly = false, catererId, from, to, enabled = true }) =>
  useQuery({
    queryKey: readOnly ? queryKeys.diningMenu.catererRange({ from, to }) : queryKeys.diningMenu.range({ catererId, from, to }),
    queryFn: () => (readOnly ? diningMenuApi.getCatererMenu({ from, to }) : diningMenuApi.getRange({ catererId, from, to })),
    enabled: enabled && (readOnly || Boolean(catererId)),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  })

export default useMenuRange
