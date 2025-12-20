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
    setCurrentPage(1)
  }

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

  const styles = {
    container: {
      padding: "var(--spacing-6) var(--spacing-10)",
      flex: 1,
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      padding: "var(--spacing-4) var(--spacing-3)",
      borderRadius: "var(--radius-xl)",
    },
    title: {
      fontSize: "var(--font-size-3xl)",
      padding: "0 var(--spacing-3)",
      fontWeight: "var(--font-weight-bold)",
      color: "var(--color-text-primary)",
    },
    headerActions: {
      display: "flex",
      alignItems: "center",
      gap: "var(--spacing-4)",
    },
    filterButton: {
      display: "flex",
      alignItems: "center",
      padding: "var(--spacing-2) var(--spacing-4)",
      borderRadius: "var(--radius-xl)",
      border: "none",
      cursor: "pointer",
      fontSize: "var(--font-size-base)",
      fontWeight: "var(--font-weight-medium)",
      transition: "var(--transition-colors)",
    },
    filterButtonActive: {
      backgroundColor: "var(--color-primary)",
      color: "var(--color-white)",
    },
    filterButtonInactive: {
      backgroundColor: "var(--color-bg-primary)",
      color: "var(--color-text-body)",
    },
    filterIcon: {
      marginRight: "var(--spacing-2)",
    },
    filterSection: {
      marginTop: "var(--spacing-8)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--spacing-4)",
    },
    filterRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    filterPanel: {
      backgroundColor: "var(--color-bg-primary)",
      padding: "var(--spacing-4)",
      borderRadius: "var(--radius-xl)",
      boxShadow: "var(--shadow-md)",
    },
    filterGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "var(--spacing-4)",
    },
    filterLabel: {
      display: "block",
      fontSize: "var(--font-size-sm)",
      color: "var(--color-text-muted)",
      marginBottom: "var(--spacing-1)",
    },
    filterInput: {
      width: "100%",
      padding: "var(--spacing-2)",
      border: "var(--border-1) solid var(--color-border-input)",
      borderRadius: "var(--radius-lg)",
      fontSize: "var(--font-size-base)",
      color: "var(--color-text-body)",
      backgroundColor: "var(--color-bg-primary)",
    },
    filterSelect: {
      width: "100%",
      padding: "var(--spacing-2)",
      border: "var(--border-1) solid var(--color-border-input)",
      borderRadius: "var(--radius-lg)",
      fontSize: "var(--font-size-base)",
      color: "var(--color-text-body)",
      backgroundColor: "var(--color-bg-primary)",
    },
    clearButton: {
      backgroundColor: "var(--color-bg-muted)",
      color: "var(--color-text-body)",
      padding: "var(--spacing-2) var(--spacing-4)",
      borderRadius: "var(--radius-lg)",
      border: "none",
      cursor: "pointer",
      fontSize: "var(--font-size-base)",
      transition: "var(--transition-colors)",
    },
    loadingContainer: {
      marginTop: "var(--spacing-6)",
      display: "flex",
      justifyContent: "center",
    },
    spinner: {
      width: "var(--icon-4xl)",
      height: "var(--icon-4xl)",
      border: "var(--border-4) solid var(--color-primary)",
      borderTop: "var(--border-4) solid transparent",
      borderRadius: "var(--radius-full)",
      animation: "spin 1s linear infinite",
    },
    resultsContainer: {
      marginTop: "var(--spacing-6)",
    },
    noResultsIcon: {
      margin: "0 auto",
      color: "var(--color-text-disabled)",
      fontSize: "var(--font-size-6xl)",
      marginBottom: "var(--spacing-4)",
    },
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Student Entry Management</h1>
        <div style={styles.headerActions}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              ...styles.filterButton,
              ...(showFilters ? styles.filterButtonActive : styles.filterButtonInactive),
            }}
          >
            <FaFilter style={styles.filterIcon} /> Filters
          </button>
        </div>
      </header>

      <div style={styles.filterSection}>
        <div style={styles.filterRow}>
          <FilterTabs tabs={ENTRY_FILTER_TABS} activeTab={filterStatus} setActiveTab={handleFilterStatusChange} />
          <SearchBar value={searchTerm} onChange={handleSearchChange} placeholder="Search by unit, room" style={{ width: "50%" }} />
        </div>

        {showFilters && (
          <div style={styles.filterPanel}>
            <div style={styles.filterGrid}>
              <div>
                <label style={styles.filterLabel}>Filter by Date</label>
                <input type="date" value={filterDate} onChange={handleDateFilterChange} style={styles.filterInput} />
              </div>
              <div>
                <label style={styles.filterLabel}>Items Per Page</label>
                <select value={itemsPerPage} onChange={handleItemsPerPageChange} style={styles.filterSelect}>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <button onClick={handleClearDateFilter} style={styles.clearButton}>
                  Clear Date Filter
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
        </div>
      ) : entries.length > 0 ? (
        <div style={styles.resultsContainer}>
          <StudentEntryTable entries={entries} refresh={fetchEntries} />
          {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} paginate={paginate} />}
        </div>
      ) : (
        <NoResults icon={<FaUserGraduate style={styles.noResultsIcon} />} message="No student entries found" suggestion="Try changing your search or filter criteria" />
      )}
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default StudentEntries
