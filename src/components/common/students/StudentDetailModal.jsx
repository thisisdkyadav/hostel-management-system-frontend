import React, { useState, useEffect } from "react"
import { FaEnvelope, FaPhone, FaUserGraduate, FaCalendarAlt, FaMapMarkerAlt, FaBuilding, FaClipboardList, FaHistory, FaUserFriends, FaComments } from "react-icons/fa"
import { studentApi } from "../../../services/apiService"
import { visitorApi } from "../../../services/visitorApi"
import { securityApi } from "../../../services/securityApi"
import { feedbackApi } from "../../../services/feedbackApi"
import Modal from "../../common/Modal"
import EditStudentModal from "./EditStudentModal"
import DisCoActions from "./DisCoActions"

const StudentDetailModal = ({ selectedStudent, setShowStudentDetail, onUpdate, isImport = false }) => {
  console.log("Selected Student:", selectedStudent)

  const [studentDetails, setStudentDetails] = useState({})
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")

  // Data for different tabs
  const [complaints, setComplaints] = useState([])
  const [accessRecords, setAccessRecords] = useState([])
  const [visitorRequests, setVisitorRequests] = useState([])
  const [feedbacks, setFeedbacks] = useState([])

  // Loading states for different tabs
  const [loadingComplaints, setLoadingComplaints] = useState(false)
  const [loadingAccessRecords, setLoadingAccessRecords] = useState(false)
  const [loadingVisitorRequests, setLoadingVisitorRequests] = useState(false)
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false)

  const fetchStudentDetails = async () => {
    try {
      setLoading(true)
      const response = await studentApi.getStudentDetails(selectedStudent.userId)
      console.log("Student Details:", response.data)
      setStudentDetails(response.data)
    } catch (error) {
      console.error("Error fetching student details:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStudentComplaints = async () => {
    if (activeTab !== "complaints" || !selectedStudent?.userId) return
    try {
      setLoadingComplaints(true)
      const response = await studentApi.getStudentComplaints(selectedStudent.userId, { limit: 10 })
      setComplaints(response.data || [])
    } catch (error) {
      console.error("Error fetching student complaints:", error)
      setComplaints([])
    } finally {
      setLoadingComplaints(false)
    }
  }

  const fetchStudentAccessHistory = async () => {
    if (activeTab !== "access" || !selectedStudent?.userId) return
    try {
      setLoadingAccessRecords(true)
      const response = await securityApi.getStudentEntries({ userId: selectedStudent.userId, limit: 10 })
      setAccessRecords(response.studentEntries || [])
    } catch (error) {
      console.error("Error fetching student access records:", error)
      setAccessRecords([])
    } finally {
      setLoadingAccessRecords(false)
    }
  }

  const fetchStudentVisitorRequests = async () => {
    if (activeTab !== "visitors" || !selectedStudent?.userId) return
    try {
      setLoadingVisitorRequests(true)
      const response = await visitorApi.getStudentVisitorRequests(selectedStudent.userId)
      console.log("Visitor Requests:", response)

      setVisitorRequests(response.data || [])
    } catch (error) {
      console.error("Error fetching student visitor requests:", error)
      setVisitorRequests([])
    } finally {
      setLoadingVisitorRequests(false)
    }
  }

  const fetchStudentFeedbacks = async () => {
    if (activeTab !== "feedback" || !selectedStudent?.userId) return
    try {
      setLoadingFeedbacks(true)
      const response = await feedbackApi.getStudentFeedbacks(selectedStudent.userId)
      setFeedbacks(response.feedbacks || [])
    } catch (error) {
      console.error("Error fetching student feedbacks:", error)
      setFeedbacks([])
    } finally {
      setLoadingFeedbacks(false)
    }
  }

  useEffect(() => {
    if (selectedStudent?.userId && !isImport) {
      fetchStudentDetails()
    } else if (isImport) {
      console.log("Selected Student for Import:", selectedStudent)

      setStudentDetails({
        ...selectedStudent,
        image: selectedStudent.profileImage || "",
        rollNumber: selectedStudent.rollNumber || "",
        department: selectedStudent.department || "",
        degree: selectedStudent.degree || "",
        year: selectedStudent.year || "",
        admissionDate: selectedStudent.admissionDate || "",
        hostel: selectedStudent.hostel || "",
        unit: selectedStudent.unit || "",
        room: selectedStudent.room || "",
        bedNumber: selectedStudent.bedNumber || "",
      })
      setLoading(false)
    }
  }, [selectedStudent?.userId])

  // Fetch data for active tab
  useEffect(() => {
    if (!isImport && selectedStudent?.userId) {
      switch (activeTab) {
        case "complaints":
          fetchStudentComplaints()
          break
        case "access":
          fetchStudentAccessHistory()
          break
        case "visitors":
          fetchStudentVisitorRequests()
          break
        case "feedback":
          fetchStudentFeedbacks()
          break
        default:
          break
      }
    }
  }, [activeTab, selectedStudent?.userId])

  if (!selectedStudent) return null

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "N/A"
    return new Date(dateTimeString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <>
            <div className="bg-gradient-to-r from-blue-50 to-white p-5 rounded-xl mb-6 shadow-sm">
              <div className="flex flex-col md:flex-row items-center md:items-start">
                {studentDetails.profileImage ? (
                  <img src={studentDetails.profileImage} alt={studentDetails.name || "Student"} className="h-24 w-24 rounded-full object-cover border-4 border-[#1360AB] shadow-md mb-4 md:mb-0" />
                ) : (
                  <div className="flex items-center justify-center h-24 w-24 rounded-full bg-blue-100 border-4 border-[#1360AB] shadow-md mb-4 md:mb-0">
                    <FaUserGraduate className="h-12 w-12 text-[#1360AB]" />
                  </div>
                )}
                <div className="md:ml-6 flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold text-gray-800">{studentDetails.name || "N/A"}</h3>
                  <p className="text-gray-500 mb-2 font-mono">{studentDetails.rollNumber || "N/A"}</p>

                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                    <div className="flex items-center justify-center md:justify-start">
                      <FaEnvelope className="text-[#1360AB] mr-2 flex-shrink-0" />
                      <span className="text-gray-700 text-sm truncate">{studentDetails.email || "N/A"}</span>
                    </div>
                    <div className="flex items-center justify-center md:justify-start">
                      <FaPhone className="text-[#1360AB] mr-2 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{studentDetails.phone || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-gray-50 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3 pb-2 border-b border-gray-200">
                  <FaUserGraduate className="text-[#1360AB] mr-2 flex-shrink-0" />
                  <h4 className="text-sm font-semibold text-[#1360AB]">Academic Information</h4>
                </div>
                <div className="space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Department:</span>
                    <span className="font-medium text-sm">{studentDetails.department || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Degree:</span>
                    <span className="font-medium text-sm">{studentDetails.degree || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Year:</span>
                    <span className="font-medium text-sm">{studentDetails.year || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Admission Date:</span>
                    <span className="font-medium text-sm">{formatDate(studentDetails.admissionDate)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3 pb-2 border-b border-gray-200">
                  <FaBuilding className="text-[#1360AB] mr-2 flex-shrink-0" />
                  <h4 className="text-sm font-semibold text-[#1360AB]">Hostel Information</h4>
                </div>
                <div className="space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Hostel:</span>
                    <span className="font-medium text-sm">{studentDetails.hostel || "N/A"}</span>
                  </div>
                  {studentDetails.hostelType === "unit-based" && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Unit Number:</span>
                      <span className="font-medium text-sm">{studentDetails.unit || "N/A"}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Room Number:</span>
                    <span className="font-medium text-sm">{studentDetails.room || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Bed Number:</span>
                    <span className="font-medium text-sm">{studentDetails.bedNumber || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3 pb-2 border-b border-gray-200">
                  <FaCalendarAlt className="text-[#1360AB] mr-2 flex-shrink-0" />
                  <h4 className="text-sm font-semibold text-[#1360AB]">Personal Information</h4>
                </div>
                <div className="space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Gender:</span>
                    <span className="font-medium text-sm">{studentDetails.gender || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Date of Birth:</span>
                    <span className="font-medium text-sm">{formatDate(studentDetails.dateOfBirth)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-600 text-sm mb-1">Address:</span>
                    <span className="font-medium text-sm">{studentDetails.address || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3 pb-2 border-b border-gray-200">
                  <FaMapMarkerAlt className="text-[#1360AB] mr-2 flex-shrink-0" />
                  <h4 className="text-sm font-semibold text-[#1360AB]">Guardian Information</h4>
                </div>
                <div className="space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Guardian Name:</span>
                    <span className="font-medium text-sm">{studentDetails.guardian || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Guardian Phone:</span>
                    <span className="font-medium text-sm">{studentDetails.guardianPhone || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Guardian Email:</span>
                    <span className="font-medium text-sm">{studentDetails.guardianEmail || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )
      case "complaints":
        return (
          <div className="bg-white">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Complaints History</h3>
            {loadingComplaints ? (
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
                      <tr key={complaint._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(complaint.createdAt)}</td>
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
          </div>
        )
      case "access":
        return (
          <div className="bg-white">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Access History</h3>
            {loadingAccessRecords ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1360AB]"></div>
              </div>
            ) : accessRecords.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-lg">
                <FaHistory className="mx-auto text-gray-300 mb-2 text-4xl" />
                <p className="text-gray-500">No access records found for this student</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recorded By</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {accessRecords.map((record) => (
                      <tr key={record._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(record.dateAndTime)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${record.status === "Checked In" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}
                          >
                            {record.status === "Checked In" ? "Checked In" : "Checked Out"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.recordedBy || "System"}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{record.notes || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      case "visitors":
        return (
          <div className="bg-white">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Visitor Requests</h3>
            {loadingVisitorRequests ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1360AB]"></div>
              </div>
            ) : visitorRequests.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-lg">
                <FaUserFriends className="mx-auto text-gray-300 mb-2 text-4xl" />
                <p className="text-gray-500">No visitor requests found for this student</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visitors</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visit Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {visitorRequests.map((request) => (
                      <tr key={request._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(request.createdAt)}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{request.visitors && request.visitors.length > 0 ? request.visitors.map((v) => v.name).join(", ") : request.visitorNames || "-"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(request.fromDate)} to {formatDate(request.toDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${request.status === "Pending" ? "bg-yellow-100 text-yellow-800" : request.status === "Approved" ? "bg-green-100 text-green-800" : request.status === "Completed" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"}`}
                          >
                            {request.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      case "feedback":
        return (
          <div className="bg-white">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Feedback History</h3>
            {loadingFeedbacks ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1360AB]"></div>
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-lg">
                <FaComments className="mx-auto text-gray-300 mb-2 text-4xl" />
                <p className="text-gray-500">No feedback found for this student</p>
              </div>
            ) : (
              <div className="space-y-4">
                {feedbacks.map((feedback) => (
                  <div key={feedback._id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <h4 className="font-medium text-gray-800">{feedback.title}</h4>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${feedback.status === "Pending" ? "bg-yellow-100 text-yellow-800" : feedback.status === "Resolved" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}
                      >
                        {feedback.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{feedback.description}</p>
                    <div className="text-xs text-gray-500 flex justify-between">
                      <span>Submitted on: {formatDate(feedback.createdAt)}</span>
                      {feedback.reply && <span className="text-green-600">Replied: Yes</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      case "disco":
        return <DisCoActions userId={selectedStudent.userId} />
      default:
        return null
    }
  }

  return (
    <>
      <Modal title="Student Profile" onClose={() => setShowStudentDetail(false)} width={800}>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative w-16 h-16">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-[#1360AB] rounded-full animate-spin border-t-transparent"></div>
            </div>
          </div>
        ) : (
          <>
            {/* Tabs Navigation */}
            {!isImport && (
              <div className="border-b border-gray-200 mb-6">
                <nav className="flex -mb-px space-x-8">
                  <button onClick={() => setActiveTab("profile")} className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === "profile" ? "border-[#1360AB] text-[#1360AB]" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
                    <FaUserGraduate className="mr-2" />
                    Profile
                  </button>
                  <button onClick={() => setActiveTab("complaints")} className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === "complaints" ? "border-[#1360AB] text-[#1360AB]" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
                    <FaClipboardList className="mr-2" />
                    Complaints
                  </button>
                  <button onClick={() => setActiveTab("access")} className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === "access" ? "border-[#1360AB] text-[#1360AB]" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
                    <FaHistory className="mr-2" />
                    Access History
                  </button>
                  <button onClick={() => setActiveTab("visitors")} className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === "visitors" ? "border-[#1360AB] text-[#1360AB]" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
                    <FaUserFriends className="mr-2" />
                    Visitors
                  </button>
                  <button onClick={() => setActiveTab("feedback")} className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === "feedback" ? "border-[#1360AB] text-[#1360AB]" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
                    <FaComments className="mr-2" />
                    Feedback
                  </button>
                  <button onClick={() => setActiveTab("disco")} className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === "disco" ? "border-[#1360AB] text-[#1360AB]" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
                    <FaUserFriends className="mr-2" />
                    DisCo Actions
                  </button>
                </nav>
              </div>
            )}

            {/* Tab Content */}
            {renderTabContent()}

            <div className="mt-6 flex justify-end space-x-4 pt-4 border-t border-gray-100">
              {!isImport && (
                <>
                  <a href={`mailto:${studentDetails.guardianEmail}`} className="px-4 py-2.5 bg-[#1360AB] text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                    Email Guardian
                  </a>
                  <a href={`mailto:${studentDetails.email}`} className="px-4 py-2.5 bg-[#1360AB] text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                    Email Student
                  </a>
                  <button onClick={() => setShowEditModal(true)} className="px-4 py-2.5 bg-[#1360AB] text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                    Edit Student
                  </button>
                </>
              )}
              <button onClick={() => setShowStudentDetail(false)} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Close
              </button>
            </div>
          </>
        )}
      </Modal>

      {showEditModal && (
        <EditStudentModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          studentData={studentDetails}
          onUpdate={() => {
            fetchStudentDetails()
            if (onUpdate) onUpdate()
          }}
        />
      )}
    </>
  )
}

export default StudentDetailModal
