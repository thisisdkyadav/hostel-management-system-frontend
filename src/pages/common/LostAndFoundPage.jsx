import { Page, Pagination, SearchInput, Tabs, Text } from "hzero"
import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import NoResults from "../../components/common/NoResults"
import LostAndFoundStats from "../../components/lostAndFound/LostAndFoundStats"
import LostAndFoundCard from "../../components/lostAndFound/LostAndFoundCard"
import AddLostItemModal from "../../components/lostAndFound/AddLostItemModal"
import LostAndFoundHeader from "../../components/headers/LostAndFoundHeader"
import PageFooter from "../../components/common/PageFooter"
import { lostAndFoundApi } from "../../service"
import { queryKeys } from "@/lib/query"
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

const LOST_ITEMS_LIMIT = DEFAULT_PAGINATION.limit

const LostAndFoundPage = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const canViewLostAndFound = true
  const canCreateLostAndFound = true

  const [activeTab, setActiveTab] = useState("Active")
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const filters = {
    page: currentPage,
    limit: LOST_ITEMS_LIMIT,
    status: activeTab,
    search: searchTerm.trim(),
  }

  const lostItemsQuery = useQuery({
    queryKey: queryKeys.lostAndFound.list(filters),
    queryFn: async () => {
      try {
        return await lostAndFoundApi.getAllLostItems({
          page: filters.page,
          limit: filters.limit,
          status: filters.status,
          search: filters.search,
        })
      } catch (error) {
        console.error("Error fetching lost items:", error)
        throw error
      }
    },
    enabled: canViewLostAndFound,
    // Keep the previous page's items visible while a refetch is in flight.
    placeholderData: (previousData) => previousData,
  })

  // If the result set shrinks (e.g. after filtering or deleting the last item
  // on a page), snap back to the last available page and refetch.
  const fetchedTotalPages = lostItemsQuery.data?.pagination?.totalPages || 0
  if (fetchedTotalPages > 0 && currentPage > fetchedTotalPages) {
    setCurrentPage(fetchedTotalPages)
  }

  const lostItems = lostItemsQuery.data?.lostAndFoundItems || []
  const stats = lostItemsQuery.data?.stats || null
  const pagination =
    lostItemsQuery.data?.pagination || DEFAULT_PAGINATION
  const loading = lostItemsQuery.isFetching

  if (!canViewLostAndFound) {
    return null
  }

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.lostAndFound.all,
    })
  }

  const handleItemAdded = async () => {
    await handleRefresh()
  }

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
      <Page>
        <LostAndFoundHeader onAddItem={() => setShowAddModal(true)}
          canCreate={canCreateLostAndFound}
          userRole={user?.role}
        />

        <Page.Body>
          <LostAndFoundStats items={lostItems} stats={stats} />

          <div className="mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="w-full sm:w-auto pb-2">
              <Tabs variant="pills" tabs={LOST_FILTER_TABS} activeTab={activeTab} setActiveTab={handleTabChange} />
            </div>
            <SearchInput value={searchTerm} onChange={handleSearchChange} placeholder="Search items..." className="w-full sm:w-64 md:w-72" />
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {lostItems.map((item) => (
              <LostAndFoundCard key={item._id} item={item} refresh={handleRefresh} />
            ))}
          </div>

          {!loading && lostItems.length === 0 && (
            <NoResults
              icon={<MdInventory style={{ fontSize: "var(--font-size-4xl)" }} color="var(--color-text-placeholder)" />}
              message="No items found"
              suggestion="Try changing your search or filter criteria"
            />
          )}
        </Page.Body>

        <PageFooter
          leftContent={[
            <Text as="span" size="sm" color="muted" key="count">
              Showing <Text as="span" weight="semibold">{lostItems.length}</Text> of{" "}
              <Text as="span" weight="semibold">{pagination.total || 0}</Text> items
            </Text>,
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
      </Page>

      <AddLostItemModal show={showAddModal} onClose={() => setShowAddModal(false)} onItemAdded={handleItemAdded} />
    </>
  )
}

export default LostAndFoundPage
