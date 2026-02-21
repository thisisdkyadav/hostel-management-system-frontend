import { Tabs } from "czero/react"
import { useState, useEffect, useCallback } from "react"
import { SearchInput, Pagination } from "@/components/ui"
import NoResults from "../../components/common/NoResults"
import LostAndFoundStats from "../../components/lostAndFound/LostAndFoundStats"
import LostAndFoundCard from "../../components/lostAndFound/LostAndFoundCard"
import AddLostItemModal from "../../components/lostAndFound/AddLostItemModal"
import LostAndFoundHeader from "../../components/headers/LostAndFoundHeader"
import PageFooter from "../../components/common/PageFooter"
import { lostAndFoundApi } from "../../service"
import { useAuth } from "../../contexts/AuthProvider"
import { MdInventory } from "react-icons/md"

const LOST_FILTER_TABS = [
  { label: "All", value: "all" },
  { label: "Active", value: "Active" },
  { label: "Claimed", value: "Claimed" },
]

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  hasMore: false,
}

const LostAndFoundPage = () => {
  const { user } = useAuth()
  const canViewLostAndFound = true
  const canCreateLostAndFound = true

  const [activeTab, setActiveTab] = useState("Active")
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [lostItems, setLostItems] = useState([])
  const [stats, setStats] = useState(null)
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)

  const fetchLostItems = useCallback(async (page = currentPage) => {
    if (!canViewLostAndFound) return

    setLoading(true)
    try {
      const response = await lostAndFoundApi.getAllLostItems({
        page,
        limit: DEFAULT_PAGINATION.limit,
        status: activeTab,
        search: searchTerm.trim(),
      })

      const apiPagination = response?.pagination || DEFAULT_PAGINATION
      const totalPages = apiPagination.totalPages || 0

      if (totalPages > 0 && page > totalPages) {
        setCurrentPage(totalPages)
        return
      }

      setLostItems(response?.lostAndFoundItems || [])
      setStats(response?.stats || null)
      setPagination(apiPagination)
    } catch (error) {
      console.error("Error fetching lost items:", error)
      setLostItems([])
      setStats(null)
      setPagination(DEFAULT_PAGINATION)
    } finally {
      setLoading(false)
    }
  }, [activeTab, canViewLostAndFound, currentPage, searchTerm])

  useEffect(() => {
    if (!canViewLostAndFound) return
    fetchLostItems(currentPage)
  }, [canViewLostAndFound, currentPage, fetchLostItems])

  const handleTabChange = (nextTab) => {
    setCurrentPage(1)
    setActiveTab(nextTab)
  }

  const handleSearchChange = (event) => {
    setCurrentPage(1)
    setSearchTerm(event.target.value)
  }

  const handlePaginate = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  return (
    <>
      <div className="flex flex-col h-full">
        <LostAndFoundHeader onAddItem={() => setShowAddModal(true)}
          canCreate={canCreateLostAndFound}
          userRole={user?.role}
        />

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          <LostAndFoundStats items={lostItems} stats={stats} />

          <div className="mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="w-full sm:w-auto pb-2">
              <Tabs variant="pills" tabs={LOST_FILTER_TABS} activeTab={activeTab} setActiveTab={handleTabChange} />
            </div>
            <SearchInput value={searchTerm} onChange={handleSearchChange} placeholder="Search items..." className="w-full sm:w-64 md:w-72" />
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {lostItems.map((item) => (
              <LostAndFoundCard key={item._id} item={item} refresh={() => fetchLostItems(currentPage)} />
            ))}
          </div>

          {!loading && lostItems.length === 0 && (
            <NoResults
              icon={<MdInventory style={{ color: "var(--color-text-placeholder)", fontSize: "var(--font-size-4xl)" }} />}
              message="No items found"
              suggestion="Try changing your search or filter criteria"
            />
          )}
        </div>

        <PageFooter
          leftContent={[
            <span key="count" style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
              Showing <span style={{ fontWeight: "var(--font-weight-semibold)" }}>{lostItems.length}</span> of{" "}
              <span style={{ fontWeight: "var(--font-weight-semibold)" }}>{pagination.total || 0}</span> items
            </span>,
          ]}
          rightContent={[
            <Pagination
              key="pagination"
              currentPage={pagination.page || 1}
              totalPages={Math.max(pagination.totalPages || 0, 1)}
              paginate={handlePaginate}
              compact
              showPageInfo={false}
            />,
          ]}
        />
      </div>

      <AddLostItemModal show={showAddModal} onClose={() => setShowAddModal(false)} onItemAdded={() => fetchLostItems(currentPage)} />
    </>
  )
}

export default LostAndFoundPage
