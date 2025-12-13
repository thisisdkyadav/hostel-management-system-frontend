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
      <header className="bg-white shadow-sm border-b border-gray-100 -mx-4 sm:-mx-6 lg:-mx-8 -mt-6 mb-6">
        <div className="px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-[#0b57d0] tracking-tight">Security Staff Management</h1>
              <p className="text-xs text-gray-500 mt-0.5">{new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
            <button onClick={() => setShowAddModal(true)} className="bg-[#0b57d0] text-white flex items-center px-4 py-2 rounded-full hover:bg-[#0e4eb5] transition-colors text-sm font-medium">
              <FaPlus className="mr-2" /> Add Security
            </button>
          </div>
        </div>
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
