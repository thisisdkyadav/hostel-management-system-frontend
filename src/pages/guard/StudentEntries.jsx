import { useState, useEffect } from "react"
import { FaUserGraduate, FaFilter } from "react-icons/fa"
import SearchBar from "../../components/common/SearchBar"
import FilterTabs from "../../components/common/FilterTabs"
import NoResults from "../../components/common/NoResults"
import StudentEntryTable from "../../components/guard/StudentEntryTable"
import Pagination from "../../components/common/Pagination"
import { securityApi } from "../../services/apiService"

const ENTRY_FILTER_TABS = [
  { label: "All", value: "all" },
  { label: "Checked In", value: "Checked In" },
  { label: "Checked Out", value: "Checked Out" },
]

const StudentEntries = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterDate, setFilterDate] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalItems, setTotalItems] = useState(0)

  const fetchEntries = async () => {
    try {
      setLoading(true)
      const queryParams = {
        status: filterStatus !== "all" ? filterStatus : undefined,
        date: filterDate || undefined,
        search: searchTerm || undefined,
        page: currentPage,
        limit: itemsPerPage,
      }

      const filteredParams = Object.fromEntries(Object.entries(queryParams).filter(([_, v]) => v !== undefined))

      const response = await securityApi.getStudentEntries(filteredParams)
      setEntries(response.studentEntries || [])

      if (response.meta) {
        setTotalItems(response.meta.total || 0)
        setTotalPages(response.meta.totalPages || 1)
      }
    } catch (error) {
      console.error("Error fetching student entries:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      fetchEntries()
    }, 500)

    return () => clearTimeout(debounceTimeout)
  }, [searchTerm, filterStatus, filterDate, currentPage, itemsPerPage])

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Reset to page 1 when search changes
  }

  const handleFilterStatusChange = (status) => {
    setFilterStatus(status)
    setCurrentPage(1) // Reset to page 1 when filter changes
  }

  const handleDateFilterChange = (e) => {
    setFilterDate(e.target.value)
    setCurrentPage(1) // Reset to page 1 when date filter changes
  }

  const handleClearDateFilter = () => {
    setFilterDate("")
  }

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value))
    setCurrentPage(1) // Reset to page 1 when items per page changes
  }

  return (
    <div className="px-10 py-6 flex-1">
      <header className="flex justify-between items-center w-full px-3 py-4 rounded-[12px]">
        <h1 className="text-2xl px-3 font-bold">Student Entry Management</h1>
        <div className="flex items-center space-x-4">
          <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center px-4 py-2 rounded-[12px] ${showFilters ? "bg-[#1360AB] text-white" : "bg-white text-gray-700"}`}>
            <FaFilter className="mr-2" /> Filters
          </button>
        </div>
      </header>

      <div className="mt-8 flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <FilterTabs tabs={ENTRY_FILTER_TABS} activeTab={filterStatus} setActiveTab={handleFilterStatusChange} />
          <SearchBar value={searchTerm} onChange={handleSearchChange} placeholder="Search by unit, room" className="w-1/2" />
        </div>

        {showFilters && (
          <div className="bg-white p-4 rounded-xl shadow-md">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Filter by Date</label>
                <input type="date" value={filterDate} onChange={handleDateFilterChange} className="w-full p-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Items Per Page</label>
                <select value={itemsPerPage} onChange={handleItemsPerPageChange} className="w-full p-2 border border-gray-300 rounded-lg">
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div className="flex items-end">
                <button onClick={handleClearDateFilter} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
                  Clear Date Filter
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="mt-6 flex justify-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      ) : entries.length > 0 ? (
        <div className="mt-6">
          <StudentEntryTable entries={entries} refresh={fetchEntries} />
          {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} paginate={paginate} />}
        </div>
      ) : (
        <NoResults icon={<FaUserGraduate className="mx-auto text-gray-300 text-5xl mb-4" />} message="No student entries found" suggestion="Try changing your search or filter criteria" />
      )}
    </div>
  )
}

export default StudentEntries
