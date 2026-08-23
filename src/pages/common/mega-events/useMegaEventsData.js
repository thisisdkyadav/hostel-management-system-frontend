import { useCallback } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import gymkhanaEventsApi from "@/service/modules/gymkhanaEvents.api"
import { queryKeys } from "@/lib/query"

/**
 * Data layer for MegaEventsPage. Owns the series list, series detail
 * (raw, unsorted occurrences), and the per-occurrence proposal/expense
 * bundle. Mutations stay in page handlers; refresh helpers invalidate the
 * matching queries.
 */
export const useMegaEventsData = ({
  canViewEventsCapability,
  selectedSeriesId,
  selectedOccurrenceId,
}) => {
  const queryClient = useQueryClient()

  const seriesQuery = useQuery({
    queryKey: queryKeys.megaEvents.seriesList(),
    queryFn: async () => {
      const response = await gymkhanaEventsApi.getMegaSeries()
      return response.data?.series || response.series || []
    },
    enabled: canViewEventsCapability,
  })

  const seriesDetailQuery = useQuery({
    queryKey: queryKeys.megaEvents.seriesDetail(selectedSeriesId),
    queryFn: async () => {
      const response = await gymkhanaEventsApi.getMegaSeriesById(selectedSeriesId)
      return {
        series: response.data?.series || response.series || null,
        occurrences: response.data?.occurrences || response.occurrences || [],
      }
    },
    enabled: Boolean(canViewEventsCapability && selectedSeriesId),
  })
  const selectedSeries = seriesDetailQuery.data?.series || null

  const occurrenceBundleQuery = useQuery({
    queryKey: queryKeys.megaEvents.occurrenceBundle(selectedOccurrenceId),
    queryFn: async () => {
      const [proposalResponse, expenseResponse] = await Promise.all([
        gymkhanaEventsApi.getMegaOccurrenceProposal(selectedOccurrenceId).catch(() => null),
        gymkhanaEventsApi.getMegaOccurrenceExpense(selectedOccurrenceId).catch(() => null),
      ])
      return {
        proposal:
          proposalResponse?.data?.proposal || proposalResponse?.proposal || null,
        expense:
          expenseResponse?.data?.expense || expenseResponse?.expense || null,
      }
    },
    enabled: Boolean(canViewEventsCapability && selectedOccurrenceId),
  })

  const refreshSeries = useCallback(
    () => queryClient.invalidateQueries({ queryKey: queryKeys.megaEvents.seriesList() }),
    [queryClient]
  )

  const refreshSeriesDetail = useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.megaEvents.seriesDetail(selectedSeriesId),
      }),
    [queryClient, selectedSeriesId]
  )

  const refreshOccurrenceBundle = useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.megaEvents.occurrenceBundle(selectedOccurrenceId),
      }),
    [queryClient, selectedOccurrenceId]
  )

  return {
    series: seriesQuery.data || [],
    isLoadingCore: canViewEventsCapability && seriesQuery.isLoading,
    coreError: seriesQuery.error || seriesDetailQuery.error || null,

    selectedSeries,
    rawOccurrences: seriesDetailQuery.data?.occurrences || [],
    proposalData: occurrenceBundleQuery.data?.proposal ?? null,
    expenseData: occurrenceBundleQuery.data?.expense ?? null,

    refreshSeries,
    refreshSeriesDetail,
    refreshOccurrenceBundle,
  }
}

export default useMegaEventsData
