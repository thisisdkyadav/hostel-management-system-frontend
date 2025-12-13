import { useState, useEffect } from "react"
import { FaUserShield, FaPlus } from "react-icons/fa"
import SearchBar from "../../components/common/SearchBar"
import NoResults from "../../components/common/NoResults"
import AdminCard from "../../components/admin/admins/AdminCard"
import AddAdminModal from "../../components/admin/admins/AddAdminModal"
import AdminStats from "../../components/admin/admins/AdminStats"
import superAdminService from "../../services/superAdminService"

const AdminManagement = () => {
  const [admins, setAdmins] = useState([])
  const [filteredAdmins, setFilteredAdmins] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await superAdminService.getAllAdmins()
      setAdmins(data || [])
      setFilteredAdmins(data || [])
    } catch (err) {
      console.error("Error fetching admins:", err)
      setError(err.message || "Failed to load administrators")
      alert("Failed to load administrators")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdmins()
  }, [])

  useEffect(() => {
    if (!admins.length) return

    let filtered = [...admins]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter((admin) => admin.name.toLowerCase().includes(term) || admin.email.toLowerCase().includes(term) || (admin.phone && admin.phone.includes(term)))
    }

    setFilteredAdmins(filtered)
  }, [admins, searchTerm])

  const handleAddAdmin = () => {
    fetchAdmins()
    setShowAddModal(false)
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 flex-1">
      <header className="bg-white shadow-sm border-b border-gray-100 -mx-4 sm:-mx-6 lg:-mx-8 -mt-6 mb-6">
        <div className="px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-[#0b57d0] tracking-tight">Administrator Management</h1>
              <p className="text-xs text-gray-500 mt-0.5">{new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
            <button onClick={() => setShowAddModal(true)} className="bg-[#0b57d0] text-white flex items-center px-4 py-2 rounded-full hover:bg-[#0e4eb5] transition-all duration-200 text-sm font-medium">
              <FaPlus className="mr-2" /> Add Administrator
            </button>
          </div>
        </div>
      </header>

      <AdminStats admins={admins} />

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="text-gray-600 mb-4">Manage system administrators who have access to the admin portal. Administrators can manage hostels, wardens, students, and other system resources.</div>

        <div className="flex justify-end">
          <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search administrators by name or email" className="w-full sm:w-64 md:w-72" />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {loading && admins.length === 0 ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading administrators...</p>
        </div>
      ) : filteredAdmins.length === 0 ? (
        <NoResults icon={<FaUserShield className="text-gray-300 text-3xl" />} message="No administrators found" suggestion="Try changing your search criteria or add a new administrator" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredAdmins.map((admin) => (
            <AdminCard key={admin.id} admin={admin} onUpdate={() => fetchAdmins()} onDelete={() => fetchAdmins()} />
          ))}
        </div>
      )}

      <AddAdminModal show={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAddAdmin} />
    </div>
  )
}

export default AdminManagement
