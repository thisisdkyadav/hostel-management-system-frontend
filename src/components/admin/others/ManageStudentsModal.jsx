import { useState, useEffect } from "react"
import { FaUsers, FaSearch, FaFileCsv, FaUserMinus } from "react-icons/fa"
import Modal from "../../common/Modal"
import { adminApi } from "../../../services/adminApi"
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
      <Modal title={`Manage Students - ${undertakingTitle}`} onClose={onClose} size="lg" width={900}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-5)' }}>
          {error && <div style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--font-size-sm)' }}>{error}</div>}

          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--spacing-4)' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '20rem' }}>
              <FaSearch style={{ position: 'absolute', left: 'var(--spacing-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search students..." style={{ width: '100%', paddingLeft: 'var(--spacing-10)', paddingRight: 'var(--spacing-4)', paddingTop: 'var(--spacing-2)', paddingBottom: 'var(--spacing-2)', border: 'var(--border-1) solid var(--color-border-input)', borderRadius: 'var(--radius-lg)', outline: 'none', transition: 'var(--transition-all)' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--color-primary)'; }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--color-border-input)'; }} />
            </div>
            <button onClick={() => setShowBulkUpload(true)} style={{ backgroundColor: 'var(--color-success)', color: 'var(--color-white)', display: 'flex', alignItems: 'center', padding: 'var(--spacing-2) var(--spacing-4)', borderRadius: 'var(--radius-lg)', transition: 'var(--transition-colors)', border: 'none', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-success-dark)'} onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-success)'}>
              <FaFileCsv style={{ marginRight: 'var(--spacing-2)' }} /> Add Students (CSV)
            </button>
          </div>

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
                        <button onClick={() => handleRemoveStudent(student.id)} style={{ color: 'var(--color-danger)', padding: 'var(--spacing-2)', borderRadius: 'var(--radius-full)', transition: 'var(--transition-colors)', border: 'none', cursor: 'pointer', background: 'none' }} onMouseEnter={(e) => { e.target.style.backgroundColor = 'var(--color-danger-bg)'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; }} title="Remove student">
                          <FaUserMinus />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--spacing-4)', marginTop: 'var(--spacing-6)', borderTop: 'var(--border-1) solid var(--color-border-light)' }}>
            <button type="button" onClick={onClose} style={{ padding: 'var(--spacing-2) var(--spacing-4)', color: 'var(--color-text-body)', backgroundColor: 'var(--color-bg-hover)', borderRadius: 'var(--radius-lg)', transition: 'var(--transition-colors)', border: 'none', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-muted)'} onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-bg-hover)'}>
              Close
            </button>
          </div>
        </div>
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
