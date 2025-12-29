import { useState, useEffect } from "react"
import { FaClipboardCheck, FaSearch, FaFileDownload } from "react-icons/fa"
import Modal from "../../common/Modal"
import Button from "../../common/Button"
import Input from "../../common/ui/Input"
import { adminApi } from "../../../services/adminApi"
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
    <Modal title={`Acceptance Status - ${undertakingTitle}`} onClose={onClose} size="lg" width={900}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-5)' }}>
        {error && <div style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--font-size-sm)' }}>{error}</div>}

        {/* Statistics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-4)' }}>
          <div style={{ backgroundColor: 'var(--color-primary-bg)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', fontWeight: 'var(--font-weight-medium)' }}>Total Students</div>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary-dark)' }}>{totalStudents}</div>
          </div>
          <div style={{ backgroundColor: 'var(--color-success-bg)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-success)', fontWeight: 'var(--font-weight-medium)' }}>Accepted</div>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-success-dark)' }}>{acceptedCount}</div>
          </div>
          <div style={{ backgroundColor: 'var(--color-warning-bg)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-warning)', fontWeight: 'var(--font-weight-medium)' }}>Pending</div>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-warning-dark)' }}>{pendingCount}</div>
          </div>
          <div style={{ backgroundColor: 'var(--color-bg-hover)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', fontWeight: 'var(--font-weight-medium)' }}>Not Viewed</div>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-secondary)' }}>{notViewedCount}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 'var(--spacing-2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-1)' }}>
            <span>Overall Acceptance</span>
            <span>{acceptancePercentage}%</span>
          </div>
          <div style={{ width: '100%', backgroundColor: 'var(--color-bg-muted)', borderRadius: 'var(--radius-full)', height: '0.625rem' }}>
            <div style={{ backgroundColor: 'var(--color-success)', height: '0.625rem', borderRadius: 'var(--radius-full)', width: `${acceptancePercentage}%` }}></div>
          </div>
        </div>

        {/* Filters and search */}
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--spacing-4)' }}>
          <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
            <Button onClick={() => setStatusFilter("all")} variant={statusFilter === "all" ? "primary" : "ghost"} size="small">
              All
            </Button>
            <Button onClick={() => setStatusFilter("accepted")} variant={statusFilter === "accepted" ? "success" : "ghost"} size="small">
              Accepted
            </Button>
            <Button onClick={() => setStatusFilter("pending")} variant={statusFilter === "pending" ? "warning" : "ghost"} size="small">
              Pending
            </Button>
            <Button onClick={() => setStatusFilter("not_viewed")} variant={statusFilter === "not_viewed" ? "secondary" : "ghost"} size="small">
              Not Viewed
            </Button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
            <div style={{ position: 'relative' }}>
              <Input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search students..." icon={<FaSearch />} />
            </div>
            <Button onClick={exportToCSV} variant="primary" size="medium" icon={<FaFileDownload />} title="Export to CSV">
              Export
            </Button>
          </div>
        </div>

        {/* Students list */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '16rem' }}>
            <div style={{ width: 'var(--icon-3xl)', height: 'var(--icon-3xl)', border: 'var(--border-2) solid transparent', borderTopColor: 'var(--color-primary)', borderBottomColor: 'var(--color-primary)', borderRadius: 'var(--radius-full)', animation: 'spin 1s linear infinite' }}></div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <NoResults icon={<FaClipboardCheck style={{ color: 'var(--color-border-primary)', fontSize: 'var(--icon-3xl)' }} />} message="No students found" suggestion={searchTerm ? "Try changing your search term or filter" : "No students match the selected filter"} />
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
                  <th scope="col" style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Acceptance Date
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
                    <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{student.acceptedAt ? new Date(student.acceptedAt).toLocaleString() : "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--spacing-4)', marginTop: 'var(--spacing-6)', borderTop: 'var(--border-1) solid var(--color-border-light)' }}>
          <Button type="button" onClick={onClose} variant="secondary" size="medium">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ViewAcceptanceStatusModal
