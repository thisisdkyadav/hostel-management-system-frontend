import { useCallback } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { adminApi, electionsApi, studentApi } from "@/service"
import { queryKeys } from "@/lib/query"

const isDispatchInFlight = (dispatch) =>
  ["queued", "running"].includes(String(dispatch?.status || ""))

/**
 * Data layer for ElectionsPage. Owns every query and mutation the page needs.
 * Query functions unwrap the API envelope so cached values match the exact
 * shapes the page consumed from its former useState triads. Mutations are
 * transport only — toasts and local UI side effects stay in the page's
 * handlers so error strings and sequencing are preserved verbatim.
 */
export const useElectionsData = ({
  isAdminView = false,
  isAdminLikeView = false,
  isStudentView = false,
  selectedAdminElectionId = "",
  showVotingEmailRecipientsModal = false,
  showTestEmailRecipientsModal = false,
  liveStatsPollTabActive = false,
}) => {
  const queryClient = useQueryClient()

  // ---- queries -------------------------------------------------------------

  const batchListQuery = useQuery({
    queryKey: queryKeys.elections.batchList(),
    queryFn: async () => {
      const batches = await studentApi.getBatchList()
      return Array.isArray(batches) ? batches : []
    },
    enabled: isAdminView,
  })

  const studentGroupsQuery = useQuery({
    queryKey: queryKeys.elections.studentGroups(),
    queryFn: async () => {
      const response = await adminApi.getStudentGroups()
      return Array.isArray(response?.value) ? response.value : []
    },
    enabled: isAdminView,
  })

  const adminElectionsQuery = useQuery({
    queryKey: queryKeys.elections.list(),
    queryFn: async () => {
      const response = await electionsApi.listAdminElections()
      return response?.data?.elections || []
    },
    enabled: isAdminLikeView,
  })

  const adminElectionDetailQuery = useQuery({
    queryKey: queryKeys.elections.detail(selectedAdminElectionId),
    queryFn: async () => {
      const response = await electionsApi.getElectionDetail(selectedAdminElectionId)
      return response?.data || null
    },
    enabled: isAdminLikeView && Boolean(selectedAdminElectionId),
  })
  const selectedAdminElection = adminElectionDetailQuery.data || null

  const votingControlWindowOpen = Boolean(selectedAdminElection?.votingControlWindowOpen)

  const liveVotingStatsQuery = useQuery({
    queryKey: queryKeys.elections.liveStats(selectedAdminElectionId),
    queryFn: async () => {
      const response = await electionsApi.getVotingLiveStats(selectedAdminElectionId)
      return response?.data || null
    },
    enabled:
      isAdminView &&
      Boolean(selectedAdminElectionId) &&
      votingControlWindowOpen,
    refetchInterval: (query) =>
      isAdminView && liveStatsPollTabActive && isDispatchInFlight(query.state.data?.dispatch)
        ? 3000
        : false,
  })
  // The page cleared stats whenever the voting control window was not open.
  const liveVotingStats =
    isAdminView && votingControlWindowOpen ? liveVotingStatsQuery.data || null : null
  const loadingVotingStats =
    isAdminView && votingControlWindowOpen && liveVotingStatsQuery.isFetching

  const votingEmailRecipientsQuery = useQuery({
    queryKey: queryKeys.elections.votingEmailRecipients(selectedAdminElectionId),
    queryFn: async () => {
      const response = await electionsApi.getVotingEmailRecipients(selectedAdminElectionId)
      return response?.data || null
    },
    enabled:
      isAdminView && showVotingEmailRecipientsModal && Boolean(selectedAdminElectionId),
    refetchInterval: showVotingEmailRecipientsModal &&
      isDispatchInFlight(liveVotingStatsQuery.data?.dispatch)
      ? 3000
      : false,
  })
  const votingEmailRecipientsData = showVotingEmailRecipientsModal
    ? votingEmailRecipientsQuery.data || null
    : null
  const loadingVotingEmailRecipients =
    showVotingEmailRecipientsModal && votingEmailRecipientsQuery.isFetching

  const testEmailRecipientsQuery = useQuery({
    queryKey: queryKeys.elections.testEmailRecipients(selectedAdminElectionId),
    queryFn: async () => {
      const response = await electionsApi.getTestEmailRecipients(selectedAdminElectionId)
      return response?.data || null
    },
    enabled:
      isAdminView && showTestEmailRecipientsModal && Boolean(selectedAdminElectionId),
    // Prefer the fresh dispatch status from the recipients payload so polling
    // stops once the dispatch settles (old loader polled detail + recipients
    // together; the recipients response carries the same dispatch snapshot).
    refetchInterval: (query) =>
      showTestEmailRecipientsModal &&
      isDispatchInFlight(
        query.state.data?.dispatch ?? selectedAdminElection?.testEmailDispatch
      )
        ? 3000
        : false,
  })
  const testEmailRecipientsData = showTestEmailRecipientsModal
    ? testEmailRecipientsQuery.data || null
    : null
  const loadingTestEmailRecipients =
    showTestEmailRecipientsModal && testEmailRecipientsQuery.isFetching

  const studentCurrentQuery = useQuery({
    queryKey: queryKeys.elections.studentCurrent(),
    queryFn: async () => {
      const response = await electionsApi.getStudentCurrent()
      return response?.data?.elections || []
    },
    enabled: isStudentView,
    // Nomination drafts / vote selections are seeded from this data; an
    // unexpected background refetch would wipe in-progress edits.
    refetchOnWindowFocus: false,
  })

  // ---- mutations -----------------------------------------------------------

  const saveElectionMutation = useMutation({
    mutationFn: ({ mode, id, payload }) =>
      mode === "edit" && id
        ? electionsApi.updateElection(id, payload)
        : electionsApi.createElection(payload),
  })

  const cloneElectionMutation = useMutation({
    mutationFn: ({ id, title }) => electionsApi.cloneElection(id, { title }),
  })

  const reviewNominationMutation = useMutation({
    mutationFn: ({ electionId, nominationId, payload }) =>
      electionsApi.reviewNomination(electionId, nominationId, payload),
  })

  const upsertNominationMutation = useMutation({
    mutationFn: ({ electionId, postId, payload }) =>
      electionsApi.upsertNomination(electionId, postId, payload),
  })

  const withdrawNominationMutation = useMutation({
    mutationFn: ({ electionId, nominationId }) =>
      electionsApi.withdrawNomination(electionId, nominationId),
  })

  const submitVotesMutation = useMutation({
    mutationFn: ({ electionId, payload }) =>
      electionsApi.submitStudentVotes(electionId, payload),
  })

  const publishResultsMutation = useMutation({
    mutationFn: ({ electionId, payload }) =>
      electionsApi.publishResults(electionId, payload),
  })

  const sendVotingEmailsMutation = useMutation({
    mutationFn: ({ electionId, payload }) =>
      electionsApi.sendVotingEmails(electionId, payload),
  })

  const sendTestEmailsMutation = useMutation({
    mutationFn: ({ electionId, payload }) =>
      electionsApi.sendTestEmails(electionId, payload),
  })

  // ---- imperative helpers used by page handlers -----------------------------

  const refetchAdminDetail = useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.elections.detail(selectedAdminElectionId),
      }),
    [queryClient, selectedAdminElectionId]
  )

  const refetchLiveVotingStats = useCallback(
    () => liveVotingStatsQuery.refetch(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedAdminElectionId]
  )

  const refetchVotingEmailRecipients = useCallback(
    () => votingEmailRecipientsQuery.refetch(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedAdminElectionId]
  )

  const refetchTestEmailRecipients = useCallback(
    () => testEmailRecipientsQuery.refetch(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedAdminElectionId]
  )

  const setLiveVotingStatsCache = useCallback(
    (updater) =>
      queryClient.setQueryData(
        queryKeys.elections.liveStats(selectedAdminElectionId),
        updater
      ),
    [queryClient, selectedAdminElectionId]
  )

  const refreshAdminElections = useCallback(
    () => queryClient.invalidateQueries({ queryKey: queryKeys.elections.list() }),
    [queryClient]
  )

  const refreshStudentPortal = useCallback(
    () => queryClient.invalidateQueries({ queryKey: queryKeys.elections.studentCurrent() }),
    [queryClient]
  )

  const retryCore = useCallback(async () => {
    if (isAdminLikeView) await adminElectionsQuery.refetch()
    if (isStudentView) await studentCurrentQuery.refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdminLikeView, isStudentView, selectedAdminElectionId])

  return {
    // data (same names/shapes the page consumed from useState)
    batchOptions: batchListQuery.data || [],
    groupOptions: studentGroupsQuery.data || [],
    adminElections: adminElectionsQuery.data || [],
    selectedAdminElection,
    liveVotingStats,
    loadingVotingStats,
    votingEmailRecipientsData,
    loadingVotingEmailRecipients,
    testEmailRecipientsData,
    loadingTestEmailRecipients,
    studentElections: studentCurrentQuery.data || [],

    // page-level Loading/Error state
    isLoadingCore:
      (isAdminLikeView && adminElectionsQuery.isLoading) ||
      (isStudentView && studentCurrentQuery.isLoading),
    coreError: adminElectionsQuery.error || studentCurrentQuery.error || null,

    // refetch / cache helpers
    refetchAdminDetail,
    refetchLiveVotingStats,
    refetchVotingEmailRecipients,
    refetchTestEmailRecipients,
    setLiveVotingStatsCache,
    refreshAdminElections,
    refreshStudentPortal,
    retryCore,

    // mutations
    saveElectionMutation,
    cloneElectionMutation,
    reviewNominationMutation,
    upsertNominationMutation,
    withdrawNominationMutation,
    submitVotesMutation,
    publishResultsMutation,
    sendVotingEmailsMutation,
    sendTestEmailsMutation,
  }
}

export default useElectionsData
