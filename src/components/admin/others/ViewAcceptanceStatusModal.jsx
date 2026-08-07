import { useState, useEffect } from "react"
import { FaClipboardCheck, FaSearch, FaFileDownload } from "react-icons/fa"
import { Alert, Grid, HStack, IconCircle, InfoRow, SearchInput, Spinner, Surface, Text, VStack } from "@/components/ui"
import { Button, Input, Table } from "czero/react"
import { Modal } from "@/components/ui"
import { adminApi } from "../../../service"
import NoResults from "../../common/NoResults"

const ViewAcceptanceStatusModal = ({ show, undertakingId, undertakingTitle, onClose }) => {
  const [students, setStudents] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState("all") // all, accepted, pending, not_viewed

  // Fetch students with acceptance status
  const fetchStudentsStatus = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await adminApi.getUndertakingStudentsStatus(undertakingId)
      setStudents(response.students || [])
    } catch (error) {
      console.error("Error fetching students status:", error)
      setError("Failed to fetch students status. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (show && undertakingId) {
      fetchStudentsStatus()
    }
  }, [show, undertakingId])

  // Filter students based on search term and status filter
  const filteredStudents = students.filter((student) => {
    // Filter by status
    if (statusFilter !== "all" && student.status !== statusFilter) return false

    // Filter by search term
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return student.name?.toLowerCase().includes(term) || student.email?.toLowerCase().includes(term) || student.rollNumber?.toLowerCase().includes(term)
  })

  // Calculate statistics
  const totalStudents = students.length
  const acceptedCount = students.filter((s) => s.status === "accepted").length
  const pendingCount = students.filter((s) => s.status === "pending").length
  const notViewedCount = students.filter((s) => s.status === "not_viewed").length

  const acceptancePercentage = totalStudents > 0 ? Math.round((acceptedCount / totalStudents) * 100) : 0

  // Export to CSV
  const exportToCSV = () => {
    // Create CSV content
    const headers = ["Name", "Email", "Roll Number", "Status", "Acceptance Date"]
    const csvRows = [
      headers.join(","),
      ...students.map((student) => [`"${student.name || ""}"`, `"${student.email || ""}"`, `"${student.rollNumber || ""}"`, `"${student.status === "accepted" ? "Accepted" : student.status === "pending" ? "Pending" : "Not Viewed"}"`, `"${student.acceptedAt || ""}"`].join(",")),
    ]

    // Create and download the CSV file
    const csvContent = csvRows.join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${undertakingTitle.replace(/\s+/g, "_")}_status.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!show) return null

  return (
    <Modal isOpen={show} title={`Acceptance Status - ${undertakingTitle}`} onClose={onClose} size="lg" width={900}>
      <VStack gap="large">
        {error && <Alert type="error">{error}</Alert>}

        {/* Statistics */}
        <Grid cols={4} gap={4}>
          <Surface bg="brand" padding={4} radius="lg">
            <Text as="div" size="sm" color="brand" weight="medium">Total Students</Text>
            <Text as="div" size="2xl" weight="bold" color="var(--color-primary-dark)">{totalStudents}</Text>
          </Surface>
          <Surface bg="success" padding={4} radius="lg">
            <Text as="div" size="sm" color="success" weight="medium">Accepted</Text>
            <Text as="div" size="2xl" weight="bold" color="var(--color-success-text)">{acceptedCount}</Text>
          </Surface>
          <Surface bg="warning" padding={4} radius="lg">
            <Text as="div" size="sm" color="warning" weight="medium">Pending</Text>
            <Text as="div" size="2xl" weight="bold" color="var(--color-warning-text)">{pendingCount}</Text>
          </Surface>
          <Surface bg="var(--color-bg-hover)" padding={4} radius="lg">
            <Text as="div" size="sm" color="muted" weight="medium">Not Viewed</Text>
            <Text as="div" size="2xl" weight="bold" color="secondary">{notViewedCount}</Text>
          </Surface>
        </Grid>

        {/* Progress bar */}
        <div style={{ marginTop: 'var(--spacing-2)' }}>
          <InfoRow label="Overall Acceptance" value={<>{acceptancePercentage}%</>} style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-1)' }} />
          <div style={{ width: '100%', backgroundColor: 'var(--color-bg-muted)', borderRadius: 'var(--radius-full)', height: '0.625rem' }}>
            <div style={{ backgroundColor: 'var(--color-success)', height: '0.625rem', borderRadius: 'var(--radius-full)', width: `${acceptancePercentage}%` }}></div>
          </div>
        </div>

        {/* Filters and search */}
        <HStack gap="medium" justify="between" align="center">
          <HStack gap="xsmall">
            <Button onClick={() => setStatusFilter("all")} variant={statusFilter === "all" ? "primary" : "ghost"} size="sm">
              All
            </Button>
            <Button onClick={() => setStatusFilter("accepted")} variant={statusFilter === "accepted" ? "success" : "ghost"} size="sm">
              Accepted
            </Button>
            <Button onClick={() => setStatusFilter("pending")} variant={statusFilter === "pending" ? "warning" : "ghost"} size="sm">
              Pending
            </Button>
            <Button onClick={() => setStatusFilter("not_viewed")} variant={statusFilter === "not_viewed" ? "secondary" : "ghost"} size="sm">
              Not Viewed
            </Button>
          </HStack>

          <HStack gap="small" align="center">
            <Input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search students..." icon={<FaSearch />} />
            <Button onClick={exportToCSV} variant="primary" size="md" title="Export to CSV">
              <FaFileDownload />
              Export
            </Button>
          </HStack>
        </HStack>

        {/* Students list */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '16rem' }}>
            <Spinner size="var(--icon-3xl)" thickness="thin" />
          </div>
        ) : filteredStudents.length === 0 ? (
          <NoResults icon={<FaClipboardCheck style={{ fontSize: 'var(--icon-3xl)' }} color="var(--color-border-primary)" />} message="No students found" suggestion={searchTerm ? "Try changing your search term or filter" : "No students match the selected filter"} />
        ) : (
          <div style={{ marginTop: 'var(--spacing-4)', border: 'var(--border-1) solid var(--color-border-light)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head scope="col">
                    Student
                  </Table.Head>
                  <Table.Head scope="col">
                    Roll Number
                  </Table.Head>
                  <Table.Head scope="col">
                    Status
                  </Table.Head>
                  <Table.Head scope="col">
                    Acceptance Date
                  </Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredStudents.map((student, index) => (
                  <Table.Row style={{ backgroundColor: index % 2 === 0 ? 'var(--color-bg-primary)' : 'var(--color-bg-hover)' }} key={student.id}>
                    <Table.Cell style={{ whiteSpace: 'nowrap' }}>
                      <HStack gap="none" align="center">
                        <IconCircle size="var(--icon-xl)" bg="muted" color="muted" style={{ marginRight: 'var(--spacing-3)' }}>{student.name ? student.name.charAt(0).toUpperCase() : "S"}</IconCircle>
                        <div>
                          <Text as="div" size="sm" weight="medium" color="secondary">{student.name}</Text>
                          <Text as="div" size="sm" color="muted">{student.email}</Text>
                        </div>
                      </HStack>
                    </Table.Cell>
                    <Table.Cell style={{ whiteSpace: 'nowrap', fontSize: 'var(--font-size-sm)' }}>{student.rollNumber || "N/A"}</Table.Cell>
                    <Table.Cell style={{ whiteSpace: 'nowrap' }}>
                      <Surface as="span" bg={student.status === "accepted" ? 'var(--color-success-bg)' : student.status === "pending" ? 'var(--color-warning-bg)' : 'var(--color-bg-muted)'} padding="var(--spacing-1) var(--spacing-2)" radius="full" color={student.status === "accepted" ? 'var(--color-success-text)' : student.status === "pending" ? 'var(--color-warning-text)' : 'var(--color-text-secondary)'} size="xs" weight="semibold" leading="1.25rem" style={{ display: 'inline-flex' }}>
                        {student.status === "accepted" ? "Accepted" : student.status === "pending" ? "Pending" : "Not Viewed"}
                      </Surface>
                    </Table.Cell>
                    <Table.Cell style={{ whiteSpace: 'nowrap', fontSize: 'var(--font-size-sm)' }}>{student.acceptedAt ? new Date(student.acceptedAt).toLocaleString() : "N/A"}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        )}

        <HStack gap="small" justify="end" style={{ paddingTop: 'var(--spacing-4)', marginTop: 'var(--spacing-2)', borderTop: 'var(--border-1) solid var(--color-border-light)' }}>
          <Button type="button" onClick={onClose} variant="secondary" size="md">
            Close
          </Button>
        </HStack>
      </VStack>
    </Modal>
  )
}

export default ViewAcceptanceStatusModal
