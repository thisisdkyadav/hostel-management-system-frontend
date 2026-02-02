import { useState, useEffect } from "react"
import { FaUsers, FaSearch, FaFileCsv, FaUserMinus } from "react-icons/fa"
import { Modal, Input, VStack, HStack, Alert, SearchInput } from "@/components/ui"
import { Button } from "czero/react"
import { adminApi } from "../../../service"
import NoResults from "../../common/NoResults"
import BulkStudentUndertakingModal from "./BulkStudentUndertakingModal"

const ManageStudentsModal = ({ show, undertakingId, undertakingTitle, onClose, onUpdate }) => {
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
    if (window.confirm("Are you sure you want to remove this student from the undertaking?")) {
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
              <div style={{ width: 'var(--icon-3xl)', height: 'var(--icon-3xl)', border: 'var(--border-2) solid transparent', borderTopColor: 'var(--color-primary)', borderBottomColor: 'var(--color-primary)', borderRadius: 'var(--radius-full)', animation: 'spin 1s linear infinite' }}></div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <NoResults icon={<FaUsers style={{ color: 'var(--color-border-primary)', fontSize: 'var(--icon-3xl)' }} />} message="No students found" suggestion={searchTerm ? "Try changing your search term" : "Add students to this undertaking using CSV upload"} />
          ) : (
            <div style={{ marginTop: 'var(--spacing-4)', border: 'var(--border-1) solid var(--color-border-light)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: 'var(--color-bg-hover)' }}>
                  <tr>
                    <th scope="col" style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Student
                    </th>
                    <th scope="col" style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Roll Number
                    </th>
                    <th scope="col" style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Status
                    </th>
                    <th scope="col" style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'right', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, index) => (
                    <tr key={student.id} style={{ backgroundColor: index % 2 === 0 ? 'var(--color-bg-primary)' : 'var(--color-bg-hover)', borderBottom: 'var(--border-1) solid var(--color-border-light)' }}>
                      <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <div style={{ height: 'var(--icon-xl)', width: 'var(--icon-xl)', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', marginRight: 'var(--spacing-3)' }}>{student.name ? student.name.charAt(0).toUpperCase() : "S"}</div>
                          <div>
                            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)' }}>{student.name}</div>
                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{student.rollNumber || "N/A"}</td>
                      <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap' }}>
                        <span style={{ padding: 'var(--spacing-1) var(--spacing-2)', display: 'inline-flex', fontSize: 'var(--font-size-xs)', lineHeight: '1.25rem', fontWeight: 'var(--font-weight-semibold)', borderRadius: 'var(--radius-full)', backgroundColor: student.status === "accepted" ? 'var(--color-success-bg)' : student.status === "pending" ? 'var(--color-warning-bg)' : 'var(--color-bg-muted)', color: student.status === "accepted" ? 'var(--color-success-dark)' : student.status === "pending" ? 'var(--color-warning-dark)' : 'var(--color-text-secondary)' }}>
                          {student.status === "accepted" ? "Accepted" : student.status === "pending" ? "Pending" : "Not Viewed"}
                        </span>
                      </td>
                      <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap', textAlign: 'right', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                        <Button onClick={() => handleRemoveStudent(student.id)} variant="ghost" size="sm" title="Remove student"><FaUserMinus /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
