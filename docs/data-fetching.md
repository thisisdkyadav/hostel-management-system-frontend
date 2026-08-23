# Data Fetching Pattern — TanStack Query

> How new data fetching works in HMS frontend. Adopted as the standard in
> August 2026. Existing `useEffect`-based fetching still works and migrates
> feature-by-feature.

---

## Layering (unchanged)

React Query sits **on top of** the service layer — it never replaces it:

```
component → useXxx() query/mutation hook → service/modules/*.api.js → core/apiClient.js
```

API modules stay plain. What changes is who owns loading/error state and
caching: React Query does, not component `useState` + `useEffect`.

## Foundation (`src/lib/query/`)

| File | Purpose |
|---|---|
| `queryClient.js` | The app's `QueryClient`: staleTime 30s, retry policy (no retry on auth/404/validation errors; 2 retries on network/server errors), global 401 → logout redirect |
| `queryKeys.js` | **The** query-key factories. Every query key comes from here — never inline string arrays at call sites |
| `optimistic.js` | `useOptimisticMutation` — the standard optimistic-update mutation (patch cache → restore on error → invalidate on settle) |
| `QueryInvalidationBridge.jsx` | Socket.IO events (`visitor-update`, `complaint-update`, `notification`) invalidate the matching domain automatically |

## Writing a query

```jsx
import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query"
import gymkhanaEventsApi from "@/service/modules/gymkhanaEvents.api"

export const useCalendarData = (year) =>
  useQuery({
    queryKey: queryKeys.gymkhana.calendar(year),
    queryFn: () => gymkhanaEventsApi.getCalendarByYear(year),
    enabled: Boolean(year),
  })
```

You get `{ data, isLoading, isError, error, refetch }`. Delete any local
`loading` / `error` / `hasAttemptedLoad` state — that's the point.

## Writing a mutation

For button-click flows ("save → toast → close modal"), use `useMutation`
directly and invalidate the affected queries in `onSuccess`:

```jsx
const queryClient = useQueryClient()
const saveEvent = useMutation({
  mutationFn: (payload) => gymkhanaEventsApi.updateCalendar(id, payload),
  onSuccess: async () => {
    toast.success("Event saved")
    await queryClient.invalidateQueries({ queryKey: queryKeys.gymkhana.all })
  },
  onError: (err) => toast.error(err.message),
})
// saveEvent.mutate(payload); saveEvent.isPending
```

If the UI should reflect the change instantly, use the shared optimistic
helper instead of hand-rolling snapshot logic:

```jsx
import { patchItemById, queryKeys, useOptimisticMutation } from "@/lib/query"

const moveTask = useOptimisticMutation({
  queryKey: myTasksKeys.list(filters),   // prefix — every matching cache is patched
  updateFn: patchItemById(
    (item) => item?._id ?? item?.id,
    (variables) => variables.patch        // fields to merge into the matched item
  ),
  mutationFn: (variables) => tasksApi.move(variables.id, variables.to),
})
```

`updateFn` receives each matching cache and the mutation variables; return
`undefined` to leave a cache untouched. `patchItemById` / `prependItem` /
`removeItemById` (`lib/query/cachePatches.js`) handle both bare-array caches
and the standard `{ data: { items: [...] } }` envelope. On failure every
patched cache is restored from its snapshot; on settle everything invalidates
so server state always converges.

## Rules

1. **New data fetching uses React Query.** Do not add new
   `useEffect + useState` fetching triads.
2. **Keys come from `queryKeys.js`.** Adding a domain = adding its factory
   there. Hierarchy: `domain.all ⊃ list/detail(...)` so broad invalidations
   stay one-liners.
3. **Imperative stays imperative.** Version checks, blob downloads, POSTs
   fired from event handlers with no cache to read — plain service calls or
   `useMutation`, not queries.
4. **Realtime invalidation is free**: if your domain's data changes server-side
   via a socket event, add the event → key mapping in `QueryInvalidationBridge`.
5. **Don't mirror server state into `useState`.** Derive from query data;
   keep only genuinely local UI state (open modals, form drafts) in state.
6. **Paginated fetch-all logic can live inside `queryFn`** to start; switch to
   `useInfiniteQuery` only when the UX wants incremental loading.

## Migration recipe (per feature)

1. Replace fetch-in-effect with `useQuery` keyed by the inputs it depends on.
2. Replace post-mutation manual refetches with `invalidateQueries`.
3. Delete the manual loading/error/request-id-guard state the query replaces.
4. Keep the hook's public return shape stable if other components consume it —
   migrate callers in the same change set.
