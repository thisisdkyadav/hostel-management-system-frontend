import { Tabs } from "czero/react"
import { useState, useEffect } from "react"
import { SearchInput } from "@/components/ui"
import NoResults from "../../components/common/NoResults"
import LostAndFoundStats from "../../components/lostAndFound/LostAndFoundStats"
import LostAndFoundCard from "../../components/lostAndFound/LostAndFoundCard"
import AddLostItemModal from "../../components/lostAndFound/AddLostItemModal"
import LostAndFoundHeader from "../../components/headers/LostAndFoundHeader"
import { filterLostItems } from "../../utils/adminUtils"
import { lostAndFoundApi } from "../../service"
import { useAuth } from "../../contexts/AuthProvider"
import useAuthz from "../../hooks/useAuthz"
import { MdInventory } from "react-icons/md"

const LOST_FILTER_TABS = [
  { label: "All", value: "all" },
  { label: "Active", value: "Active" },
  { label: "Claimed", value: "Claimed" },
]

const LostAndFoundPage = () => {
  const { user } = useAuth()
  const { can } = useAuthz()
  const canViewLostAndFound = can("cap.lostAndFound.view")
  const canCreateLostAndFound = can("cap.lostAndFound.create")

  const [activeTab, setActiveTab] = useState("Active")
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [lostItems, setLostItems] = useState([])

  const filteredItems = filterLostItems(lostItems, activeTab, searchTerm)

  const fetchLostItems = async () => {
    if (!canViewLostAndFound) return
    try {
      const response = await lostAndFoundApi.getAllLostItems()
      setLostItems(response.lostAndFoundItems || [])
    } catch (error) {
      console.error("Error fetching lost items:", error)
    }
  }

  useEffect(() => {
    fetchLostItems()
  }, [canViewLostAndFound])

  return (
    <>
      <div className="flex flex-col h-full">
        <LostAndFoundHeader onAddItem={() => setShowAddModal(true)}
          canCreate={canCreateLostAndFound}
          userRole={user?.role}
        />

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">

          <LostAndFoundStats items={lostItems} />

          <div className="mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="w-full sm:w-auto pb-2">
              <Tabs variant="pills" tabs={LOST_FILTER_TABS} activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
            <SearchInput value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search items..." className="w-full sm:w-64 md:w-72" />
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredItems.map((item) => (
              <LostAndFoundCard key={item._id} item={item} refresh={fetchLostItems} />
            ))}
          </div>

          {filteredItems.length === 0 && <NoResults icon={<MdInventory style={{ color: 'var(--color-text-placeholder)', fontSize: 'var(--font-size-4xl)' }} />} message="No items found" suggestion="Try changing your search or filter criteria" />}
        </div>
      </div>

      <AddLostItemModal show={showAddModal} onClose={() => setShowAddModal(false)} onItemAdded={fetchLostItems} />
    </>
  )
}

export default LostAndFoundPage
