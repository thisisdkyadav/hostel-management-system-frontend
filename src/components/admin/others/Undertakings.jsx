import { useState, useEffect } from "react"
import { FaFileSignature, FaPlus } from "react-icons/fa"
import { Grid, Heading, HStack, SearchInput, Spinner, Surface } from "@/components/ui"
import { Button } from "czero/react"
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
        <Heading as="h2" size="xl" weight="semibold" color="body">Undertakings</Heading>
        <Button onClick={() => setShowAddModal(true)} variant="primary" size="md">
          <FaPlus /> Add Undertaking
        </Button>
      </header>

      <HStack gap={4} align="center" justify="between" style={{ marginTop: 'var(--spacing-6)' }}>
        <SearchInput value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search undertakings by title, description or dates" className="w-full sm:w-64 md:w-72" />
      </HStack>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '16rem' }}>
          <Spinner size="var(--icon-3xl)" thickness="thin" />
        </div>
      ) : error ? (
        <Surface padding={8} color="danger" align="center">{error}</Surface>
      ) : filteredUndertakings.length === 0 ? (
        <NoResults icon={<FaFileSignature style={{ fontSize: 'var(--icon-3xl)' }} color="var(--color-border-primary)" />} message="No undertakings found" suggestion="Try changing your search criteria or create a new undertaking" />
      ) : (
        <Grid cols={3} gap={6} style={{ marginTop: 'var(--spacing-6)' }}>
          {filteredUndertakings.map((undertaking) => (
            <UndertakingCard key={undertaking.id} undertaking={undertaking} onUpdate={fetchUndertakings} onDelete={fetchUndertakings} />
          ))}
        </Grid>
      )}

      <AddUndertakingModal show={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={fetchUndertakings} />
    </div>
  )
}

export default Undertakings
