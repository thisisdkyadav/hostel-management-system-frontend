import { useState, useEffect } from "react"
import { HiAnnotation } from "react-icons/hi"
import FilterTabs from "../../components/common/FilterTabs"
import SearchBar from "../../components/common/SearchBar"
import NoResults from "../../components/common/NoResults"
import FeedbackStats from "../../components/FeedbackStats"
import FeedbackCard from "../../components/FeedbackCard"
import { useAuth } from "../../contexts/AuthProvider"
import { feedbackApi } from "../../services/feedbackApi"
import FeedbackFormModal from "../../components/student/feedback/FeedbackFormModal"
import FeedbackHeader from "../../components/headers/FeedbackHeader"

const FEEDBACK_FILTER_TABS = [
  { label: "All Feedbacks", value: "all", color: "primary" },
  { label: "Pending", value: "Pending", color: "primary" },
  { label: "Seen", value: "Seen", color: "primary" },
]

const filterFeedbacks = (feedbacks, filter, searchTerm) => {
  let filtered = feedbacks

  if (filter !== "all") {
    filtered = feedbacks.filter((feedback) => feedback.status === filter)
  }

  if (searchTerm) {
    const term = searchTerm.toLowerCase()
    filtered = filtered.filter((feedback) => feedback.title.toLowerCase().includes(term) || feedback.description.toLowerCase().includes(term) || feedback.userId.name.toLowerCase().includes(term))
  }

  return filtered
}

const Feedbacks = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("Pending")
  const [searchTerm, setSearchTerm] = useState("")
  const [feedbacks, setFeedbacks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  const filteredFeedbacks = filterFeedbacks(feedbacks, activeTab, searchTerm)

  const fetchFeedbacks = async () => {
    try {
      setIsLoading(true)
      const response = await feedbackApi.getFeedbacks()
      setFeedbacks(response.feedbacks || [])
    } catch (error) {
      console.error("Error fetching feedbacks:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddFeedback = async (feedback) => {
    try {
      const response = await feedbackApi.submitFeedback(feedback)
      if (response.success) {
        await fetchFeedbacks()
        return true
      } else {
        alert("Failed to submit feedback")
        return false
      }
    } catch (error) {
      console.error("Error submitting feedback:", error)
      alert("An error occurred while submitting feedback")
      return false
    }
  }

  useEffect(() => {
    if (user) {
      fetchFeedbacks()
    }
  }, [user])

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
          <FeedbackStats feedbacks={feedbacks} />

          <div style={styles.filterSection} className="filter-responsive">
            <div style={styles.tabWrapper}>
              <FilterTabs tabs={FEEDBACK_FILTER_TABS} activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
            <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search feedbacks..." className="search-responsive" />
          </div>

          {isLoading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
            </div>
          ) : (
            <>
              <div style={styles.grid} className="feedbacks-grid">
                {filteredFeedbacks.map((feedback) => (["Student"].includes(user?.role) ? <FeedbackCard key={feedback._id} feedback={feedback} refresh={fetchFeedbacks} isStudentView={true} /> : <FeedbackCard key={feedback._id} feedback={feedback} refresh={fetchFeedbacks} />))}
              </div>

              {filteredFeedbacks.length === 0 && <NoResults icon={<HiAnnotation style={styles.noResultsIcon} />} message="No feedbacks found" suggestion="Try changing your search or filter criteria" />}
            </>
          )}
        </div>
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

export default Feedbacks
