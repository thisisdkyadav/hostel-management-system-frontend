import { useEffect, useMemo, useState } from "react"
import { useAuth } from "../contexts/AuthProvider"
import { leaveApi } from "../services/leaveApi"
import LeavesHeader from "../components/leaves/LeavesHeader"
import LeavesFilterPanel from "../components/leaves/LeavesFilterPanel"
import LeavesContent from "../components/leaves/LeavesContent"
import LeaveDetailModal from "../components/leaves/LeaveDetailModal"
import LeaveForm from "../components/leaves/LeaveForm"

const Leaves = () => {
  const { user } = useAuth()
  const isAdmin = useMemo(() => user?.role === "Admin", [user?.role])

  const [filters, setFilters] = useState({
    status: "all",
    startDate: "",
    endDate: "",
    page: 1,
    limit: 10,
  })

  // Admin toggle for self vs all leaves
  const [viewSelfOnly, setViewSelfOnly] = useState(false)

  const [showFilters, setShowFilters] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedLeave, setSelectedLeave] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [viewMode, setViewMode] = useState("list")
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== "page" ? 1 : prev.page,
    }))
  }

  const resetFilters = () => {
    setFilters({
      status: "all",
      startDate: "",
      endDate: "",
      page: 1,
      limit: filters.limit,
    })
  }

  const paginate = (pageNumber) => {
    setFilters((prev) => ({ ...prev, page: pageNumber }))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const onViewDetails = (leave) => {
    setSelectedLeave(leave)
    setShowDetailModal(true)
  }

  const fetchLeaves = async () => {
    try {
      setLoading(true)
      if (isAdmin && !viewSelfOnly) {
        const queryParams = {}
        if (filters.status !== "all") queryParams.status = filters.status
        if (filters.startDate) queryParams.startDate = filters.startDate
        if (filters.endDate) queryParams.endDate = filters.endDate
        queryParams.page = filters.page
        queryParams.limit = filters.limit

        const response = await leaveApi.getLeaves(queryParams)
        const list = response.leaves || response.data || response || []
        const normalized = Array.isArray(list) ? list : []
        setLeaves(normalized)
        setTotalItems(response.totalCount || response.meta?.total || normalized.length)
        setTotalPages(response.totalPages || response.meta?.totalPages || 1)
      } else {
        // Fetch self leaves (for non-admin or admin viewing self)
        const response = await leaveApi.getMyLeaves()
        const list = response.leaves || response.data || response || []
        const normalized = Array.isArray(list) ? list : []
        setLeaves(normalized)
        setTotalItems(normalized.length)
        setTotalPages(1)
      }
    } catch (error) {
      console.error("Error fetching leaves:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchLeaves()
    }, 300)
    return () => clearTimeout(delay)
  }, [filters, isAdmin, viewSelfOnly])

  return (
    <div className="flex flex-col h-full">
      <LeavesHeader showFilters={showFilters} setShowFilters={setShowFilters} viewMode={viewMode} setViewMode={setViewMode} onCreate={() => setShowCreateModal(true)} title="Leave Management" isAdmin={isAdmin} viewSelfOnly={viewSelfOnly} setViewSelfOnly={setViewSelfOnly} />

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
        {showFilters && <LeavesFilterPanel filters={filters} updateFilter={updateFilter} resetFilters={resetFilters} isAdmin={isAdmin} />}

        <LeavesContent loading={loading} leaves={leaves} viewMode={viewMode} filters={filters} totalPages={totalPages} updateFilter={updateFilter} onViewDetails={onViewDetails} paginate={paginate} />
      </div>

      {showDetailModal && selectedLeave && (
        <LeaveDetailModal
          leave={selectedLeave}
          onClose={() => setShowDetailModal(false)}
          isAdmin={isAdmin}
          isSelfView={!isAdmin || viewSelfOnly}
          onUpdated={() => {
            setShowDetailModal(false)
            fetchLeaves()
          }}
        />
      )}

      {showCreateModal && (
        <LeaveForm
          isOpen={showCreateModal}
          setIsOpen={setShowCreateModal}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchLeaves()
          }}
        />
      )}
    </div>
  )
}

export default Leaves
