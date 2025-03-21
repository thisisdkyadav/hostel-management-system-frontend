import { useState, useEffect } from "react"
import { FaUserFriends, FaFilter } from "react-icons/fa"
import SearchBar from "../../components/admin/SearchBar"
import FilterTabs from "../../components/admin/FilterTabs"
import NoResults from "../../components/admin/NoResults"
import VisitorTable from "../../components/guard/VisitorTable"
import { filterVisitors } from "../../utils/securityUtils"
import { securityApi } from "../../services/apiService"

const VISITOR_FILTER_TABS = [
  { label: "All", value: "all" },
  { label: "Checked In", value: "Checked In" },
  { label: "Checked Out", value: "Checked Out" },
]

const Visitors = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterDate, setFilterDate] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [visitors, setVisitors] = useState([])

  const handleUpdateVisitor = (updatedVisitor) => {
    setVisitors(visitors.map((visitor) => (visitor.id === updatedVisitor.id ? updatedVisitor : visitor)))
  }

  const fetchVisitors = async () => {
    try {
      const data = await securityApi.getVisitors()
      setVisitors(data)
    } catch (error) {
      console.error("Error fetching visitors:", error)
    }
  }

  useEffect(() => {
    fetchVisitors()
    console.log(filterStatus, filterDate, searchTerm, "Fetching visitors data...")
  }, [filterStatus, filterDate, searchTerm])

  const filteredVisitors = filterVisitors(visitors, filterStatus, filterDate, searchTerm)

  return (
    <div className="px-10 py-6 flex-1">
      <header className="flex justify-between items-center w-full px-3 py-4 rounded-[12px]">
        <h1 className="text-2xl px-3 font-bold">Visitor Management</h1>
        <div className="flex items-center space-x-4">
          <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center px-4 py-2 rounded-[12px] ${showFilters ? "bg-[#1360AB] text-white" : "bg-white text-gray-700"}`}>
            <FaFilter className="mr-2" /> Filters
          </button>
        </div>
      </header>

      <div className="mt-8 flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <FilterTabs tabs={VISITOR_FILTER_TABS} activeTab={filterStatus} setActiveTab={setFilterStatus} />
          <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search visitors..." className="w-1/2" />
        </div>

        {showFilters && (
          <div className="bg-white p-4 rounded-xl shadow-md">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Filter by Date</label>
                <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg" />
              </div>
              <div className="flex items-end">
                <button onClick={() => setFilterDate("")} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
                  Clear Date Filter
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {filteredVisitors.length > 0 ? (
        <div className="mt-6">
          <VisitorTable visitors={filteredVisitors} onUpdateVisitor={handleUpdateVisitor} />
        </div>
      ) : (
        <NoResults icon={<FaUserFriends className="mx-auto text-gray-300 text-5xl mb-4" />} message="No visitors found" suggestion="Try changing your search or filter criteria" />
      )}
    </div>
  )
}

export default Visitors
