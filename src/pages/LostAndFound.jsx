import { useState, useEffect, use } from "react"
import { FaPlus } from "react-icons/fa"
import FilterTabs from "../components/admin/FilterTabs"
import SearchBar from "../components/admin/SearchBar"
import NoResults from "../components/admin/NoResults"
import LostAndFoundCard from "../components/lostAndFound/LostAndFoundCard"
import LostAndFoundStats from "../components/lostAndFound/LostAndFoundStats"
import AddLostItemModal from "../components/lostAndFound/AddLostItemModal"
import { filterLostItems } from "../utils/adminUtils"
import { lostAndFoundApi } from "../services/apiService"
import { useAuth } from "../contexts/AuthProvider"

const LOST_FILTER_TABS = [
  { id: "all", label: "All Items" },
  { id: "Active", label: "Active" },
  { id: "Claimed", label: "Claimed" },
]

const LostAndFound = () => {
  const { user } = useAuth()

  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [lostItems, setLostItems] = useState([])

  const filteredItems = filterLostItems(lostItems, activeTab, searchTerm)

  const fetchLostItems = async () => {
    try {
      const response = await lostAndFoundApi.getAllLostItems()
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
      <div className="px-10 py-6 flex-1">
        <header className="flex justify-between items-center w-full px-3 py-4 rounded-[12px]">
          <h1 className="text-2xl px-3 font-bold">Lost and Found</h1>
          {["Admin", "Warden", "Security"].includes(user?.role) && (
            <div className="flex items-center space-x-6">
              <button onClick={() => setShowAddModal(true)} className="bg-[#1360AB] text-white flex items-center px-5 py-2 rounded-[12px]">
                <FaPlus className="mr-2" /> Add Item
              </button>
            </div>
          )}
        </header>

        <LostAndFoundStats items={lostItems} />

        <div className="mt-8 flex justify-between items-center">
          <FilterTabs tabs={LOST_FILTER_TABS} activeTab={activeTab} setActiveTab={setActiveTab} />
          <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search items..." className="w-1/2" />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6">
          {filteredItems.map((item) => (
            <LostAndFoundCard key={item._id} item={item} refresh={fetchLostItems} />
          ))}
        </div>

        {filteredItems.length === 0 && <NoResults />}
      </div>

      <AddLostItemModal show={showAddModal} onClose={() => setShowAddModal(false)} onItemAdded={fetchLostItems} />
    </>
  )
}

export default LostAndFound
