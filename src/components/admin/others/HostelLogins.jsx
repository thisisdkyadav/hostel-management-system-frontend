import { useState, useEffect } from "react"
import { FaBuilding, FaPlus } from "react-icons/fa"
import { useGlobal } from "../../../contexts/GlobalProvider"
import { Grid, Heading, SearchInput, Spinner, Surface, VStack } from "@/components/ui"
import { Button } from "czero/react"
import NoResults from "../../common/NoResults"
import HostelGateCard from "./HostelGateCard"
import AddHostelGateModal from "./AddHostelGateModal"
import { hostelGateApi } from "../../../service"

const filterHostelGates = (gates, searchTerm) => {
  if (!gates) return []

  return gates.filter((gate) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()

    // Get hostel name from the populated hostel field if available
    const hostelName = gate.hostelId?.name || ""

    return hostelName.toLowerCase().includes(term)
  })
}

const HostelLogins = () => {
  const { hostelList } = useGlobal()
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [hostelGates, setHostelGates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const filteredHostelGates = filterHostelGates(hostelGates, searchTerm)

  const fetchHostelGates = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await hostelGateApi.getAllHostelGates()
      setHostelGates(response.hostelGates || [])
    } catch (error) {
      console.error("Error fetching hostel gates:", error)
      setError("Failed to fetch hostel gates. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHostelGates()
  }, [])

  return (
    <div>
      <header style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 'var(--spacing-6)' }}>
        <Heading as="h2" size="xl" weight="semibold" color="body">Hostel Gate Logins</Heading>
        <Button onClick={() => setShowAddModal(true)} variant="primary" size="md">
          <FaPlus />
          Add Hostel Gate Login
        </Button>
      </header>

      <VStack gap={4} align="start" justify="between" style={{ marginTop: 'var(--spacing-6)' }} className="sm:flex-row sm:items-center sm:space-y-0">
        <SearchInput value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by hostel name" className="w-full sm:w-64 md:w-72" />
      </VStack>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '16rem' }}>
          <Spinner size="var(--icon-3xl)" thickness="thin" />
        </div>
      ) : error ? (
        <Surface padding={8} color="danger" align="center">{error}</Surface>
      ) : filteredHostelGates.length === 0 ? (
        <NoResults icon={<FaBuilding style={{ color: 'var(--color-border-primary)', fontSize: 'var(--icon-3xl)' }} />} message="No hostel gate logins found" suggestion="Add a new hostel gate login using the button above" />
      ) : (
        <Grid cols={3} gap={6} style={{ marginTop: 'var(--spacing-6)' }}>
          {filteredHostelGates.map((gate) => (
            <HostelGateCard key={gate._id} gate={gate} onUpdate={fetchHostelGates} onDelete={fetchHostelGates} />
          ))}
        </Grid>
      )}

      <AddHostelGateModal show={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={fetchHostelGates} hostels={hostelList} />
    </div>
  )
}

export default HostelLogins
