import { useState, useEffect } from "react"
import { HiAnnotation } from "react-icons/hi"
import FilterTabs from "../../components/common/FilterTabs"
import SearchBar from "../../components/common/SearchBar"
import NoResults from "../../components/common/NoResults"
import FeedbackStats from "../../components/FeedbackStats"
import FeedbackCard from "../../components/FeedbackCard"
import { useAuth } from "../../contexts/AuthProvider"
import { wardenApi } from "../../services/apiService"
import { useWarden } from "../../contexts/WardenProvider"

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
  const { profile } = useWarden()
  const [activeTab, setActiveTab] = useState("Pending")
  const [searchTerm, setSearchTerm] = useState("")
  const [feedbacks, setFeedbacks] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const filteredFeedbacks = filterFeedbacks(feedbacks, activeTab, searchTerm)

  const fetchFeedbacks = async () => {
    try {
      setIsLoading(true)
      const response = await wardenApi.getFeedbacks(profile?.hostelId._id)
      console.log("Feedbacks response:", response)

      setFeedbacks(response.feedbacks || [])
    } catch (error) {
      console.error("Error fetching feedbacks:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (profile?.hostelId._id) {
      fetchFeedbacks()
    }
  }, [profile])

  if (!["Warden", "Associate Warden"].includes(user?.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8 max-w-md w-full border border-red-100">
          <div className="flex items-center justify-center bg-red-100 text-red-600 w-14 h-14 rounded-full mb-6 mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-10v4m6 6a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 text-center mb-6">You do not have permission to access this page. This page is only for wardens.</p>
          <div className="flex justify-center">
            <a href="/" className="px-5 py-2.5 bg-[#1360AB] text-white rounded-lg hover:bg-[#0d4b86] transition-colors shadow-sm">
              Return to Home
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 flex-1">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full mb-6">
        <div className="flex items-center mb-4 sm:mb-0">
          <div className="p-3 mr-4 rounded-xl bg-blue-100 text-[#1360AB] flex-shrink-0">
            <HiAnnotation size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Student Feedbacks</h1>
            <p className="text-gray-500 text-sm mt-1 max-w-xl">Review and manage feedback submitted by students in your hostel.</p>
          </div>
        </div>
      </header>

      <FeedbackStats feedbacks={feedbacks} />

      <div className="mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="w-full sm:w-auto overflow-x-auto pb-2">
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
            {filteredFeedbacks.map((feedback) => (
              <FeedbackCard key={feedback._id} feedback={feedback} refresh={fetchFeedbacks} />
            ))}
          </div>

          {filteredFeedbacks.length === 0 && <NoResults icon={<HiAnnotation className="text-gray-300 text-3xl" />} message="No feedbacks found" suggestion="Try changing your search or filter criteria" />}
        </>
      )}
    </div>
  )
}

export default Feedbacks
