import { useState, useEffect } from "react"
import { FaFileSignature, FaPlus } from "react-icons/fa"
import SearchBar from "../../components/common/SearchBar"
import NoResults from "../../components/common/NoResults"
import UndertakingCard from "../../components/admin/others/UndertakingCard"
import AddUndertakingModal from "../../components/admin/others/AddUndertakingModal"
import { adminApi } from "../../service"
import { useAuth } from "../../contexts/AuthProvider"
import { Button } from "@/components/ui"

const filterUndertakings = (undertakings, filterStatus, searchTerm) => {
  return undertakings
    .filter((undertaking) => {
      if (filterStatus === "all") return true
      return undertaking.status === filterStatus
    })
    .filter((undertaking) => {
      if (!searchTerm) return true
      const term = searchTerm.toLowerCase()
      return undertaking.title.toLowerCase().includes(term) || undertaking.description.toLowerCase().includes(term) || (undertaking.createdAt && undertaking.createdAt.includes(term)) || (undertaking.deadline && undertaking.deadline.includes(term))
    })
}

const WardenUndertakings = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [undertakings, setUndertakings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const isAdmin = user?.role === "Admin"

  const filteredUndertakings = filterUndertakings(undertakings, filterStatus, searchTerm)

  const fetchUndertakings = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await adminApi.getUndertakings()
      setUndertakings(response.undertakings || [])
    } catch (error) {
      console.error("Error fetching undertakings:", error)
      setError("Failed to fetch undertakings. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUndertakings()
  }, [])

  const styles = {
    container: { padding: "var(--spacing-6) var(--spacing-4)", flex: 1 },
    header: { display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-start", width: "100%", marginBottom: "var(--spacing-6)" },
    title: { fontSize: "var(--font-size-3xl)", fontWeight: "var(--font-weight-bold)", color: "var(--color-text-secondary)", marginBottom: "var(--spacing-4)" },
    addButton: { backgroundColor: "var(--button-primary-bg)", color: "var(--color-white)", display: "flex", alignItems: "center", padding: "var(--spacing-2-5) var(--spacing-4)", borderRadius: "var(--radius-xl)", border: "none", cursor: "pointer", boxShadow: "var(--shadow-sm)", transition: "var(--transition-all)", fontSize: "var(--font-size-base)", fontWeight: "var(--font-weight-medium)" },
    buttonIcon: { marginRight: "var(--spacing-2)" },
    filterSection: { marginTop: "var(--spacing-6)", display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--spacing-4)" },
    loadingContainer: { display: "flex", justifyContent: "center", alignItems: "center", height: "16rem" },
    spinner: { width: "var(--icon-4xl)", height: "var(--icon-4xl)", borderRadius: "var(--radius-full)", borderTop: "var(--border-2) solid var(--color-primary)", borderBottom: "var(--border-2) solid var(--color-primary)", animation: "spin 1s linear infinite" },
    errorContainer: { textAlign: "center", padding: "var(--spacing-8)", color: "var(--color-danger)" },
    grid: { marginTop: "var(--spacing-6)", display: "grid", gap: "var(--spacing-6)" },
    noResultsIcon: { color: "var(--color-text-disabled)", fontSize: "var(--font-size-4xl)" },
  }

  return (
    <div style={styles.container}>
      <header style={styles.header} className="header-responsive">
        <h1 style={styles.title}>Undertakings Management</h1>
        {isAdmin && (
          <Button onClick={() => setShowAddModal(true)} variant="primary" size="medium" icon={<FaPlus />}>
            Add Undertaking
          </Button>
        )}
      </header>

      <div style={styles.filterSection} className="filter-responsive">
        <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search undertakings by title, description or dates" className="search-responsive" />
      </div>

      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
        </div>
      ) : error ? (
        <div style={styles.errorContainer}>{error}</div>
      ) : filteredUndertakings.length === 0 ? (
        <NoResults icon={<FaFileSignature style={styles.noResultsIcon} />} message="No undertakings found" suggestion="Try changing your search criteria or create a new undertaking" />
      ) : (
        <div style={styles.grid} className="undertakings-grid">
          {filteredUndertakings.map((undertaking) => (
            <UndertakingCard key={undertaking.id} undertaking={undertaking} onUpdate={fetchUndertakings} onDelete={fetchUndertakings} isReadOnly={!isAdmin} />
          ))}
        </div>
      )}

      {isAdmin && <AddUndertakingModal show={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={fetchUndertakings} />}

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .header-responsive { flex-direction: column; align-items: flex-start; }
        @media (min-width: 640px) { .header-responsive { flex-direction: row; align-items: center; } .header-responsive h1 { margin-bottom: 0; } }
        .filter-responsive { flex-direction: column; align-items: flex-start; }
        @media (min-width: 640px) { .filter-responsive { flex-direction: row; align-items: center; } }
        .search-responsive { width: 100%; }
        @media (min-width: 640px) { .search-responsive { width: 16rem; } }
        @media (min-width: 768px) { .search-responsive { width: 18rem; } }
        .undertakings-grid { grid-template-columns: 1fr; }
        @media (min-width: 768px) { .undertakings-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .undertakings-grid { grid-template-columns: repeat(3, 1fr); } }
      `}</style>
    </div>
  )
}

export default WardenUndertakings
