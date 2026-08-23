import { useState, useEffect, useMemo, useCallback } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useSearchParams } from "react-router-dom"
import { queryKeys } from "../../lib/query"
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
import { COMPLAINT_CATEGORIES, WHO_CAN_CREATE_COMPLAINT } from "../../constants/complaintConstants"
import useAuthz from "../../hooks/useAuthz"
import { Page, Pagination, Text } from "hzero"
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
  const categories = COMPLAINT_CATEGORIES
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

  // Debounced copy of the URL-derived filters: the list request waits 500ms
  // after a filter change (search-as-you-type) before hitting the API.
  const [debouncedFilters, setDebouncedFilters] = useState(filters)
  useEffect(() => {
    const delay = setTimeout(() => {
      setDebouncedFilters(filters)
    }, 500)
    return () => clearTimeout(delay)
  }, [filters])
  const isFilterChangePending = filters !== debouncedFilters

  const listQuery = useQuery({
    queryKey: queryKeys.complaints.list(debouncedFilters),
    queryFn: async () => {
      const queryParams = new URLSearchParams()
      if (debouncedFilters.status !== "all") queryParams.append("status", debouncedFilters.status)
      if (debouncedFilters.category !== "all") queryParams.append("category", debouncedFilters.category)
      if (debouncedFilters.hostelId !== "all") queryParams.append("hostelId", debouncedFilters.hostelId)
      if (debouncedFilters.searchTerm) queryParams.append("search", debouncedFilters.searchTerm)
      if (debouncedFilters.feedbackRating !== "all") queryParams.append("feedbackRating", debouncedFilters.feedbackRating)
      if (debouncedFilters.satisfactionStatus !== "all") queryParams.append("satisfactionStatus", debouncedFilters.satisfactionStatus)
      if (debouncedFilters.resolvedToday) queryParams.append("resolvedToday", "true")
      if (debouncedFilters.overdue) queryParams.append("overdue", "true")
      queryParams.append("page", debouncedFilters.page)
      queryParams.append("limit", debouncedFilters.limit)

      return adminApi.getAllComplaints(queryParams.toString())
    },
    enabled: canViewComplaints,
  })

  useEffect(() => {
    if (listQuery.error) {
      console.error("Error fetching complaints:", listQuery.error)
    }
  }, [listQuery.error])

  const complaints = listQuery.data?.data?.items || []
  const totalComplaints = listQuery.data?.data?.pagination?.total || 0
  const totalPages = listQuery.data?.data?.pagination?.totalPages || 1
  const loading = isFilterChangePending || listQuery.isFetching

  const statsQuery = useQuery({
    queryKey: queryKeys.complaints.stats(filters.hostelId),
    queryFn: () => {
      const queryParams = {}

      // Only add hostelId to stats query if a specific hostel is selected
      if (filters.hostelId !== "all") {
        queryParams.hostelId = filters.hostelId
      }

      return complaintApi.getStats(queryParams)
    },
    enabled: canViewComplaints,
  })

  useEffect(() => {
    if (statsQuery.error) {
      console.error("Error fetching complaint stats:", statsQuery.error)
    }
  }, [statsQuery.error])

  const statsData = statsQuery.data?.data || statsQuery.data || null
  const statsLoading = statsQuery.isFetching

  const queryClient = useQueryClient()
  const refreshComplaintQueries = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.complaints.all })
  }, [queryClient])

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
    <Page>
      <ComplaintsHeader showFilters={showFilters} setShowFilters={setShowFilters} viewMode={viewMode} setViewMode={setViewMode} showCraftComplaint={showCraftComplaint} setShowCraftComplaint={setShowCraftComplaint} userRole={user?.role} canCreateComplaint={canCreateComplaint} />

      {/* Main Content with padding */}
      <Page.Body>
        <div className="hidden sm:block">
          <ComplaintStats statsData={statsData} loading={statsLoading} />
        </div>

        {showFilters && <ComplaintsFilterPanel filters={filters} updateFilter={updateFilter} resetFilters={resetFilters} hostels={hostels} categories={categories} />}

        <ComplaintsContent loading={loading} complaints={complaints} viewMode={viewMode} filters={filters} COMPLAINT_FILTER_TABS={complaintFilterTabs} updateFilter={updateFilter} onViewDetails={viewComplaintDetails} showFilters={showFilters} />
      </Page.Body>

      <PageFooter
        leftContent={[
          <Text as="span" size="sm" color="muted" key="count">
            Showing <Text as="span" weight="semibold">{complaints.length}</Text> of{" "}
            <Text as="span" weight="semibold">{totalComplaints}</Text> complaints
          </Text>,
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

      {showDetailModal && selectedComplaint && <ComplaintDetailModal selectedComplaint={selectedComplaint} setShowDetailModal={setShowDetailModal} onComplaintUpdate={refreshComplaintQueries} />}

      {showCraftComplaint && canCreateComplaint && <ComplaintForm isOpen={showCraftComplaint} setIsOpen={setShowCraftComplaint} onSuccess={refreshComplaintQueries} />}
    </Page>
  )
}

export default ComplaintsPage
