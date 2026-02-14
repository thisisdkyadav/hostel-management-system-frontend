import { Tabs } from "czero/react"
import { useState, useEffect } from "react"
import { SearchInput, EmptyState } from "@/components/ui"
import { Search } from "lucide-react"
import HostelCard from "../../components/admin/hostel/HostelCard"
import HostelStats from "../../components/admin/hostel//HostelStats"
import AddHostelModal from "../../components/admin/hostel/AddHostelModal"
import HostelsHeader from "../../components/headers/HostelsHeader"
import { HOSTEL_FILTER_TABS } from "../../constants/adminConstants"
import { filterHostels } from "../../utils/adminUtils"
import { adminApi } from "../../service"

const HostelsPage = () => {
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
        <HostelsHeader onAddHostel={() => setShowAddModal(true)}
          onArchiveToggle={handleArchiveToggle}
          fetchArchive={fetchArchive}
        />


        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-scroll px-[var(--spacing-4)] md:px-[var(--spacing-6)] lg:px-[var(--spacing-8)] py-[var(--spacing-6)]">
          <HostelStats hostels={hostels} />

          <div className="mt-[var(--spacing-8)] flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-[var(--spacing-4)] sm:space-y-[var(--spacing-0)]">
            <div className="w-full sm:w-auto pb-[var(--spacing-2)]">
              <Tabs value={activeTab} onChange={setActiveTab} variant="pills" size="small">
                <Tabs.List>
                  {HOSTEL_FILTER_TABS.map((tab) => (
                    <Tabs.Trigger key={tab.value} value={tab.value}>{tab.label}</Tabs.Trigger>
                  ))}
                </Tabs.List>
              </Tabs>
            </div>
            <div className="w-full sm:w-[16rem] md:w-[18rem]">
              <SearchInput
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search hostel..."
              />
            </div>
          </div>

          <div className="mt-[var(--spacing-6)] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--spacing-4)] md:gap-[var(--spacing-6)]">
            {filteredHostels.map((hostel) => (
              <HostelCard key={hostel.id} hostel={hostel} onUpdate={handleUpdateHostel} refreshHostels={refreshHostels} />
            ))}
          </div>

          {filteredHostels.length === 0 && (
            <EmptyState
              icon={Search}
              title="No Hostels Found"
              message="No hostels match your search criteria. Try adjusting your filters."
            />
          )}
        </div>
      </div>

      <AddHostelModal show={showAddModal} onClose={() => setShowAddModal(false)} onAdd={fetchHostels} />
    </>
  )
}

export default HostelsPage

