import { useState, useEffect } from "react"
import { FaClipboardCheck, FaSearch, FaFileDownload } from "react-icons/fa"
import Modal from "../../common/Modal"
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
    <Modal title={`Acceptance Status - ${undertakingTitle}`} onClose={onClose} size="lg">
      <div className="space-y-5">
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">Total Students</div>
            <div className="text-2xl font-bold text-blue-800">{totalStudents}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600 font-medium">Accepted</div>
            <div className="text-2xl font-bold text-green-800">{acceptedCount}</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-sm text-yellow-600 font-medium">Pending</div>
            <div className="text-2xl font-bold text-yellow-800">{pendingCount}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 font-medium">Not Viewed</div>
            <div className="text-2xl font-bold text-gray-800">{notViewedCount}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-2">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Overall Acceptance</span>
            <span>{acceptancePercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${acceptancePercentage}%` }}></div>
          </div>
        </div>

        {/* Filters and search */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="flex space-x-2">
            <button onClick={() => setStatusFilter("all")} className={`px-3 py-1.5 rounded-lg text-sm ${statusFilter === "all" ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
              All
            </button>
            <button onClick={() => setStatusFilter("accepted")} className={`px-3 py-1.5 rounded-lg text-sm ${statusFilter === "accepted" ? "bg-green-600 text-white" : "bg-green-50 text-green-700 hover:bg-green-100"}`}>
              Accepted
            </button>
            <button onClick={() => setStatusFilter("pending")} className={`px-3 py-1.5 rounded-lg text-sm ${statusFilter === "pending" ? "bg-yellow-600 text-white" : "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"}`}>
              Pending
            </button>
            <button onClick={() => setStatusFilter("not_viewed")} className={`px-3 py-1.5 rounded-lg text-sm ${statusFilter === "not_viewed" ? "bg-gray-600 text-white" : "bg-gray-50 text-gray-700 hover:bg-gray-100"}`}>
              Not Viewed
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search students..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB]" />
            </div>
            <button onClick={exportToCSV} className="bg-[#1360AB] text-white flex items-center px-4 py-2 rounded-lg hover:bg-[#0F4C81] transition-colors" title="Export to CSV">
              <FaFileDownload className="mr-2" /> Export
            </button>
          </div>
        </div>

        {/* Students list */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1360AB]"></div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <NoResults icon={<FaClipboardCheck className="text-gray-300 text-3xl" />} message="No students found" suggestion={searchTerm ? "Try changing your search term or filter" : "No students match the selected filter"} />
        ) : (
          <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roll Number
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acceptance Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-3">{student.name ? student.name.charAt(0).toUpperCase() : "S"}</div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.rollNumber || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${student.status === "accepted" ? "bg-green-100 text-green-800" : student.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"}`}>
                        {student.status === "accepted" ? "Accepted" : student.status === "pending" ? "Pending" : "Not Viewed"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.acceptedAt ? new Date(student.acceptedAt).toLocaleString() : "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end pt-4 mt-6 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
            Close
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ViewAcceptanceStatusModal
