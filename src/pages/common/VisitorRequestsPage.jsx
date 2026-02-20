import { useState, useEffect } from "react"
import { FaUserFriends } from "react-icons/fa"
import { useAuth } from "../../contexts/AuthProvider"
import { visitorApi } from "../../service"
import VisitorRequestTable from "../../components/visitor/requests/VisitorRequestTable"
import AddVisitorProfileModal from "../../components/visitor/requests/AddVisitorProfileModal"
import AddVisitorRequestModal from "../../components/visitor/requests/AddVisitorRequestModal"
import ManageVisitorProfilesModal from "../../components/visitor/requests/ManageVisitorProfilesModal"
import { LoadingState, ErrorState, EmptyState } from "@/components/ui"
import { Button } from "czero/react"
import VisitorRequestsHeader from "../../components/headers/VisitorRequestsHeader"
import useAuthz from "../../hooks/useAuthz"

const VisitorRequestsPage = () => {
  const { user } = useAuth()
  const { can } = useAuthz()
  const canViewVisitors = can("cap.visitors.view")
  const canCreateVisitorRequests = ["Student"].includes(user?.role) && can("cap.visitors.create")
  const canAllocateVisitors =
    ["Warden", "Associate Warden", "Hostel Supervisor"].includes(user?.role) &&
    can("cap.visitors.allocate")
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
    if (!canViewVisitors) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)

      const requests = await visitorApi.getVisitorRequestsSummary()

      let profiles = []
      if (user.role === "Student" && canCreateVisitorRequests) {
        profiles = await visitorApi.getVisitorProfiles()
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
    if (!canViewVisitors) return
    fetchVisitorData()
  }, [canViewVisitors])

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

    if (canAllocateVisitors && allocationFilter !== "all") {
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

  if (!canViewVisitors) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ backgroundColor: "var(--color-danger-bg)", borderLeft: "var(--border-4) solid var(--color-danger)", color: "var(--color-danger-text)", padding: "var(--spacing-4)", marginBottom: "var(--spacing-6)", borderRadius: "var(--radius-lg)" }}>
          <p style={{ fontWeight: "var(--font-weight-medium)" }}>Access Denied</p>
          <p>You do not have permission to view visitor requests.</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <VisitorRequestsHeader showFilters={showFilters} onToggleFilters={() => setShowFilters(!showFilters)} onAddProfile={() => setShowAddProfileModal(true)} onManageProfiles={() => setShowManageProfilesModal(true)} onNewRequest={() => setShowAddRequestModal(true)} userRole={user.role} canManageProfiles={canCreateVisitorRequests} canCreateRequest={canCreateVisitorRequests} />

      <div style={{ flex: "1", overflowY: "auto", padding: "var(--spacing-6) var(--spacing-8)" }}>
        {showFilters && (
          <div style={{ backgroundColor: "var(--color-bg-primary)", padding: "var(--spacing-4)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-sm)", marginBottom: "var(--spacing-6)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
              <div>
                <h3 style={{ fontWeight: "var(--font-weight-medium)", color: "var(--color-text-body)", marginBottom: "var(--spacing-2)" }}>Filter by Status:</h3>
                <div style={{ display: "flex", gap: "var(--spacing-2)", backgroundColor: "var(--color-bg-muted)", padding: "var(--spacing-1)", borderRadius: "var(--radius-lg)" }}>
                  {["Warden", "Associate Warden", "Hostel Supervisor"].includes(user.role)
                    ? ["all", "approved"].map((status) => (
                        <Button key={status} onClick={() => setStatusFilter(status)} variant={statusFilter === status ? "primary" : "ghost"} size="sm">
                          {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
                        </Button>
                      ))
                    : ["all", "pending", "approved", "rejected"].map((status) => (
                        <Button key={status} onClick={() => setStatusFilter(status)} variant={statusFilter === status ? "primary" : "ghost"} size="sm">
                          {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
                        </Button>
                      ))}
                </div>
              </div>

              {canAllocateVisitors && (
                <div>
                  <h3 style={{ fontWeight: "var(--font-weight-medium)", color: "var(--color-text-body)", marginBottom: "var(--spacing-2)" }}>Filter by Allocation:</h3>
                  <div style={{ display: "flex", gap: "var(--spacing-2)", backgroundColor: "var(--color-bg-muted)", padding: "var(--spacing-1)", borderRadius: "var(--radius-lg)" }}>
                    {["all", "allocated", "unallocated"].map((status) => (
                      <Button key={status} onClick={() => setAllocationFilter(status)} variant={allocationFilter === status ? "primary" : "ghost"} size="sm">
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {visitorRequests.length === 0 ? (
          <EmptyState
            icon={() => <FaUserFriends style={{ color: "var(--color-text-placeholder)" }} size={48} />}
            title={["Warden", "Associate Warden", "Hostel Supervisor"].includes(user.role) ? "No Visitor Requests" : "No Visitor Requests"}
            message={["Warden", "Associate Warden", "Hostel Supervisor"].includes(user.role) ? "There are no visitor requests assigned to your hostel yet." : "You haven't made any visitor accommodation requests yet. Create a new request to get started."}
            buttonText={user.role === "Student" ? "Create Request" : null}
            buttonAction={user.role === "Student" ? () => setShowAddRequestModal(true) : null}
          />
        ) : filteredRequests.length === 0 ? (
          <div style={{ backgroundColor: "var(--color-bg-primary)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-sm)", padding: "var(--spacing-8)", textAlign: "center" }}>
            <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-base)" }}>No requests found matching your filters.</p>
          </div>
        ) : (
          <VisitorRequestTable requests={filteredRequests} onRefresh={fetchVisitorData} />
        )}

        {showAddProfileModal && canCreateVisitorRequests && <AddVisitorProfileModal isOpen={showAddProfileModal} onClose={() => setShowAddProfileModal(false)} onSubmit={handleAddProfile} />}

        {showAddRequestModal && canCreateVisitorRequests && <AddVisitorRequestModal isOpen={showAddRequestModal} onClose={() => setShowAddRequestModal(false)} onSubmit={handleAddRequest} visitorProfiles={visitorProfiles} handleAddProfile={handleAddProfileFromRequest} />}

        {showManageProfilesModal && canCreateVisitorRequests && <ManageVisitorProfilesModal isOpen={showManageProfilesModal} onClose={() => setShowManageProfilesModal(false)} visitorProfiles={visitorProfiles} onRefresh={fetchVisitorData} />}
      </div>
    </div>
  )
}

export default VisitorRequestsPage
