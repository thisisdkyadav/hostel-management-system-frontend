import { useState, useEffect } from "react"
import { FaFileSignature, FaPlus } from "react-icons/fa"
import SearchBar from "../../common/SearchBar"
import NoResults from "../../common/NoResults"
import UndertakingCard from "./UndertakingCard"
import AddUndertakingModal from "./AddUndertakingModal"
import { adminApi } from "../../../services/adminApi"

const filterUndertakings = (undertakings, filterStatus, searchTerm) => {
  return undertakings
    .filter((undertaking) => {
      if (filterStatus === "all") return true
      return undertaking.status === filterStatus
    })
    .filter((undertaking) => {
      if (!searchTerm) return true
      const term = searchTerm.toLowerCase()
      return undertaking.title.toLowerCase().includes(term) || undertaking.description.toLowerCase().includes(term) || (undertaking.createdAt && undertaking.createdAt.includes(term)) || (undertaking.deadline && undertaking.deadline.includes(term))
    })
}

const Undertakings = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [undertakings, setUndertakings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const filteredUndertakings = filterUndertakings(undertakings, filterStatus, searchTerm)

  const fetchUndertakings = async () => {
    try {
      setLoading(true)
      setError(null)
      // Replace with actual API call when implemented
      const response = await adminApi.getUndertakings()
      setUndertakings(response.undertakings || [])
    } catch (error) {
      console.error("Error fetching undertakings:", error)
      setError("Failed to fetch undertakings. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUndertakings()
  }, [])

  return (
    <div>
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full mb-6">
        <h2 className="text-xl font-semibold text-gray-700">Undertakings</h2>
        <button onClick={() => setShowAddModal(true)} className="bg-[#1360AB] text-white flex items-center px-4 py-2.5 rounded-xl hover:bg-[#0F4C81] transition-all duration-300 shadow-sm hover:shadow-md">
          <FaPlus className="mr-2" /> Add Undertaking
        </button>
      </header>

      <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search undertakings by title, description or dates" className="w-full sm:w-64 md:w-72" />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1360AB]"></div>
        </div>
      ) : error ? (
        <div className="text-center p-8 text-red-600">{error}</div>
      ) : filteredUndertakings.length === 0 ? (
        <NoResults icon={<FaFileSignature className="text-gray-300 text-3xl" />} message="No undertakings found" suggestion="Try changing your search criteria or create a new undertaking" />
      ) : (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredUndertakings.map((undertaking) => (
            <UndertakingCard key={undertaking.id} undertaking={undertaking} onUpdate={fetchUndertakings} onDelete={fetchUndertakings} />
          ))}
        </div>
      )}

      <AddUndertakingModal show={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={fetchUndertakings} />
    </div>
  )
}

export default Undertakings
