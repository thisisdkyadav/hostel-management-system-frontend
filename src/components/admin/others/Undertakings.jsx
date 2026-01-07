import { useState, useEffect } from "react"
import { FaFileSignature, FaPlus } from "react-icons/fa"
import { SearchInput, Button } from "@/components/ui"
import NoResults from "../../common/NoResults"
import UndertakingCard from "./UndertakingCard"
import AddUndertakingModal from "./AddUndertakingModal"
import { adminApi } from "../../../service"

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

const Undertakings = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [undertakings, setUndertakings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const filteredUndertakings = filterUndertakings(undertakings, filterStatus, searchTerm)

  const fetchUndertakings = async () => {
    try {
      setLoading(true)
      setError(null)
      // Replace with actual API call when implemented
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

  return (
    <div>
      <header style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 'var(--spacing-6)' }}>
        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-body)' }}>Undertakings</h2>
        <Button onClick={() => setShowAddModal(true)} variant="primary" size="medium" icon={<FaPlus />}>
          Add Undertaking
        </Button>
      </header>

      <div style={{ marginTop: 'var(--spacing-6)', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--spacing-4)' }}>
        <SearchInput value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search undertakings by title, description or dates" className="w-full sm:w-64 md:w-72" />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '16rem' }}>
          <div style={{ width: 'var(--icon-3xl)', height: 'var(--icon-3xl)', border: 'var(--border-2) solid transparent', borderTopColor: 'var(--color-primary)', borderBottomColor: 'var(--color-primary)', borderRadius: 'var(--radius-full)', animation: 'spin 1s linear infinite' }}></div>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-8)', color: 'var(--color-danger)' }}>{error}</div>
      ) : filteredUndertakings.length === 0 ? (
        <NoResults icon={<FaFileSignature style={{ color: 'var(--color-border-primary)', fontSize: 'var(--icon-3xl)' }} />} message="No undertakings found" suggestion="Try changing your search criteria or create a new undertaking" />
      ) : (
        <div style={{ marginTop: 'var(--spacing-6)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-6)' }}>
          {filteredUndertakings.map((undertaking) => (
            <UndertakingCard key={undertaking.id} undertaking={undertaking} onUpdate={fetchUndertakings} onDelete={fetchUndertakings} />
          ))}
        </div>
      )}

      <AddUndertakingModal show={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={fetchUndertakings} />
    </div>
  )
}

export default Undertakings
