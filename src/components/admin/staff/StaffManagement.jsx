import { Tabs } from "czero/react"
import { useState, useEffect } from "react"
import { FaUserTie } from "react-icons/fa"
import { SearchInput } from "@/components/ui"
import NoResults from "../../common/NoResults"
import WardenCard from "../wardens/WardenCard"
import AddWardenModal from "../wardens/AddWardenModal"
import WardenStats from "../wardens/WardenStats"
import StaffManagementHeader from "../../headers/StaffManagementHeader"
import { filterStaffMembers } from "../../../utils/adminUtils"
import { GYMKHANA_FILTER_TABS, WARDEN_FILTER_TABS } from "../../../constants/adminConstants"
import { adminApi } from "../../../service"

const StaffManagement = ({ staffType = "warden" }) => {
  const isWarden = staffType === "warden"
  const isAssociateWarden = staffType === "associateWarden"
  const isHostelSupervisor = staffType === "hostelSupervisor"
  const isGymkhana = staffType === "gymkhana"

  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [staffList, setStaffList] = useState([])

  const filteredStaff = filterStaffMembers(staffList, staffType, filterStatus, searchTerm)

  const staffTitle = isWarden
    ? "Warden"
    : isAssociateWarden
      ? "Associate Warden"
      : isHostelSupervisor
        ? "Hostel Supervisor"
        : "Gymkhana"
  const filterTabs = isGymkhana ? GYMKHANA_FILTER_TABS : WARDEN_FILTER_TABS
  const searchPlaceholder = isGymkhana
    ? "Search Gymkhana users by name or sub role"
    : `Search ${staffTitle.toLowerCase()}s by name or hostel`
  const emptyMessage = isGymkhana ? "No Gymkhana users found" : `No ${staffTitle.toLowerCase()}s found`

  const fetchStaff = async () => {
    try {
      const response = isWarden
        ? await adminApi.getAllWardens()
        : isAssociateWarden
          ? await adminApi.getAllAssociateWardens()
          : isHostelSupervisor
            ? await adminApi.getAllHostelSupervisors()
            : await adminApi.getAllGymkhanaUsers()
      setStaffList(response || [])
    } catch (error) {
      console.error(`Error fetching ${staffTitle.toLowerCase()}s:`, error)
    }
  }

  useEffect(() => {
    fetchStaff()
  }, [staffType])

  return (
    <div className="flex flex-col h-full">
      <StaffManagementHeader staffTitle={staffTitle} onAddStaff={() => setShowAddModal(true)}
      />

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">

        <WardenStats wardens={staffList} staffType={staffType} />

        <div className="mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="w-full sm:w-auto pb-2">
            <Tabs variant="pills" tabs={filterTabs} activeTab={filterStatus} setActiveTab={setFilterStatus} />
          </div>
          <SearchInput value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={searchPlaceholder} className="w-full sm:w-64 md:w-72" />
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredStaff.map((staff) => (
            <WardenCard key={staff.id} warden={staff} staffType={staffType} onUpdate={() => fetchStaff()} onDelete={() => fetchStaff()} />
          ))}
        </div>

        {filteredStaff.length === 0 && <NoResults icon={<FaUserTie style={{ color: 'var(--color-border-primary)', fontSize: 'var(--icon-3xl)' }} />} message={emptyMessage} suggestion="Try changing your search or filter criteria" />}

        <AddWardenModal show={showAddModal} staffType={staffType} onClose={() => setShowAddModal(false)} onAdd={fetchStaff} />
      </div>
    </div>
  )
}

export default StaffManagement
