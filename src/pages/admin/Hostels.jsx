import { useState, useEffect } from "react"
import { FaPlus, FaArchive } from "react-icons/fa"
import FilterTabs from "../../components/common/FilterTabs"
import SearchBar from "../../components/common/SearchBar"
import NoResults from "../../components/common/NoResults"
import HostelCard from "../../components/admin/hostel/HostelCard"
import HostelStats from "../../components/admin/hostel//HostelStats"
import AddHostelModal from "../../components/admin/hostel/AddHostelModal"
import Button from "../../components/common/Button"
import PageHeader from "../../components/common/PageHeader"
import { HOSTEL_FILTER_TABS } from "../../constants/adminConstants"
import { filterHostels } from "../../utils/adminUtils"
import { adminApi } from "../../services/apiService"

const Hostels = () => {
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [hostels, setHostels] = useState([])
  const [fetchArchive, setFetchArchive] = useState(false)

  const filteredHostels = filterHostels(hostels, activeTab, searchTerm)

  const fetchHostels = async (fetchArchive = false) => {
    try {
      const response = await adminApi.getAllHostels(fetchArchive ? "archive=true" : "")

      setHostels(response || [])
    } catch (error) {
      console.error("Error fetching hostels:", error)
    }
  }

  const handleUpdateHostel = async (updatedHostel) => {
    try {
      await adminApi.updateHostel(updatedHostel.id, updatedHostel)
      fetchHostels()
    } catch (error) {
      console.error("Error updating hostel:", error)
    }
  }

  const handleArchiveToggle = () => {
    fetchHostels(!fetchArchive)
    setFetchArchive(!fetchArchive)
  }

  const refreshHostels = () => {
    fetchHostels(fetchArchive)
  }

  useEffect(() => {
    fetchHostels()
  }, [])

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Fixed Header */}
        <PageHeader title="Hostel Management">
          <Button 
            variant="secondary" 
            onClick={handleArchiveToggle}
            icon={<FaArchive />}
          >
            {fetchArchive ? "Show All" : "Show Archived"}
          </Button>
          <Button 
            variant="primary" 
            onClick={() => setShowAddModal(true)}
            icon={<FaPlus />}
          >
            Add Hostel
          </Button>
        </PageHeader>


        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-scroll px-4 md:px-6 lg:px-8 py-6">
          <HostelStats hostels={hostels} />

          <div className="mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="w-full sm:w-auto pb-2">
              <FilterTabs tabs={HOSTEL_FILTER_TABS} activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
            <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search hostel..." className="w-full sm:w-64 md:w-72" />
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredHostels.map((hostel) => (
              <HostelCard key={hostel.id} hostel={hostel} onUpdate={handleUpdateHostel} refreshHostels={refreshHostels} />
            ))}
          </div>

          {filteredHostels.length === 0 && <NoResults />}
        </div>
      </div>

      <AddHostelModal show={showAddModal} onClose={() => setShowAddModal(false)} onAdd={fetchHostels} />
    </>
  )
}

export default Hostels
