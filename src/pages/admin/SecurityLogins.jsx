import { useState, useEffect } from "react"
import { FaUserShield, FaPlus } from "react-icons/fa"
import FilterTabs from "../../components/common/FilterTabs"
import SearchBar from "../../components/common/SearchBar"
import NoResults from "../../components/common/NoResults"
import SecurityCard from "../../components/admin/security/SecurityCard"
import AddSecurityModal from "../../components/admin/security/AddSecurityModal"
import SecurityStats from "../../components/admin/security/SecurityStats"
import { filterSecurity } from "../../utils/adminUtils"
import { SECURITY_FILTER_TABS } from "../../constants/adminConstants"
import { adminApi } from "../../services/apiService"
import { useAdmin } from "../../contexts/AdminProvider"

const SecurityLogins = () => {
  const { hostelList } = useAdmin()

  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [securityStaff, setSecurityStaff] = useState([])

  const filteredSecurityStaff = filterSecurity(securityStaff, filterStatus, searchTerm)

  const fetchSecurityStaff = async () => {
    try {
      const response = await adminApi.getAllSecurityLogins()
      setSecurityStaff(response || [])
    } catch (error) {
      console.error("Error fetching security staff:", error)
    }
  }

  useEffect(() => {
    fetchSecurityStaff()
  }, [])

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 flex-1">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">Security Staff Management</h1>
        <button onClick={() => setShowAddModal(true)} className="bg-[#1360AB] text-white flex items-center px-4 py-2.5 rounded-xl shadow-sm hover:bg-[#0d4d8a] transition-colors">
          <FaPlus className="mr-2" /> Add Security
        </button>
      </header>

      <SecurityStats securityStaff={securityStaff} />

      <div className="mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="w-full sm:w-auto overflow-x-auto pb-2">
          <FilterTabs tabs={SECURITY_FILTER_TABS} activeTab={filterStatus} setActiveTab={setFilterStatus} />
        </div>
        <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search security by name or hostel" className="w-full sm:w-64 md:w-80" />
      </div>

      {filteredSecurityStaff.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredSecurityStaff.map((staff) => (
            <SecurityCard key={staff.id} security={staff} onUpdate={fetchSecurityStaff} onDelete={fetchSecurityStaff} />
          ))}
        </div>
      ) : (
        <div className="mt-12">
          <NoResults icon={<FaUserShield className="text-gray-300 text-5xl" />} message="No security staff found" suggestion="Try changing your search or filter criteria" />
        </div>
      )}

      <AddSecurityModal show={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={fetchSecurityStaff} />
    </div>
  )
}

export default SecurityLogins
