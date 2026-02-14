import { useState, useEffect } from "react"
import { FaHistory, FaFilter, FaSignInAlt, FaSignOutAlt, FaCalendarAlt, FaClock } from "react-icons/fa"
import { Pagination, Select } from "@/components/ui"
import { Tabs, Button, Input } from "czero/react"
import NoResults from "./common/NoResults"
import { securityApi } from "../service"
import { useAuth } from "../contexts/AuthProvider"

const ENTRY_FILTER_TABS = [
  { label: "All", value: "all" },
  { label: "Checked In", value: "Checked In" },
  { label: "Checked Out", value: "Checked Out" },
]

const AccessHistory = ({ cachedData }) => {
  const { isOnline } = useAuth()
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

      // If we have cached data and we're offline, use it
      if (cachedData && !isOnline) {
        processCachedData(cachedData)
        return
      }

      const queryParams = {
        status: filterStatus !== "all" ? filterStatus : undefined,
        date: filterDate || undefined,
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

      // If we have cached data and the API call fails, use it
      if (cachedData) {
        processCachedData(cachedData)
      }
    } finally {
      setLoading(false)
    }
  }

  // Helper function to process cached data with filters
  const processCachedData = (data) => {
    let filteredEntries = data.studentEntries || []

    // Apply status filter
    if (filterStatus !== "all") {
      filteredEntries = filteredEntries.filter((entry) => entry.status === filterStatus)
    }

    // Apply date filter
    if (filterDate) {
      const filterDateObj = new Date(filterDate)
      filteredEntries = filteredEntries.filter((entry) => {
        const entryDate = new Date(entry.dateAndTime)
        return entryDate.toDateString() === filterDateObj.toDateString()
      })
    }

    // Apply pagination
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedEntries = filteredEntries.slice(startIndex, startIndex + itemsPerPage)

    setEntries(paginatedEntries)
    setTotalItems(filteredEntries.length)
    setTotalPages(Math.ceil(filteredEntries.length / itemsPerPage))
  }

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      fetchEntries()
    }, 500)

    return () => clearTimeout(debounceTimeout)
  }, [filterStatus, filterDate, currentPage, itemsPerPage, cachedData, isOnline])

  const handleFilterStatusChange = (status) => {
    setFilterStatus(status)
    setCurrentPage(1)
  }

  const handleDateFilterChange = (e) => {
    setFilterDate(e.target.value)
    setCurrentPage(1)
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
    setCurrentPage(1)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="lg:col-span-2">
      <div className="bg-[var(--color-bg-primary)] rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-[var(--color-border-light)] h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="p-2.5 mr-3 rounded-xl bg-[var(--color-info-bg)] text-[var(--color-primary)]">
              <FaHistory size={20} />
            </div>
            <h2 className="text-xl font-bold text-[var(--color-text-secondary)]">Access History</h2>
          </div>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant={showFilters ? "primary" : "white"}
            size="md"
            disabled={!isOnline && !cachedData}
          >
            <FaFilter /> Filters
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="mb-5">
          <Tabs variant="pills" tabs={ENTRY_FILTER_TABS} activeTab={filterStatus} setActiveTab={handleFilterStatusChange} disabled={!isOnline && !cachedData} />
        </div>

        {/* Additional Filters */}
        {showFilters && (
          <div className="bg-[var(--color-bg-tertiary)] p-4 rounded-xl mb-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-[var(--color-text-muted)] mb-1">Filter by Date</label>
                <Input type="date" value={filterDate} onChange={handleDateFilterChange} />
              </div>
              <div>
                <label className="block text-sm text-[var(--color-text-muted)] mb-1">Items Per Page</label>
                <Select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  options={[
                    { value: 5, label: "5" },
                    { value: 10, label: "10" },
                    { value: 20, label: "20" },
                    { value: 50, label: "50" },
                  ]}
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleClearDateFilter}
                  variant="secondary"
                  size="md"
                >
                  Clear Date Filter
                </Button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative w-16 h-16">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-[var(--color-border-primary)] rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-[var(--color-primary)] rounded-full animate-spin border-t-transparent"></div>
            </div>
          </div>
        ) : entries.length === 0 ? (
          <NoResults icon={<FaHistory className="text-[var(--color-text-disabled)] text-5xl" />}
            message={!isOnline && !cachedData ? "No data available while offline" : "No entry records found"}
            suggestion={!isOnline && !cachedData ? "Connect to the internet to view your access history" : "Try changing your filter criteria"}
          />
        ) : (
          <>
            {/* Table View for Larger Screens */}
            <div className="hidden lg:block overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[var(--color-border-light)]">
                  <thead className="bg-[var(--color-bg-tertiary)]">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-[var(--color-bg-primary)] divide-y divide-[var(--color-border-light)]">
                    {entries.map((entry) => (
                      <tr key={entry._id} className="hover:bg-[var(--color-bg-tertiary)]">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="p-1.5 rounded-md mr-2" style={{ backgroundColor: entry.status === "Checked In" ? 'var(--color-success-bg-light)' : 'var(--color-info-bg)' }}>
                              {entry.status === "Checked In" ? <FaSignInAlt className="text-sm" style={{ color: 'var(--color-success)' }} /> : <FaSignOutAlt className="text-sm" style={{ color: 'var(--color-info)' }} />}
                            </div>
                            <span className="text-sm font-medium text-[var(--color-text-body)]">{entry.status}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-[var(--color-text-body)]">
                            <FaCalendarAlt className="text-[var(--color-text-disabled)] mr-2 text-xs" />
                            {formatDate(entry.dateAndTime)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-[var(--color-text-body)]">
                            <FaClock className="text-[var(--color-text-disabled)] mr-2 text-xs" />
                            {formatTime(entry.dateAndTime)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile View for Entries */}
            <div className="lg:hidden space-y-3">
              {entries.map((entry) => (
                <div key={entry._id} className="bg-[var(--color-bg-tertiary)] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="p-1.5 rounded-md mr-2" style={{ backgroundColor: entry.status === "Checked In" ? 'var(--color-success-bg-light)' : 'var(--color-info-bg)' }}>
                        {entry.status === "Checked In" ? <FaSignInAlt className="text-sm" style={{ color: 'var(--color-success)' }} /> : <FaSignOutAlt className="text-sm" style={{ color: 'var(--color-info)' }} />}
                      </div>
                      <span className="text-sm font-medium text-[var(--color-text-body)]">{entry.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                    <div className="flex items-center">
                      <FaCalendarAlt className="mr-1" />
                      {formatDate(entry.dateAndTime)}
                    </div>
                    <div className="flex items-center">
                      <FaClock className="mr-1" />
                      {formatTime(entry.dateAndTime)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination currentPage={currentPage} totalPages={totalPages} paginate={paginate} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default AccessHistory
