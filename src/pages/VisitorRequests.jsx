import { useState, useEffect } from "react"
import { FaUserFriends, FaPlus, FaFilter, FaUserEdit } from "react-icons/fa"
import { useAuth } from "../contexts/AuthProvider"
import { visitorApi } from "../services/visitorApi"
import VisitorRequestTable from "../components/visitor/requests/VisitorRequestTable"
import AddVisitorProfileModal from "../components/visitor/requests/AddVisitorProfileModal"
import AddVisitorRequestModal from "../components/visitor/requests/AddVisitorRequestModal"
import ManageVisitorProfilesModal from "../components/visitor/requests/ManageVisitorProfilesModal"
import LoadingState from "../components/common/LoadingState"
import ErrorState from "../components/common/ErrorState"
import EmptyState from "../components/common/EmptyState"

const VisitorRequests = () => {
  const { user, canAccess } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [visitorRequests, setVisitorRequests] = useState([])
  const [visitorProfiles, setVisitorProfiles] = useState([])
  const [showAddProfileModal, setShowAddProfileModal] = useState(false)
  const [showAddRequestModal, setShowAddRequestModal] = useState(false)
  const [showManageProfilesModal, setShowManageProfilesModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")
  const [allocationFilter, setAllocationFilter] = useState("all")

  const fetchVisitorData = async () => {
    try {
      setLoading(true)
      setError(null)

      const requests = await visitorApi.getVisitorRequestsSummary()

      let profiles = []
      if (user.role === "Student") {
        profiles = await visitorApi.getVisitorProfiles()
      }

      console.log("Visitor Requests Summary:", requests)
      if (user.role === "Student") {
        console.log("Visitor Profiles:", profiles)
      }

      setVisitorRequests(requests.data || [])
      setVisitorProfiles(profiles.data || [])
    } catch (err) {
      console.error("Error fetching visitor data:", err)
      setError("Failed to load visitor requests. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVisitorData()
  }, [])

  const handleAddProfile = async (profileData) => {
    try {
      await visitorApi.addVisitorProfile(profileData)
      fetchVisitorData()
      setShowAddProfileModal(false)
      return true
    } catch (err) {
      console.error("Error adding visitor profile:", err)
      return false
    }
  }

  const handleAddRequest = async (requestData) => {
    try {
      await visitorApi.addVisitorRequest({
        ...requestData,
        studentId: user._id,
      })
      fetchVisitorData()
      setShowAddRequestModal(false)
      return true
    } catch (err) {
      console.error("Error adding visitor request:", err)
      return false
    }
  }

  const handleAddProfileFromRequest = async (profileData) => {
    setShowAddProfileModal(true)
    setShowAddRequestModal(false)
    setShowManageProfilesModal(false)
  }

  const filteredRequests = visitorRequests.filter((request) => {
    if (statusFilter !== "all" && request.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false
    }

    if (canAccess("visitors", "react") && ["Warden", "Associate Warden", "Hostel Supervisor"].includes(user.role) && allocationFilter !== "all") {
      if (allocationFilter === "allocated" && !request.isAllocated) return false
      if (allocationFilter === "unallocated" && request.isAllocated) return false
    }

    return true
  })

  if (loading) {
    return <LoadingState message="Loading visitor requests..." />
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchVisitorData} />
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 flex-1">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="flex items-center mb-4 sm:mb-0">
          <div className="p-3 mr-4 rounded-xl bg-blue-100 text-[#1360AB] flex-shrink-0">
            <FaUserFriends size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Visitor Requests</h1>
            <p className="text-gray-500 text-sm mt-1">{["Warden", "Associate Warden", "Hostel Supervisor"].includes(user.role) ? "Manage visitor accommodation requests for your hostel" : "Manage your visitor accommodation requests"}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center px-4 py-2.5 rounded-xl transition-colors ${showFilters ? "bg-[#1360AB] text-white shadow-md" : "bg-white text-gray-700 border border-gray-200 shadow-sm hover:bg-gray-50"}`}>
            <FaFilter className="mr-2" /> {showFilters ? "Hide Filters" : "Filter Requests"}
          </button>
          {["Student"].includes(user.role) && (
            <>
              <button onClick={() => setShowAddProfileModal(true)} className="flex items-center px-4 py-2.5 bg-white text-gray-700 rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors">
                <FaPlus className="mr-2" /> Add Visitor Profile
              </button>
              <button onClick={() => setShowManageProfilesModal(true)} className="flex items-center px-4 py-2.5 bg-white text-gray-700 rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors">
                <FaUserEdit className="mr-2" /> Manage Profiles
              </button>
              <button onClick={() => setShowAddRequestModal(true)} className="flex items-center px-4 py-2.5 bg-[#1360AB] text-white rounded-xl shadow-sm hover:bg-blue-700 transition-colors">
                <FaPlus className="mr-2" /> New Request
              </button>
            </>
          )}
        </div>
      </header>

      {showFilters && (
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Filter by Status:</h3>
              <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
                {["Warden", "Associate Warden", "Hostel Supervisor"].includes(user.role)
                  ? ["all", "approved"].map((status) => (
                      <button key={status} onClick={() => setStatusFilter(status)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === status ? "bg-[#1360AB] text-white shadow-sm" : "text-gray-600 hover:bg-gray-200"}`}>
                        {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))
                  : ["all", "pending", "approved", "rejected"].map((status) => (
                      <button key={status} onClick={() => setStatusFilter(status)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === status ? "bg-[#1360AB] text-white shadow-sm" : "text-gray-600 hover:bg-gray-200"}`}>
                        {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
              </div>
            </div>

            {["Warden", "Associate Warden", "Hostel Supervisor"].includes(user.role) && (
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Filter by Allocation:</h3>
                <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
                  {["all", "allocated", "unallocated"].map((status) => (
                    <button key={status} onClick={() => setAllocationFilter(status)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${allocationFilter === status ? "bg-[#1360AB] text-white shadow-sm" : "text-gray-600 hover:bg-gray-200"}`}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {visitorRequests.length === 0 ? (
        <EmptyState
          icon={() => <FaUserFriends className="text-gray-400" size={48} />}
          title={["Warden", "Associate Warden", "Hostel Supervisor"].includes(user.role) ? "No Visitor Requests" : "No Visitor Requests"}
          message={["Warden", "Associate Warden", "Hostel Supervisor"].includes(user.role) ? "There are no visitor requests assigned to your hostel yet." : "You haven't made any visitor accommodation requests yet. Create a new request to get started."}
          buttonText={user.role === "Student" ? "Create Request" : null}
          buttonAction={user.role === "Student" ? () => setShowAddRequestModal(true) : null}
        />
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-gray-500">No requests found matching your filters.</p>
        </div>
      ) : (
        <VisitorRequestTable requests={filteredRequests} onRefresh={fetchVisitorData} />
      )}

      {showAddProfileModal && <AddVisitorProfileModal isOpen={showAddProfileModal} onClose={() => setShowAddProfileModal(false)} onSubmit={handleAddProfile} />}

      {showAddRequestModal && <AddVisitorRequestModal isOpen={showAddRequestModal} onClose={() => setShowAddRequestModal(false)} onSubmit={handleAddRequest} visitorProfiles={visitorProfiles} handleAddProfile={handleAddProfileFromRequest} />}

      {showManageProfilesModal && <ManageVisitorProfilesModal isOpen={showManageProfilesModal} onClose={() => setShowManageProfilesModal(false)} visitorProfiles={visitorProfiles} onRefresh={fetchVisitorData} />}
    </div>
  )
}

export default VisitorRequests
