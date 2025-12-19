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
        <div className="space-y-5">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="relative w-full max-w-xs">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search students..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB]" />
            </div>
            <button onClick={() => setShowBulkUpload(true)} className="bg-green-600 text-white flex items-center px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              <FaFileCsv className="mr-2" /> Add Students (CSV)
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1360AB]"></div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <NoResults icon={<FaUsers className="text-gray-300 text-3xl" />} message="No students found" suggestion={searchTerm ? "Try changing your search term" : "Add students to this undertaking using CSV upload"} />
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
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
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
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => handleRemoveStudent(student.id)} className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded-full transition-colors" title="Remove student">
                          <FaUserMinus />
                        </button>
                      </td>
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
