import { useState, useEffect, use } from "react"
import { FaPlus } from "react-icons/fa"
import FilterTabs from "../components/common/FilterTabs"
import SearchBar from "../components/common/SearchBar"
import NoResults from "../components/common/NoResults"
import LostAndFoundStats from "../components/lostAndFound/LostAndFoundStats"
import LostAndFoundCard from "../components/lostAndFound/LostAndFoundCard"
import AddLostItemModal from "../components/lostAndFound/AddLostItemModal"
import { filterLostItems } from "../utils/adminUtils"
import { lostAndFoundApi } from "../services/apiService"
import { useAuth } from "../contexts/AuthProvider"
import { MdInventory } from "react-icons/md"

const LOST_FILTER_TABS = [
  { label: "All", value: "all" },
  { label: "Active", value: "Active" },
  { label: "Claimed", value: "Claimed" },
]

const LostAndFound = () => {
  const { user } = useAuth()

  const [activeTab, setActiveTab] = useState("Active")
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [lostItems, setLostItems] = useState([])

  const filteredItems = filterLostItems(lostItems, activeTab, searchTerm)

  const fetchLostItems = async () => {
    try {
      const response = await lostAndFoundApi.getAllLostItems()

      console.log("Fetched lost items:", response.lostAndFoundItems)

      setLostItems(response.lostAndFoundItems || [])
    } catch (error) {
      console.error("Error fetching lost items:", error)
    }
  }

  useEffect(() => {
    fetchLostItems()
  }, [])

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8 py-6 flex-1">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">Lost and Found</h1>
          {["Admin", "Warden", "Associate Warden", "Hostel Supervisor", "Security", "Hostel Gate"].includes(user?.role) && (
            <button onClick={() => setShowAddModal(true)} className="bg-[#1360AB] text-white flex items-center px-4 py-2.5 rounded-xl hover:bg-[#0F4C81] transition-all duration-300 shadow-sm hover:shadow-md">
              <FaPlus className="mr-2" /> Add Item
            </button>
          )}
        </header>

        <LostAndFoundStats items={lostItems} />

        <div className="mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="w-full sm:w-auto overflow-x-auto pb-2">
            <FilterTabs tabs={LOST_FILTER_TABS} activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
          <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search items..." className="w-full sm:w-64 md:w-72" />
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredItems.map((item) => (
            <LostAndFoundCard key={item._id} item={item} refresh={fetchLostItems} />
          ))}
        </div>

        {filteredItems.length === 0 && <NoResults icon={<MdInventory className="text-gray-300 text-3xl" />} message="No items found" suggestion="Try changing your search or filter criteria" />}
      </div>

      <AddLostItemModal show={showAddModal} onClose={() => setShowAddModal(false)} onItemAdded={fetchLostItems} />
    </>
  )
}

export default LostAndFound
