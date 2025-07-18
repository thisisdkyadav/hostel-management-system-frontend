import { useState, useEffect } from "react"
import { FaFileSignature, FaCheck, FaClock, FaExclamationTriangle } from "react-icons/fa"
import { studentUndertakingApi } from "../../services/studentUndertakingApi"
import UndertakingDetailModal from "../../components/student/undertakings/UndertakingDetailModal"
import LoadingState from "../../components/common/LoadingState"
import ErrorState from "../../components/common/ErrorState"
import EmptyState from "../../components/common/EmptyState"

const Undertakings = () => {
  const [pendingUndertakings, setPendingUndertakings] = useState([])
  const [acceptedUndertakings, setAcceptedUndertakings] = useState([])
  const [selectedUndertaking, setSelectedUndertaking] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("pending")

  // Fetch undertakings on component mount
  useEffect(() => {
    fetchUndertakings()
  }, [])

  // Function to fetch both pending and accepted undertakings
  const fetchUndertakings = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch both types of undertakings in parallel
      const [pendingResponse, acceptedResponse] = await Promise.all([studentUndertakingApi.getPendingUndertakings(), studentUndertakingApi.getAcceptedUndertakings()])

      setPendingUndertakings(pendingResponse.pendingUndertakings || [])
      setAcceptedUndertakings(acceptedResponse.acceptedUndertakings || [])
    } catch (err) {
      console.error("Error fetching undertakings:", err)
      setError("Failed to load undertakings. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  // Function to view undertaking details
  const handleViewUndertaking = async (undertakingId) => {
    try {
      setLoading(true)
      const response = await studentUndertakingApi.getUndertakingDetails(undertakingId)
      setSelectedUndertaking(response.undertaking)
      setShowDetailModal(true)
    } catch (err) {
      console.error("Error fetching undertaking details:", err)
      alert("Failed to load undertaking details. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Function to accept an undertaking
  const handleAcceptUndertaking = async (undertakingId) => {
    try {
      await studentUndertakingApi.acceptUndertaking(undertakingId)
      alert("Undertaking accepted successfully!")
      setShowDetailModal(false)
      fetchUndertakings() // Refresh the lists
    } catch (err) {
      console.error("Error accepting undertaking:", err)
      alert("Failed to accept undertaking. Please try again.")
    }
  }

  // Function to check if deadline is approaching (within 3 days)
  const isDeadlineApproaching = (deadline) => {
    const deadlineDate = new Date(deadline)
    const now = new Date()
    const daysRemaining = Math.floor((deadlineDate - now) / (1000 * 60 * 60 * 24))
    return daysRemaining <= 3 && daysRemaining >= 0
  }

  // Function to check if deadline has passed
  const isDeadlinePassed = (deadline) => {
    const deadlineDate = new Date(deadline)
    const now = new Date()
    return deadlineDate < now
  }

  // Format date to display in a more readable format
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified"
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
  }

  if (loading && pendingUndertakings.length === 0 && acceptedUndertakings.length === 0) {
    return <LoadingState message="Loading undertakings..." />
  }

  if (error) {
    return <ErrorState message={error} />
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 flex-1 bg-gray-50">
      <header className="flex justify-between items-center bg-white rounded-xl shadow-sm px-6 py-4 mb-6">
        <div className="flex items-center">
          <FaFileSignature className="text-blue-600 text-2xl mr-3" />
          <h1 className="text-2xl font-bold text-gray-800">My Undertakings</h1>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
        <div className="flex border-b">
          <button className={`px-6 py-3 text-sm font-medium ${activeTab === "pending" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`} onClick={() => setActiveTab("pending")}>
            Pending ({pendingUndertakings.length})
          </button>
          <button className={`px-6 py-3 text-sm font-medium ${activeTab === "accepted" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`} onClick={() => setActiveTab("accepted")}>
            Accepted ({acceptedUndertakings.length})
          </button>
        </div>
      </div>

      {/* Pending Undertakings */}
      {activeTab === "pending" && (
        <div>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : pendingUndertakings.length === 0 ? (
            <EmptyState icon={FaFileSignature} title="No Pending Undertakings" message="You don't have any undertakings that require your attention." iconColor="text-gray-300" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingUndertakings.map((undertaking) => (
                <div key={undertaking.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 border-l-4 border-blue-500">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg text-gray-800">{undertaking.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${undertaking.status === "not_viewed" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}`}>{undertaking.status === "not_viewed" ? "New" : "Pending"}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{undertaking.description}</p>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center">
                      <FaClock className="text-gray-400 mr-1" />
                      <span className="text-xs text-gray-500">Due: {formatDate(undertaking.deadline)}</span>

                      {isDeadlineApproaching(undertaking.deadline) && (
                        <span className="ml-2 text-xs text-orange-600 flex items-center">
                          <FaExclamationTriangle className="mr-1" /> Approaching
                        </span>
                      )}

                      {isDeadlinePassed(undertaking.deadline) && (
                        <span className="ml-2 text-xs text-red-600 flex items-center">
                          <FaExclamationTriangle className="mr-1" /> Overdue
                        </span>
                      )}
                    </div>

                    <button onClick={() => handleViewUndertaking(undertaking.id)} className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-sm transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Accepted Undertakings */}
      {activeTab === "accepted" && (
        <div>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : acceptedUndertakings.length === 0 ? (
            <EmptyState icon={FaCheck} title="No Accepted Undertakings" message="You haven't accepted any undertakings yet." iconColor="text-gray-300" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {acceptedUndertakings.map((undertaking) => (
                <div key={undertaking.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 border-l-4 border-green-500">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg text-gray-800">{undertaking.title}</h3>
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Accepted</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{undertaking.description}</p>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center">
                      <FaCheck className="text-green-500 mr-1" />
                      <span className="text-xs text-gray-500">Accepted on: {formatDate(undertaking.acceptedAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Undertaking Detail Modal */}
      {selectedUndertaking && <UndertakingDetailModal show={showDetailModal} undertaking={selectedUndertaking} onClose={() => setShowDetailModal(false)} onAccept={handleAcceptUndertaking} />}
    </div>
  )
}

export default Undertakings
