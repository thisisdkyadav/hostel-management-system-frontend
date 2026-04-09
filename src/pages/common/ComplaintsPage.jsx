import { useState, useEffect, useMemo, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import { useAuth } from "../../contexts/AuthProvider"
import { useGlobal } from "../../contexts/GlobalProvider"
import { adminApi, complaintApi } from "../../service"
import { COMPLAINT_FILTER_TABS } from "../../constants/adminConstants"
import ComplaintStats from "../../components/complaints/ComplaintStats"
import ComplaintDetailModal from "../../components/complaints/ComplaintDetailModal"
import ComplaintForm from "../../components/complaints/ComplaintForm"
import ComplaintsHeader from "../../components/headers/ComplaintsHeader"
import ComplaintsFilterPanel from "../../components/complaints/ComplaintsFilterPanel"
import ComplaintsContent from "../../components/complaints/ComplaintsContent"
import { WHO_CAN_CREATE_COMPLAINT } from "../../constants/complaintConstants"
import useAuthz from "../../hooks/useAuthz"
import { Pagination } from "@/components/ui"
import PageFooter from "../../components/common/PageFooter"

const DEFAULT_FILTERS = {
  status: "all",
  category: "all",
  hostelId: "all",
  searchTerm: "",
  feedbackRating: "all",
  satisfactionStatus: "all",
  resolvedToday: false,
  overdue: false,
  page: 1,
  limit: 10,
}

const VALID_LIMITS = new Set([5, 10, 20, 50])

const ComplaintsPage = () => {
  const { user } = useAuth()
  const { getConstraint } = useAuthz()
  const [searchParams, setSearchParams] = useSearchParams()
  const { hostelList = [] } = useGlobal()
  const constrainedHostelIds = getConstraint("constraint.complaints.scope.hostelIds", [])
  const hostels = useMemo(() => {
    if (!["Admin"].includes(user?.role)) {
      return []
    }

    if (!Array.isArray(constrainedHostelIds) || constrainedHostelIds.length === 0) {
      return hostelList
    }

    const allowedHostelIds = new Set(
      constrainedHostelIds
        .map((hostelId) => (typeof hostelId === "string" ? hostelId.trim() : ""))
        .filter(Boolean)
    )
    return hostelList.filter((hostel) => allowedHostelIds.has(hostel._id))
  }, [constrainedHostelIds, hostelList, user?.role])
  const categories = ["Plumbing", "Electrical", "Civil", "Cleanliness", "Internet", "Other"]
  const canViewComplaints = true
  const canCreateComplaint = WHO_CAN_CREATE_COMPLAINT.includes(user?.role)

  const filters = useMemo(() => {
    const parsedPage = Number.parseInt(searchParams.get("page") || "", 10)
    const parsedLimit = Number.parseInt(searchParams.get("limit") || "", 10)

    return {
      status: searchParams.get("status") || DEFAULT_FILTERS.status,
      category: searchParams.get("category") || DEFAULT_FILTERS.category,
      hostelId: searchParams.get("hostelId") || DEFAULT_FILTERS.hostelId,
      searchTerm: searchParams.get("search") || DEFAULT_FILTERS.searchTerm,
      feedbackRating: searchParams.get("feedbackRating") || DEFAULT_FILTERS.feedbackRating,
      satisfactionStatus: searchParams.get("satisfactionStatus") || DEFAULT_FILTERS.satisfactionStatus,
      resolvedToday: searchParams.get("resolvedToday") === "true",
      overdue: searchParams.get("overdue") === "true",
      page: Number.isNaN(parsedPage) || parsedPage < 1 ? DEFAULT_FILTERS.page : parsedPage,
      limit: VALID_LIMITS.has(parsedLimit) ? parsedLimit : DEFAULT_FILTERS.limit,
    }
  }, [searchParams])

  const [showFilters, setShowFilters] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [viewMode, setViewMode] = useState("list")
  const [showCraftComplaint, setShowCraftComplaint] = useState(false)
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [totalComplaints, setTotalComplaints] = useState(0)
  const [statsData, setStatsData] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)

  const complaintFilterTabs = useMemo(() => {
    const statusCounts = {
      all: statsData?.total || 0,
      Pending: statsData?.pending || 0,
      "In Progress": statsData?.inProgress || 0,
      "Forwarded to IDO": statsData?.forwardedToIDO || 0,
      Resolved: statsData?.resolved || 0,
    }

    return COMPLAINT_FILTER_TABS.map((tab) => ({
      ...tab,
      count: statusCounts[tab.value] ?? 0,
    }))
  }, [statsData])

  const hasExpandedFiltersApplied = useMemo(
    () =>
      filters.category !== DEFAULT_FILTERS.category ||
      filters.hostelId !== DEFAULT_FILTERS.hostelId ||
      filters.searchTerm !== DEFAULT_FILTERS.searchTerm ||
      filters.feedbackRating !== DEFAULT_FILTERS.feedbackRating ||
      filters.satisfactionStatus !== DEFAULT_FILTERS.satisfactionStatus ||
      filters.resolvedToday !== DEFAULT_FILTERS.resolvedToday ||
      filters.overdue !== DEFAULT_FILTERS.overdue ||
      filters.limit !== DEFAULT_FILTERS.limit,
    [
      filters.category,
      filters.feedbackRating,
      filters.hostelId,
      filters.limit,
      filters.overdue,
      filters.resolvedToday,
      filters.satisfactionStatus,
      filters.searchTerm,
    ]
  )

  const updateUrlFilters = useCallback((changes) => {
    const nextFilters = {
      ...filters,
      ...changes,
    }

    const normalizedFilters = {
      ...nextFilters,
      page: changes.page ?? (Object.prototype.hasOwnProperty.call(changes, "page") ? nextFilters.page : 1),
    }

    const nextSearchParams = new URLSearchParams()

    if (normalizedFilters.status !== DEFAULT_FILTERS.status) nextSearchParams.set("status", normalizedFilters.status)
    if (normalizedFilters.category !== DEFAULT_FILTERS.category) nextSearchParams.set("category", normalizedFilters.category)
    if (normalizedFilters.hostelId !== DEFAULT_FILTERS.hostelId) nextSearchParams.set("hostelId", normalizedFilters.hostelId)
    if (normalizedFilters.searchTerm) nextSearchParams.set("search", normalizedFilters.searchTerm)
    if (normalizedFilters.feedbackRating !== DEFAULT_FILTERS.feedbackRating) nextSearchParams.set("feedbackRating", normalizedFilters.feedbackRating)
    if (normalizedFilters.satisfactionStatus !== DEFAULT_FILTERS.satisfactionStatus) nextSearchParams.set("satisfactionStatus", normalizedFilters.satisfactionStatus)
    if (normalizedFilters.resolvedToday) nextSearchParams.set("resolvedToday", "true")
    if (normalizedFilters.overdue) nextSearchParams.set("overdue", "true")
    if (normalizedFilters.page !== DEFAULT_FILTERS.page) nextSearchParams.set("page", String(normalizedFilters.page))
    if (normalizedFilters.limit !== DEFAULT_FILTERS.limit) nextSearchParams.set("limit", String(normalizedFilters.limit))

    setSearchParams(nextSearchParams)
  }, [filters, setSearchParams])

  const updateFilter = useCallback((key, value) => {
    const specialFilterAdjustments =
      key === "resolvedToday" && value
        ? { overdue: false }
        : key === "overdue" && value
          ? { resolvedToday: false }
          : {}

    updateUrlFilters({
      [key]: value,
      ...specialFilterAdjustments,
      ...(key !== "page" ? { page: 1 } : {}),
    })
  }, [updateUrlFilters])

  const resetFilters = useCallback(() => {
    updateUrlFilters({
      ...DEFAULT_FILTERS,
      limit: filters.limit,
    })
  }, [filters.limit, updateUrlFilters])

  useEffect(() => {
    if (filters.hostelId === "all") return
    const isSelectedHostelAllowed = hostels.some((hostel) => hostel._id === filters.hostelId)
    if (!isSelectedHostelAllowed) {
      updateUrlFilters({ hostelId: DEFAULT_FILTERS.hostelId, page: 1 })
    }
  }, [filters.hostelId, hostels, updateUrlFilters])

  useEffect(() => {
    if (hasExpandedFiltersApplied) {
      setShowFilters(true)
    }
  }, [hasExpandedFiltersApplied])

  const viewComplaintDetails = (complaint) => {
    setSelectedComplaint(complaint)
    setShowDetailModal(true)
  }

  const paginate = (pageNumber) => {
    updateFilter("page", pageNumber)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const fetchComplaints = async () => {
    if (!canViewComplaints) return
    try {
      setLoading(true)
      const queryParams = new URLSearchParams()
      if (filters.status !== "all") queryParams.append("status", filters.status)
      if (filters.category !== "all") queryParams.append("category", filters.category)
      if (filters.hostelId !== "all") queryParams.append("hostelId", filters.hostelId)
      if (filters.searchTerm) queryParams.append("search", filters.searchTerm)
      if (filters.feedbackRating !== "all") queryParams.append("feedbackRating", filters.feedbackRating)
      if (filters.satisfactionStatus !== "all") queryParams.append("satisfactionStatus", filters.satisfactionStatus)
      if (filters.resolvedToday) queryParams.append("resolvedToday", "true")
      if (filters.overdue) queryParams.append("overdue", "true")
      queryParams.append("page", filters.page)
      queryParams.append("limit", filters.limit)

      const response = await adminApi.getAllComplaints(queryParams.toString())
      setComplaints(response.data || [])
      setTotalComplaints(response.meta?.total || 0)
      setTotalPages(response.meta?.totalPages || 1)
    } catch (error) {
      console.error("Error fetching complaints:", error)
      setComplaints([])
      setTotalComplaints(0)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const fetchComplaintStats = async () => {
    if (!canViewComplaints) return
    try {
      setStatsLoading(true)
      const queryParams = {}

      // Only add hostelId to stats query if a specific hostel is selected
      if (filters.hostelId !== "all") {
        queryParams.hostelId = filters.hostelId
      }

      const response = await complaintApi.getStats(queryParams)
      setStatsData(response.data || response)
    } catch (error) {
      console.error("Error fetching complaint stats:", error)
      setStatsData(null)
    } finally {
      setStatsLoading(false)
    }
  }

  useEffect(() => {
    if (!canViewComplaints) return
    setLoading(true)
    const delay = setTimeout(() => {
      fetchComplaints()
    }, 500)
    return () => clearTimeout(delay)
  }, [canViewComplaints, filters])

  useEffect(() => {
    if (!canViewComplaints) return
    fetchComplaintStats()
  }, [canViewComplaints, filters.hostelId])

  if (!canViewComplaints) {
    return (
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
        <div className="rounded-lg border border-[var(--color-danger)] bg-[var(--color-danger-bg)] p-4 text-[var(--color-danger-text)]">
          You do not have permission to view complaints.
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <ComplaintsHeader showFilters={showFilters} setShowFilters={setShowFilters} viewMode={viewMode} setViewMode={setViewMode} showCraftComplaint={showCraftComplaint} setShowCraftComplaint={setShowCraftComplaint} userRole={user?.role} canCreateComplaint={canCreateComplaint} />

      {/* Main Content with padding */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="hidden sm:block">
          <ComplaintStats statsData={statsData} loading={statsLoading} />
        </div>

        {showFilters && <ComplaintsFilterPanel filters={filters} updateFilter={updateFilter} resetFilters={resetFilters} hostels={hostels} categories={categories} />}

        <ComplaintsContent loading={loading} complaints={complaints} viewMode={viewMode} filters={filters} COMPLAINT_FILTER_TABS={complaintFilterTabs} updateFilter={updateFilter} onViewDetails={viewComplaintDetails} showFilters={showFilters} />
      </div>

      <PageFooter
        leftContent={[
          <span key="count" style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
            Showing <span style={{ fontWeight: "var(--font-weight-semibold)" }}>{complaints.length}</span> of{" "}
            <span style={{ fontWeight: "var(--font-weight-semibold)" }}>{totalComplaints}</span> complaints
          </span>,
        ]}
        rightContent={[
          <Pagination
            key="pagination"
            currentPage={filters.page}
            totalPages={Math.max(totalPages, 1)}
            paginate={paginate}
            compact
            showPageInfo={false}
          />,
        ]}
      />

      {showDetailModal && selectedComplaint && <ComplaintDetailModal selectedComplaint={selectedComplaint} setShowDetailModal={setShowDetailModal} onComplaintUpdate={fetchComplaints} />}

      {showCraftComplaint && canCreateComplaint && <ComplaintForm isOpen={showCraftComplaint} setIsOpen={setShowCraftComplaint} onSuccess={fetchComplaints} />}
    </div>
  )
}

export default ComplaintsPage
