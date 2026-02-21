import { useState, useEffect, useCallback } from "react"
import { FaUserFriends } from "react-icons/fa"
import { useAuth } from "../../contexts/AuthProvider"
import { visitorApi } from "../../service"
import VisitorRequestTable from "../../components/visitor/requests/VisitorRequestTable"
import AddVisitorProfileModal from "../../components/visitor/requests/AddVisitorProfileModal"
import AddVisitorRequestModal from "../../components/visitor/requests/AddVisitorRequestModal"
import ManageVisitorProfilesModal from "../../components/visitor/requests/ManageVisitorProfilesModal"
import { LoadingState, ErrorState, EmptyState, Pagination } from "@/components/ui"
import { Button } from "czero/react"
import VisitorRequestsHeader from "../../components/headers/VisitorRequestsHeader"
import PageFooter from "../../components/common/PageFooter"

const REQUESTS_PAGE_SIZE = 10

const VisitorRequestsPage = () => {
  const { user } = useAuth()
  const canViewVisitors = true
  const canCreateVisitorRequests = ["Student"].includes(user?.role) && true
  const canAllocateVisitors =
    ["Warden", "Associate Warden", "Hostel Supervisor"].includes(user?.role) &&
    true
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
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRequests, setTotalRequests] = useState(0)
  const fetchVisitorProfiles = useCallback(async () => {
    if (user?.role !== "Student" || !canCreateVisitorRequests) {
      setVisitorProfiles([])
      return
    }

    try {
      const profiles = await visitorApi.getVisitorProfiles()
      setVisitorProfiles(profiles.data || [])
    } catch (err) {
      console.error("Error fetching visitor profiles:", err)
      setVisitorProfiles([])
    }
  }, [canCreateVisitorRequests, user?.role])

  const fetchVisitorData = useCallback(async () => {
    if (!canViewVisitors) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)

      const requestParams = {
        page: currentPage,
        limit: REQUESTS_PAGE_SIZE,
      }

      if (statusFilter !== "all") {
        requestParams.status = statusFilter
      }

      if (canAllocateVisitors && allocationFilter !== "all") {
        requestParams.allocation = allocationFilter
      }

      const requests = await visitorApi.getVisitorRequestsSummary(requestParams)
      const apiPagination = requests.pagination || {}
      const nextTotalPages = apiPagination.totalPages || 0

      if (nextTotalPages > 0 && currentPage > nextTotalPages) {
        setCurrentPage(nextTotalPages)
        return
      }

      setVisitorRequests(requests.data || [])
      setTotalRequests(apiPagination.total || 0)
      setTotalPages(Math.max(nextTotalPages, 1))
    } catch (err) {
      console.error("Error fetching visitor data:", err)
      setError("Failed to load visitor requests. Please try again later.")
      setVisitorRequests([])
      setTotalRequests(0)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }, [
    allocationFilter,
    canAllocateVisitors,
    canViewVisitors,
    currentPage,
    statusFilter,
  ])

  useEffect(() => {
    fetchVisitorData()
  }, [fetchVisitorData])

  useEffect(() => {
    fetchVisitorProfiles()
  }, [fetchVisitorProfiles])

  const handleAddProfile = async (profileData) => {
    try {
      await visitorApi.addVisitorProfile(profileData)
      await fetchVisitorProfiles()
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

  const handleAddProfileFromRequest = async () => {
    setShowAddProfileModal(true)
    setShowAddRequestModal(false)
    setShowManageProfilesModal(false)
  }

  const hasActiveFilters =
    statusFilter !== "all" || (canAllocateVisitors && allocationFilter !== "all")

  const handlePaginate = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

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
                        <Button key={status} onClick={() => {
                          setStatusFilter(status)
                          setCurrentPage(1)
                        }} variant={statusFilter === status ? "primary" : "ghost"} size="sm">
                          {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
                        </Button>
                      ))
                    : ["all", "pending", "approved", "rejected"].map((status) => (
                        <Button key={status} onClick={() => {
                          setStatusFilter(status)
                          setCurrentPage(1)
                        }} variant={statusFilter === status ? "primary" : "ghost"} size="sm">
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
                      <Button key={status} onClick={() => {
                        setAllocationFilter(status)
                        setCurrentPage(1)
                      }} variant={allocationFilter === status ? "primary" : "ghost"} size="sm">
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {totalRequests === 0 && !hasActiveFilters ? (
          <EmptyState
            icon={() => <FaUserFriends style={{ color: "var(--color-text-placeholder)" }} size={48} />}
            title={["Warden", "Associate Warden", "Hostel Supervisor"].includes(user.role) ? "No Visitor Requests" : "No Visitor Requests"}
            message={["Warden", "Associate Warden", "Hostel Supervisor"].includes(user.role) ? "There are no visitor requests assigned to your hostel yet." : "You haven't made any visitor accommodation requests yet. Create a new request to get started."}
            buttonText={user.role === "Student" ? "Create Request" : null}
            buttonAction={user.role === "Student" ? () => setShowAddRequestModal(true) : null}
          />
        ) : totalRequests === 0 ? (
          <div style={{ backgroundColor: "var(--color-bg-primary)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-sm)", padding: "var(--spacing-8)", textAlign: "center" }}>
            <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-base)" }}>No requests found matching your filters.</p>
          </div>
        ) : (
          <VisitorRequestTable requests={visitorRequests} onRefresh={fetchVisitorData} />
        )}

        {showAddProfileModal && canCreateVisitorRequests && <AddVisitorProfileModal isOpen={showAddProfileModal} onClose={() => setShowAddProfileModal(false)} onSubmit={handleAddProfile} />}

        {showAddRequestModal && canCreateVisitorRequests && <AddVisitorRequestModal isOpen={showAddRequestModal} onClose={() => setShowAddRequestModal(false)} onSubmit={handleAddRequest} visitorProfiles={visitorProfiles} handleAddProfile={handleAddProfileFromRequest} />}

        {showManageProfilesModal && canCreateVisitorRequests && <ManageVisitorProfilesModal isOpen={showManageProfilesModal} onClose={() => setShowManageProfilesModal(false)} visitorProfiles={visitorProfiles} onRefresh={fetchVisitorProfiles} />}
      </div>

      <PageFooter
        leftContent={[
          <span key="count" style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
            Showing <span style={{ fontWeight: "var(--font-weight-semibold)" }}>{visitorRequests.length}</span> of{" "}
            <span style={{ fontWeight: "var(--font-weight-semibold)" }}>{totalRequests}</span> requests
          </span>,
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
  )
}

export default VisitorRequestsPage
