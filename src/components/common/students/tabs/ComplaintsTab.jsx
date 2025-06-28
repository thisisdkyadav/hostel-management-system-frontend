import React, { useState, useEffect } from "react"
import { FaClipboardList } from "react-icons/fa"
import { studentApi } from "../../../../services/apiService"
import ComplaintDetailModal from "../../../complaints/ComplaintDetailModal"

const ComplaintsTab = ({ userId }) => {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const handleComplaintClick = (complaint) => {
    setSelectedComplaint(complaint)
    setShowDetailModal(true)
  }

  const fetchStudentComplaints = async () => {
    if (!userId) return
    try {
      setLoading(true)
      const response = await studentApi.getStudentComplaints(userId, { limit: 10 })
      setComplaints(response.data || [])
    } catch (error) {
      console.error("Error fetching student complaints:", error)
      setComplaints([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudentComplaints()
  }, [userId])

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="bg-white">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Complaints History</h3>
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1360AB]"></div>
        </div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <FaClipboardList className="mx-auto text-gray-300 mb-2 text-4xl" />
          <p className="text-gray-500">No complaints found for this student</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {complaints.map((complaint) => (
                <tr onClick={() => handleComplaintClick(complaint)} key={complaint._id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(complaint.createdDate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{complaint.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${complaint.status === "Pending" ? "bg-yellow-100 text-yellow-800" : complaint.status === "In Progress" ? "bg-blue-100 text-blue-800" : complaint.status === "Resolved" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      {complaint.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showDetailModal && selectedComplaint && <ComplaintDetailModal selectedComplaint={selectedComplaint} setShowDetailModal={setShowDetailModal} onComplaintUpdate={fetchStudentComplaints} />}
    </div>
  )
}

export default ComplaintsTab
