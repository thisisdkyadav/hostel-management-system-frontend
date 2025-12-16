import { useState, useEffect } from "react"
import { FaUserShield } from "react-icons/fa"
import FilterTabs from "../../components/common/FilterTabs"
import SearchBar from "../../components/common/SearchBar"
import NoResults from "../../components/common/NoResults"
import SecurityCard from "../../components/admin/security/SecurityCard"
import AddSecurityModal from "../../components/admin/security/AddSecurityModal"
import SecurityStats from "../../components/admin/security/SecurityStats"
import SecurityLoginsHeader from "../../components/headers/SecurityLoginsHeader"
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
    <div className="flex flex-col h-full">
      <SecurityLoginsHeader onAddSecurity={() => setShowAddModal(true)} />

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">

      <SecurityStats securityStaff={securityStaff} />

      <div className="mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="w-full sm:w-auto pb-2">
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
    </div>
  )
}

export default SecurityLogins
