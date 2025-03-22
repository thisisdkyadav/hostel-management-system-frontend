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
    <div className="px-10 py-6 flex-1">
      <header className="flex justify-between items-center w-full px-3 py-4 rounded-[12px]">
        <h1 className="text-2xl px-3 font-bold">Security Staff Management</h1>
        <div className="flex items-center space-x-6">
          <button onClick={() => setShowAddModal(true)} className="bg-[#1360AB] text-white flex items-center px-5 py-2 rounded-[12px]">
            <FaPlus className="mr-2" /> Add Security
          </button>
        </div>
      </header>

      <SecurityStats securityStaff={securityStaff} />

      <div className="mt-8 flex justify-between items-center">
        {/* <FilterTabs tabs={SECURITY_FILTER_TABS} activeTab={filterStatus} setActiveTab={setFilterStatus} /> */}
        <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search security by name or hostel" className="w-1/2" />
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSecurityStaff.map((staff) => (
          <SecurityCard key={staff.id} security={staff} onUpdate={fetchSecurityStaff} onDelete={fetchSecurityStaff} />
        ))}
      </div>

      {filteredSecurityStaff.length === 0 && <NoResults icon={<FaUserShield className="mx-auto text-gray-300 text-5xl mb-4" />} message="No security staff found" suggestion="Try changing your search or filter criteria" />}

      <AddSecurityModal show={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={fetchSecurityStaff} />
    </div>
  )
}

export default SecurityLogins
