import { useState, useEffect } from "react"
import { HiAnnotation, HiPlus } from "react-icons/hi"
import FilterTabs from "../../components/common/FilterTabs"
import SearchBar from "../../components/common/SearchBar"
import NoResults from "../../components/common/NoResults"
import FeedbackStats from "../../components/FeedbackStats"
import FeedbackCard from "../../components/FeedbackCard"
import { useAuth } from "../../contexts/AuthProvider"
import { feedbackApi } from "../../services/feedbackApi"
import FeedbackFormModal from "../../components/student/feedback/FeedbackFormModal"

const FEEDBACK_FILTER_TABS = [
  { label: "All Feedbacks", value: "all", color: "[#1360AB]" },
  { label: "Pending", value: "Pending", color: "[#1360AB]" },
  { label: "Seen", value: "Seen", color: "[#1360AB]" },
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

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8 py-6 flex-1">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full mb-6">
          <div className="flex items-center mb-4 sm:mb-0">
            <div className="p-3 mr-4 rounded-xl bg-blue-100 text-[#1360AB] flex-shrink-0">
              <HiAnnotation size={24} />
            </div>
            {["Student"].includes(user.role) ? (
              <div>
                <h1 className="text-2xl font-bold text-gray-800">My Feedbacks</h1>
                <p className="text-gray-500 text-sm mt-1 max-w-xl">View and manage your submitted feedbacks. You can edit or delete your feedbacks if they are still pending.</p>
              </div>
            ) : (
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Student Feedbacks</h1>
                <p className="text-gray-500 text-sm mt-1 max-w-xl">Review and manage feedback submitted by students in your hostel.</p>
              </div>
            )}
          </div>
          {["Student"].includes(user.role) && (
            <button onClick={() => setShowAddModal(true)} className="bg-[#1360AB] text-white flex items-center px-4 py-2.5 rounded-xl hover:bg-[#0F4C81] transition-all duration-300 shadow-sm hover:shadow-md">
              <HiPlus className="mr-2" /> Add Feedback
            </button>
          )}
        </header>

        <FeedbackStats feedbacks={feedbacks} />

        <div className="mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="w-full sm:w-auto pb-2">
            <FilterTabs tabs={FEEDBACK_FILTER_TABS} activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
          <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search feedbacks..." className="w-full sm:w-64 md:w-72" />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1360AB]"></div>
          </div>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {filteredFeedbacks.map((feedback) => (["Student"].includes(user.role) ? <FeedbackCard key={feedback._id} feedback={feedback} refresh={fetchFeedbacks} isStudentView={true} /> : <FeedbackCard key={feedback._id} feedback={feedback} refresh={fetchFeedbacks} />))}
            </div>

            {filteredFeedbacks.length === 0 && <NoResults icon={<HiAnnotation className="text-gray-300 text-3xl" />} message="No feedbacks found" suggestion="Try changing your search or filter criteria" />}
          </>
        )}
      </div>
      <FeedbackFormModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={handleAddFeedback} isEditing={false} />
    </>
  )
}

export default Feedbacks
