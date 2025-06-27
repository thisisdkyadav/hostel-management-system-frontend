import React, { useState, useEffect, useRef } from "react"
import {
  FaEnvelope,
  FaPhone,
  FaUserGraduate,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaBuilding,
  FaClipboardList,
  FaHistory,
  FaUserFriends,
  FaComments,
  FaUsers,
  FaHeartbeat,
  FaBoxes,
  FaPlus,
  FaEdit,
  FaTrash,
  FaUndo,
  FaIdCard,
  FaExpand,
  FaRegClock,
  FaCheck,
  FaTimes,
  FaUserCheck,
  FaUserSlash,
  FaUserClock,
} from "react-icons/fa"
import { studentApi } from "../../../services/apiService"
import { visitorApi } from "../../../services/visitorApi"
import { securityApi } from "../../../services/securityApi"
import { feedbackApi } from "../../../services/feedbackApi"
import { inventoryApi } from "../../../services/inventoryApi"
import { IDcardApi } from "../../../services/IDcardApi"
import Modal from "../../common/Modal"
import EditStudentModal from "./EditStudentModal"
import DisCoActions from "./DisCoActions"
import FamilyDetails from "./FamilyDetails"
import HealthTab from "./HealthTab"
import { useAuth } from "../../../contexts/AuthProvider"
import { getMediaUrl } from "../../../utils/mediaUtils"

const StudentDetailModal = ({ selectedStudent, setShowStudentDetail, onUpdate, isImport = false }) => {
  const { user, canAccess } = useAuth()

  const [studentDetails, setStudentDetails] = useState({})
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")

  // Data for different tabs
  const [complaints, setComplaints] = useState([])
  const [accessRecords, setAccessRecords] = useState([])
  const [visitorRequests, setVisitorRequests] = useState([])
  const [feedbacks, setFeedbacks] = useState([])
  const [studentInventory, setStudentInventory] = useState([])
  const [idCardData, setIdCardData] = useState({ front: null, back: null })

  // Loading states for different tabs
  const [loadingComplaints, setLoadingComplaints] = useState(false)
  const [loadingAccessRecords, setLoadingAccessRecords] = useState(false)
  const [loadingVisitorRequests, setLoadingVisitorRequests] = useState(false)
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false)
  const [loadingInventory, setLoadingInventory] = useState(false)
  const [loadingIdCard, setLoadingIdCard] = useState(false)

  // Inventory state
  const [showInventoryModal, setShowInventoryModal] = useState(false)
  const [inventoryModalType, setInventoryModalType] = useState("") // 'assign', 'edit'
  const [selectedInventoryItem, setSelectedInventoryItem] = useState(null)
  const [availableInventory, setAvailableInventory] = useState([])
  const [inventoryFormData, setInventoryFormData] = useState({
    studentProfileId: "",
    hostelInventoryId: "",
    itemTypeId: "",
    count: 1,
    status: "Issued",
    condition: "Good",
    notes: "",
  })

  // Define tabs for modal
  const modalTabs = [
    { id: "profile", name: "Profile", icon: <FaUserGraduate /> },
    { id: "complaints", name: "Complaints", icon: <FaClipboardList /> },
    { id: "access", name: "Access History", icon: <FaHistory /> },
    { id: "visitors", name: "Visitors", icon: <FaUserFriends /> },
    { id: "feedback", name: "Feedback", icon: <FaComments /> },
    { id: "inventory", name: "Inventory", icon: <FaBoxes /> },
    { id: "idcard", name: "ID Card", icon: <FaIdCard /> },
    { id: "disco", name: "DisCo Actions", icon: <FaUserFriends /> },
    { id: "family", name: "Family", icon: <FaUsers /> },
    { id: "health", name: "Health", icon: <FaHeartbeat /> },
  ]

  const fetchStudentDetails = async () => {
    try {
      setLoading(true)
      const response = await studentApi.getStudentDetails(selectedStudent.userId)
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

  const fetchStudentIdCard = async () => {
    if (activeTab !== "idcard" || !selectedStudent?.userId) return
    try {
      setLoadingIdCard(true)
      const data = await IDcardApi.getIDcard(selectedStudent.userId)
      setIdCardData(data)
    } catch (error) {
      console.error("Error fetching student ID card:", error)
      setIdCardData({ front: null, back: null })
    } finally {
      setLoadingIdCard(false)
    }
  }

  const fetchStudentInventory = async () => {
    if (activeTab !== "inventory" || !selectedStudent?._id) return
    try {
      setLoadingInventory(true)
      const response = await inventoryApi.getStudentInventoryByStudentId(selectedStudent._id)
      setStudentInventory(response || [])
    } catch (error) {
      console.error("Error fetching student inventory:", error)
      setStudentInventory([])
    } finally {
      setLoadingInventory(false)
    }
  }

  const fetchAvailableInventory = async () => {
    if (!showInventoryModal || !selectedStudent?._id) return
    try {
      const response = await inventoryApi.getAllHostelInventory({ limit: 100 })
      // Filter to only show items with available count > 0
      setAvailableInventory(response.data.filter((item) => item.availableCount > 0))
    } catch (error) {
      console.error("Error fetching available inventory:", error)
      setAvailableInventory([])
    }
  }

  useEffect(() => {
    if (selectedStudent?.userId && !isImport) {
      fetchStudentDetails()
    } else if (isImport) {
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
        case "inventory":
          fetchStudentInventory()
          break
        case "idcard":
          fetchStudentIdCard()
          break
        default:
          break
      }
    }
  }, [activeTab, selectedStudent?.userId])

  // Fetch available inventory when modal opens
  useEffect(() => {
    if (showInventoryModal) {
      fetchAvailableInventory()
    }
  }, [showInventoryModal])

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
                  <img src={getMediaUrl(studentDetails.profileImage)} alt={studentDetails.name || "Student"} className="h-24 w-24 rounded-full object-cover border-4 border-[#1360AB] shadow-md mb-4 md:mb-0" />
                ) : (
                  <div className="flex items-center justify-center h-24 w-24 rounded-full bg-blue-100 border-4 border-[#1360AB] shadow-md mb-4 md:mb-0">
                    <FaUserGraduate className="h-12 w-12 text-[#1360AB]" />
                  </div>
                )}
                <div className="md:ml-6 flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h3 className="text-2xl font-bold text-gray-800">{studentDetails.name || "N/A"}</h3>
                    {studentDetails.status && (
                      <div className="mt-2 md:mt-0 flex justify-center md:justify-start">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm flex items-center ${
                            studentDetails.status === "Active"
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : studentDetails.status === "Graduated"
                              ? "bg-blue-100 text-blue-800 border border-blue-200"
                              : studentDetails.status === "Dropped"
                              ? "bg-red-100 text-red-800 border border-red-200"
                              : studentDetails.status === "Inactive"
                              ? "bg-gray-100 text-gray-800 border border-gray-200"
                              : "bg-purple-100 text-purple-800 border border-purple-200"
                          }`}
                        >
                          {studentDetails.status === "Active" && <FaUserCheck className="mr-1" />}
                          {studentDetails.status === "Graduated" && <FaUserGraduate className="mr-1" />}
                          {studentDetails.status === "Dropped" && <FaUserSlash className="mr-1" />}
                          {studentDetails.status === "Inactive" && <FaUserClock className="mr-1" />}
                          {!["Active", "Graduated", "Dropped", "Inactive"].includes(studentDetails.status) && <FaUserGraduate className="mr-1" />}
                          {studentDetails.status || "Active"}
                        </span>
                      </div>
                    )}
                  </div>
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
                  <h4 className="text-sm font-semibold text-[#1360AB]">Emergency Contact</h4>
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

              {/* if day scholar is true then show the day scholar details */}
              {studentDetails.isDayScholar && (
                <div className="bg-gray-50 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-3 pb-2 border-b border-gray-200">
                    <h4 className="text-sm font-semibold text-[#1360AB]">Day Scholar Details</h4>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Address:</span>
                      <span className="font-medium text-sm">{studentDetails.dayScholarDetails.address || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Owner Name:</span>
                      <span className="font-medium text-sm">{studentDetails.dayScholarDetails.ownerName || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Owner Phone:</span>
                      <span className="font-medium text-sm">{studentDetails.dayScholarDetails.ownerPhone || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Owner Email:</span>
                      <span className="font-medium text-sm">{studentDetails.dayScholarDetails.ownerEmail || "N/A"}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )

      case "family":
        return <FamilyDetails userId={selectedStudent.userId} />

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
      case "inventory":
        return (
          <div className="bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Student Inventory</h3>
              {user && canAccess("student_inventory", "create") && ["Warden", "Associate Warden", "Hostel Supervisor"].includes(user.role) && (
                <button onClick={handleOpenAssignInventory} className="flex items-center justify-center gap-2 bg-[#1360AB] hover:bg-blue-700 text-white py-1.5 px-3 rounded-lg transition-colors text-sm">
                  <FaPlus size={14} /> Assign Item
                </button>
              )}
            </div>

            {loadingInventory ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1360AB]"></div>
              </div>
            ) : studentInventory.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-lg">
                <FaBoxes className="mx-auto text-gray-300 mb-2 text-4xl" />
                <p className="text-gray-500">No inventory items assigned to this student</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                      {user && canAccess("student_inventory", "edit") && ["Warden", "Associate Warden", "Hostel Supervisor"].includes(user.role) && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {studentInventory.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-[#E4F1FF] flex items-center justify-center mr-3">
                              <FaBoxes className="text-[#1360AB]" />
                            </div>
                            <span className="font-medium text-gray-800">{item.itemTypeId.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">{item.count}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{formatDate(item.issueDate)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${item.status === "Issued" ? "bg-green-100 text-green-800" : item.status === "Damaged" ? "bg-red-100 text-red-800" : item.status === "Lost" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{item.condition}</td>
                        {user && canAccess("student_inventory", "edit") && ["Warden", "Associate Warden", "Hostel Supervisor"].includes(user.role) && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => {
                                  setSelectedInventoryItem(item)
                                  setInventoryFormData({
                                    studentProfileId: selectedStudent._id,
                                    hostelInventoryId: item.hostelInventoryId,
                                    itemTypeId: item.itemTypeId._id,
                                    count: item.count,
                                    status: item.status,
                                    condition: item.condition,
                                    notes: item.notes || "",
                                  })
                                  setInventoryModalType("edit")
                                  setShowInventoryModal(true)
                                }}
                                className="w-8 h-8 rounded-full bg-[#E4F1FF] flex items-center justify-center text-[#1360AB] hover:bg-[#1360AB] hover:text-white transition-all"
                                title="View/Edit Item"
                              >
                                <FaEdit />
                              </button>
                              {item.status === "Issued" && (
                                <button
                                  onClick={() => {
                                    setSelectedInventoryItem(item)
                                    setInventoryFormData({
                                      studentProfileId: selectedStudent._id,
                                      hostelInventoryId: item.hostelInventoryId,
                                      itemTypeId: item.itemTypeId._id,
                                      count: item.count,
                                      status: item.status,
                                      condition: item.condition,
                                      notes: "",
                                    })
                                    setInventoryModalType("return")
                                    setShowInventoryModal(true)
                                  }}
                                  className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600 hover:bg-green-600 hover:text-white transition-all"
                                  title="Return Item"
                                >
                                  <FaUndo />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      case "idcard":
        return (
          <div className="bg-white">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Student ID Card</h3>

            {loadingIdCard ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1360AB]"></div>
              </div>
            ) : !idCardData.front && !idCardData.back ? (
              <div className="text-center py-10 bg-gray-50 rounded-lg">
                <FaIdCard className="mx-auto text-gray-300 mb-2 text-4xl" />
                <p className="text-gray-500">No ID card images found for this student</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Front ID Card */}
                <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all border border-gray-200">
                  <h4 className="text-base font-semibold text-gray-700 mb-3">ID Card Front</h4>
                  {idCardData.front ? (
                    <div className="relative w-full">
                      <div className="overflow-hidden rounded-lg max-h-[280px] flex items-center justify-center border border-gray-200">
                        <img src={getMediaUrl(idCardData.front)} alt="ID Card Front" className="object-contain w-full max-h-[280px]" />
                      </div>

                      <div className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-sm">
                        <a href={idCardData.front} target="_blank" rel="noopener noreferrer" className="text-[#1360AB]">
                          <FaExpand size={14} />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gray-100 flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300">
                      <FaIdCard className="text-gray-300 mb-2 text-4xl" />
                      <p className="text-gray-500 text-sm">Front side not uploaded</p>
                    </div>
                  )}
                </div>

                {/* Back ID Card */}
                <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all border border-gray-200">
                  <h4 className="text-base font-semibold text-gray-700 mb-3">ID Card Back</h4>
                  {idCardData.back ? (
                    <div className="relative w-full">
                      <div className="overflow-hidden rounded-lg max-h-[280px] flex items-center justify-center border border-gray-200">
                        <img src={getMediaUrl(idCardData.back)} alt="ID Card Back" className="object-contain w-full max-h-[280px]" />
                      </div>

                      <div className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-sm">
                        <a href={idCardData.back} target="_blank" rel="noopener noreferrer" className="text-[#1360AB]">
                          <FaExpand size={14} />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gray-100 flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300">
                      <FaIdCard className="text-gray-300 mb-2 text-4xl" />
                      <p className="text-gray-500 text-sm">Back side not uploaded</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      case "disco":
        return <DisCoActions userId={selectedStudent.userId} />
      case "health":
        return <HealthTab userId={selectedStudent.userId} />
      default:
        return null
    }
  }

  // Handle view item
  const handleViewItem = (item) => {
    setSelectedInventoryItem(item)
    setInventoryFormData({
      studentProfileId: selectedStudent._id,
      hostelInventoryId: item.hostelInventoryId,
      itemTypeId: item.itemTypeId._id,
      count: item.count,
      status: item.status,
      condition: item.condition,
      notes: item.notes || "",
    })
    setInventoryModalType("view")
    setShowInventoryModal(true)
  }

  // Handle opening inventory assignment modal
  const handleOpenAssignInventory = () => {
    setInventoryFormData({
      studentProfileId: selectedStudent._id,
      hostelInventoryId: "",
      itemTypeId: "",
      count: 1,
      status: "Issued",
      condition: "Good",
      notes: "",
    })
    setInventoryModalType("assign")
    setShowInventoryModal(true)
  }

  // Handle inventory form submission
  const handleInventorySubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (inventoryModalType === "assign") {
        await inventoryApi.assignInventoryToStudent(inventoryFormData)
      } else if (inventoryModalType === "edit") {
        await inventoryApi.updateStudentInventoryStatus(selectedInventoryItem._id, {
          status: inventoryFormData.status,
          condition: inventoryFormData.condition,
          notes: inventoryFormData.notes,
        })
      }
      closeInventoryModal()
      fetchStudentInventory()
    } catch (err) {
      console.error("Error with inventory action:", err)
    } finally {
      setLoading(false)
    }
  }

  // Handle returning inventory item
  const handleReturnInventory = async () => {
    if (!window.confirm("Are you sure you want to return this item?")) return

    setLoading(true)
    try {
      await inventoryApi.returnStudentInventory(selectedInventoryItem._id, {
        condition: inventoryFormData.condition,
        notes: inventoryFormData.notes || "Item returned",
      })
      closeInventoryModal()
      fetchStudentInventory()
    } catch (err) {
      console.error("Error returning inventory item:", err)
    } finally {
      setLoading(false)
    }
  }

  // Close inventory modal
  const closeInventoryModal = () => {
    setShowInventoryModal(false)
    setSelectedInventoryItem(null)
    setInventoryFormData({
      studentProfileId: selectedStudent._id,
      hostelInventoryId: "",
      itemTypeId: "",
      count: 1,
      status: "Issued",
      condition: "Good",
      notes: "",
    })
  }

  // Get max count for selected inventory
  const getMaxCount = () => {
    if (!inventoryFormData.hostelInventoryId) return 1
    const selectedInventory = availableInventory.find((item) => item._id === inventoryFormData.hostelInventoryId)
    return selectedInventory ? selectedInventory.availableCount : 1
  }

  // Handle inventory form change
  const handleInventoryFormChange = (e) => {
    const { name, value } = e.target

    if (name === "hostelInventoryId") {
      const selectedInventory = availableInventory.find((item) => item._id === value)
      if (selectedInventory) {
        setInventoryFormData((prev) => ({
          ...prev,
          [name]: value,
          itemTypeId: selectedInventory.itemTypeId._id,
        }))
      }
    } else {
      setInventoryFormData((prev) => ({
        ...prev,
        [name]: name === "count" ? Math.max(1, parseInt(value) || 1) : value,
      }))
    }
  }

  // Define render footer function
  const renderFooter = () => {
    if (loading) return null

    return (
      <div className="flex justify-end space-x-4">
        {!isImport && (
          <>
            <a href={`mailto:${studentDetails.guardianEmail}`} className="px-4 py-2.5 bg-[#1360AB] text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
              Email Guardian
            </a>
            <a href={`mailto:${studentDetails.email}`} className="px-4 py-2.5 bg-[#1360AB] text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
              Email Student
            </a>
            {canAccess("students_info", "edit") && (
              <button onClick={() => setShowEditModal(true)} className="px-4 py-2.5 bg-[#1360AB] text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                Edit Student
              </button>
            )}
          </>
        )}
        <button onClick={() => setShowStudentDetail(false)} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
          Close
        </button>
      </div>
    )
  }

  return (
    <>
      <Modal title="Student Profile" onClose={() => setShowStudentDetail(false)} width={1200} tabs={!isImport ? modalTabs : null} activeTab={activeTab} onTabChange={setActiveTab} hideTitle={!isImport} footer={renderFooter()} fullHeight={true}>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative w-16 h-16">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-[#1360AB] rounded-full animate-spin border-t-transparent"></div>
            </div>
          </div>
        ) : (
          <>
            {/* Tab Content */}
            {renderTabContent()}
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

      {/* Inventory Modal */}
      {showInventoryModal && (
        <Modal
          title={inventoryModalType === "assign" ? "Assign Inventory Item" : inventoryModalType === "edit" ? "View/Edit Inventory Item" : "Return Inventory Item"}
          onClose={closeInventoryModal}
          footer={
            <div className="flex justify-end gap-3">
              <button type="button" onClick={closeInventoryModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                Cancel
              </button>

              {/* Return button - only for return mode */}
              {inventoryModalType === "return" && (
                <button type="button" onClick={handleReturnInventory} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center min-w-[100px]">
                  {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Return Item"}
                </button>
              )}

              {/* Submit button - only for assign and edit modes */}
              {(inventoryModalType === "assign" || inventoryModalType === "edit") && (
                <button type="submit" form="inventory-form" disabled={loading || (inventoryModalType === "assign" && !inventoryFormData.hostelInventoryId)} className="px-4 py-2 bg-[#1360AB] text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center min-w-[100px]">
                  {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : inventoryModalType === "assign" ? "Assign Item" : "Update Item"}
                </button>
              )}
            </div>
          }
        >
          <form id="inventory-form" onSubmit={handleInventorySubmit} className="space-y-4">
            {/* Item details for edit/return modals */}
            {(inventoryModalType === "edit" || inventoryModalType === "return") && selectedInventoryItem && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#E4F1FF] flex items-center justify-center mr-3">
                    <FaBoxes className="text-[#1360AB]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{selectedInventoryItem.itemTypeId.name}</h3>
                    <div className="flex space-x-2 text-sm">
                      <span className="text-gray-500">Qty: {selectedInventoryItem.count}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-500">Issued: {formatDate(selectedInventoryItem.issueDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Item selection - only for assign */}
            {inventoryModalType === "assign" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
                <select name="hostelInventoryId" value={inventoryFormData.hostelInventoryId} onChange={handleInventoryFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1360AB]" required>
                  <option value="">Select Item</option>
                  {availableInventory.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.itemTypeId.name} - Available: {item.availableCount}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Count - only for assign */}
            {inventoryModalType === "assign" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Count</label>
                <input type="number" name="count" value={inventoryFormData.count} onChange={handleInventoryFormChange} min="1" max={getMaxCount()} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1360AB]" required />
                {inventoryFormData.hostelInventoryId && <p className="text-xs text-gray-500 mt-1">Maximum available: {getMaxCount()}</p>}
              </div>
            )}

            {/* Status - only for edit */}
            {inventoryModalType === "edit" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select name="status" value={inventoryFormData.status} onChange={handleInventoryFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1360AB]" required>
                  <option value="Issued">Issued</option>
                  <option value="Damaged">Damaged</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>
            )}

            {/* Condition - for all modes */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
              <select name="condition" value={inventoryFormData.condition} onChange={handleInventoryFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1360AB]" required>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>

            {/* Notes - for all modes */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                name="notes"
                value={inventoryFormData.notes}
                onChange={handleInventoryFormChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1360AB]"
                placeholder={inventoryModalType === "assign" ? "Any additional notes..." : inventoryModalType === "edit" ? "Update notes..." : "Notes about returned item..."}
              ></textarea>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}

export default StudentDetailModal
