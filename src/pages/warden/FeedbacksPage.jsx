import { Pagination, SearchInput, Tabs, Text } from "hzero"
import { useState, useEffect, useCallback, useMemo } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { HiAnnotation } from "react-icons/hi"
import NoResults from "../../components/common/NoResults"
import FeedbackStats from "../../components/FeedbackStats"
import FeedbackCard from "../../components/FeedbackCard"
import { useAuth } from "../../contexts/AuthProvider"
import { feedbackApi } from "../../service"
import { queryKeys } from "../../lib/query"
import FeedbackFormModal from "../../components/student/feedback/FeedbackFormModal"
import FeedbackHeader from "../../components/headers/FeedbackHeader"
import PageFooter from "../../components/common/PageFooter"

const FEEDBACK_FILTER_TABS = [
  { label: "All Feedbacks", value: "all", color: "primary" },
  { label: "Pending", value: "Pending", color: "primary" },
  { label: "Seen", value: "Seen", color: "primary" },
]
const FEEDBACKS_PAGE_SIZE = 10

const FeedbacksPage = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("Pending")
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const filters = useMemo(
    () => ({
      page: currentPage,
      limit: FEEDBACKS_PAGE_SIZE,
      ...(activeTab !== "all" && { status: activeTab }),
      ...(searchTerm.trim().length > 0 && { search: searchTerm.trim() }),
    }),
    [activeTab, currentPage, searchTerm],
  )

  const listQuery = useQuery({
    queryKey: queryKeys.feedback.list(filters),
    queryFn: () => feedbackApi.getFeedbacks(filters),
    enabled: Boolean(user),
  })

  // If the current page falls outside the result set (e.g. items were removed
  // from the last page), snap back to the last available page and refetch.
  const fetchedTotalPages = listQuery.data?.pagination?.totalPages || 0
  if (fetchedTotalPages > 0 && currentPage > fetchedTotalPages) {
    setCurrentPage(fetchedTotalPages)
  }

  useEffect(() => {
    if (listQuery.error) {
      console.error("Error fetching feedbacks:", listQuery.error)
    }
  }, [listQuery.error])

  const feedbacks = listQuery.data?.feedbacks || []
  const feedbackStats = listQuery.data?.stats || null
  const apiPagination = listQuery.data?.pagination || {}
  const totalFeedbacks = apiPagination.total || 0
  const totalPages = Math.max(apiPagination.totalPages || 0, 1)
  const isLoading = listQuery.isPending

  const queryClient = useQueryClient()
  const refreshFeedbackQueries = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.feedback.all })
  }, [queryClient])

  const submitFeedbackMutation = useMutation({
    mutationFn: (feedback) => feedbackApi.submitFeedback(feedback),
    onSuccess: async (response) => {
      if (response.success) {
        await refreshFeedbackQueries()
      } else {
        alert("Failed to submit feedback")
      }
    },
    onError: (error) => {
      console.error("Error submitting feedback:", error)
      alert("An error occurred while submitting feedback")
    },
  })

  const handleAddFeedback = async (feedback) => {
    try {
      const response = await submitFeedbackMutation.mutateAsync(feedback)
      return Boolean(response?.success)
    } catch {
      return false
    }
  }

  const handlePaginate = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  const styles = {
    container: { display: "flex", flexDirection: "column", height: "100%" },
    content: { flex: 1, overflowY: "auto", padding: "var(--spacing-6) var(--spacing-4)" },
    filterSection: { marginTop: "var(--spacing-8)", display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--spacing-4)" },
    tabWrapper: { width: "100%", paddingBottom: "var(--spacing-2)" },
    loadingContainer: { display: "flex", justifyContent: "center", alignItems: "center", height: "16rem" },
    spinner: { width: "var(--icon-4xl)", height: "var(--icon-4xl)", borderRadius: "var(--radius-full)", borderBottom: "var(--border-2) solid var(--color-primary)", animation: "spin 1s linear infinite" },
    grid: { marginTop: "var(--spacing-6)", display: "grid", gap: "var(--spacing-6)" },
    noResultsIcon: { color: "var(--color-text-disabled)", fontSize: "var(--font-size-4xl)" },
  }

  return (
    <>
      <div style={styles.container}>
        <FeedbackHeader userRole={user?.role} onAddFeedback={() => setShowAddModal(true)} />

        <div style={styles.content} className="content-responsive">
          <FeedbackStats feedbacks={feedbacks} stats={feedbackStats} />

          <div style={styles.filterSection} className="filter-responsive">
            <div style={styles.tabWrapper}>
              <Tabs
                variant="pills"
                tabs={FEEDBACK_FILTER_TABS}
                activeTab={activeTab}
                setActiveTab={(value) => {
                  setActiveTab(value)
                  setCurrentPage(1)
                }}
              />
            </div>
            <SearchInput
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search feedbacks..."
              className="search-responsive"
            />
          </div>

          {isLoading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
            </div>
          ) : (
            <>
              <div style={styles.grid} className="feedbacks-grid">
                {feedbacks.map((feedback) => (["Student"].includes(user?.role) ? <FeedbackCard key={feedback._id} feedback={feedback} refresh={refreshFeedbackQueries} isStudentView={true} /> : <FeedbackCard key={feedback._id} feedback={feedback} refresh={refreshFeedbackQueries} />))}
              </div>

              {feedbacks.length === 0 && <NoResults icon={<HiAnnotation style={styles.noResultsIcon} />} message="No feedbacks found" suggestion="Try changing your search or filter criteria" />}
            </>
          )}
        </div>

        <PageFooter
          leftContent={[
            <Text as="span" size="sm" color="muted" key="count">
              Showing <Text as="span" weight="semibold">{feedbacks.length}</Text> of{" "}
              <Text as="span" weight="semibold">{totalFeedbacks}</Text> feedbacks
            </Text>,
          ]}
          rightContent={[
            <Pagination
              key="pagination"
              currentPage={currentPage}
              totalPages={totalPages}
              paginate={handlePaginate}
              compact
              showPageInfo={false}
            />,
          ]}
        />
      </div>
      <FeedbackFormModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={handleAddFeedback} isEditing={false} />

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .content-responsive { padding: var(--spacing-6) var(--spacing-4); }
        @media (min-width: 640px) { .content-responsive { padding: var(--spacing-6); } }
        @media (min-width: 1024px) { .content-responsive { padding: var(--spacing-6) var(--spacing-8); } }
        .filter-responsive { flex-direction: column; align-items: flex-start; }
        @media (min-width: 640px) { .filter-responsive { flex-direction: row; align-items: center; } .filter-responsive > div:first-child { width: auto; } }
        .search-responsive { width: 100%; }
        @media (min-width: 640px) { .search-responsive { width: 16rem; } }
        @media (min-width: 768px) { .search-responsive { width: 18rem; } }
        .feedbacks-grid { grid-template-columns: 1fr; }
        @media (min-width: 768px) { .feedbacks-grid { grid-template-columns: repeat(2, 1fr); } }
      `}</style>
    </>
  )
}

export default FeedbacksPage
