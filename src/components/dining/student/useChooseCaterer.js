import { useQueryClient } from "@tanstack/react-query"
import { studentApi } from "@/service"
import { queryKeys, useOptimisticMutation } from "@/lib/query"

/**
 * Confirm a caterer for the open allocation period. Shared by the Dining page
 * and the allocation screen shown on app open, so both patch the same portal
 * cache. The choice is final on the server (a second pick gets a 409), so the
 * optimistic patch also turns `canSelect` off; on failure the snapshot comes
 * back and the portal refetches fresh seat counts.
 *
 * Call `mutate({ catererId, caterer, periodId })`.
 */
const useChooseCaterer = ({ onSuccess, onError } = {}) => {
  const queryClient = useQueryClient()

  return useOptimisticMutation({
    queryKey: queryKeys.dining.portalState(),
    updateFn: (previous, variables) => {
      if (!previous || typeof previous !== "object") return undefined
      const allocation = {
        catererId: variables.catererId,
        caterer: variables.caterer,
        selectedAt: new Date().toISOString(),
      }
      let next = previous
      for (const key of ["activeAllocationPeriod", "period"]) {
        const period = next[key]
        if (period && !period.selectedAllocation)
          next = {
            ...next,
            [key]: { ...period, selectedAllocation: allocation },
          }
      }
      return next === previous ? undefined : { ...next, canSelect: false }
    },
    mutationFn: (variables) => studentApi.selectDiningCaterer(variables.catererId, variables.periodId),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dining.meals() })
      onSuccess?.(response, variables)
    },
    onError,
  })
}

export default useChooseCaterer
