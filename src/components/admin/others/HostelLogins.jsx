import { useState, useEffect } from "react"
import { FaBuilding, FaPlus } from "react-icons/fa"
import { useAdmin } from "../../../contexts/AdminProvider"
import SearchBar from "../../common/SearchBar"
import NoResults from "../../common/NoResults"
import HostelGateCard from "./HostelGateCard"
import AddHostelGateModal from "./AddHostelGateModal"
import { hostelGateApi } from "../../../services/hostelGateApi"

const filterHostelGates = (gates, searchTerm) => {
  if (!gates) return []

  return gates.filter((gate) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()

    // Get hostel name from the populated hostel field if available
    const hostelName = gate.hostelId?.name || ""

    return hostelName.toLowerCase().includes(term)
  })
}

const HostelLogins = () => {
  const { hostelList } = useAdmin()
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [hostelGates, setHostelGates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const filteredHostelGates = filterHostelGates(hostelGates, searchTerm)

  const fetchHostelGates = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await hostelGateApi.getAllHostelGates()
      setHostelGates(response.hostelGates || [])
    } catch (error) {
      console.error("Error fetching hostel gates:", error)
      setError("Failed to fetch hostel gates. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHostelGates()
  }, [])

  return (
    <div>
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full mb-6">
        <h2 className="text-xl font-semibold text-gray-700">Hostel Gate Logins</h2>
        <button onClick={() => setShowAddModal(true)} className="bg-[#1360AB] text-white flex items-center px-4 py-2.5 rounded-xl hover:bg-[#0F4C81] transition-all duration-300 shadow-sm hover:shadow-md">
          <FaPlus className="mr-2" /> Add Hostel Gate Login
        </button>
      </header>

      <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by hostel name" className="w-full sm:w-64 md:w-72" />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1360AB]"></div>
        </div>
      ) : error ? (
        <div className="text-center p-8 text-red-600">{error}</div>
      ) : filteredHostelGates.length === 0 ? (
        <NoResults icon={<FaBuilding className="text-gray-300 text-3xl" />} message="No hostel gate logins found" suggestion="Add a new hostel gate login using the button above" />
      ) : (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredHostelGates.map((gate) => (
            <HostelGateCard key={gate._id} gate={gate} onUpdate={fetchHostelGates} onDelete={fetchHostelGates} />
          ))}
        </div>
      )}

      <AddHostelGateModal show={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={fetchHostelGates} hostels={hostelList} />
    </div>
  )
}

export default HostelLogins
