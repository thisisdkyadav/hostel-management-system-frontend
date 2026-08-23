import { useMutation, useQueryClient } from "@tanstack/react-query"

/**
 * useOptimisticMutation — standard optimistic-update mutation.
 *
 * useOptimisticMutation({
 *   queryKey: complaintsKeys.all,          // prefix — every matching cache is patched
 *   updateFn: (previous, variables) => nextCachedValue,   // return undefined to skip a cache
 *   mutationFn: (variables) => complaintsApi.update(...),
 *   onSuccess: (data, variables) => toast.success("Done"), // optional
 * })
 *
 * Behaviour: on mutate, EVERY cached query whose key starts with queryKey is
 * patched via updateFn (snapshots kept). On failure all snapshots are restored
 * and the error rethrown for the caller's onError. On success every matched
 * query is invalidated so server state wins.
 */
export const useOptimisticMutation = ({ queryKey, updateFn, mutationFn, ...options }) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      if (!updateFn || !queryKey) return undefined
      await queryClient.cancelQueries({ queryKey })
      const snapshots = queryClient.getQueriesData({ queryKey })
      for (const [key, previous] of snapshots) {
        const next = updateFn(previous, variables)
        if (next !== undefined) {
          queryClient.setQueryData(key, next)
        }
      }
      return { snapshots }
    },
    onError: (error, variables, context) => {
      if (context?.snapshots?.length && queryKey) {
        for (const [key, previous] of context.snapshots) {
          queryClient.setQueryData(key, previous)
        }
      }
      options.onError?.(error, variables, context)
    },
    onSettled: (data, error, variables, context) => {
      if (queryKey) {
        queryClient.invalidateQueries({ queryKey })
      }
      options.onSettled?.(data, error, variables, context)
    },
    ...Object.fromEntries(
      Object.entries(options).filter(([key]) => key !== "onError" && key !== "onSettled")
    ),
  })
}
