import { useState, useEffect } from "react"
import { FaUsers, FaSearch, FaFileCsv, FaUserMinus } from "react-icons/fa"
import { Alert, HStack, IconCircle, SearchInput, Spinner, Surface, Text, useConfirm, VStack } from "@/components/ui"
import { Button, Input, Table } from "czero/react"
import { Modal } from "@/components/ui"
import { adminApi } from "../../../service"
import NoResults from "../../common/NoResults"
import BulkStudentUndertakingModal from "./BulkStudentUndertakingModal"

const ManageStudentsModal = ({ show, undertakingId, undertakingTitle, onClose, onUpdate }) => {
  const confirm = useConfirm()
  const [assignedStudents, setAssignedStudents] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showBulkUpload, setShowBulkUpload] = useState(false)

  // Fetch assigned students
  const fetchAssignedStudents = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await adminApi.getUndertakingStudents(undertakingId)
      setAssignedStudents(response.students || [])
    } catch (error) {
      console.error("Error fetching assigned students:", error)
      setError("Failed to fetch assigned students. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (show && undertakingId) {
      fetchAssignedStudents()
    }
  }, [show, undertakingId])

  // Filter students based on search term
  const filteredStudents = assignedStudents.filter((student) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return student.name?.toLowerCase().includes(term) || student.email?.toLowerCase().includes(term) || student.rollNumber?.toLowerCase().includes(term)
  })

  // Remove a student from undertaking
  const handleRemoveStudent = async (studentId) => {
    if (await confirm({ message: "Are you sure you want to remove this student from the undertaking?", isDestructive: true })) {
      try {
        setLoading(true)
        setError(null)
        await adminApi.removeStudentFromUndertaking(undertakingId, studentId)
        alert("Student removed from undertaking successfully!")
        fetchAssignedStudents()
        if (onUpdate) onUpdate()
      } catch (error) {
        console.error("Error removing student from undertaking:", error)
        setError("Failed to remove student from undertaking. Please try again.")
      } finally {
        setLoading(false)
      }
    }
  }

  if (!show) return null

  return (
    <>
      <Modal isOpen={show} title={`Manage Students - ${undertakingTitle}`} onClose={onClose} size="lg" width={900}>
        <VStack gap="large">
          {error && <Alert type="error">{error}</Alert>}

          <HStack gap="medium" justify="between" align="center">
            <div style={{ position: 'relative', width: '100%', maxWidth: '20rem' }}>
              <Input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search students..." icon={<FaSearch />} />
            </div>
            <Button onClick={() => setShowBulkUpload(true)} variant="success" size="md">
              <FaFileCsv />
              Add Students (CSV)
            </Button>
          </HStack>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '16rem' }}>
              <Spinner size="var(--icon-3xl)" thickness="thin" />
            </div>
          ) : filteredStudents.length === 0 ? (
            <NoResults icon={<FaUsers style={{ fontSize: 'var(--icon-3xl)' }} color="var(--color-border-primary)" />} message="No students found" suggestion={searchTerm ? "Try changing your search term" : "Add students to this undertaking using CSV upload"} />
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
                      Action
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
                        <Surface as="span" bg={student.status === "accepted" ? 'var(--color-success-bg)' : student.status === "pending" ? 'var(--color-warning-bg)' : 'var(--color-bg-muted)'} padding="var(--spacing-1) var(--spacing-2)" radius="full" color={student.status === "accepted" ? 'var(--color-success-dark)' : student.status === "pending" ? 'var(--color-warning-dark)' : 'var(--color-text-secondary)'} size="xs" weight="semibold" leading="1.25rem" style={{ display: 'inline-flex' }}>
                          {student.status === "accepted" ? "Accepted" : student.status === "pending" ? "Pending" : "Not Viewed"}
                        </Surface>
                      </Table.Cell>
                      <Table.Cell style={{ whiteSpace: 'nowrap', textAlign: 'right', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                        <Button onClick={() => handleRemoveStudent(student.id)} variant="ghost" size="sm" title="Remove student"><FaUserMinus /></Button>
                      </Table.Cell>
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

      {/* Bulk Upload Modal */}
      <BulkStudentUndertakingModal isOpen={showBulkUpload} onClose={() => setShowBulkUpload(false)}
        undertakingId={undertakingId}
        undertakingTitle={undertakingTitle}
        onUpdate={() => {
          fetchAssignedStudents()
          if (onUpdate) onUpdate()
        }}
      />
    </>
  )
}

export default ManageStudentsModal
