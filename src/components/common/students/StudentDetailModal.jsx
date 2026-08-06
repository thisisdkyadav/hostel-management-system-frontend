import React, { useState, useEffect, useRef } from "react"
import {
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  MapPin,
  Building,
  ClipboardList,
  History,
  Users,
  MessageSquare,
  Heart,
  Package,
  Plus,
  Edit,
  Trash,
  Undo,
  CreditCard,
  Maximize,
  Clock,
  Check,
  X,
  UserCheck,
  UserX,
  ShieldCheck,
} from "lucide-react"
import { FaBoxes, FaExpand } from "react-icons/fa"
import { studentApi } from "../../../service"
import { visitorApi } from "../../../service"
import { securityApi } from "../../../service"
import { feedbackApi } from "../../../service"
import { inventoryApi, idCardApi } from "../../../service"
import EditStudentModal from "./EditStudentModal"
import DisCoActions from "./DisCoActions"
import Certificates from "./Certificates"
import FamilyDetails from "./FamilyDetails"
import HealthTab from "./HealthTab"
import ComplaintsTab from "./tabs/ComplaintsTab"
import PorTab from "./tabs/PorTab"
import { useAuth } from "../../../contexts/AuthProvider"
import useAuthz from "../../../hooks/useAuthz"
import { getMediaUrl } from "../../../utils/mediaUtils"
import { Grid, Heading, HStack, IconCircle, InfoRow, Label, Select, Spinner, Surface, Text, useConfirm, VStack } from "@/components/ui"
import { Button, Input, Table } from "czero/react"
import { Modal } from "@/components/ui"
const StudentDetailModal = ({ selectedStudent, setShowStudentDetail, onUpdate, isImport = false }) => {
  const confirm = useConfirm()
  const { user } = useAuth()
  const { can } = useAuthz()
  const canAssignInventory = true
  const canEditInventory = true
  const canEditStudentProfile = can("cap.students.edit.personal")
  const canViewPorTab = can("route.admin.por") || can("route.gymkhana.por")

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
    { id: "profile", name: "Profile", icon: <GraduationCap size={16} /> },
    { id: "complaints", name: "Complaints", icon: <ClipboardList size={16} /> },
    { id: "access", name: "Access History", icon: <History size={16} /> },
    { id: "visitors", name: "Visitors", icon: <Users size={16} /> },
    { id: "feedback", name: "Feedback", icon: <MessageSquare size={16} /> },
    { id: "inventory", name: "Inventory", icon: <Package size={16} /> },
    { id: "idcard", name: "ID Card", icon: <CreditCard size={16} /> },
    { id: "disco", name: "DisCo Actions", icon: <Users size={16} /> },
    ...(canViewPorTab ? [{ id: "por", name: "POR", icon: <ShieldCheck size={16} /> }] : []),
    { id: "certificates", name: "Certificates", icon: <CreditCard size={16} /> },
    { id: "family", name: "Family", icon: <Users size={16} /> },
    { id: "health", name: "Health", icon: <Heart size={16} /> },
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
      const data = await idCardApi.getIDcard(selectedStudent.userId)
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
        batch: selectedStudent.batch || "",
        secondaryEmail: selectedStudent.secondaryEmail || "",
        groups: Array.isArray(selectedStudent.groups) ? selectedStudent.groups : [],
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
    // Date-only "YYYY-MM-DD" is parsed in local time so it never shifts a day.
    const date = /^\d{4}-\d{2}-\d{2}$/.test(String(dateString).trim())
      ? (() => { const [y, m, d] = String(dateString).trim().split("-").map(Number); return new Date(y, m - 1, d) })()
      : new Date(dateString)
    return date.toLocaleDateString("en-US", {
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
              <HStack gap="none" align="start">
                {/* Profile Image - Left */}
                {studentDetails.profileImage ? (
                  <img
                    src={getMediaUrl(studentDetails.profileImage)}
                    alt={studentDetails.name || "Student"}
                    style={{ height: "var(--avatar-2xl)", width: "var(--avatar-2xl)", borderRadius: "var(--radius-full)", objectFit: "cover", border: "var(--border-4) solid var(--color-primary)", boxShadow: "var(--shadow-md)", flexShrink: 0 }}
                  />
                ) : (
                  <IconCircle size="var(--avatar-2xl)" bg="var(--color-primary)" style={{ border: "var(--border-4) solid var(--color-primary)", boxShadow: "var(--shadow-md)" }}>
                    <GraduationCap size={48} style={{ color: "var(--color-white)" }} />
                  </IconCircle>
                )}

                {/* Details - Middle */}
                <div style={{ marginLeft: "var(--spacing-6)", flex: 1, textAlign: "left" }}>
                  <Heading as="h3" size="2xl" weight="bold" color="secondary" style={{ marginBottom: "var(--spacing-1)" }}>{studentDetails.name || "N/A"}</Heading>
                  <Text color="muted" style={{ marginBottom: "var(--spacing-2)", fontFamily: "var(--font-mono)" }}>{studentDetails.rollNumber || "N/A"}</Text>

                  <HStack gap={4} align="center">
                    <HStack gap="none" align="center">
                      <Mail size={16} style={{ color: "var(--color-primary)", marginRight: "var(--spacing-2)", flexShrink: 0 }} />
                      <Text as="span" color="body" size="sm">{studentDetails.email || "N/A"}</Text>
                    </HStack>
                    <HStack gap="none" align="center">
                      <Mail size={16} style={{ color: "var(--color-primary)", marginRight: "var(--spacing-2)", flexShrink: 0 }} />
                      <Text as="span" color="body" size="sm">{studentDetails.secondaryEmail || "N/A"}</Text>
                    </HStack>
                    <HStack gap="none" align="center">
                      <Phone size={16} style={{ color: "var(--color-primary)", marginRight: "var(--spacing-2)", flexShrink: 0 }} />
                      <Text as="span" color="body" size="sm">{studentDetails.phone || "N/A"}</Text>
                    </HStack>
                  </HStack>
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
                        border: `var(--border-1) solid ${studentDetails.status === "Active"
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
                      {studentDetails.status === "Active" && <UserCheck size={14} style={{ marginRight: "var(--spacing-1)" }} />}
                      {studentDetails.status === "Graduated" && <GraduationCap size={14} style={{ marginRight: "var(--spacing-1)" }} />}
                      {studentDetails.status === "Dropped" && <UserX size={14} style={{ marginRight: "var(--spacing-1)" }} />}
                      {studentDetails.status === "Inactive" && <Clock size={14} style={{ marginRight: "var(--spacing-1)" }} />}
                      {!["Active", "Graduated", "Dropped", "Inactive"].includes(studentDetails.status) && <GraduationCap size={14} style={{ marginRight: "var(--spacing-1)" }} />}
                      {studentDetails.status || "Active"}
                    </span>
                  </div>
                )}
              </HStack>
            </div>

            <Grid cols={2} gap={5}>
              <div style={{ backgroundColor: "var(--color-bg-tertiary)", padding: "var(--spacing-5)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-sm)", transition: "var(--transition-all)" }}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "var(--spacing-3)", paddingBottom: "var(--spacing-2)", borderBottom: "var(--border-1) solid var(--color-border-primary)" }}>
                  <GraduationCap size={16} style={{ color: "var(--color-primary)", marginRight: "var(--spacing-2)", flexShrink: 0 }} />
                  <Heading as="h4" size="sm" weight="semibold" color="brand">Academic Information</Heading>
                </div>
                <VStack gap="var(--spacing-2-5)">
                  <InfoRow label="Department:" value={studentDetails.department || "N/A"} />
                  <InfoRow label="Degree:" value={studentDetails.degree || "N/A"} />
                  <InfoRow label="Batch:" value={studentDetails.batch || "N/A"} />
                  <HStack gap={4} justify="between">
                    <Text as="span" color="muted" size="sm" style={{ flexShrink: 0 }}>Groups:</Text>
                    <Text as="span" weight="medium" size="sm" color="body" align="right">
                      {Array.isArray(studentDetails.groups) && studentDetails.groups.length > 0 ? studentDetails.groups.join(", ") : "N/A"}
                    </Text>
                  </HStack>
                  <InfoRow label="Year:" value={studentDetails.year || "N/A"} />
                  <InfoRow label="Admission Date:" value={formatDate(studentDetails.admissionDate)} />
                </VStack>
              </div>

              <div style={{ backgroundColor: "var(--color-bg-tertiary)", padding: "var(--spacing-5)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-sm)", transition: "var(--transition-all)" }}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "var(--spacing-3)", paddingBottom: "var(--spacing-2)", borderBottom: "var(--border-1) solid var(--color-border-primary)" }}>
                  <Building size={16} style={{ color: "var(--color-primary)", marginRight: "var(--spacing-2)", flexShrink: 0 }} />
                  <Heading as="h4" size="sm" weight="semibold" color="brand">Hostel Information</Heading>
                </div>
                <VStack gap="var(--spacing-2-5)">
                  <InfoRow label="Hostel:" value={studentDetails.hostel || "N/A"} />
                  {studentDetails.hostelType === "unit-based" && (
                    <InfoRow label="Unit Number:" value={studentDetails.unit || "N/A"} />
                  )}
                  <InfoRow label="Room Number:" value={studentDetails.room || "N/A"} />
                  <InfoRow label="Bed Number:" value={studentDetails.bedNumber || "N/A"} />
                </VStack>
              </div>

              <div style={{ backgroundColor: "var(--color-bg-tertiary)", padding: "var(--spacing-5)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-sm)", transition: "var(--transition-all)" }}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "var(--spacing-3)", paddingBottom: "var(--spacing-2)", borderBottom: "var(--border-1) solid var(--color-border-primary)" }}>
                  <Calendar size={16} style={{ color: "var(--color-primary)", marginRight: "var(--spacing-2)", flexShrink: 0 }} />
                  <Heading as="h4" size="sm" weight="semibold" color="brand">Personal Information</Heading>
                </div>
                <VStack gap="var(--spacing-2-5)">
                  <InfoRow label="Gender:" value={studentDetails.gender || "N/A"} />
                  <InfoRow label="Date of Birth:" value={formatDate(studentDetails.dateOfBirth)} />
                  <VStack gap="none">
                    <Text as="span" color="muted" size="sm" style={{ marginBottom: "var(--spacing-1)" }}>Address:</Text>
                    <Text as="span" weight="medium" size="sm" color="body">{studentDetails.address || "N/A"}</Text>
                  </VStack>
                  <HStack gap={4} justify="between">
                    <Text as="span" color="muted" size="sm" style={{ flexShrink: 0 }}>Secondary Email:</Text>
                    <Text as="span" weight="medium" size="sm" color="body" align="right" style={{ wordBreak: "break-word" }}>
                      {studentDetails.secondaryEmail || "N/A"}
                    </Text>
                  </HStack>
                </VStack>
              </div>

              <div style={{ backgroundColor: "var(--color-bg-tertiary)", padding: "var(--spacing-5)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-sm)", transition: "var(--transition-all)" }}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "var(--spacing-3)", paddingBottom: "var(--spacing-2)", borderBottom: "var(--border-1) solid var(--color-border-primary)" }}>
                  <MapPin size={16} style={{ color: "var(--color-primary)", marginRight: "var(--spacing-2)", flexShrink: 0 }} />
                  <Heading as="h4" size="sm" weight="semibold" color="brand">Emergency Contact</Heading>
                </div>
                <VStack gap="var(--spacing-2-5)">
                  <InfoRow label="Guardian Name:" value={studentDetails.guardian || "N/A"} />
                  <InfoRow label="Guardian Phone:" value={studentDetails.guardianPhone || "N/A"} />
                  <InfoRow label="Guardian Email:" value={studentDetails.guardianEmail || "N/A"} />
                  <InfoRow label="Faculty Advisor Email:" value={studentDetails.facultyAdvisorEmail || "N/A"} />
                </VStack>
              </div>

              {/* if day scholar is true then show the day scholar details */}
              {studentDetails.isDayScholar && (
                <div style={{ backgroundColor: "var(--color-bg-tertiary)", padding: "var(--spacing-5)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-sm)", transition: "var(--transition-all)" }}>
                  <div style={{ display: "flex", alignItems: "center", marginBottom: "var(--spacing-3)", paddingBottom: "var(--spacing-2)", borderBottom: "var(--border-1) solid var(--color-border-primary)" }}>
                    <Heading as="h4" size="sm" weight="semibold" color="brand">Day Scholar Details</Heading>
                  </div>
                  <VStack gap="var(--spacing-2-5)">
                    <InfoRow label="Address:" value={studentDetails.dayScholarDetails.address || "N/A"} />
                    <InfoRow label="Owner Name:" value={studentDetails.dayScholarDetails.ownerName || "N/A"} />
                    <InfoRow label="Owner Phone:" value={studentDetails.dayScholarDetails.ownerPhone || "N/A"} />
                    <InfoRow label="Owner Email:" value={studentDetails.dayScholarDetails.ownerEmail || "N/A"} />
                  </VStack>
                </div>
              )}
            </Grid>
          </>
        )

      case "family":
        return <FamilyDetails userId={selectedStudent.userId} />

      case "complaints":
        return <ComplaintsTab userId={selectedStudent.userId} />

      case "por":
        return <PorTab userId={selectedStudent.userId} />

      case "access":
        return (
          <Surface bg="primary">
            <Heading as="h3" size="lg" weight="semibold" color="body" style={{ marginBottom: "var(--spacing-4)" }}>Access History</Heading>
            {loadingAccessRecords ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "var(--spacing-10) 0" }}>
                <Spinner size="var(--spacing-8)" thickness="thin" />
              </div>
            ) : accessRecords.length === 0 ? (
              <Surface bg="tertiary" padding="var(--spacing-10) 0" radius="lg" align="center">
                <History size={48} style={{ margin: "0 auto", color: "var(--color-text-disabled)", marginBottom: "var(--spacing-2)" }} />
                <Text color="muted">No access records found for this student</Text>
              </Surface>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.Head>Date & Time</Table.Head>
                      <Table.Head>Type</Table.Head>
                      <Table.Head>Recorded By</Table.Head>
                      <Table.Head>Notes</Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {accessRecords.map((record) => (
                      <Table.Row key={record._id}>
                        <Table.Cell style={{ whiteSpace: "nowrap", fontSize: "var(--font-size-sm)" }}>{formatDateTime(record.dateAndTime)}</Table.Cell>
                        <Table.Cell style={{ whiteSpace: "nowrap" }}>
                          <Surface as="span" bg={record.status === "Checked In" ? "var(--color-success-bg-light)" : "var(--color-primary-bg)"} padding="var(--spacing-1) var(--spacing-2)" radius="full" color={record.status === "Checked In" ? "var(--color-success)" : "var(--color-primary)"} size="xs" weight="semibold" leading={1.25} style={{ display: "inline-flex" }}>
                            {record.status === "Checked In" ? "Checked In" : "Checked Out"}
                          </Surface>
                        </Table.Cell>
                        <Table.Cell style={{ whiteSpace: "nowrap", fontSize: "var(--font-size-sm)" }}>{record.recordedBy || "System"}</Table.Cell>
                        <Table.Cell style={{ fontSize: "var(--font-size-sm)" }}>{record.notes || "-"}</Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>
            )}
          </Surface>
        )
      case "visitors":
        return (
          <Surface bg="primary">
            <Heading as="h3" size="lg" weight="semibold" color="body" style={{ marginBottom: "var(--spacing-4)" }}>Visitor Requests</Heading>
            {loadingVisitorRequests ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "var(--spacing-10) 0" }}>
                <Spinner size="var(--spacing-8)" thickness="thin" />
              </div>
            ) : visitorRequests.length === 0 ? (
              <Surface bg="tertiary" padding="var(--spacing-10) 0" radius="lg" align="center">
                <Users size={48} style={{ margin: "0 auto", color: "var(--color-text-disabled)", marginBottom: "var(--spacing-2)" }} />
                <Text color="muted">No visitor requests found for this student</Text>
              </Surface>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.Head>Request Date</Table.Head>
                      <Table.Head>Visitors</Table.Head>
                      <Table.Head>Visit Date</Table.Head>
                      <Table.Head>Status</Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {visitorRequests.map((request) => (
                      <Table.Row key={request._id}>
                        <Table.Cell style={{ whiteSpace: "nowrap", fontSize: "var(--font-size-sm)" }}>{formatDate(request.createdAt)}</Table.Cell>
                        <Table.Cell style={{ fontSize: "var(--font-size-sm)" }}>{request.visitors && request.visitors.length > 0 ? request.visitors.map((v) => v.name).join(", ") : request.visitorNames || "-"}</Table.Cell>
                        <Table.Cell style={{ whiteSpace: "nowrap", fontSize: "var(--font-size-sm)" }}>
                          {formatDate(request.fromDate)} to {formatDate(request.toDate)}
                        </Table.Cell>
                        <Table.Cell style={{ whiteSpace: "nowrap" }}>
                          <Surface as="span" bg={request.status === "Pending" ? "var(--color-warning-bg-light)" : request.status === "Approved" ? "var(--color-success-bg-light)" : request.status === "Completed" ? "var(--color-primary-bg)" : "var(--color-danger-bg-light)"} padding="var(--spacing-1) var(--spacing-2)" radius="full" color={request.status === "Pending" ? "var(--color-warning)" : request.status === "Approved" ? "var(--color-success)" : request.status === "Completed" ? "var(--color-primary)" : "var(--color-danger)"} size="xs" weight="semibold" leading={1.25} style={{ display: "inline-flex" }}>
                            {request.status}
                          </Surface>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>
            )}
          </Surface>
        )
      case "feedback":
        return (
          <Surface bg="primary">
            <Heading as="h3" size="lg" weight="semibold" color="body" style={{ marginBottom: "var(--spacing-4)" }}>Feedback History</Heading>
            {loadingFeedbacks ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "var(--spacing-10) 0" }}>
                <Spinner size="var(--spacing-8)" thickness="thin" />
              </div>
            ) : feedbacks.length === 0 ? (
              <Surface bg="tertiary" padding="var(--spacing-10) 0" radius="lg" align="center">
                <MessageSquare size={48} style={{ margin: "0 auto", color: "var(--color-text-disabled)", marginBottom: "var(--spacing-2)" }} />
                <Text color="muted">No feedback found for this student</Text>
              </Surface>
            ) : (
              <VStack gap={4}>
                {feedbacks.map((feedback) => (
                  <Surface bg="tertiary" padding={4} radius="lg" key={feedback._id}>
                    <HStack gap="none" justify="between" style={{ marginBottom: "var(--spacing-2)" }}>
                      <Heading as="h4" weight="medium" color="secondary">{feedback.title}</Heading>
                      <Surface as="span" bg={feedback.status === "Pending" ? "var(--color-warning-bg-light)" : feedback.status === "Resolved" ? "var(--color-success-bg-light)" : "var(--color-primary-bg)"} padding="var(--spacing-1) var(--spacing-2)" radius="full" color={feedback.status === "Pending" ? "var(--color-warning)" : feedback.status === "Resolved" ? "var(--color-success)" : "var(--color-primary)"} size="xs" weight="semibold" leading={1.25} style={{ display: "inline-flex" }}>
                        {feedback.status}
                      </Surface>
                    </HStack>
                    <Text size="sm" color="muted" style={{ marginBottom: "var(--spacing-2)" }}>{feedback.description}</Text>
                    <HStack justify="between" gap="none" size="xs" color="muted">
                      <span>Submitted on: {formatDate(feedback.createdAt)}</span>
                      {feedback.reply && <Text as="span" color="success">Replied: Yes</Text>}
                    </HStack>
                  </Surface>
                ))}
              </VStack>
            )}
          </Surface>
        )
      case "inventory":
        return (
          <Surface bg="primary">
            <HStack gap="none" align="center" justify="between" style={{ marginBottom: "var(--spacing-4)" }}>
              <Heading as="h3" size="lg" weight="semibold" color="body">Student Inventory</Heading>
              {user && canAssignInventory && ["Warden", "Associate Warden", "Hostel Supervisor"].includes(user.role) && (
                <Button onClick={handleOpenAssignInventory} variant="primary" size="sm">
                  <Plus size={14} />
                  Assign Item
                </Button>
              )}
            </HStack>

            {loadingInventory ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "var(--spacing-10) 0" }}>
                <Spinner size="var(--spacing-8)" thickness="thin" />
              </div>
            ) : studentInventory.length === 0 ? (
              <Surface bg="tertiary" padding="var(--spacing-10) 0" radius="lg" align="center">
                <Package size={48} style={{ margin: "0 auto", color: "var(--color-text-disabled)", marginBottom: "var(--spacing-2)" }} />
                <Text color="muted">No inventory items assigned to this student</Text>
              </Surface>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.Head>Item</Table.Head>
                      <Table.Head>Count</Table.Head>
                      <Table.Head>Issue Date</Table.Head>
                      <Table.Head>Status</Table.Head>
                      <Table.Head>Condition</Table.Head>
                      {user && canEditInventory && ["Warden", "Associate Warden", "Hostel Supervisor"].includes(user.role) && (
                        <Table.Head>Actions</Table.Head>
                      )}
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {studentInventory.map((item) => (
                      <Table.Row key={item._id}>
                        <Table.Cell style={{ whiteSpace: "nowrap" }}>
                          <HStack gap="none" align="center">
                            <IconCircle size="var(--spacing-8)" bg="brand" style={{ marginRight: "var(--spacing-3)" }}>
                              <Package size={16} style={{ color: "var(--color-primary)" }} />
                            </IconCircle>
                            <Text as="span" weight="medium" color="secondary">{item.itemTypeId.name}</Text>
                          </HStack>
                        </Table.Cell>
                        <Table.Cell style={{ whiteSpace: "nowrap", fontWeight: "var(--font-weight-medium)" }}>{item.count}</Table.Cell>
                        <Table.Cell style={{ whiteSpace: "nowrap" }}>{formatDate(item.issueDate)}</Table.Cell>
                        <Table.Cell style={{ whiteSpace: "nowrap" }}>
                          <Surface as="span" bg={item.status === "Issued" ? "var(--color-success-bg-light)" : item.status === "Damaged" ? "var(--color-danger-bg-light)" : item.status === "Lost" ? "var(--color-info-bg)" : "var(--color-bg-muted)"} padding="var(--spacing-1) var(--spacing-2-5)" radius="full" color={item.status === "Issued" ? "var(--color-success)" : item.status === "Damaged" ? "var(--color-danger)" : item.status === "Lost" ? "var(--color-info)" : "var(--color-text-secondary)"} size="xs" weight="medium">
                            {item.status}
                          </Surface>
                        </Table.Cell>
                        <Table.Cell style={{ whiteSpace: "nowrap" }}>{item.condition}</Table.Cell>
                        {user && canEditInventory && ["Warden", "Associate Warden", "Hostel Supervisor"].includes(user.role) && (
                          <Table.Cell style={{ whiteSpace: "nowrap" }}>
                            <HStack gap={3} align="center">
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
                                size="sm"
                                title="View/Edit Item"
                              >
                                <Edit size={16} />
                              </Button>
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
                                  size="sm"
                                  title="Return Item"
                                >
                                  <Undo size={16} />
                                </Button>
                              )}
                            </HStack>
                          </Table.Cell>
                        )}
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>
            )}
          </Surface>
        )
      case "idcard":
        return (
          <Surface bg="primary">
            <Heading as="h3" size="lg" weight="semibold" color="body" style={{ marginBottom: "var(--spacing-4)" }}>Student ID Card</Heading>

            {loadingIdCard ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "var(--spacing-10) 0" }}>
                <Spinner size="var(--spacing-8)" thickness="thin" />
              </div>
            ) : !idCardData.front && !idCardData.back ? (
              <Surface bg="tertiary" padding="var(--spacing-10) 0" radius="lg" align="center">
                <CreditCard size={48} style={{ margin: "0 auto", color: "var(--color-text-disabled)", marginBottom: "var(--spacing-2)" }} />
                <Text color="muted">No ID card images found for this student</Text>
              </Surface>
            ) : (
              <Grid cols={2} gap={6}>
                {/* Front ID Card */}
                <div style={{ backgroundColor: "var(--color-bg-primary)", borderRadius: "var(--radius-xl)", padding: "var(--spacing-5)", boxShadow: "var(--shadow-sm)", transition: "var(--transition-all)", border: "var(--border-1) solid var(--color-border-primary)" }}>
                  <Heading as="h4" size="base" weight="semibold" color="body" style={{ marginBottom: "var(--spacing-3)" }}>ID Card Front</Heading>
                  {idCardData.front ? (
                    <div style={{ position: "relative", width: "100%" }}>
                      <div style={{ overflow: "hidden", borderRadius: "var(--radius-lg)", maxHeight: "280px", display: "flex", alignItems: "center", justifyContent: "center", border: "var(--border-1) solid var(--color-border-primary)" }}>
                        <img src={getMediaUrl(idCardData.front)} alt="ID Card Front" style={{ objectFit: "contain", width: "100%", maxHeight: "280px" }} />
                      </div>

                      <div style={{ position: "absolute", bottom: "var(--spacing-2)", right: "var(--spacing-2)", backgroundColor: "var(--color-bg-primary)", padding: "var(--spacing-2)", borderRadius: "var(--radius-full)", boxShadow: "var(--shadow-sm)" }}>
                        <Text as="a" color="brand" href={getMediaUrl(idCardData.front)} target="_blank" rel="noopener noreferrer">
                          <FaExpand size={14} />
                        </Text>
                      </div>
                    </div>
                  ) : (
                    <div style={{ width: "100%", height: "192px", backgroundColor: "var(--color-bg-muted)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-lg)", border: "var(--border-1) dashed var(--color-border-primary)" }}>
                      <FaIdCard style={{ marginBottom: "var(--spacing-2)", fontSize: "var(--font-size-4xl)" }} color="var(--color-text-disabled)" />
                      <Text color="muted" size="sm">Front side not uploaded</Text>
                    </div>
                  )}
                </div>

                {/* Back ID Card */}
                <div style={{ backgroundColor: "var(--color-bg-primary)", borderRadius: "var(--radius-xl)", padding: "var(--spacing-5)", boxShadow: "var(--shadow-sm)", transition: "var(--transition-all)", border: "var(--border-1) solid var(--color-border-primary)" }}>
                  <Heading as="h4" size="base" weight="semibold" color="body" style={{ marginBottom: "var(--spacing-3)" }}>ID Card Back</Heading>
                  {idCardData.back ? (
                    <div style={{ position: "relative", width: "100%" }}>
                      <div style={{ overflow: "hidden", borderRadius: "var(--radius-lg)", maxHeight: "280px", display: "flex", alignItems: "center", justifyContent: "center", border: "var(--border-1) solid var(--color-border-primary)" }}>
                        <img src={getMediaUrl(idCardData.back)} alt="ID Card Back" style={{ objectFit: "contain", width: "100%", maxHeight: "280px" }} />
                      </div>

                      <div style={{ position: "absolute", bottom: "var(--spacing-2)", right: "var(--spacing-2)", backgroundColor: "var(--color-bg-primary)", padding: "var(--spacing-2)", borderRadius: "var(--radius-full)", boxShadow: "var(--shadow-sm)" }}>
                        <Text as="a" color="brand" href={getMediaUrl(idCardData.back)} target="_blank" rel="noopener noreferrer">
                          <FaExpand size={14} />
                        </Text>
                      </div>
                    </div>
                  ) : (
                    <div style={{ width: "100%", height: "192px", backgroundColor: "var(--color-bg-muted)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-lg)", border: "var(--border-1) dashed var(--color-border-primary)" }}>
                      <FaIdCard style={{ marginBottom: "var(--spacing-2)", fontSize: "var(--font-size-4xl)" }} color="var(--color-text-disabled)" />
                      <Text color="muted" size="sm">Back side not uploaded</Text>
                    </div>
                  )}
                </div>
              </Grid>
            )}
          </Surface>
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
    if (!(await confirm("Are you sure you want to return this item?"))) return

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
      <HStack gap={4} justify="end">
        {!isImport && (
          <>
            <Text as="a" color="var(--color-white)" style={{ padding: "var(--spacing-2-5) var(--spacing-4)", backgroundColor: "var(--color-primary)", borderRadius: "var(--radius-lg)", textDecoration: "none", transition: "var(--transition-all)", boxShadow: "var(--shadow-sm)" }} href={`mailto:${studentDetails.guardianEmail}`}>
              Email Guardian
            </Text>
            <Text as="a" color="var(--color-white)" style={{ padding: "var(--spacing-2-5) var(--spacing-4)", backgroundColor: "var(--color-primary)", borderRadius: "var(--radius-lg)", textDecoration: "none", transition: "var(--transition-all)", boxShadow: "var(--shadow-sm)" }} href={`mailto:${studentDetails.email}`}>
              Email Student
            </Text>
            {studentDetails.secondaryEmail ? (
              <Text as="a" color="var(--color-white)" style={{ padding: "var(--spacing-2-5) var(--spacing-4)", backgroundColor: "var(--color-primary)", borderRadius: "var(--radius-lg)", textDecoration: "none", transition: "var(--transition-all)", boxShadow: "var(--shadow-sm)" }} href={`mailto:${studentDetails.secondaryEmail}`}>
                Email Secondary Address
              </Text>
            ) : null}
            {canEditStudentProfile && (
              <Button onClick={() => setShowEditModal(true)} variant="primary" size="md">
                Edit Student
              </Button>
            )}
          </>
        )}
        <Button onClick={() => setShowStudentDetail(false)} variant="secondary" size="md">
          Close
        </Button>
      </HStack>
    )
  }

  return (
    <>
      <Modal title="Student Profile" onClose={() => setShowStudentDetail(false)} width={1400} tabs={!isImport ? modalTabs : null} activeTab={activeTab} onTabChange={setActiveTab} hideTitle={!isImport} footer={renderFooter()} fullHeight={true}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "256px" }}>
            <div style={{ position: "relative", width: "var(--spacing-16)", height: "var(--spacing-16)" }}>
              <IconCircle size="100%" style={{ position: "absolute", top: 0, left: 0, border: "var(--border-4) solid var(--color-border-primary)" }}></IconCircle>
              <Spinner size="100%" thickness="thick" style={{ position: "absolute", top: 0, left: 0 }} />
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
            <HStack gap={3} justify="end">
              <Button type="button" onClick={closeInventoryModal} variant="secondary" size="md">
                Cancel
              </Button>

              {/* Return button - only for return mode */}
              {inventoryModalType === "return" && (
                <Button type="button" onClick={handleReturnInventory} variant="success" size="md" loading={loading}>
                  Return Item
                </Button>
              )}

              {/* Submit button - only for assign and edit modes */}
              {(inventoryModalType === "assign" || inventoryModalType === "edit") && (
                <Button type="submit" form="inventory-form" disabled={loading || (inventoryModalType === "assign" && !inventoryFormData.hostelInventoryId)} variant="primary" size="md" loading={loading}>
                  {inventoryModalType === "assign" ? "Assign Item" : "Update Item"}
                </Button>
              )}
            </HStack>
          }
        >
          <form id="inventory-form" onSubmit={handleInventorySubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
            {/* Item details for edit/return modals */}
            {(inventoryModalType === "edit" || inventoryModalType === "return") && selectedInventoryItem && (
              <Surface bg="tertiary" padding={4} radius="lg" style={{ marginBottom: "var(--spacing-4)" }}>
                <HStack gap="none" align="center" style={{ marginBottom: "var(--spacing-3)" }}>
                  <IconCircle size="var(--spacing-10)" bg="brand" style={{ marginRight: "var(--spacing-3)" }}>
                    <FaBoxes color="var(--color-primary)" />
                  </IconCircle>
                  <div>
                    <Heading as="h3" weight="medium" color="primary">{selectedInventoryItem.itemTypeId.name}</Heading>
                    <HStack gap={2} size="sm">
                      <Text as="span" color="muted">Qty: {selectedInventoryItem.count}</Text>
                      <Text as="span" color="muted">•</Text>
                      <Text as="span" color="muted">Issued: {formatDate(selectedInventoryItem.issueDate)}</Text>
                    </HStack>
                  </div>
                </HStack>
              </Surface>
            )}

            {/* Item selection - only for assign */}
            {inventoryModalType === "assign" && (
              <div style={{ marginBottom: "var(--spacing-4)" }}>
                <Label color="body" spacing={1}>Item</Label>
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
                <Label color="body" spacing={1}>Count</Label>
                <Input type="number" name="count" value={inventoryFormData.count} onChange={handleInventoryFormChange} min={1} max={getMaxCount()} required />
                {inventoryFormData.hostelInventoryId && <Text size="xs" color="muted" style={{ marginTop: "var(--spacing-1)" }}>Maximum available: {getMaxCount()}</Text>}
              </div>
            )}

            {/* Status - only for edit */}
            {inventoryModalType === "edit" && (
              <div style={{ marginBottom: "var(--spacing-4)" }}>
                <Label color="body" spacing={1}>Status</Label>
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
              <Label color="body" spacing={1}>Condition</Label>
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
              <Label color="body" spacing={1}>Notes</Label>
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
