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
import { studentApi } from "../../../service"
import { visitorApi } from "../../../service"
import { securityApi } from "../../../service"
import { feedbackApi } from "../../../service"
import { inventoryApi, idCardApi } from "../../../service"
import Modal from "../../common/Modal"
import EditStudentModal from "./EditStudentModal"
import DisCoActions from "./DisCoActions"
import Certificates from "./Certificates"
import FamilyDetails from "./FamilyDetails"
import HealthTab from "./HealthTab"
import ComplaintsTab from "./tabs/ComplaintsTab"
import { useAuth } from "../../../contexts/AuthProvider"
import { getMediaUrl } from "../../../utils/mediaUtils"
import Button from "../../common/Button"
import Input from "../ui/Input"
import Select from "../ui/Select"

const StudentDetailModal = ({ selectedStudent, setShowStudentDetail, onUpdate, isImport = false }) => {
  const { user, canAccess } = useAuth()

  const [studentDetails, setStudentDetails] = useState({})
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")

  // Data for different tabs
  const [accessRecords, setAccessRecords] = useState([])
  const [visitorRequests, setVisitorRequests] = useState([])
  const [feedbacks, setFeedbacks] = useState([])
  const [studentInventory, setStudentInventory] = useState([])
  const [idCardData, setIdCardData] = useState({ front: null, back: null })

  // Loading states for different tabs
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
    { id: "certificates", name: "Certificates", icon: <FaIdCard /> },
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
            <div style={{ background: "linear-gradient(to right, var(--color-primary-bg), var(--color-bg-primary))", padding: "var(--spacing-5)", borderRadius: "var(--radius-xl)", marginBottom: "var(--spacing-6)", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start" }}>
                {/* Profile Image - Left */}
                {studentDetails.profileImage ? (
                  <img
                    src={getMediaUrl(studentDetails.profileImage)}
                    alt={studentDetails.name || "Student"}
                    style={{ height: "var(--avatar-2xl)", width: "var(--avatar-2xl)", borderRadius: "var(--radius-full)", objectFit: "cover", border: "var(--border-4) solid var(--color-primary)", boxShadow: "var(--shadow-md)", flexShrink: 0 }}
                  />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "var(--avatar-2xl)",
                      width: "var(--avatar-2xl)",
                      borderRadius: "var(--radius-full)",
                      backgroundColor: "var(--color-primary)",
                      border: "var(--border-4) solid var(--color-primary)",
                      boxShadow: "var(--shadow-md)",
                      flexShrink: 0,
                    }}
                  >
                    <FaUserGraduate style={{ height: "var(--icon-3xl)", width: "var(--icon-3xl)", color: "var(--color-white)" }} />
                  </div>
                )}

                {/* Details - Middle */}
                <div style={{ marginLeft: "var(--spacing-6)", flex: 1, textAlign: "left" }}>
                  <h3 style={{ fontSize: "var(--font-size-2xl)", fontWeight: "var(--font-weight-bold)", color: "var(--color-text-secondary)", marginBottom: "var(--spacing-1)" }}>{studentDetails.name || "N/A"}</h3>
                  <p style={{ color: "var(--color-text-muted)", marginBottom: "var(--spacing-2)", fontFamily: "var(--font-mono)" }}>{studentDetails.rollNumber || "N/A"}</p>

                  <div style={{ display: "flex", flexDirection: "row", gap: "var(--spacing-4)", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <FaEnvelope style={{ color: "var(--color-primary)", marginRight: "var(--spacing-2)", flexShrink: 0 }} />
                      <span style={{ color: "var(--color-text-body)", fontSize: "var(--font-size-sm)" }}>{studentDetails.email || "N/A"}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <FaPhone style={{ color: "var(--color-primary)", marginRight: "var(--spacing-2)", flexShrink: 0 }} />
                      <span style={{ color: "var(--color-text-body)", fontSize: "var(--font-size-sm)" }}>{studentDetails.phone || "N/A"}</span>
                    </div>
                  </div>
                </div>

                {/* Status Badge - Far Right */}
                {studentDetails.status && (
                  <div style={{ flexShrink: 0 }}>
                    <span
                      style={{
                        padding: "var(--spacing-1) var(--spacing-3)",
                        borderRadius: "var(--radius-full)",
                        fontSize: "var(--font-size-xs)",
                        fontWeight: "var(--font-weight-medium)",
                        boxShadow: "var(--shadow-sm)",
                        display: "flex",
                        alignItems: "center",
                        backgroundColor:
                          studentDetails.status === "Active"
                            ? "var(--color-success-bg-light)"
                            : studentDetails.status === "Graduated"
                            ? "var(--color-primary-bg)"
                            : studentDetails.status === "Dropped"
                            ? "var(--color-danger-bg-light)"
                            : studentDetails.status === "Inactive"
                            ? "var(--color-bg-muted)"
                            : "var(--color-info-bg)",
                        color:
                          studentDetails.status === "Active"
                            ? "var(--color-success)"
                            : studentDetails.status === "Graduated"
                            ? "var(--color-primary)"
                            : studentDetails.status === "Dropped"
                            ? "var(--color-danger)"
                            : studentDetails.status === "Inactive"
                            ? "var(--color-text-secondary)"
                            : "var(--color-info)",
                        border: `var(--border-1) solid ${
                          studentDetails.status === "Active"
                            ? "var(--color-success-light)"
                            : studentDetails.status === "Graduated"
                            ? "var(--color-primary-light)"
                            : studentDetails.status === "Dropped"
                            ? "var(--color-danger-light)"
                            : studentDetails.status === "Inactive"
                            ? "var(--color-border-primary)"
                            : "var(--color-info-light)"
                        }`,
                      }}
                    >
                      {studentDetails.status === "Active" && <FaUserCheck style={{ marginRight: "var(--spacing-1)" }} />}
                      {studentDetails.status === "Graduated" && <FaUserGraduate style={{ marginRight: "var(--spacing-1)" }} />}
                      {studentDetails.status === "Dropped" && <FaUserSlash style={{ marginRight: "var(--spacing-1)" }} />}
                      {studentDetails.status === "Inactive" && <FaUserClock style={{ marginRight: "var(--spacing-1)" }} />}
                      {!["Active", "Graduated", "Dropped", "Inactive"].includes(studentDetails.status) && <FaUserGraduate style={{ marginRight: "var(--spacing-1)" }} />}
                      {studentDetails.status || "Active"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "var(--spacing-5)" }}>
              <div style={{ backgroundColor: "var(--color-bg-tertiary)", padding: "var(--spacing-5)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-sm)", transition: "var(--transition-all)" }}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "var(--spacing-3)", paddingBottom: "var(--spacing-2)", borderBottom: "var(--border-1) solid var(--color-border-primary)" }}>
                  <FaUserGraduate style={{ color: "var(--color-primary)", marginRight: "var(--spacing-2)", flexShrink: 0 }} />
                  <h4 style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-primary)" }}>Academic Information</h4>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2-5)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Department:</span>
                    <span style={{ fontWeight: "var(--font-weight-medium)", fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>{studentDetails.department || "N/A"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Degree:</span>
                    <span style={{ fontWeight: "var(--font-weight-medium)", fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>{studentDetails.degree || "N/A"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Year:</span>
                    <span style={{ fontWeight: "var(--font-weight-medium)", fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>{studentDetails.year || "N/A"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Admission Date:</span>
                    <span style={{ fontWeight: "var(--font-weight-medium)", fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>{formatDate(studentDetails.admissionDate)}</span>
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: "var(--color-bg-tertiary)", padding: "var(--spacing-5)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-sm)", transition: "var(--transition-all)" }}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "var(--spacing-3)", paddingBottom: "var(--spacing-2)", borderBottom: "var(--border-1) solid var(--color-border-primary)" }}>
                  <FaBuilding style={{ color: "var(--color-primary)", marginRight: "var(--spacing-2)", flexShrink: 0 }} />
                  <h4 style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-primary)" }}>Hostel Information</h4>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2-5)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Hostel:</span>
                    <span style={{ fontWeight: "var(--font-weight-medium)", fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>{studentDetails.hostel || "N/A"}</span>
                  </div>
                  {studentDetails.hostelType === "unit-based" && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Unit Number:</span>
                      <span style={{ fontWeight: "var(--font-weight-medium)", fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>{studentDetails.unit || "N/A"}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Room Number:</span>
                    <span style={{ fontWeight: "var(--font-weight-medium)", fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>{studentDetails.room || "N/A"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Bed Number:</span>
                    <span style={{ fontWeight: "var(--font-weight-medium)", fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>{studentDetails.bedNumber || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: "var(--color-bg-tertiary)", padding: "var(--spacing-5)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-sm)", transition: "var(--transition-all)" }}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "var(--spacing-3)", paddingBottom: "var(--spacing-2)", borderBottom: "var(--border-1) solid var(--color-border-primary)" }}>
                  <FaCalendarAlt style={{ color: "var(--color-primary)", marginRight: "var(--spacing-2)", flexShrink: 0 }} />
                  <h4 style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-primary)" }}>Personal Information</h4>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2-5)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Gender:</span>
                    <span style={{ fontWeight: "var(--font-weight-medium)", fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>{studentDetails.gender || "N/A"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Date of Birth:</span>
                    <span style={{ fontWeight: "var(--font-weight-medium)", fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>{formatDate(studentDetails.dateOfBirth)}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)", marginBottom: "var(--spacing-1)" }}>Address:</span>
                    <span style={{ fontWeight: "var(--font-weight-medium)", fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>{studentDetails.address || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: "var(--color-bg-tertiary)", padding: "var(--spacing-5)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-sm)", transition: "var(--transition-all)" }}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "var(--spacing-3)", paddingBottom: "var(--spacing-2)", borderBottom: "var(--border-1) solid var(--color-border-primary)" }}>
                  <FaMapMarkerAlt style={{ color: "var(--color-primary)", marginRight: "var(--spacing-2)", flexShrink: 0 }} />
                  <h4 style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-primary)" }}>Emergency Contact</h4>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2-5)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Guardian Name:</span>
                    <span style={{ fontWeight: "var(--font-weight-medium)", fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>{studentDetails.guardian || "N/A"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Guardian Phone:</span>
                    <span style={{ fontWeight: "var(--font-weight-medium)", fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>{studentDetails.guardianPhone || "N/A"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Guardian Email:</span>
                    <span style={{ fontWeight: "var(--font-weight-medium)", fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>{studentDetails.guardianEmail || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* if day scholar is true then show the day scholar details */}
              {studentDetails.isDayScholar && (
                <div style={{ backgroundColor: "var(--color-bg-tertiary)", padding: "var(--spacing-5)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-sm)", transition: "var(--transition-all)" }}>
                  <div style={{ display: "flex", alignItems: "center", marginBottom: "var(--spacing-3)", paddingBottom: "var(--spacing-2)", borderBottom: "var(--border-1) solid var(--color-border-primary)" }}>
                    <h4 style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-primary)" }}>Day Scholar Details</h4>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2-5)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Address:</span>
                      <span style={{ fontWeight: "var(--font-weight-medium)", fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>{studentDetails.dayScholarDetails.address || "N/A"}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Owner Name:</span>
                      <span style={{ fontWeight: "var(--font-weight-medium)", fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>{studentDetails.dayScholarDetails.ownerName || "N/A"}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Owner Phone:</span>
                      <span style={{ fontWeight: "var(--font-weight-medium)", fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>{studentDetails.dayScholarDetails.ownerPhone || "N/A"}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Owner Email:</span>
                      <span style={{ fontWeight: "var(--font-weight-medium)", fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>{studentDetails.dayScholarDetails.ownerEmail || "N/A"}</span>
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
        return <ComplaintsTab userId={selectedStudent.userId} />

      case "access":
        return (
          <div style={{ backgroundColor: "var(--color-bg-primary)" }}>
            <h3 style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-body)", marginBottom: "var(--spacing-4)" }}>Access History</h3>
            {loadingAccessRecords ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "var(--spacing-10) 0" }}>
                <div style={{ width: "var(--spacing-8)", height: "var(--spacing-8)", borderRadius: "var(--radius-full)", border: "var(--border-2) solid transparent", borderBottomColor: "var(--color-primary)", animation: "spin 1s linear infinite" }}></div>
              </div>
            ) : accessRecords.length === 0 ? (
              <div style={{ textAlign: "center", padding: "var(--spacing-10) 0", backgroundColor: "var(--color-bg-tertiary)", borderRadius: "var(--radius-lg)" }}>
                <FaHistory style={{ margin: "0 auto", color: "var(--color-text-disabled)", marginBottom: "var(--spacing-2)", fontSize: "var(--font-size-4xl)" }} />
                <p style={{ color: "var(--color-text-muted)" }}>No access records found for this student</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ minWidth: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ backgroundColor: "var(--color-bg-tertiary)" }}>
                    <tr>
                      <th style={{ padding: "var(--spacing-3) var(--spacing-6)", textAlign: "left", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Date & Time</th>
                      <th style={{ padding: "var(--spacing-3) var(--spacing-6)", textAlign: "left", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Type</th>
                      <th style={{ padding: "var(--spacing-3) var(--spacing-6)", textAlign: "left", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Recorded By</th>
                      <th style={{ padding: "var(--spacing-3) var(--spacing-6)", textAlign: "left", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accessRecords.map((record) => (
                      <tr key={record._id} style={{ borderBottom: "var(--border-1) solid var(--color-border-light)" }}>
                        <td style={{ padding: "var(--spacing-4) var(--spacing-6)", whiteSpace: "nowrap", fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>{formatDateTime(record.dateAndTime)}</td>
                        <td style={{ padding: "var(--spacing-4) var(--spacing-6)", whiteSpace: "nowrap" }}>
                          <span
                            style={{
                              padding: "var(--spacing-1) var(--spacing-2)",
                              display: "inline-flex",
                              fontSize: "var(--font-size-xs)",
                              lineHeight: 1.25,
                              fontWeight: "var(--font-weight-semibold)",
                              borderRadius: "var(--radius-full)",
                              backgroundColor: record.status === "Checked In" ? "var(--color-success-bg-light)" : "var(--color-primary-bg)",
                              color: record.status === "Checked In" ? "var(--color-success)" : "var(--color-primary)",
                            }}
                          >
                            {record.status === "Checked In" ? "Checked In" : "Checked Out"}
                          </span>
                        </td>
                        <td style={{ padding: "var(--spacing-4) var(--spacing-6)", whiteSpace: "nowrap", fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>{record.recordedBy || "System"}</td>
                        <td style={{ padding: "var(--spacing-4) var(--spacing-6)", fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>{record.notes || "-"}</td>
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
          <div style={{ backgroundColor: "var(--color-bg-primary)" }}>
            <h3 style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-body)", marginBottom: "var(--spacing-4)" }}>Visitor Requests</h3>
            {loadingVisitorRequests ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "var(--spacing-10) 0" }}>
                <div style={{ width: "var(--spacing-8)", height: "var(--spacing-8)", borderRadius: "var(--radius-full)", border: "var(--border-2) solid transparent", borderBottomColor: "var(--color-primary)", animation: "spin 1s linear infinite" }}></div>
              </div>
            ) : visitorRequests.length === 0 ? (
              <div style={{ textAlign: "center", padding: "var(--spacing-10) 0", backgroundColor: "var(--color-bg-tertiary)", borderRadius: "var(--radius-lg)" }}>
                <FaUserFriends style={{ margin: "0 auto", color: "var(--color-text-disabled)", marginBottom: "var(--spacing-2)", fontSize: "var(--font-size-4xl)" }} />
                <p style={{ color: "var(--color-text-muted)" }}>No visitor requests found for this student</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ minWidth: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ backgroundColor: "var(--color-bg-tertiary)" }}>
                    <tr>
                      <th style={{ padding: "var(--spacing-3) var(--spacing-6)", textAlign: "left", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Request Date</th>
                      <th style={{ padding: "var(--spacing-3) var(--spacing-6)", textAlign: "left", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Visitors</th>
                      <th style={{ padding: "var(--spacing-3) var(--spacing-6)", textAlign: "left", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Visit Date</th>
                      <th style={{ padding: "var(--spacing-3) var(--spacing-6)", textAlign: "left", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitorRequests.map((request) => (
                      <tr key={request._id} style={{ borderBottom: "var(--border-1) solid var(--color-border-light)" }}>
                        <td style={{ padding: "var(--spacing-4) var(--spacing-6)", whiteSpace: "nowrap", fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>{formatDate(request.createdAt)}</td>
                        <td style={{ padding: "var(--spacing-4) var(--spacing-6)", fontSize: "var(--font-size-sm)", color: "var(--color-text-primary)" }}>{request.visitors && request.visitors.length > 0 ? request.visitors.map((v) => v.name).join(", ") : request.visitorNames || "-"}</td>
                        <td style={{ padding: "var(--spacing-4) var(--spacing-6)", whiteSpace: "nowrap", fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
                          {formatDate(request.fromDate)} to {formatDate(request.toDate)}
                        </td>
                        <td style={{ padding: "var(--spacing-4) var(--spacing-6)", whiteSpace: "nowrap" }}>
                          <span
                            style={{
                              padding: "var(--spacing-1) var(--spacing-2)",
                              display: "inline-flex",
                              fontSize: "var(--font-size-xs)",
                              lineHeight: 1.25,
                              fontWeight: "var(--font-weight-semibold)",
                              borderRadius: "var(--radius-full)",
                              backgroundColor: request.status === "Pending" ? "var(--color-warning-bg-light)" : request.status === "Approved" ? "var(--color-success-bg-light)" : request.status === "Completed" ? "var(--color-primary-bg)" : "var(--color-danger-bg-light)",
                              color: request.status === "Pending" ? "var(--color-warning)" : request.status === "Approved" ? "var(--color-success)" : request.status === "Completed" ? "var(--color-primary)" : "var(--color-danger)",
                            }}
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
          <div style={{ backgroundColor: "var(--color-bg-primary)" }}>
            <h3 style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-body)", marginBottom: "var(--spacing-4)" }}>Feedback History</h3>
            {loadingFeedbacks ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "var(--spacing-10) 0" }}>
                <div style={{ width: "var(--spacing-8)", height: "var(--spacing-8)", borderRadius: "var(--radius-full)", border: "var(--border-2) solid transparent", borderBottomColor: "var(--color-primary)", animation: "spin 1s linear infinite" }}></div>
              </div>
            ) : feedbacks.length === 0 ? (
              <div style={{ textAlign: "center", padding: "var(--spacing-10) 0", backgroundColor: "var(--color-bg-tertiary)", borderRadius: "var(--radius-lg)" }}>
                <FaComments style={{ margin: "0 auto", color: "var(--color-text-disabled)", marginBottom: "var(--spacing-2)", fontSize: "var(--font-size-4xl)" }} />
                <p style={{ color: "var(--color-text-muted)" }}>No feedback found for this student</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
                {feedbacks.map((feedback) => (
                  <div key={feedback._id} style={{ backgroundColor: "var(--color-bg-tertiary)", padding: "var(--spacing-4)", borderRadius: "var(--radius-lg)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--spacing-2)" }}>
                      <h4 style={{ fontWeight: "var(--font-weight-medium)", color: "var(--color-text-secondary)" }}>{feedback.title}</h4>
                      <span
                        style={{
                          padding: "var(--spacing-1) var(--spacing-2)",
                          display: "inline-flex",
                          fontSize: "var(--font-size-xs)",
                          lineHeight: 1.25,
                          fontWeight: "var(--font-weight-semibold)",
                          borderRadius: "var(--radius-full)",
                          backgroundColor: feedback.status === "Pending" ? "var(--color-warning-bg-light)" : feedback.status === "Resolved" ? "var(--color-success-bg-light)" : "var(--color-primary-bg)",
                          color: feedback.status === "Pending" ? "var(--color-warning)" : feedback.status === "Resolved" ? "var(--color-success)" : "var(--color-primary)",
                        }}
                      >
                        {feedback.status}
                      </span>
                    </div>
                    <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)", marginBottom: "var(--spacing-2)" }}>{feedback.description}</p>
                    <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", display: "flex", justifyContent: "space-between" }}>
                      <span>Submitted on: {formatDate(feedback.createdAt)}</span>
                      {feedback.reply && <span style={{ color: "var(--color-success)" }}>Replied: Yes</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      case "inventory":
        return (
          <div style={{ backgroundColor: "var(--color-bg-primary)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--spacing-4)" }}>
              <h3 style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-body)" }}>Student Inventory</h3>
              {user && canAccess("student_inventory", "create") && ["Warden", "Associate Warden", "Hostel Supervisor"].includes(user.role) && (
                <Button onClick={handleOpenAssignInventory} variant="primary" size="small" icon={<FaPlus size={14} />}>
                  Assign Item
                </Button>
              )}
            </div>

            {loadingInventory ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "var(--spacing-10) 0" }}>
                <div style={{ width: "var(--spacing-8)", height: "var(--spacing-8)", borderRadius: "var(--radius-full)", border: "var(--border-2) solid transparent", borderBottomColor: "var(--color-primary)", animation: "spin 1s linear infinite" }}></div>
              </div>
            ) : studentInventory.length === 0 ? (
              <div style={{ textAlign: "center", padding: "var(--spacing-10) 0", backgroundColor: "var(--color-bg-tertiary)", borderRadius: "var(--radius-lg)" }}>
                <FaBoxes style={{ margin: "0 auto", color: "var(--color-text-disabled)", marginBottom: "var(--spacing-2)", fontSize: "var(--font-size-4xl)" }} />
                <p style={{ color: "var(--color-text-muted)" }}>No inventory items assigned to this student</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ minWidth: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ backgroundColor: "var(--color-bg-tertiary)" }}>
                    <tr>
                      <th style={{ padding: "var(--spacing-3) var(--spacing-6)", textAlign: "left", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Item</th>
                      <th style={{ padding: "var(--spacing-3) var(--spacing-6)", textAlign: "left", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Count</th>
                      <th style={{ padding: "var(--spacing-3) var(--spacing-6)", textAlign: "left", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Issue Date</th>
                      <th style={{ padding: "var(--spacing-3) var(--spacing-6)", textAlign: "left", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                      <th style={{ padding: "var(--spacing-3) var(--spacing-6)", textAlign: "left", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Condition</th>
                      {user && canAccess("student_inventory", "edit") && ["Warden", "Associate Warden", "Hostel Supervisor"].includes(user.role) && (
                        <th style={{ padding: "var(--spacing-3) var(--spacing-6)", textAlign: "left", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {studentInventory.map((item) => (
                      <tr key={item._id} style={{ borderBottom: "var(--border-1) solid var(--color-border-light)" }}>
                        <td style={{ padding: "var(--spacing-4) var(--spacing-6)", whiteSpace: "nowrap" }}>
                          <div style={{ display: "flex", alignItems: "center" }}>
                            <div style={{ width: "var(--spacing-8)", height: "var(--spacing-8)", borderRadius: "var(--radius-full)", backgroundColor: "var(--color-primary-bg)", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "var(--spacing-3)" }}>
                              <FaBoxes style={{ color: "var(--color-primary)" }} />
                            </div>
                            <span style={{ fontWeight: "var(--font-weight-medium)", color: "var(--color-text-secondary)" }}>{item.itemTypeId.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: "var(--spacing-4) var(--spacing-6)", whiteSpace: "nowrap", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-secondary)" }}>{item.count}</td>
                        <td style={{ padding: "var(--spacing-4) var(--spacing-6)", whiteSpace: "nowrap", color: "var(--color-text-muted)" }}>{formatDate(item.issueDate)}</td>
                        <td style={{ padding: "var(--spacing-4) var(--spacing-6)", whiteSpace: "nowrap" }}>
                          <span
                            style={{
                              padding: "var(--spacing-1) var(--spacing-2-5)",
                              borderRadius: "var(--radius-full)",
                              fontSize: "var(--font-size-xs)",
                              fontWeight: "var(--font-weight-medium)",
                              backgroundColor: item.status === "Issued" ? "var(--color-success-bg-light)" : item.status === "Damaged" ? "var(--color-danger-bg-light)" : item.status === "Lost" ? "var(--color-info-bg)" : "var(--color-bg-muted)",
                              color: item.status === "Issued" ? "var(--color-success)" : item.status === "Damaged" ? "var(--color-danger)" : item.status === "Lost" ? "var(--color-info)" : "var(--color-text-secondary)",
                            }}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td style={{ padding: "var(--spacing-4) var(--spacing-6)", whiteSpace: "nowrap", color: "var(--color-text-muted)" }}>{item.condition}</td>
                        {user && canAccess("student_inventory", "edit") && ["Warden", "Associate Warden", "Hostel Supervisor"].includes(user.role) && (
                          <td style={{ padding: "var(--spacing-4) var(--spacing-6)", whiteSpace: "nowrap" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-3)" }}>
                              <Button
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
                                variant="ghost"
                                size="small"
                                icon={<FaEdit />}
                                title="View/Edit Item"
                              />
                              {item.status === "Issued" && (
                                <Button
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
                                  variant="success"
                                  size="small"
                                  icon={<FaUndo />}
                                  title="Return Item"
                                />
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
          <div style={{ backgroundColor: "var(--color-bg-primary)" }}>
            <h3 style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-body)", marginBottom: "var(--spacing-4)" }}>Student ID Card</h3>

            {loadingIdCard ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "var(--spacing-10) 0" }}>
                <div style={{ width: "var(--spacing-8)", height: "var(--spacing-8)", borderRadius: "var(--radius-full)", border: "var(--border-2) solid transparent", borderBottomColor: "var(--color-primary)", animation: "spin 1s linear infinite" }}></div>
              </div>
            ) : !idCardData.front && !idCardData.back ? (
              <div style={{ textAlign: "center", padding: "var(--spacing-10) 0", backgroundColor: "var(--color-bg-tertiary)", borderRadius: "var(--radius-lg)" }}>
                <FaIdCard style={{ margin: "0 auto", color: "var(--color-text-disabled)", marginBottom: "var(--spacing-2)", fontSize: "var(--font-size-4xl)" }} />
                <p style={{ color: "var(--color-text-muted)" }}>No ID card images found for this student</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "var(--spacing-6)" }}>
                {/* Front ID Card */}
                <div style={{ backgroundColor: "var(--color-bg-primary)", borderRadius: "var(--radius-xl)", padding: "var(--spacing-5)", boxShadow: "var(--shadow-sm)", transition: "var(--transition-all)", border: "var(--border-1) solid var(--color-border-primary)" }}>
                  <h4 style={{ fontSize: "var(--font-size-base)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-body)", marginBottom: "var(--spacing-3)" }}>ID Card Front</h4>
                  {idCardData.front ? (
                    <div style={{ position: "relative", width: "100%" }}>
                      <div style={{ overflow: "hidden", borderRadius: "var(--radius-lg)", maxHeight: "280px", display: "flex", alignItems: "center", justifyContent: "center", border: "var(--border-1) solid var(--color-border-primary)" }}>
                        <img src={getMediaUrl(idCardData.front)} alt="ID Card Front" style={{ objectFit: "contain", width: "100%", maxHeight: "280px" }} />
                      </div>

                      <div style={{ position: "absolute", bottom: "var(--spacing-2)", right: "var(--spacing-2)", backgroundColor: "var(--color-bg-primary)", padding: "var(--spacing-2)", borderRadius: "var(--radius-full)", boxShadow: "var(--shadow-sm)" }}>
                        <a href={idCardData.front} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-primary)" }}>
                          <FaExpand size={14} />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div style={{ width: "100%", height: "192px", backgroundColor: "var(--color-bg-muted)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-lg)", border: "var(--border-1) dashed var(--color-border-primary)" }}>
                      <FaIdCard style={{ color: "var(--color-text-disabled)", marginBottom: "var(--spacing-2)", fontSize: "var(--font-size-4xl)" }} />
                      <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Front side not uploaded</p>
                    </div>
                  )}
                </div>

                {/* Back ID Card */}
                <div style={{ backgroundColor: "var(--color-bg-primary)", borderRadius: "var(--radius-xl)", padding: "var(--spacing-5)", boxShadow: "var(--shadow-sm)", transition: "var(--transition-all)", border: "var(--border-1) solid var(--color-border-primary)" }}>
                  <h4 style={{ fontSize: "var(--font-size-base)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-body)", marginBottom: "var(--spacing-3)" }}>ID Card Back</h4>
                  {idCardData.back ? (
                    <div style={{ position: "relative", width: "100%" }}>
                      <div style={{ overflow: "hidden", borderRadius: "var(--radius-lg)", maxHeight: "280px", display: "flex", alignItems: "center", justifyContent: "center", border: "var(--border-1) solid var(--color-border-primary)" }}>
                        <img src={getMediaUrl(idCardData.back)} alt="ID Card Back" style={{ objectFit: "contain", width: "100%", maxHeight: "280px" }} />
                      </div>

                      <div style={{ position: "absolute", bottom: "var(--spacing-2)", right: "var(--spacing-2)", backgroundColor: "var(--color-bg-primary)", padding: "var(--spacing-2)", borderRadius: "var(--radius-full)", boxShadow: "var(--shadow-sm)" }}>
                        <a href={idCardData.back} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-primary)" }}>
                          <FaExpand size={14} />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div style={{ width: "100%", height: "192px", backgroundColor: "var(--color-bg-muted)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-lg)", border: "var(--border-1) dashed var(--color-border-primary)" }}>
                      <FaIdCard style={{ color: "var(--color-text-disabled)", marginBottom: "var(--spacing-2)", fontSize: "var(--font-size-4xl)" }} />
                      <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Back side not uploaded</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      case "disco":
        return <DisCoActions userId={selectedStudent.userId} />
      case "certificates":
        return <Certificates userId={selectedStudent.userId} />
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
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-4)" }}>
        {!isImport && (
          <>
            <a
              href={`mailto:${studentDetails.guardianEmail}`}
              style={{ padding: "var(--spacing-2-5) var(--spacing-4)", backgroundColor: "var(--color-primary)", color: "var(--color-white)", borderRadius: "var(--radius-lg)", textDecoration: "none", transition: "var(--transition-all)", boxShadow: "var(--shadow-sm)" }}
            >
              Email Guardian
            </a>
            <a
              href={`mailto:${studentDetails.email}`}
              style={{ padding: "var(--spacing-2-5) var(--spacing-4)", backgroundColor: "var(--color-primary)", color: "var(--color-white)", borderRadius: "var(--radius-lg)", textDecoration: "none", transition: "var(--transition-all)", boxShadow: "var(--shadow-sm)" }}
            >
              Email Student
            </a>
            {canAccess("students_info", "edit") && (
              <Button onClick={() => setShowEditModal(true)} variant="primary" size="medium">
                Edit Student
              </Button>
            )}
          </>
        )}
        <Button onClick={() => setShowStudentDetail(false)} variant="secondary" size="medium">
          Close
        </Button>
      </div>
    )
  }

  return (
    <>
      <Modal title="Student Profile" onClose={() => setShowStudentDetail(false)} width={1300} tabs={!isImport ? modalTabs : null} activeTab={activeTab} onTabChange={setActiveTab} hideTitle={!isImport} footer={renderFooter()} fullHeight={true}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "256px" }}>
            <div style={{ position: "relative", width: "var(--spacing-16)", height: "var(--spacing-16)" }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "var(--border-4) solid var(--color-border-primary)", borderRadius: "var(--radius-full)" }}></div>
              <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "var(--border-4) solid var(--color-primary)", borderRadius: "var(--radius-full)", animation: "spin 1s linear infinite", borderTopColor: "transparent" }}></div>
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
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-3)" }}>
              <Button type="button" onClick={closeInventoryModal} variant="secondary" size="medium">
                Cancel
              </Button>

              {/* Return button - only for return mode */}
              {inventoryModalType === "return" && (
                <Button type="button" onClick={handleReturnInventory} variant="success" size="medium" isLoading={loading}>
                  Return Item
                </Button>
              )}

              {/* Submit button - only for assign and edit modes */}
              {(inventoryModalType === "assign" || inventoryModalType === "edit") && (
                <Button type="submit" form="inventory-form" disabled={loading || (inventoryModalType === "assign" && !inventoryFormData.hostelInventoryId)} variant="primary" size="medium" isLoading={loading}>
                  {inventoryModalType === "assign" ? "Assign Item" : "Update Item"}
                </Button>
              )}
            </div>
          }
        >
          <form id="inventory-form" onSubmit={handleInventorySubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
            {/* Item details for edit/return modals */}
            {(inventoryModalType === "edit" || inventoryModalType === "return") && selectedInventoryItem && (
              <div style={{ backgroundColor: "var(--color-bg-tertiary)", padding: "var(--spacing-4)", borderRadius: "var(--radius-lg)", marginBottom: "var(--spacing-4)" }}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "var(--spacing-3)" }}>
                  <div style={{ width: "var(--spacing-10)", height: "var(--spacing-10)", borderRadius: "var(--radius-full)", backgroundColor: "var(--color-primary-bg)", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "var(--spacing-3)" }}>
                    <FaBoxes style={{ color: "var(--color-primary)" }} />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: "var(--font-weight-medium)", color: "var(--color-text-primary)" }}>{selectedInventoryItem.itemTypeId.name}</h3>
                    <div style={{ display: "flex", gap: "var(--spacing-2)", fontSize: "var(--font-size-sm)" }}>
                      <span style={{ color: "var(--color-text-muted)" }}>Qty: {selectedInventoryItem.count}</span>
                      <span style={{ color: "var(--color-text-muted)" }}>•</span>
                      <span style={{ color: "var(--color-text-muted)" }}>Issued: {formatDate(selectedInventoryItem.issueDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Item selection - only for assign */}
            {inventoryModalType === "assign" && (
              <div style={{ marginBottom: "var(--spacing-4)" }}>
                <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-body)", marginBottom: "var(--spacing-1)" }}>Item</label>
                <Select
                  name="hostelInventoryId"
                  value={inventoryFormData.hostelInventoryId}
                  onChange={handleInventoryFormChange}
                  placeholder="Select Item"
                  options={availableInventory.map((item) => ({
                    value: item._id,
                    label: `${item.itemTypeId.name} - Available: ${item.availableCount}`,
                  }))}
                  required
                />
              </div>
            )}

            {/* Count - only for assign */}
            {inventoryModalType === "assign" && (
              <div style={{ marginBottom: "var(--spacing-4)" }}>
                <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-body)", marginBottom: "var(--spacing-1)" }}>Count</label>
                <Input type="number" name="count" value={inventoryFormData.count} onChange={handleInventoryFormChange} min={1} max={getMaxCount()} required />
                {inventoryFormData.hostelInventoryId && <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "var(--spacing-1)" }}>Maximum available: {getMaxCount()}</p>}
              </div>
            )}

            {/* Status - only for edit */}
            {inventoryModalType === "edit" && (
              <div style={{ marginBottom: "var(--spacing-4)" }}>
                <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-body)", marginBottom: "var(--spacing-1)" }}>Status</label>
                <Select
                  name="status"
                  value={inventoryFormData.status}
                  onChange={handleInventoryFormChange}
                  options={[
                    { value: "Issued", label: "Issued" },
                    { value: "Damaged", label: "Damaged" },
                    { value: "Lost", label: "Lost" },
                  ]}
                  required
                />
              </div>
            )}

            {/* Condition - for all modes */}
            <div style={{ marginBottom: "var(--spacing-4)" }}>
              <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-body)", marginBottom: "var(--spacing-1)" }}>Condition</label>
              <Select
                name="condition"
                value={inventoryFormData.condition}
                onChange={handleInventoryFormChange}
                options={[
                  { value: "Excellent", label: "Excellent" },
                  { value: "Good", label: "Good" },
                  { value: "Fair", label: "Fair" },
                  { value: "Poor", label: "Poor" },
                ]}
                required
              />
            </div>

            {/* Notes - for all modes */}
            <div style={{ marginBottom: "var(--spacing-4)" }}>
              <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-body)", marginBottom: "var(--spacing-1)" }}>Notes</label>
              <textarea
                name="notes"
                value={inventoryFormData.notes}
                onChange={handleInventoryFormChange}
                rows="3"
                style={{ width: "100%", padding: "var(--spacing-2) var(--spacing-3)", border: "var(--border-1) solid var(--color-border-input)", borderRadius: "var(--radius-md)", backgroundColor: "var(--color-bg-primary)", color: "var(--color-text-body)" }}
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
