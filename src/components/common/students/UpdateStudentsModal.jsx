import { useState, useRef, useEffect } from "react"
import { FaFileUpload, FaCheck, FaTimes, FaFileDownload, FaUser, FaHeartbeat, FaUsers, FaPlus, FaTrash, FaUserGraduate, FaHome } from "react-icons/fa"
import StudentTableView from "./StudentTableView"
import Papa from "papaparse"
import ToggleButtonGroup from "../../common/ToggleButtonGroup"
import StudentDetailModal from "./StudentDetailModal"
import CsvUploader from "../../common/CsvUploader"
import { healthApi } from "../../../service"
import { adminApi } from "../../../service"
import toast from "react-hot-toast"
import { Input, Select, Checkbox, FileInput } from "@/components/ui"
import { Button, Modal } from "czero/react"

// Reusable styles using theme CSS variables
const styles = {
  container: { display: "flex", flexDirection: "column", gap: "var(--spacing-5)" },
  sectionTitle: { fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-secondary)" },
  subTitle: { fontSize: "var(--font-size-base)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-body)", marginBottom: "var(--spacing-2)" },
  label: { display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-body)", marginBottom: "var(--spacing-1)" },
  input: { width: "100%", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border-input)", padding: "var(--spacing-2) var(--spacing-3)", fontSize: "var(--font-size-sm)", backgroundColor: "var(--color-bg-primary)", color: "var(--color-text-body)", outline: "none" },
  select: { width: "100%", padding: "var(--spacing-2-5)", border: "1px solid var(--color-border-input)", borderRadius: "var(--radius-lg)", backgroundColor: "var(--color-bg-primary)", color: "var(--color-text-body)", outline: "none" },
  checkbox: { width: "var(--spacing-4)", height: "var(--spacing-4)", accentColor: "var(--color-primary)", borderRadius: "var(--radius-sm)" },
  errorBox: { padding: "var(--spacing-2) var(--spacing-4)", backgroundColor: "var(--color-danger-bg)", color: "var(--color-danger-text)", borderRadius: "var(--radius-lg)", borderLeft: "4px solid var(--color-danger)" },
  successBox: { marginTop: "var(--spacing-4)", padding: "var(--spacing-4)", backgroundColor: "var(--color-success-bg)", borderRadius: "var(--radius-lg)" },
  successText: { color: "var(--color-success-text)", fontWeight: "var(--font-weight-medium)" },
  tableContainer: { marginTop: "var(--spacing-4)", border: "1px solid var(--color-border-primary)", borderRadius: "var(--radius-lg)", overflowX: "auto" },
  table: { minWidth: "100%", borderCollapse: "collapse" },
  tableHeader: { backgroundColor: "var(--color-bg-tertiary)" },
  tableHeaderCell: { padding: "var(--spacing-3) var(--spacing-4)", textAlign: "left", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "var(--letter-spacing-wider)" },
  tableBody: { backgroundColor: "var(--color-bg-primary)" },
  tableRow: { borderTop: "1px solid var(--color-border-primary)" },
  tableRowAlt: { backgroundColor: "var(--color-bg-secondary)" },
  tableCell: { padding: "var(--spacing-2) var(--spacing-4)", whiteSpace: "nowrap", fontSize: "var(--font-size-sm)", color: "var(--color-text-primary)" },
  tablePagination: { padding: "var(--spacing-3) var(--spacing-4)", backgroundColor: "var(--color-bg-secondary)", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" },
  formCard: { padding: "var(--spacing-4)", border: "1px solid var(--color-border-primary)", borderRadius: "var(--radius-lg)", backgroundColor: "var(--color-bg-secondary)" },
  formCardTitle: { fontWeight: "var(--font-weight-medium)", color: "var(--color-text-body)" },
  deleteButton: { color: "var(--color-danger)", background: "none", border: "none", cursor: "pointer" },
  primaryButton: { display: "flex", alignItems: "center", padding: "var(--spacing-2) var(--spacing-3)", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-white)", backgroundColor: "var(--color-primary)", borderRadius: "var(--radius-md)", border: "none", cursor: "pointer" },
  secondaryButton: { display: "flex", alignItems: "center", padding: "var(--spacing-2) var(--spacing-3)", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-primary)", backgroundColor: "transparent", border: "1px solid var(--color-primary)", borderRadius: "var(--radius-md)", cursor: "pointer" },
  cancelButton: { padding: "var(--spacing-2-5) var(--spacing-4)", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-body)", backgroundColor: "var(--color-bg-primary)", border: "1px solid var(--color-border-input)", borderRadius: "var(--radius-lg)", cursor: "pointer" },
  confirmButton: { padding: "var(--spacing-2-5) var(--spacing-4)", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-white)", backgroundColor: "var(--color-primary)", borderRadius: "var(--radius-lg)", border: "none", cursor: "pointer", boxShadow: "var(--shadow-sm)", display: "flex", alignItems: "center" },
  toggleButtonActive: { padding: "var(--spacing-2) var(--spacing-4)", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", backgroundColor: "var(--color-primary)", color: "var(--color-white)", border: "none", cursor: "pointer" },
  toggleButtonInactive: { padding: "var(--spacing-2) var(--spacing-4)", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", backgroundColor: "var(--color-bg-primary)", color: "var(--color-text-body)", border: "1px solid var(--color-border-input)", cursor: "pointer" },
  dropZone: { border: "2px dashed var(--color-border-input)", borderRadius: "var(--radius-xl)", padding: "var(--spacing-8)", textAlign: "center", cursor: "pointer", backgroundColor: "var(--color-bg-secondary)", transition: "var(--transition-colors)" },
  dropZoneIcon: { margin: "0 auto", height: "3rem", width: "3rem", color: "var(--color-text-placeholder)" },
  dropZoneText: { marginTop: "var(--spacing-2)", fontSize: "var(--font-size-sm)", color: "var(--color-text-tertiary)" },
  dropZoneHint: { marginTop: "var(--spacing-3)", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" },
  fileInfoBox: { padding: "var(--spacing-2) var(--spacing-4)", backgroundColor: "var(--color-info-bg)", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", justifyContent: "space-between" },
  fileInfoText: { fontSize: "var(--font-size-sm)", color: "var(--color-info-text)" },
  instructionsBox: { fontSize: "var(--font-size-xs)", color: "var(--color-text-tertiary)", marginTop: "var(--spacing-2)", backgroundColor: "var(--color-bg-secondary)", padding: "var(--spacing-3)", borderRadius: "var(--radius-lg)", maxWidth: "28rem" },
  instructionsList: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "var(--spacing-1) var(--spacing-4)" },
  boldText: { fontWeight: "var(--font-weight-medium)" },
  validValuesBox: { marginTop: "var(--spacing-3)", display: "flex", flexDirection: "column", gap: "var(--spacing-2)" },
  validValuesLabel: { fontWeight: "var(--font-weight-medium)", color: "var(--color-info-text)" },
  validValuesContent: { color: "var(--color-text-body)", backgroundColor: "var(--color-info-bg)", padding: "var(--spacing-1)", borderRadius: "var(--radius-sm)" },
  loadingContainer: { display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--spacing-4)" },
  spinner: { width: "var(--spacing-6)", height: "var(--spacing-6)", border: "2px solid var(--skeleton-base)", borderTop: "2px solid var(--color-primary)", borderRadius: "var(--radius-full)" },
  smallSpinner: { width: "var(--spacing-4)", height: "var(--spacing-4)", marginRight: "var(--spacing-2)", border: "2px solid var(--color-white)", borderTop: "2px solid transparent", borderRadius: "var(--radius-full)" },
  loadingText: { marginLeft: "var(--spacing-2)", fontSize: "var(--font-size-sm)", color: "var(--color-text-tertiary)" },
  previewHeader: { display: "flex", flexDirection: "column", justifyContent: "space-between", marginBottom: "var(--spacing-4)" },
  previewBadge: { marginTop: "var(--spacing-2)", fontSize: "var(--font-size-sm)", color: "var(--color-text-tertiary)", backgroundColor: "var(--color-info-bg)", padding: "var(--spacing-1) var(--spacing-3)", borderRadius: "var(--radius-full)" },
  footer: { marginTop: "var(--spacing-6)", display: "flex", justifyContent: "flex-end", gap: "var(--spacing-3)", paddingTop: "var(--spacing-4)", borderTop: "1px solid var(--color-border-light)" },
  sectionDivider: { borderBottom: "1px solid var(--color-border-primary)", paddingBottom: "var(--spacing-4)" },
  flexRow: { display: "flex", gap: "var(--spacing-4)" },
  flexCol: { display: "flex", flexDirection: "column", gap: "var(--spacing-4)" },
  gridCols2: { display: "grid", gridTemplateColumns: "repeat(1, 1fr)", gap: "var(--spacing-4)" },
  colSpan2: { gridColumn: "span 2" },
  downloadLink: { display: "flex", alignItems: "center", fontSize: "var(--font-size-sm)", color: "var(--color-primary)", background: "none", border: "none", cursor: "pointer", marginBottom: "var(--spacing-2)" },
}


const UpdateStudentsModal = ({ isOpen, onClose, onUpdate }) => {
  const [csvFile, setCsvFile] = useState(null)
  const [parsedData, setParsedData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState(1)
  const fileInputRef = useRef(null)
  const [showStudentDetail, setShowStudentDetail] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [activeTab, setActiveTab] = useState("basic")
  const [healthData, setHealthData] = useState([])
  const [familyData, setFamilyData] = useState([])
  const [deleteExistingFamily, setDeleteExistingFamily] = useState(false)
  const [uploadStatus, setUploadStatus] = useState("")
  const [statusData, setStatusData] = useState([])
  const [selectedStatus, setSelectedStatus] = useState("Active")
  const [dayScholarData, setDayScholarData] = useState([])
  const [dayScholarMode, setDayScholarMode] = useState("add")
  const [validDegrees, setValidDegrees] = useState([])
  const [validDepartments, setValidDepartments] = useState([])
  const [configLoading, setConfigLoading] = useState(false)

  const availableFields = ["name", "email", "phone", "password", "profileImage", "gender", "dateOfBirth", "degree", "department", "year", "address", "admissionDate", "guardian", "guardianPhone", "guardianEmail"]
  const requiredFields = ["rollNumber"]

  // Fetch valid degrees and departments from the config API
  useEffect(() => {
    if (isOpen && activeTab === "basic") {
      fetchConfigData()
    }
  }, [isOpen, activeTab])

  const fetchConfigData = async () => {
    setConfigLoading(true)
    try {
      const [degreesResponse, departmentsResponse] = await Promise.all([adminApi.getDegrees(), adminApi.getDepartments()])

      setValidDegrees(degreesResponse.value || [])
      setValidDepartments(departmentsResponse.value || [])
    } catch (err) {
      console.error("Error fetching config data:", err)
      toast.error("Failed to load degree and department options. Some validations may not work properly.")
    } finally {
      setConfigLoading(false)
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.type !== "text/csv") {
        setError("Please upload a valid CSV file")
        return
      }
      setCsvFile(file)
      parseCSV(file)
    }
  }

  const generateCsvTemplate = () => {
    const headers = ["rollNumber", ...availableFields]
    const csvContent = headers.join(",")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "update_students_template.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      if (file.type !== "text/csv") {
        setError("Please upload a valid CSV file")
        return
      }
      setCsvFile(file)
      parseCSV(file)
    }
  }

  const parseCSV = (file) => {
    setIsLoading(true)
    setError("")

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          if (results.data.length > 900) {
            setError("Free accounts are limited to 900 records. Please upgrade or reduce your data.")
            setIsLoading(false)
            return
          }

          const headers = results.meta.fields
          const missingFields = requiredFields.filter((field) => !headers.includes(field))

          if (missingFields.length > 0) {
            setError(`Missing required fields: ${missingFields.join(", ")}`)
            setIsLoading(false)
            return
          }

          const updatableFields = headers.filter((field) => availableFields.includes(field))
          if (updatableFields.length === 0) {
            setError(`CSV must include at least one field to update: ${availableFields.join(", ")}`)
            setIsLoading(false)
            return
          }

          const validGenders = ["Male", "Female"]
          const invalidRecords = []
          const parsedData = results.data.map((student, index) => {
            const studentData = {
              rollNumber: student.rollNumber,
            }

            availableFields.forEach((field) => {
              if (student[field]) {
                if (field === "admissionDate") {
                  studentData[field] = student[field] || new Date().toISOString().split("T")[0]
                } else {
                  studentData[field] = student[field] || ""
                }
              }
            })

            // Validate gender if provided
            if (studentData.gender && !validGenders.includes(studentData.gender)) {
              invalidRecords.push({
                row: index + 2,
                field: "gender",
                value: studentData.gender,
                message: `Invalid gender: "${studentData.gender}". Only "Male" or "Female" are allowed.`,
              })
            }

            // Validate degree and department if they are provided
            if (studentData.degree && validDegrees.length > 0 && !validDegrees.includes(studentData.degree)) {
              invalidRecords.push({
                row: index + 2, // +2 because of 0-indexing and header row
                field: "degree",
                value: studentData.degree,
                message: `Invalid degree: "${studentData.degree}"`,
              })
            }

            if (studentData.department && validDepartments.length > 0 && !validDepartments.includes(studentData.department)) {
              invalidRecords.push({
                row: index + 2,
                field: "department",
                value: studentData.department,
                message: `Invalid department: "${studentData.department}"`,
              })
            }

            return studentData
          })

          if (invalidRecords.length > 0) {
            const errorMessages = invalidRecords.slice(0, 5).map((rec) => `Row ${rec.row}: ${rec.message}`)

            if (invalidRecords.length > 5) {
              errorMessages.push(`... and ${invalidRecords.length - 5} more errors`)
            }

            setError(`Invalid data detected:\n${errorMessages.join("\n")}`)
            setIsLoading(false)
            return
          }

          setParsedData(parsedData)
          setStep(2)
          setIsLoading(false)
        } catch (err) {
          setError("Failed to process CSV data. Please check the format.")
          setIsLoading(false)
        }
      },
      error: (error) => {
        setError(`Error parsing CSV: ${error.message}`)
        setIsLoading(false)
      },
    })
  }

  // Format array for display in the UI
  const formatArrayForDisplay = (arr) => {
    if (!arr || arr.length === 0) return "Loading..."

    if (arr.length <= 5) {
      return arr.join(", ")
    }

    return arr.slice(0, 5).join(", ") + `, ... (${arr.length - 5} more)`
  }

  const handleHealthDataParsed = (data) => {
    // Validate blood group format
    const validBloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

    const validatedData = data
      .map((item) => {
        // Remove spaces from blood group value before validation
        if (item.bloodGroup) {
          item.bloodGroup = item.bloodGroup.replace(/\s+/g, "")
        }

        // Check if blood group is valid
        if (item.bloodGroup && !validBloodGroups.includes(item.bloodGroup)) {
          setError(`Invalid blood group format: "${item.bloodGroup}" for roll number ${item.rollNumber}. Valid formats are: ${validBloodGroups.join(", ")}`)
          return null
        }
        return item
      })
      .filter(Boolean)

    if (validatedData.length === data.length) {
      setError("")
      setHealthData(validatedData)
      setUploadStatus(`${validatedData.length} records are ready to be updated`)
    }
  }

  const handleFamilyDataParsed = (data) => {
    // Validate required fields
    const invalidEntries = data.filter((item) => !item.rollNumber || !item.name)

    if (invalidEntries.length > 0) {
      setError("All family members must have both rollNumber and name fields")
      return
    }

    setError("")
    setFamilyData(data)
  }

  const handleStatusDataParsed = (data) => {
    // Validate required fields
    const invalidEntries = data.filter((item) => !item.rollNumber)

    if (invalidEntries.length > 0) {
      setError("All entries must have a rollNumber field")
      return
    }

    setError("")
    setStatusData(data)
    setUploadStatus(`${data.length} students will have their status updated to ${selectedStatus}`)
  }

  const handleDayScholarDataParsed = (data) => {
    // Validate required fields
    const invalidEntries = data.filter((item) => !item.rollNumber)

    if (invalidEntries.length > 0) {
      setError("All entries must have a rollNumber field")
      return
    }

    if (dayScholarMode === "add") {
      // Check if all required fields are present for add mode
      const missingFields = data.filter((item) => !item.address || !item.ownerName || !item.ownerPhone || !item.ownerEmail)

      if (missingFields.length > 0) {
        setError("All fields are required for day scholar students")
        return
      }
    }

    setError("")
    setDayScholarData(data)
    setUploadStatus(`${data.length} students ready for ${dayScholarMode === "add" ? "adding/updating as day scholars" : "removing from day scholars"}`)
    toast.success(`${data.length} students ready for update`)
  }

  const handleUpdate = async () => {
    if (activeTab === "basic" && parsedData.length === 0) {
      setError("No data to update")
      return
    }

    if (activeTab === "health" && healthData.length === 0) {
      setError("No health data to update")
      return
    }

    if (activeTab === "family" && familyData.length === 0) {
      setError("No family data to update")
      return
    }

    if (activeTab === "status" && statusData.length === 0) {
      setError("No students selected for status update")
      return
    }

    if (activeTab === "dayScholar" && dayScholarData.length === 0) {
      setError("No day scholar data to update")
      return
    }

    setIsUpdating(true)

    try {
      let isSuccess = false

      if (activeTab === "basic") {
        isSuccess = await onUpdate(parsedData, activeTab)
      } else if (activeTab === "health") {
        // Format health data for the API
        const formattedHealthData = {
          studentsData: healthData.map((student) => ({
            rollNumber: student.rollNumber,
            bloodGroup: student.bloodGroup,
          })),
        }

        isSuccess = await healthApi.updateBulkStudentHealth(formattedHealthData)
      } else if (activeTab === "family") {
        // Format family data for the API
        const formattedFamilyData = {
          familyData: {
            deleteExisting: deleteExistingFamily,
            members: familyData,
          },
        }

        isSuccess = await adminApi.updateBulkFamilyMembers(formattedFamilyData)
      } else if (activeTab === "status") {
        // Use the adminApi to update student statuses
        const rollNumbers = statusData.map((student) => student.rollNumber)
        isSuccess = await adminApi.bulkUpdateStudentsStatus(rollNumbers, selectedStatus)
      } else if (activeTab === "dayScholar") {
        // Format day scholar data for the API
        const formattedDayScholarData = {}

        dayScholarData.forEach((student) => {
          formattedDayScholarData[student.rollNumber] = {
            isDayScholar: dayScholarMode === "add",
            ...(dayScholarMode === "add" && {
              dayScholarDetails: {
                address: student.address || "",
                ownerName: student.ownerName || "",
                ownerPhone: student.ownerPhone || "",
                ownerEmail: student.ownerEmail || "",
              },
            }),
          }
        })

        const response = await adminApi.bulkUpdateDayScholarDetails(formattedDayScholarData)
        isSuccess = response.success

        if (isSuccess) {
          toast.success(`Successfully updated ${dayScholarData.length} student${dayScholarData.length > 1 ? "s" : ""} day scholar status`)
        } else if (response.errors && response.errors.length > 0) {
          toast.error(`Updated with ${response.errors.length} errors. Please check the details.`)
        }
      }

      if (isSuccess) {
        onClose()
        resetForm()
      }
    } catch (error) {
      setError(error.message || "An error occurred while updating")
      toast.error(error.message || "An error occurred while updating")
    } finally {
      setIsUpdating(false)
    }
  }

  const resetForm = () => {
    setCsvFile(null)
    setParsedData([])
    setHealthData([])
    setFamilyData([])
    setStatusData([])
    setDayScholarData([])
    setError("")
    setStep(1)
  }

  const viewStudentDetails = (student) => {
    setSelectedStudent(student)
    setShowStudentDetail(true)
  }

  // Define tabs
  const tabs = [
    { id: "basic", name: "Basic Details", icon: <FaUser /> },
    { id: "health", name: "Health Info", icon: <FaHeartbeat /> },
    { id: "family", name: "Family Members", icon: <FaUsers /> },
    { id: "status", name: "Status Update", icon: <FaUserGraduate /> },
    { id: "dayScholar", name: "Day Scholar", icon: <FaHome /> },
  ]

  // Health Tab Component
  const HealthInfoTab = () => {
    const healthTemplateHeaders = ["rollNumber", "bloodGroup"]

    const healthInstructionsText = (
      <div>
        <p style={styles.boldText}>Field Input Types:</p>
        <ul style={{ display: "grid", gridTemplateColumns: "1fr", gap: "var(--spacing-1)" }}>
          <li>
            <span style={styles.boldText}>rollNumber:</span> String (Required)
          </li>
          <li>
            <span style={styles.boldText}>bloodGroup:</span> String (A+, B+, AB+, O+, A-, B-, AB-, O-)
          </li>
        </ul>
      </div>
    )

    return (
      <div style={styles.container}>
        <h3 style={styles.sectionTitle}>Update Health Information</h3>

        <CsvUploader onDataParsed={handleHealthDataParsed} requiredFields={["rollNumber", "bloodGroup"]} templateFileName="health_update_template.csv" templateHeaders={healthTemplateHeaders} maxRecords={900} instructionText={healthInstructionsText} />

        {error && <div style={styles.errorBox}>{error}</div>}

        {healthData.length > 0 && !error && (
          <div style={styles.successBox}>
            <p style={styles.successText}>{uploadStatus}</p>
          </div>
        )}

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead style={styles.tableHeader}>
              <tr>
                <th scope="col" style={styles.tableHeaderCell}>
                  Roll Number
                </th>
                <th scope="col" style={styles.tableHeaderCell}>
                  Blood Group
                </th>
              </tr>
            </thead>
            <tbody style={styles.tableBody}>
              {healthData.slice(0, 5).map((item, index) => (
                <tr key={index} style={index % 2 === 0 ? styles.tableRow : { ...styles.tableRow, ...styles.tableRowAlt }}>
                  <td style={styles.tableCell}>{item.rollNumber}</td>
                  <td style={styles.tableCell}>{item.bloodGroup}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {healthData.length > 5 && <div style={styles.tablePagination}>Showing 5 of {healthData.length} records</div>}
        </div>
      </div>
    )
  }

  // Family Members Tab Component
  const FamilyMembersTab = () => {
    const [familyMembers, setFamilyMembers] = useState([
      {
        rollNumber: "",
        name: "",
        relationship: "",
        phone: "",
        email: "",
        address: "",
      },
    ])

    const familyTemplateHeaders = ["rollNumber", "name", "relationship", "phone", "email", "address"]

    const familyInstructionsText = (
      <div>
        <p className="font-medium mb-1">Field Input Types:</p>
        <ul className="grid grid-cols-1 gap-y-1">
          <li>
            <span className="font-medium">rollNumber:</span> String (Required)
          </li>
          <li>
            <span className="font-medium">name:</span> String (Required)
          </li>
          <li>
            <span className="font-medium">relationship:</span> String (Parent, Sibling, Guardian, etc.)
          </li>
          <li>
            <span className="font-medium">phone:</span> Number
          </li>
          <li>
            <span className="font-medium">email:</span> Email
          </li>
          <li>
            <span className="font-medium">address:</span> String
          </li>
        </ul>
      </div>
    )

    const addFamilyMember = () => {
      setFamilyMembers([
        ...familyMembers,
        {
          rollNumber: "",
          name: "",
          relationship: "",
          phone: "",
          email: "",
          address: "",
        },
      ])
    }

    const removeFamilyMember = (index) => {
      const newMembers = [...familyMembers]
      newMembers.splice(index, 1)
      setFamilyMembers(newMembers)
    }

    const handleChange = (index, field, value) => {
      const updatedMembers = [...familyMembers]
      updatedMembers[index][field] = value
      setFamilyMembers(updatedMembers)
    }

    const handleManualUpdate = () => {
      // Filter out empty members
      const validMembers = familyMembers.filter((m) => m.rollNumber && m.name)
      if (validMembers.length === 0) {
        setError("Please add at least one valid family member with Roll Number and Name")
        return
      }
      setFamilyData(validMembers)
    }

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <h3 className="text-lg font-medium text-gray-800">Update Family Members</h3>
          <div className="mt-2 sm:mt-0">
            <div className="flex items-center">
              <Checkbox
                id="deleteExisting"
                checked={deleteExistingFamily}
                onChange={(e) => setDeleteExistingFamily(e.target.checked)}
                label="Replace existing family members"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-4">
          <div className="border-b border-gray-200 pb-4">
            <h4 className="text-base font-medium text-gray-700 mb-2">Option 1: Upload CSV</h4>
            <CsvUploader onDataParsed={handleFamilyDataParsed} requiredFields={["rollNumber", "name"]} templateFileName="family_update_template.csv" templateHeaders={familyTemplateHeaders} maxRecords={900} instructionText={familyInstructionsText} />

            {familyData.length > 0 && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <p className="text-green-700 font-medium">{familyData.length} family members ready to update</p>
              </div>
            )}
          </div>

          <div>
            <h4 className="text-base font-medium text-gray-700 mb-4">Option 2: Add Family Members Manually</h4>

            <div className="space-y-4">
              {familyMembers.map((member, index) => (
                <div key={index} className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex justify-between mb-3">
                    <h5 className="font-medium text-gray-700">Family Member {index + 1}</h5>
                    {familyMembers.length > 1 && (
                      <Button onClick={() => removeFamilyMember(index)} variant="ghost" size="sm" aria-label="Remove family member"><FaTrash /></Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number *</label>
                      <Input type="text" value={member.rollNumber} onChange={(e) => handleChange(index, "rollNumber", e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                      <Input type="text" value={member.name} onChange={(e) => handleChange(index, "name", e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                      <Input type="text" value={member.relationship} onChange={(e) => handleChange(index, "relationship", e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <Input type="tel" value={member.phone} onChange={(e) => handleChange(index, "phone", e.target.value)} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <Input type="email" value={member.email} onChange={(e) => handleChange(index, "email", e.target.value)} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <Input type="text" value={member.address} onChange={(e) => handleChange(index, "address", e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}

              <div style={styles.flexRow}>
                <Button onClick={addFamilyMember} variant="outline" size="md">
                  <FaPlus />
                  Add Another Family Member
                </Button>

                <Button onClick={handleManualUpdate} variant="primary" size="md">
                  <FaCheck />
                  Save Family Members
                </Button>
              </div>

              {familyData.length > 0 && familyMembers.some((m) => m.rollNumber && m.name) && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <p className="text-green-700 font-medium">Family members ready to update</p>
                </div>
              )}
            </div>
          </div>

          {/* Preview table for family data */}
          {familyData.length > 0 && (
            <div className="mt-4 border rounded-lg overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Roll Number
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Relationship
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {familyData.slice(0, 5).map((member, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{member.rollNumber}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{member.name}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{member.relationship || "-"}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{member.phone || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {familyData.length > 5 && <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500">Showing 5 of {familyData.length} records</div>}
            </div>
          )}

          {error && <div className="py-2 px-4 bg-red-50 text-red-600 rounded-lg border-l-4 border-red-500">{error}</div>}
        </div>
      </div>
    )
  }

  // Status Update Tab Component
  const StatusUpdateTab = () => {
    const statusOptions = ["Active", "Graduated", "Dropped", "Inactive"]

    const handleStatusDataParsed = (data) => {
      // Validate required fields
      const invalidEntries = data.filter((item) => !item.rollNumber)

      if (invalidEntries.length > 0) {
        setError("All entries must have a rollNumber field")
        return
      }

      setError("")
      setStatusData(data)
      setUploadStatus(`${data.length} students will have their status updated to ${selectedStatus}`)
    }

    const statusTemplateHeaders = ["rollNumber"]

    const statusInstructionsText = (
      <div>
        <p className="font-medium mb-1">Field Input Types:</p>
        <ul className="grid grid-cols-1 gap-y-1">
          <li>
            <span className="font-medium">rollNumber:</span> String (Required) - The roll number of the student to update
          </li>
        </ul>
      </div>
    )

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-800">Update Student Status</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Status to Apply</label>
          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            options={statusOptions.map((status) => ({ value: status, label: status }))}
          />
          <p className="mt-1 text-sm text-gray-500">All selected students will be updated to this status</p>
        </div>

        <div className="border-t pt-4">
          <h4 className="text-base font-medium text-gray-700 mb-3">Upload CSV with Student Roll Numbers</h4>

          <CsvUploader onDataParsed={handleStatusDataParsed} requiredFields={["rollNumber"]} templateFileName="status_update_template.csv" templateHeaders={statusTemplateHeaders} maxRecords={900} instructionText={statusInstructionsText} />
        </div>

        {error && <div className="py-2 px-4 bg-red-50 text-red-600 rounded-lg border-l-4 border-red-500">{error}</div>}

        {statusData.length > 0 && !error && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <p className="text-green-700 font-medium">{uploadStatus}</p>
          </div>
        )}

        {statusData.length > 0 && (
          <div className="mt-4 border rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roll Number
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {statusData.slice(0, 10).map((student, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{student.rollNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {statusData.length > 10 && <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500">Showing 10 of {statusData.length} records</div>}
          </div>
        )}
      </div>
    )
  }

  // Day Scholar Tab Component
  const DayScholarTab = () => {
    const [dayScholarStudents, setDayScholarStudents] = useState([
      {
        rollNumber: "",
        address: "",
        ownerName: "",
        ownerPhone: "",
        ownerEmail: "",
      },
    ])

    const dayScholarTemplateHeaders = dayScholarMode === "add" ? ["rollNumber", "address", "ownerName", "ownerPhone", "ownerEmail"] : ["rollNumber"]

    const dayScholarInstructionsText = (
      <div>
        <p className="font-medium mb-1">Field Input Types:</p>
        <ul className="grid grid-cols-1 gap-y-1">
          <li>
            <span className="font-medium">rollNumber:</span> String (Required)
          </li>
          {dayScholarMode === "add" && (
            <>
              <li>
                <span className="font-medium">address:</span> String (Required)
              </li>
              <li>
                <span className="font-medium">ownerName:</span> String (Required)
              </li>
              <li>
                <span className="font-medium">ownerPhone:</span> String (Required)
              </li>
              <li>
                <span className="font-medium">ownerEmail:</span> String (Required)
              </li>
            </>
          )}
        </ul>
      </div>
    )

    const addDayScholarStudent = () => {
      setDayScholarStudents([
        ...dayScholarStudents,
        {
          rollNumber: "",
          address: "",
          ownerName: "",
          ownerPhone: "",
          ownerEmail: "",
        },
      ])
    }

    const removeDayScholarStudent = (index) => {
      const newStudents = [...dayScholarStudents]
      newStudents.splice(index, 1)
      setDayScholarStudents(newStudents)
    }

    const handleChange = (index, field, value) => {
      const updatedStudents = [...dayScholarStudents]
      updatedStudents[index][field] = value
      setDayScholarStudents(updatedStudents)
    }

    const handleManualUpdate = () => {
      // Filter out empty students
      const validStudents = dayScholarStudents.filter((s) => s.rollNumber)

      if (validStudents.length === 0) {
        setError("Please add at least one student with a Roll Number")
        return
      }

      if (dayScholarMode === "add") {
        // Check if all required fields are filled for add mode
        const invalidStudents = validStudents.filter((s) => !s.address || !s.ownerName || !s.ownerPhone || !s.ownerEmail)

        if (invalidStudents.length > 0) {
          setError("All fields are required for day scholar students")
          return
        }
      }

      setDayScholarData(validStudents)
      setError("")
      toast.success(`${validStudents.length} students ready for update`)
    }

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <h3 className="text-lg font-medium text-gray-800">Update Day Scholar Status</h3>
          <div className="mt-2 sm:mt-0">
            <ToggleButtonGroup
              options={[
                { value: "add", label: "Add/Update Day Scholar" },
                { value: "remove", label: "Remove Day Scholar" },
              ]}
              value={dayScholarMode}
              onChange={setDayScholarMode}
              shape="rounded"
              size="sm"
              variant="muted"
              hideLabelsOnMobile={false}
            />
          </div>
        </div>

        <div className="flex flex-col space-y-4">
          <div className="border-b border-gray-200 pb-4">
            <h4 className="text-base font-medium text-gray-700 mb-2">Option 1: Upload CSV</h4>
            <CsvUploader onDataParsed={handleDayScholarDataParsed} requiredFields={["rollNumber"]} templateFileName={dayScholarMode === "add" ? "day_scholar_add_template.csv" : "day_scholar_remove_template.csv"} templateHeaders={dayScholarTemplateHeaders} maxRecords={900} instructionText={dayScholarInstructionsText} />

            {dayScholarData.length > 0 && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <p className="text-green-700 font-medium">{uploadStatus}</p>
              </div>
            )}
          </div>

          <div>
            <h4 className="text-base font-medium text-gray-700 mb-4">Option 2: Add Students Manually</h4>

            <div className="space-y-4">
              {dayScholarStudents.map((student, index) => (
                <div key={index} className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex justify-between mb-3">
                    <h5 className="font-medium text-gray-700">Student {index + 1}</h5>
                    {dayScholarStudents.length > 1 && (
                      <Button onClick={() => removeDayScholarStudent(index)} variant="ghost" size="sm" aria-label="Remove student"><FaTrash /></Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number *</label>
                      <Input type="text" value={student.rollNumber} onChange={(e) => handleChange(index, "rollNumber", e.target.value)} required />
                    </div>

                    {dayScholarMode === "add" && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name *</label>
                          <Input type="text" value={student.ownerName} onChange={(e) => handleChange(index, "ownerName", e.target.value)} required />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Owner Phone *</label>
                          <Input type="tel" value={student.ownerPhone} onChange={(e) => handleChange(index, "ownerPhone", e.target.value)} required />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Owner Email *</label>
                          <Input type="email" value={student.ownerEmail} onChange={(e) => handleChange(index, "ownerEmail", e.target.value)} required />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                          <Input type="text" value={student.address} onChange={(e) => handleChange(index, "address", e.target.value)} required />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}

              <div style={styles.flexRow}>
                <Button onClick={addDayScholarStudent} variant="outline" size="md">
                  <FaPlus />
                  Add Another Student
                </Button>

                <Button onClick={handleManualUpdate} variant="primary" size="md">
                  <FaCheck />
                  Save Students
                </Button>
              </div>
            </div>
          </div>

          {/* Preview table for day scholar data */}
          {dayScholarData.length > 0 && (
            <div className="mt-4 border rounded-lg overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Roll Number
                    </th>
                    {dayScholarMode === "add" && (
                      <>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Address
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Owner Name
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Owner Phone
                        </th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dayScholarData.slice(0, 5).map((student, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{student.rollNumber}</td>
                      {dayScholarMode === "add" && (
                        <>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{student.address || "-"}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{student.ownerName || "-"}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{student.ownerPhone || "-"}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {dayScholarData.length > 5 && <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500">Showing 5 of {dayScholarData.length} records</div>}
            </div>
          )}

          {error && <div className="py-2 px-4 bg-red-50 text-red-600 rounded-lg border-l-4 border-red-500">{error}</div>}
        </div>
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <Modal title="Update Students in Bulk" onClose={onClose} width={900} tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === "basic" && (
        <>
          {step === 1 && (
            <div className="space-y-5">
              <div className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors" onDragOver={handleDragOver} onDrop={handleDrop} onClick={() => fileInputRef.current.click()}>
                <FaFileUpload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">Drag and drop a CSV file here, or click to select a file</p>
                <p className="mt-3 text-xs text-gray-500">
                  <strong>Required field:</strong> rollNumber (used as identifier - cannot be changed)
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  <strong>Updatable fields:</strong> {availableFields.join(", ")}
                </p>
                <FileInput ref={fileInputRef} hidden accept=".csv" onChange={handleFileUpload} />
              </div>
              <div className="flex flex-col items-center">
                <Button onClick={generateCsvTemplate} variant="ghost" size="sm">
                  <FaFileDownload />
                  Download CSV Template
                </Button>

                <div className="text-xs text-gray-600 mt-2 bg-gray-50 p-3 rounded-lg max-w-md">
                  <p className="font-medium mb-1">Field Input Types:</p>
                  <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <li>
                      <span className="font-medium">rollNumber:</span> String (Required)
                    </li>
                    <li>
                      <span className="font-medium">name:</span> String
                    </li>
                    <li>
                      <span className="font-medium">email:</span> Email
                    </li>
                    <li>
                      <span className="font-medium">phone:</span> Number
                    </li>
                    <li>
                      <span className="font-medium">password:</span> String
                    </li>
                    <li>
                      <span className="font-medium">gender:</span> Male/Female
                    </li>
                    <li>
                      <span className="font-medium">dateOfBirth:</span> YYYY-MM-DD
                    </li>
                    <li>
                      <span className="font-medium">degree:</span> {configLoading ? "Loading..." : validDegrees.length > 0 ? "Must be one of the valid degrees" : "String"}
                    </li>
                    <li>
                      <span className="font-medium">department:</span> {configLoading ? "Loading..." : validDepartments.length > 0 ? "Must be one of the valid departments" : "String"}
                    </li>
                    <li>
                      <span className="font-medium">year:</span> Number
                    </li>
                    <li>
                      <span className="font-medium">address:</span> String
                    </li>
                    <li>
                      <span className="font-medium">admissionDate:</span> YYYY-MM-DD
                    </li>
                    <li>
                      <span className="font-medium">guardian:</span> String
                    </li>
                    <li>
                      <span className="font-medium">guardianPhone:</span> Number
                    </li>
                    <li>
                      <span className="font-medium">guardianEmail:</span> Email
                    </li>
                  </ul>

                  {/* Display valid degrees and departments */}
                  {!configLoading && (
                    <div className="mt-3 space-y-2">
                      {validDegrees.length > 0 && (
                        <div>
                          <p className="font-medium text-blue-700">Valid Degrees:</p>
                          <p className="text-gray-700 bg-blue-50 p-1 rounded">{formatArrayForDisplay(validDegrees)}</p>
                        </div>
                      )}

                      {validDepartments.length > 0 && (
                        <div>
                          <p className="font-medium text-blue-700">Valid Departments:</p>
                          <p className="text-gray-700 bg-blue-50 p-1 rounded">{formatArrayForDisplay(validDepartments)}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {csvFile && (
                <div className="py-2 px-4 bg-blue-50 rounded-lg flex items-center justify-between">
                  <span className="text-sm text-blue-700">
                    Selected file: <span className="font-medium">{csvFile.name}</span>
                  </span>
                  <Button onClick={(e) => {
                    e.stopPropagation()
                    setCsvFile(null)
                  }} variant="ghost" size="sm" aria-label="Remove file"><FaTimes /></Button>
                </div>
              )}
              {error && <div className="py-2 px-4 bg-red-50 text-red-600 rounded-lg border-l-4 border-red-500 whitespace-pre-line">{error}</div>}
              {(isLoading || configLoading) && (
                <div className="flex items-center justify-center py-4">
                  <div className="w-6 h-6 border-2 border-t-2 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <span className="ml-2 text-sm text-gray-600">{isLoading ? "Processing file..." : "Loading configuration..."}</span>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <h3 className="text-lg font-medium text-gray-800">Preview Updates</h3>
                <div className="mt-2 sm:mt-0 text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">{parsedData.length} students will be updated</div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <StudentTableView currentStudents={parsedData} sortField="name" sortDirection="asc" handleSort={() => { }} viewStudentDetails={viewStudentDetails} />
              </div>

              {error && <div className="py-2 px-4 bg-red-50 text-red-600 rounded-lg border-l-4 border-red-500 whitespace-pre-line">{error}</div>}
            </div>
          )}
        </>
      )}

      {/* Health Tab */}
      {activeTab === "health" && <HealthInfoTab />}

      {/* Family Tab */}
      {activeTab === "family" && <FamilyMembersTab />}

      {/* Status Tab */}
      {activeTab === "status" && <StatusUpdateTab />}

      {/* Day Scholar Tab */}
      {activeTab === "dayScholar" && <DayScholarTab />}

      <div style={styles.footer}>
        {activeTab === "basic" && step === 1 ? (
          <Button onClick={onClose} variant="secondary" size="md">
            Cancel
          </Button>
        ) : activeTab === "basic" ? (
          <Button onClick={resetForm} variant="secondary" size="md">
            Back
          </Button>
        ) : (
          <Button onClick={onClose} variant="secondary" size="md">
            Cancel
          </Button>
        )}

        {(step === 2 || activeTab !== "basic") && (
          <Button onClick={handleUpdate} variant="primary" size="md" loading={isUpdating} disabled={(activeTab === "basic" && parsedData.length === 0) || (activeTab === "health" && healthData.length === 0) || (activeTab === "family" && familyData.length === 0) || (activeTab === "status" && statusData.length === 0) || (activeTab === "dayScholar" && dayScholarData.length === 0) || isLoading || isUpdating}>
            <FaCheck />
            {isUpdating ? "Updating Students..." : "Confirm Update"}
          </Button>
        )}
      </div>
      {showStudentDetail && selectedStudent && <StudentDetailModal selectedStudent={selectedStudent} setShowStudentDetail={setShowStudentDetail} onUpdate={null} isImport={true} />}
    </Modal>
  )
}

export default UpdateStudentsModal
