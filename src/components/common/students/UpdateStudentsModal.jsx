import { useState, useRef, useEffect, useMemo } from "react"
import { FaFileUpload, FaCheck, FaTimes, FaFileDownload, FaUser, FaHeartbeat, FaUsers, FaPlus, FaTrash, FaUserGraduate, FaHome, FaSearch } from "react-icons/fa"
import Papa from "papaparse"
import ToggleButtonGroup from "../../common/ToggleButtonGroup"
import SheetPreviewTable from "../../sheet/SheetPreviewTable"
import CsvUploader from "../../common/CsvUploader"
import { healthApi } from "../../../service"
import { adminApi } from "../../../service"
import { studentApi } from "../../../service"
import { useToast } from "@/components/ui/feedback"
import { Checkbox, FileInput, Grid, HStack, Select, Spinner } from "@/components/ui"
import { Button, Input } from "czero/react"
import { Modal } from "@/components/ui"
import { BULK_RECORD_LIMIT_MESSAGE, MAX_BULK_RECORDS } from "@/constants/systemLimits"
import { useSocket } from "../../../contexts/SocketProvider"
import { createBatchScopeOptions, MIXED_BATCH_SCOPE_KEY } from "../../../utils/studentBatchConfig"
import HealthInfoTab from "./update-students/HealthInfoTab"
import StatusUpdateTab from "./update-students/StatusUpdateTab"
import FamilyMembersTab from "./update-students/FamilyMembersTab"
import DayScholarTab from "./update-students/DayScholarTab"
import RollNumberCheckTab from "./update-students/RollNumberCheckTab"
import BatchAssignmentTab from "./update-students/BatchAssignmentTab"
import GroupsAssignmentTab from "./update-students/GroupsAssignmentTab"

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

const normalizeString = (value) => (value === null || value === undefined ? "" : String(value).trim())
const UPDATE_PROGRESS_EVENT = "students:update:progress"
const MAX_UPDATE_RESULT_ROWS_SHOWN = MAX_BULK_RECORDS

const createUpdateJobId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }

  return `student-update-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

const normalizeRollNumber = (value) => normalizeString(value).toUpperCase()
const normalizeEmail = (value) => normalizeString(value).toLowerCase()

const toOutcomeArray = (value) => (Array.isArray(value) ? value : (value ? [value] : []))

const buildUpdateResultRows = (students = [], outcome = null) => {
  const results = toOutcomeArray(outcome?.results)
  const errors = toOutcomeArray(outcome?.errors)

  const successRollNumbers = new Set()
  const successEmails = new Set()
  const failedByRollNumber = new Map()
  const failedByEmail = new Map()

  results.forEach((entry) => {
    const rollCandidates = [
      entry?.rollNumber,
      entry?.student?.rollNumber,
      entry?.student,
    ]
    const emailCandidates = [entry?.email, entry?.student?.email, entry?.student]

    rollCandidates.forEach((candidate) => {
      const roll = normalizeRollNumber(candidate)
      if (roll && !roll.includes("@")) successRollNumbers.add(roll)
    })

    emailCandidates.forEach((candidate) => {
      const email = normalizeEmail(candidate)
      if (email && email.includes("@")) successEmails.add(email)
    })
  })

  errors.forEach((entry) => {
    const message = normalizeString(entry?.message || entry?.reason || entry?.error) || "Update failed"
    const rollCandidates = [entry?.rollNumber, entry?.student]
    const emailCandidates = [entry?.email, entry?.student]

    rollCandidates.forEach((candidate) => {
      const roll = normalizeRollNumber(candidate)
      if (roll && !roll.includes("@") && !failedByRollNumber.has(roll)) {
        failedByRollNumber.set(roll, message)
      }
    })

    emailCandidates.forEach((candidate) => {
      const email = normalizeEmail(candidate)
      if (email && email.includes("@") && !failedByEmail.has(email)) {
        failedByEmail.set(email, message)
      }
    })
  })

  const requestFailedMessage = normalizeString(outcome?.message) || "Update failed"

  return students.map((student) => {
    const rollNumber = normalizeString(student?.rollNumber) || "—"
    const email = normalizeString(student?.email) || "—"
    const normalizedRoll = normalizeRollNumber(rollNumber)
    const normalizedEmailValue = normalizeEmail(email)

    const matchedError = failedByRollNumber.get(normalizedRoll) || failedByEmail.get(normalizedEmailValue)
    if (matchedError) {
      return { rollNumber, email, successStatus: "Failed", reason: matchedError }
    }

    if (successRollNumbers.has(normalizedRoll) || successEmails.has(normalizedEmailValue)) {
      return { rollNumber, email, successStatus: "Success", reason: "—" }
    }

    if (outcome?.success === false) {
      return { rollNumber, email, successStatus: "Failed", reason: requestFailedMessage }
    }

    if (errors.length > 0) {
      return { rollNumber, email, successStatus: "Failed", reason: "Not updated" }
    }

    return { rollNumber, email, successStatus: "Success", reason: "—" }
  })
}

const escapeCSV = (value) => {
  const str = String(value ?? "")
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

const downloadCSV = (rows, filenameBase) => {
  if (!Array.isArray(rows) || rows.length === 0) return false

  const headers = ["roll number", "email", "success status", "reason"]
  const csvContent = [
    headers.map(escapeCSV).join(","),
    ...rows.map((row) => ([
      row?.["roll number"] ?? "",
      row?.email ?? "",
      row?.["success status"] ?? "",
      row?.reason ?? "",
    ]).map(escapeCSV).join(",")),
  ].join("\n")

  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", `${filenameBase}_${new Date().toISOString().split("T")[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  return true
}

const downloadRollNumberCSV = (rollNumbers = [], filenameBase) => {
  if (!Array.isArray(rollNumbers) || rollNumbers.length === 0) return false

  const csvContent = [
    "rollNumber",
    ...rollNumbers.map((rollNumber) => escapeCSV(rollNumber)),
  ].join("\n")

  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", `${filenameBase}_${new Date().toISOString().split("T")[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  return true
}

const uniqueNonEmptyValues = (values = []) => {
  const seen = new Set()
  const unique = []

  values.forEach((value) => {
    const normalized = normalizeString(value)
    if (!normalized) return
    const key = normalized.toLowerCase()
    if (seen.has(key)) return
    seen.add(key)
    unique.push(normalized)
  })

  return unique
}


const UpdateStudentsModal = ({ isOpen, onClose, onUpdate }) => {
  const { toast } = useToast()
  const { on, isConnected } = useSocket()

  const [csvFile, setCsvFile] = useState(null)
  const [parsedData, setParsedData] = useState([])
  const [basicValidationIssues, setBasicValidationIssues] = useState([])
  const [basicInvalidCellMap, setBasicInvalidCellMap] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState(1)
  const fileInputRef = useRef(null)
  const updateJobIdRef = useRef(null)
  const [activeTab, setActiveTab] = useState("basic")
  const [healthData, setHealthData] = useState([])
  const [familyData, setFamilyData] = useState([])
  const [deleteExistingFamily, setDeleteExistingFamily] = useState(false)
  const [uploadStatus, setUploadStatus] = useState("")
  const [statusData, setStatusData] = useState([])
  const [selectedStatus, setSelectedStatus] = useState("Active")
  const [rollNumberCheckData, setRollNumberCheckData] = useState([])
  const [rollNumberCheckSummary, setRollNumberCheckSummary] = useState(null)
  const [rollNumberCheckScopeType, setRollNumberCheckScopeType] = useState("system")
  const [selectedRollCheckGroup, setSelectedRollCheckGroup] = useState("")
  const [selectedRollCheckDegree, setSelectedRollCheckDegree] = useState("")
  const [selectedRollCheckDepartment, setSelectedRollCheckDepartment] = useState("")
  const [selectedRollCheckBatch, setSelectedRollCheckBatch] = useState("")
  const [availableRollCheckBatches, setAvailableRollCheckBatches] = useState([])
  const [rollCheckBatchOptionsLoading, setRollCheckBatchOptionsLoading] = useState(false)
  const [dayScholarData, setDayScholarData] = useState([])
  const [dayScholarMode, setDayScholarMode] = useState("add")
  const [batchAssignmentData, setBatchAssignmentData] = useState([])
  const [batchSelectionMode, setBatchSelectionMode] = useState("csv")
  const [batchAssignmentMode, setBatchAssignmentMode] = useState("append")
  const [batchRangeStart, setBatchRangeStart] = useState("")
  const [batchRangeEnd, setBatchRangeEnd] = useState("")
  const [selectedBatchDegree, setSelectedBatchDegree] = useState("")
  const [selectedBatchDepartment, setSelectedBatchDepartment] = useState("")
  const [selectedBatch, setSelectedBatch] = useState("")
  const [availableBatches, setAvailableBatches] = useState([])
  const [groupAssignmentData, setGroupAssignmentData] = useState([])
  const [groupSelectionMode, setGroupSelectionMode] = useState("csv")
  const [groupAssignmentMode, setGroupAssignmentMode] = useState("add")
  const [groupRangeStart, setGroupRangeStart] = useState("")
  const [groupRangeEnd, setGroupRangeEnd] = useState("")
  const [availableStudentGroups, setAvailableStudentGroups] = useState([])
  const [selectedGroups, setSelectedGroups] = useState([])
  const [batchOptionsLoading, setBatchOptionsLoading] = useState(false)
  const [validDegrees, setValidDegrees] = useState([])
  const [validDepartments, setValidDepartments] = useState([])
  const [showAllDegrees, setShowAllDegrees] = useState(false)
  const [showAllDepartments, setShowAllDepartments] = useState(false)
  const [configLoading, setConfigLoading] = useState(false)
  const [updateProgress, setUpdateProgress] = useState({
    phase: "idle",
    total: 0,
    processed: 0,
    updated: 0,
    failed: 0,
    message: null,
  })
  const [updateResultRows, setUpdateResultRows] = useState([])

  const batchDegreeOptions = useMemo(
    () => createBatchScopeOptions(validDegrees, "degree"),
    [validDegrees]
  )

  const batchDepartmentOptions = useMemo(
    () => createBatchScopeOptions(validDepartments, "department"),
    [validDepartments]
  )

  const availableFields = ["name", "email", "secondaryEmail", "facultyAdvisorEmail", "phone", "profileImage", "gender", "dateOfBirth", "degree", "department", "year", "address", "admissionDate", "guardian", "guardianPhone", "guardianEmail"]
  const requiredFields = ["rollNumber"]
  const VISIBLE_REFERENCE_LIMIT = 25

  const displayedDegrees = useMemo(
    () => (showAllDegrees ? validDegrees : validDegrees.slice(0, VISIBLE_REFERENCE_LIMIT)),
    [showAllDegrees, validDegrees]
  )
  const displayedDepartments = useMemo(
    () => (showAllDepartments ? validDepartments : validDepartments.slice(0, VISIBLE_REFERENCE_LIMIT)),
    [showAllDepartments, validDepartments]
  )
  const invalidDegreeValues = useMemo(
    () => uniqueNonEmptyValues(basicValidationIssues.filter((issue) => issue.field === "degree").map((issue) => issue.value)),
    [basicValidationIssues]
  )
  const invalidDepartmentValues = useMemo(
    () => uniqueNonEmptyValues(basicValidationIssues.filter((issue) => issue.field === "department").map((issue) => issue.value)),
    [basicValidationIssues]
  )
  const progressPercent = useMemo(() => {
    if (!updateProgress.total) return 0
    return Math.max(0, Math.min(100, Math.round((updateProgress.processed / updateProgress.total) * 100)))
  }, [updateProgress])

  const updateResultSheetRows = useMemo(() => (
    updateResultRows.map((row) => ({
      "roll number": row.rollNumber,
      email: row.email,
      "success status": row.successStatus,
      reason: row.reason,
    }))
  ), [updateResultRows])

  const updateDisplayedSheetRows = useMemo(
    () => updateResultSheetRows.slice(0, MAX_UPDATE_RESULT_ROWS_SHOWN),
    [updateResultSheetRows]
  )
  const updateSuccessCount = useMemo(
    () => updateResultRows.filter((row) => row.successStatus === "Success").length,
    [updateResultRows]
  )
  const updateFailedCount = useMemo(
    () => updateResultRows.filter((row) => row.successStatus === "Failed").length,
    [updateResultRows]
  )
  const isBasicUpdateCompleted = updateProgress.phase === "completed" || updateProgress.phase === "failed"

  const getBasicPreviewCellStyle = (column, _value, _row, rowIndex) => {
    const rowIssues = basicInvalidCellMap[rowIndex] || {}
    if (column === "degree" && rowIssues.degree) {
      return { backgroundColor: "var(--color-warning-bg)", color: "var(--color-warning-text)", fontWeight: "var(--font-weight-medium)" }
    }
    if (column === "department" && rowIssues.department) {
      return { backgroundColor: "var(--color-danger-bg-light)", color: "var(--color-danger-text)", fontWeight: "var(--font-weight-medium)" }
    }
    if (column === "gender" && rowIssues.gender) {
      return { backgroundColor: "var(--color-info-bg)", color: "var(--color-info-text)", fontWeight: "var(--font-weight-medium)" }
    }
    if (["email", "guardianEmail", "secondaryEmail", "facultyAdvisorEmail"].includes(column) && rowIssues[column]) {
      return { backgroundColor: "var(--color-danger-bg-light)", color: "var(--color-danger-text)", fontWeight: "var(--font-weight-medium)" }
    }
    return null
  }

  // Fetch valid degrees and departments from the config API
  useEffect(() => {
    if (isOpen && (activeTab === "basic" || activeTab === "batch" || activeTab === "groups" || activeTab === "rollCheck")) {
      fetchConfigData()
    }
  }, [isOpen, activeTab])

  useEffect(() => {
    if (!isOpen || activeTab !== "batch") return
    if (!selectedBatchDegree || !selectedBatchDepartment) {
      setAvailableBatches([])
      setSelectedBatch("")
      return
    }

    const loadBatchOptions = async () => {
      setBatchOptionsLoading(true)
      try {
        const response = await studentApi.getBatchList({
          degree: selectedBatchDegree,
          department: selectedBatchDepartment,
        })
        setAvailableBatches(response || [])
        if (selectedBatch && !(response || []).includes(selectedBatch)) {
          setSelectedBatch("")
        }
      } catch (err) {
        console.error("Error fetching batch options:", err)
        toast.error("Failed to load batch options for the selected degree and department.")
        setAvailableBatches([])
        setSelectedBatch("")
      } finally {
        setBatchOptionsLoading(false)
      }
    }

    loadBatchOptions()
  }, [activeTab, isOpen, selectedBatchDegree, selectedBatchDepartment])

  useEffect(() => {
    if (!isOpen || activeTab !== "rollCheck" || rollNumberCheckScopeType !== "batch") return
    if (!selectedRollCheckDegree || !selectedRollCheckDepartment) {
      setAvailableRollCheckBatches([])
      setSelectedRollCheckBatch("")
      return
    }

    const loadRollCheckBatchOptions = async () => {
      setRollCheckBatchOptionsLoading(true)
      try {
        const response = await studentApi.getBatchList({
          degree: selectedRollCheckDegree,
          department: selectedRollCheckDepartment,
        })
        setAvailableRollCheckBatches(response || [])
        if (selectedRollCheckBatch && !(response || []).includes(selectedRollCheckBatch)) {
          setSelectedRollCheckBatch("")
        }
      } catch (err) {
        console.error("Error fetching roll check batch options:", err)
        toast.error("Failed to load batch options for the selected degree and department.")
        setAvailableRollCheckBatches([])
        setSelectedRollCheckBatch("")
      } finally {
        setRollCheckBatchOptionsLoading(false)
      }
    }

    loadRollCheckBatchOptions()
  }, [
    activeTab,
    isOpen,
    rollNumberCheckScopeType,
    selectedRollCheckDegree,
    selectedRollCheckDepartment,
    selectedRollCheckBatch,
  ])

  useEffect(() => {
    if (!on) return undefined

    const cleanup = on(UPDATE_PROGRESS_EVENT, (payload) => {
      if (!payload || !updateJobIdRef.current) return
      if (payload.jobId !== updateJobIdRef.current) return

      setUpdateProgress({
        phase: payload.phase || "processing",
        total: payload.total || 0,
        processed: payload.processed || 0,
        updated: payload.updated || 0,
        failed: payload.failed || 0,
        message: payload.message || null,
      })
    })

    return () => {
      if (typeof cleanup === "function") {
        cleanup()
      }
    }
  }, [on])

  useEffect(() => {
    if (availableStudentGroups.length === 0) {
      setSelectedGroups([])
      return
    }

    setSelectedGroups((prev) => prev.filter((group) => availableStudentGroups.includes(group)))
  }, [availableStudentGroups])

  const fetchConfigData = async () => {
    setConfigLoading(true)
    try {
      const [degreesResponse, departmentsResponse, studentGroupsResponse] = await Promise.all([
        adminApi.getDegrees(),
        adminApi.getDepartments(),
        adminApi.getStudentGroups(),
      ])
      setValidDegrees(uniqueNonEmptyValues(degreesResponse.value || []))
      setValidDepartments(uniqueNonEmptyValues(departmentsResponse.value || []))
      setAvailableStudentGroups(uniqueNonEmptyValues(studentGroupsResponse.value || []))
    } catch (err) {
      console.error("Error fetching config data:", err)
      toast.error("Failed to load degree, department, or group options. Some validations may not work properly.")
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
    setBasicValidationIssues([])
    setBasicInvalidCellMap({})

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          if (results.data.length > MAX_BULK_RECORDS) {
            setError(BULK_RECORD_LIMIT_MESSAGE)
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
          const emailFields = ["email", "guardianEmail", "secondaryEmail", "facultyAdvisorEmail"]
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          const degreeLookup = new Set(validDegrees.map((value) => value.toLowerCase()))
          const departmentLookup = new Set(validDepartments.map((value) => value.toLowerCase()))
          const invalidRecords = []
          const invalidCellMap = {}
          const parsedData = results.data.map((student, index) => {
            const studentData = {
              rollNumber: normalizeString(student.rollNumber),
            }

            availableFields.forEach((field) => {
              if (student[field] !== undefined && student[field] !== null && String(student[field]).trim() !== "") {
                // Date-only fields (admissionDate, dateOfBirth) are kept as the
                // raw "YYYY-MM-DD" string the CSV provides — no Date conversion,
                // so no timezone day-shift. The backend normalizes/validates.
                studentData[field] = normalizeString(student[field])
              }
            })

            const rowInvalidMap = {}

            // Validate gender if provided
            if (studentData.gender && !validGenders.includes(studentData.gender)) {
              const issue = {
                row: index + 2,
                field: "gender",
                value: studentData.gender,
                message: `Invalid gender: "${studentData.gender}". Only "Male" or "Female" are allowed.`,
              }
              invalidRecords.push(issue)
              rowInvalidMap.gender = issue.message
            }

            // Validate degree and department if they are provided
            if (studentData.degree && degreeLookup.size > 0 && !degreeLookup.has(studentData.degree.toLowerCase())) {
              const issue = {
                row: index + 2,
                field: "degree",
                value: studentData.degree,
                message: `Invalid degree: "${studentData.degree}"`,
              }
              invalidRecords.push(issue)
              rowInvalidMap.degree = issue.message
            }

            if (studentData.department && departmentLookup.size > 0 && !departmentLookup.has(studentData.department.toLowerCase())) {
              const issue = {
                row: index + 2,
                field: "department",
                value: studentData.department,
                message: `Invalid department: "${studentData.department}"`,
              }
              invalidRecords.push(issue)
              rowInvalidMap.department = issue.message
            }

            emailFields.forEach((field) => {
              if (studentData[field] && !emailPattern.test(studentData[field])) {
                const issue = {
                  row: index + 2,
                  field,
                  value: studentData[field],
                  message: `Invalid ${field}: "${studentData[field]}"`,
                }
                invalidRecords.push(issue)
                rowInvalidMap[field] = issue.message
              }
            })

            if (Object.keys(rowInvalidMap).length > 0) {
              invalidCellMap[index] = rowInvalidMap
            }

            return studentData
          })

          if (invalidRecords.length > 0) {
            const groupedSummary = invalidRecords.reduce((acc, issue) => {
              acc[issue.field] = (acc[issue.field] || 0) + 1
              return acc
            }, {})
            const summaryText = Object.entries(groupedSummary).map(([field, count]) => `${count} ${field}`).join(", ")
            setError(`Invalid values found (${summaryText}). Invalid cells are highlighted in the sheet. Fix them before confirming update.`)
          } else {
            setError("")
          }

          setBasicValidationIssues(invalidRecords)
          setBasicInvalidCellMap(invalidCellMap)
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

  const renderReferenceValues = (title, values, displayedValues, showAll, setShowAll) => {
    if (values.length === 0) return null

    return (
      <div>
        <p className="font-medium text-blue-700">{title} ({values.length})</p>
        <div className="text-gray-700 bg-blue-50 p-2 rounded max-h-40 overflow-auto">
          {displayedValues.join(", ")}
        </div>
        {values.length > VISIBLE_REFERENCE_LIMIT && (
          <Button
            onClick={() => setShowAll((prev) => !prev)}
            variant="ghost"
            size="sm"
          >
            {showAll ? "Show less" : `Show all (${values.length})`}
          </Button>
        )}
      </div>
    )
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

  const handleRollNumberCheckDataParsed = (data) => {
    const normalizedRollNumbers = (Array.isArray(data) ? data : [])
      .map((item) => normalizeRollNumber(item?.rollNumber))
      .filter(Boolean)

    if (normalizedRollNumbers.length === 0) {
      setError("All entries must have a rollNumber field")
      setRollNumberCheckData([])
      setRollNumberCheckSummary(null)
      return
    }

    const uniqueRollNumbers = [...new Set(normalizedRollNumbers)]
    const duplicateCount = normalizedRollNumbers.length - uniqueRollNumbers.length

    setError("")
    setRollNumberCheckData(uniqueRollNumbers.map((rollNumber) => ({ rollNumber })))
    setRollNumberCheckSummary(null)
    setUploadStatus(
      `${uniqueRollNumbers.length} unique roll numbers ready to check${duplicateCount > 0 ? ` (${duplicateCount} duplicate entries removed)` : ""}`
    )
  }

  const handleRollNumberCheckScopeTypeChange = (nextScopeType) => {
    setRollNumberCheckScopeType(nextScopeType)
    setSelectedRollCheckGroup("")
    setSelectedRollCheckDegree("")
    setSelectedRollCheckDepartment("")
    setSelectedRollCheckBatch("")
    setAvailableRollCheckBatches([])
    setRollNumberCheckSummary(null)
    setError("")
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

  const handleBatchDataParsed = (data) => {
    const invalidEntries = data.filter((item) => !item.rollNumber)

    if (invalidEntries.length > 0) {
      setError("All entries must have a rollNumber field")
      return
    }

    setError("")
    const normalizedData = data.map((item) => ({
      ...item,
      rollNumber: normalizeString(item.rollNumber).toUpperCase(),
    }))
    setBatchAssignmentData(normalizedData)
    setUploadStatus(`${normalizedData.length} students ready for batch assignment`)
    toast.success(`${normalizedData.length} students ready for batch assignment`)
  }

  const handleBatchSelectionModeChange = (nextMode) => {
    setBatchSelectionMode(nextMode)
    setBatchAssignmentData([])
    setBatchRangeStart("")
    setBatchRangeEnd("")
    setUploadStatus("")
    setError("")
  }

  const handleBatchRangeChange = (field, value) => {
    const normalizedValue = normalizeString(value).replace(/\s+/g, "")

    if (field === "start") {
      setBatchRangeStart(normalizedValue)
    } else {
      setBatchRangeEnd(normalizedValue)
    }

    const nextStart = field === "start" ? normalizedValue : batchRangeStart
    const nextEnd = field === "end" ? normalizedValue : batchRangeEnd
    if (nextStart && nextEnd) {
      setUploadStatus(`Numeric roll number range ${nextStart} to ${nextEnd} is ready for batch assignment`)
      setError("")
    } else {
      setUploadStatus("")
    }
  }

  const handleGroupDataParsed = (data) => {
    const invalidEntries = data.filter((item) => !item.rollNumber)

    if (invalidEntries.length > 0) {
      setError("All entries must have a rollNumber field")
      return
    }

    setError("")
    const normalizedData = data.map((item) => ({
      ...item,
      rollNumber: normalizeString(item.rollNumber).toUpperCase(),
    }))
    setGroupAssignmentData(normalizedData)
    setUploadStatus(`${normalizedData.length} students ready for group assignment`)
    toast.success(`${normalizedData.length} students ready for group assignment`)
  }

  const handleGroupSelectionModeChange = (nextMode) => {
    setGroupSelectionMode(nextMode)
    setGroupAssignmentData([])
    setGroupRangeStart("")
    setGroupRangeEnd("")
    setUploadStatus("")
    setError("")
  }

  const handleGroupRangeChange = (field, value) => {
    const normalizedValue = normalizeString(value).replace(/\s+/g, "")

    if (field === "start") {
      setGroupRangeStart(normalizedValue)
    } else {
      setGroupRangeEnd(normalizedValue)
    }

    const nextStart = field === "start" ? normalizedValue : groupRangeStart
    const nextEnd = field === "end" ? normalizedValue : groupRangeEnd
    if (nextStart && nextEnd) {
      setUploadStatus(`Numeric roll number range ${nextStart} to ${nextEnd} is ready for group assignment`)
      setError("")
    } else {
      setUploadStatus("")
    }
  }

  const handleGroupToggle = (event) => {
    const { value, checked } = event.target

    setSelectedGroups((prev) => {
      if (checked) {
        return uniqueNonEmptyValues([...prev, value])
      }

      return prev.filter((group) => group !== value)
    })
    setError("")
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

    if (activeTab === "rollCheck" && rollNumberCheckData.length === 0) {
      setError("No roll numbers selected for checking")
      return
    }

    if (activeTab === "rollCheck" && rollNumberCheckScopeType === "group" && !selectedRollCheckGroup) {
      setError("Select a group before checking")
      return
    }

    if (
      activeTab === "rollCheck" &&
      rollNumberCheckScopeType === "batch" &&
      (!selectedRollCheckDegree || !selectedRollCheckDepartment || !selectedRollCheckBatch)
    ) {
      setError("Select degree, department, and batch before checking")
      return
    }

    if (activeTab === "dayScholar" && dayScholarData.length === 0) {
      setError("No day scholar data to update")
      return
    }

    if (activeTab === "batch" && (!selectedBatchDegree || !selectedBatchDepartment || !selectedBatch)) {
      setError("Select degree, department, and batch before confirming the update")
      return
    }

    if (activeTab === "batch" && batchSelectionMode === "csv" && batchAssignmentData.length === 0) {
      setError("No students selected for batch assignment")
      return
    }

    if (activeTab === "batch" && batchSelectionMode === "range") {
      if (!batchRangeStart || !batchRangeEnd) {
        setError("Provide both range start and range end before confirming the update")
        return
      }

      if (!/^\d+$/.test(batchRangeStart) || !/^\d+$/.test(batchRangeEnd)) {
        setError("Range mode supports only purely numeric roll numbers")
        return
      }

      if (BigInt(batchRangeStart) > BigInt(batchRangeEnd)) {
        setError("Range start must be less than or equal to range end")
        return
      }
    }

    if (activeTab === "groups" && selectedGroups.length === 0) {
      setError("Select at least one group before confirming the update")
      return
    }

    if (activeTab === "groups" && groupSelectionMode === "csv" && groupAssignmentData.length === 0) {
      setError("No students selected for group assignment")
      return
    }

    if (activeTab === "groups" && groupSelectionMode === "range") {
      if (!groupRangeStart || !groupRangeEnd) {
        setError("Provide both range start and range end before confirming the update")
        return
      }

      if (!/^\d+$/.test(groupRangeStart) || !/^\d+$/.test(groupRangeEnd)) {
        setError("Range mode supports only purely numeric roll numbers")
        return
      }

      if (BigInt(groupRangeStart) > BigInt(groupRangeEnd)) {
        setError("Range start must be less than or equal to range end")
        return
      }
    }

    setIsUpdating(true)

    try {
      let isSuccess = false

      if (activeTab === "basic") {
        setStep(3)
        setError("")
        setUpdateResultRows([])

        const updateJobId = createUpdateJobId()
        updateJobIdRef.current = updateJobId
        setUpdateProgress({
          phase: "started",
          total: parsedData.length,
          processed: 0,
          updated: 0,
          failed: 0,
          message: "Student update started",
        })

        const rawOutcome = await onUpdate(parsedData, activeTab, { updateJobId })
        const outcome = rawOutcome && typeof rawOutcome === "object"
          ? rawOutcome
          : {
            success: Boolean(rawOutcome),
            message: rawOutcome ? "Students updated successfully" : "Failed to update students",
            results: [],
            errors: [],
          }
        const finalRows = buildUpdateResultRows(parsedData, outcome)
        const successful = finalRows.filter((row) => row.successStatus === "Success").length
        const failed = finalRows.filter((row) => row.successStatus === "Failed").length
        const total = finalRows.length
        const requestFailed = outcome?.success === false && successful === 0

        setUpdateResultRows(finalRows)
        setUpdateProgress({
          phase: requestFailed ? "failed" : "completed",
          total,
          processed: total,
          updated: successful,
          failed,
          message: normalizeString(outcome?.message)
            || (failed > 0
              ? `Update completed with ${failed} failed records`
              : "Update completed successfully"),
        })
        setError(requestFailed ? (normalizeString(outcome?.message) || "Update failed") : "")
        return
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
      } else if (activeTab === "rollCheck") {
        const response = await studentApi.checkMissingRollNumbers(
          rollNumberCheckData.map((student) => student.rollNumber),
          {
            scopeType: rollNumberCheckScopeType,
            ...(rollNumberCheckScopeType === "group" ? { groupName: selectedRollCheckGroup } : {}),
            ...(rollNumberCheckScopeType === "batch"
              ? {
                degree: selectedRollCheckDegree,
                department: selectedRollCheckDepartment,
                batch: selectedRollCheckBatch,
              }
              : {}),
          }
        )
        setRollNumberCheckSummary(response)
        setError("")

        if ((response?.missingCount || 0) > 0 || (response?.outOfScopeCount || 0) > 0) {
          toast.success(
            `Check complete. ${response?.missingCount || 0} missing in system, ${response?.outOfScopeCount || 0} outside the selected scope.`
          )
        } else {
          toast.success("All uploaded roll numbers matched the selected check.")
        }
        return
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
      } else if (activeTab === "batch") {
        const response = await studentApi.bulkUpdateBatchAssignment({
          degree: selectedBatchDegree,
          department: selectedBatchDepartment,
          batch: selectedBatch,
          assignmentMode: batchAssignmentMode,
          ...(batchSelectionMode === "csv"
            ? { rollNumbers: batchAssignmentData.map((student) => student.rollNumber) }
            : { rollNumberRange: { start: batchRangeStart, end: batchRangeEnd } }),
        })
        isSuccess = true

        const unsuccessfulCount = Array.isArray(response?.unsuccessfulRollNumbers)
          ? response.unsuccessfulRollNumbers.length
          : 0
        const clearedCount = response?.clearedCount || 0
        if (unsuccessfulCount > 0) {
          toast.success(`Updated ${response.updatedCount || 0} students. ${unsuccessfulCount} roll numbers were not found.`)
        } else {
          const appliedDegree = response?.assignment?.appliedDegree
          const appliedDepartment = response?.assignment?.appliedDepartment
          const assignmentSummary = [
            appliedDegree ? `degree ${appliedDegree}` : "existing degree",
            appliedDepartment ? `department ${appliedDepartment}` : "existing department",
          ].join(", ")
          const matchedCount = response?.matchedCount || response?.updatedCount || 0
          const replaceSummary = batchAssignmentMode === "replace"
            ? ` Replaced the existing list and cleared ${clearedCount} previous assignment${clearedCount === 1 ? "" : "s"}.`
            : ""
          toast.success(`Successfully assigned ${matchedCount} student${matchedCount === 1 ? "" : "s"} to ${selectedBatch} using ${assignmentSummary}.${replaceSummary}`)
        }
      } else if (activeTab === "groups") {
        const response = await studentApi.bulkUpdateStudentGroups({
          groupNames: selectedGroups,
          assignmentMode: groupAssignmentMode,
          ...(groupSelectionMode === "csv"
            ? { rollNumbers: groupAssignmentData.map((student) => student.rollNumber) }
            : { rollNumberRange: { start: groupRangeStart, end: groupRangeEnd } }),
        })
        isSuccess = true

        const unsuccessfulCount = Array.isArray(response?.unsuccessfulRollNumbers)
          ? response.unsuccessfulRollNumbers.length
          : 0
        const matchedCount = response?.matchedCount || response?.updatedCount || 0
        const clearedCount = response?.clearedCount || 0
        const actionLabel = groupAssignmentMode === "add"
          ? "added to"
          : groupAssignmentMode === "remove"
            ? "removed from"
            : "updated with"
        const groupLabel = selectedGroups.join(", ")

        if (unsuccessfulCount > 0) {
          toast.success(`Updated ${response.updatedCount || 0} students. ${unsuccessfulCount} roll numbers were not found.`)
        } else {
          const replaceSummary = groupAssignmentMode === "replace"
            ? ` Cleared ${clearedCount} previous membership${clearedCount === 1 ? "" : "s"} for the selected group${selectedGroups.length === 1 ? "" : "s"}.`
            : ""
          toast.success(`Successfully ${actionLabel} ${groupLabel} for ${matchedCount} student${matchedCount === 1 ? "" : "s"}.${replaceSummary}`)
        }
      }

      if (isSuccess) {
        handleCloseModal()
      }
    } catch (error) {
      const message = error.message || "An error occurred while updating"
      if (activeTab === "basic" && parsedData.length > 0) {
        const fallbackOutcome = {
          success: false,
          message,
          errors: [{ student: "All records", message }],
        }
        const finalRows = buildUpdateResultRows(parsedData, fallbackOutcome)
        setUpdateResultRows(finalRows)
        setUpdateProgress({
          phase: "failed",
          total: finalRows.length,
          processed: finalRows.length,
          updated: 0,
          failed: finalRows.length,
          message,
        })
      }
      setError(message)
      toast.error(message)
    } finally {
      setIsUpdating(false)
    }
  }

  const resetForm = () => {
    setCsvFile(null)
    setParsedData([])
    setBasicValidationIssues([])
    setBasicInvalidCellMap({})
    setHealthData([])
    setFamilyData([])
    setStatusData([])
    setRollNumberCheckData([])
    setRollNumberCheckSummary(null)
    setRollNumberCheckScopeType("system")
    setSelectedRollCheckGroup("")
    setSelectedRollCheckDegree("")
    setSelectedRollCheckDepartment("")
    setSelectedRollCheckBatch("")
    setAvailableRollCheckBatches([])
    setDayScholarData([])
    setBatchAssignmentData([])
    setBatchSelectionMode("csv")
    setBatchAssignmentMode("append")
    setBatchRangeStart("")
    setBatchRangeEnd("")
    setSelectedBatchDegree("")
    setSelectedBatchDepartment("")
    setSelectedBatch("")
    setAvailableBatches([])
    setGroupAssignmentData([])
    setGroupSelectionMode("csv")
    setGroupAssignmentMode("add")
    setGroupRangeStart("")
    setGroupRangeEnd("")
    setSelectedGroups([])
    setUploadStatus("")
    setError("")
    setStep(1)
    setShowAllDegrees(false)
    setShowAllDepartments(false)
    setUpdateResultRows([])
    setUpdateProgress({
      phase: "idle",
      total: 0,
      processed: 0,
      updated: 0,
      failed: 0,
      message: null,
    })
    updateJobIdRef.current = null
  }

  function handleCloseModal() {
    resetForm()
    setActiveTab("basic")
    onClose()
  }

  const handleExportUpdateResults = () => {
    if (!isBasicUpdateCompleted || updateResultSheetRows.length === 0) {
      setError("No completed update results available to export")
      return
    }

    const exported = downloadCSV(updateResultSheetRows, "student_update_results")
    if (!exported) {
      setError("Failed to export update results")
    }
  }

  // Define tabs
  const tabs = [
    { id: "basic", name: "Basic Details", icon: <FaUser /> },
    { id: "batch", name: "Batch Assignment", icon: <FaUsers /> },
    { id: "groups", name: "Groups", icon: <FaUsers /> },
    { id: "health", name: "Health Info", icon: <FaHeartbeat /> },
    { id: "family", name: "Family Members", icon: <FaUsers /> },
    { id: "status", name: "Status Update", icon: <FaUserGraduate /> },
    { id: "rollCheck", name: "Check Roll Numbers", icon: <FaSearch /> },
    { id: "dayScholar", name: "Day Scholar", icon: <FaHome /> },
  ]






  if (!isOpen) return null

  return (
    <Modal title="Update Students in Bulk" onClose={handleCloseModal} width={1280} tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
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
                      <span className="font-medium">secondaryEmail:</span> Email
                    </li>
                    <li>
                      <span className="font-medium">phone:</span> Number
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
                      {renderReferenceValues("Valid Degrees", validDegrees, displayedDegrees, showAllDegrees, setShowAllDegrees)}
                      {renderReferenceValues("Valid Departments", validDepartments, displayedDepartments, showAllDepartments, setShowAllDepartments)}
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
                  <Spinner size={24} thickness="thin" />
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
              <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4 items-start">
                <div className="border rounded-lg overflow-hidden">
                  <SheetPreviewTable rows={parsedData} getCellStyle={getBasicPreviewCellStyle} />
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-lg border bg-[var(--color-info-bg)] border-[var(--color-info-light)]">
                    <div className="text-xs text-[var(--color-info-text)]">Rows In Sheet</div>
                    <div className="text-lg font-semibold text-[var(--color-info-text)]">{parsedData.length}</div>
                  </div>
                  <div className="p-3 rounded-lg border bg-[var(--color-success-bg)] border-[var(--color-success-light)]">
                    <div className="text-xs text-[var(--color-success-text)]">Rows Ready To Update</div>
                    <div className="text-lg font-semibold text-[var(--color-success-text)]">{Math.max(parsedData.length - Object.keys(basicInvalidCellMap).length, 0)}</div>
                  </div>
                  <div className="p-3 rounded-lg border bg-[var(--color-warning-bg)] border-[var(--color-warning-light)]">
                    <div className="text-xs text-[var(--color-warning-text)]">Invalid Degree Values</div>
                    <div className="text-lg font-semibold text-[var(--color-warning-text)]">{invalidDegreeValues.length}</div>
                    {invalidDegreeValues.length > 0 && (
                      <div className="mt-2 text-xs text-[var(--color-warning-text)] max-h-24 overflow-auto">
                        {invalidDegreeValues.join(", ")}
                      </div>
                    )}
                  </div>
                  <div className="p-3 rounded-lg border bg-[var(--color-danger-bg)] border-[var(--color-danger-border)]">
                    <div className="text-xs text-[var(--color-danger-text)]">Invalid Department Values</div>
                    <div className="text-lg font-semibold text-[var(--color-danger-text)]">{invalidDepartmentValues.length}</div>
                    {invalidDepartmentValues.length > 0 && (
                      <div className="mt-2 text-xs text-[var(--color-danger-text)] max-h-24 overflow-auto">
                        {invalidDepartmentValues.join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {error && <div className="py-2 px-4 bg-red-50 text-red-600 rounded-lg border-l-4 border-red-500 whitespace-pre-line">{error}</div>}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h3 className="text-lg font-medium text-gray-800">Update Progress</h3>

              <div className="border rounded-lg p-3 bg-[var(--color-bg-tertiary)]">
                <div className="flex justify-between mb-2 text-xs text-[var(--color-text-body)]">
                  <span>{updateProgress.message || "Updating students..."}</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[var(--color-bg-muted)] overflow-hidden">
                  <div
                    style={{
                      width: `${progressPercent}%`,
                      height: "100%",
                      backgroundColor: "var(--color-primary)",
                      transition: "width 240ms ease",
                    }}
                  />
                </div>
              </div>

              <Grid cols={{ base: 1, sm: 2, xl: 4 }} gap={3}>
                <div className="p-3 rounded-lg border bg-[var(--color-info-bg)] border-[var(--color-info-light)]">
                  <div className="text-xs text-[var(--color-info-text)]">Processed</div>
                  <div className="text-lg font-semibold text-[var(--color-info-text)]">
                    {updateProgress.processed}/{updateProgress.total || parsedData.length}
                  </div>
                </div>
                <div className="p-3 rounded-lg border bg-[var(--color-success-bg)] border-[var(--color-success-light)]">
                  <div className="text-xs text-[var(--color-success-text)]">Successful</div>
                  <div className="text-lg font-semibold text-[var(--color-success-text)]">
                    {isBasicUpdateCompleted ? updateSuccessCount : updateProgress.updated}
                  </div>
                </div>
                <div className="p-3 rounded-lg border bg-[var(--color-danger-bg)] border-[var(--color-danger-border)]">
                  <div className="text-xs text-[var(--color-danger-text)]">Failed</div>
                  <div className="text-lg font-semibold text-[var(--color-danger-text)]">
                    {isBasicUpdateCompleted ? updateFailedCount : updateProgress.failed}
                  </div>
                </div>
                <div className="p-3 rounded-lg border bg-[var(--color-warning-bg)] border-[var(--color-warning-light)]">
                  <div className="text-xs text-[var(--color-warning-text)]">Shown In Sheet</div>
                  <div className="text-lg font-semibold text-[var(--color-warning-text)]">
                    {updateDisplayedSheetRows.length}/{updateResultSheetRows.length}
                  </div>
                </div>
              </Grid>

              <div className="text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-tertiary)] border rounded-lg px-3 py-2">
                Status table columns: roll number, email, success status, reason.
                {!isConnected && " Socket offline: showing limited live progress"}
              </div>

              {isBasicUpdateCompleted ? (
                <SheetPreviewTable rows={updateDisplayedSheetRows} />
              ) : (
                <div className="border rounded-lg bg-[var(--color-bg-tertiary)] p-4 text-sm text-[var(--color-text-muted)]">
                  Results sheet will appear when update finishes.
                </div>
              )}

              {error && <div className="py-2 px-4 bg-red-50 text-red-600 rounded-lg border-l-4 border-red-500 whitespace-pre-line">{error}</div>}
            </div>
          )}
        </>
      )}

      {/* Health Tab */}
      {activeTab === "batch" && <BatchAssignmentTab availableBatches={availableBatches} batchAssignmentData={batchAssignmentData} batchAssignmentMode={batchAssignmentMode} batchDegreeOptions={batchDegreeOptions} batchDepartmentOptions={batchDepartmentOptions} batchOptionsLoading={batchOptionsLoading} batchRangeEnd={batchRangeEnd} batchRangeStart={batchRangeStart} batchSelectionMode={batchSelectionMode} configLoading={configLoading} error={error} handleBatchDataParsed={handleBatchDataParsed} handleBatchRangeChange={handleBatchRangeChange} handleBatchSelectionModeChange={handleBatchSelectionModeChange} selectedBatch={selectedBatch} selectedBatchDegree={selectedBatchDegree} selectedBatchDepartment={selectedBatchDepartment} setBatchAssignmentMode={setBatchAssignmentMode} setSelectedBatch={setSelectedBatch} setSelectedBatchDegree={setSelectedBatchDegree} setSelectedBatchDepartment={setSelectedBatchDepartment} uploadStatus={uploadStatus} />}

      {activeTab === "groups" && <GroupsAssignmentTab availableStudentGroups={availableStudentGroups} configLoading={configLoading} error={error} groupAssignmentData={groupAssignmentData} groupAssignmentMode={groupAssignmentMode} groupRangeEnd={groupRangeEnd} groupRangeStart={groupRangeStart} groupSelectionMode={groupSelectionMode} handleGroupDataParsed={handleGroupDataParsed} handleGroupRangeChange={handleGroupRangeChange} handleGroupSelectionModeChange={handleGroupSelectionModeChange} handleGroupToggle={handleGroupToggle} selectedGroups={selectedGroups} setGroupAssignmentMode={setGroupAssignmentMode} uploadStatus={uploadStatus} />}

      {/* Health Tab */}
      {activeTab === "health" && <HealthInfoTab rows={healthData} error={error} status={uploadStatus} onDataParsed={handleHealthDataParsed} />}

      {/* Family Tab */}
      {activeTab === "family" && (
        <FamilyMembersTab
          familyData={familyData}
          error={error}
          replaceExisting={deleteExistingFamily}
          onReplaceExistingChange={setDeleteExistingFamily}
          onDataParsed={handleFamilyDataParsed}
          onSaveManual={setFamilyData}
          onError={setError}
        />
      )}

      {/* Status Tab */}
      {activeTab === "status" && (
        <StatusUpdateTab
          rows={statusData}
          error={error}
          status={uploadStatus}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          onDataParsed={handleStatusDataParsed}
        />
      )}

      {/* Roll Number Check Tab */}
      {activeTab === "rollCheck" && <RollNumberCheckTab availableRollCheckBatches={availableRollCheckBatches} availableStudentGroups={availableStudentGroups} batchDegreeOptions={batchDegreeOptions} batchDepartmentOptions={batchDepartmentOptions} configLoading={configLoading} error={error} handleRollNumberCheckDataParsed={handleRollNumberCheckDataParsed} handleRollNumberCheckScopeTypeChange={handleRollNumberCheckScopeTypeChange} rollCheckBatchOptionsLoading={rollCheckBatchOptionsLoading} rollNumberCheckData={rollNumberCheckData} rollNumberCheckScopeType={rollNumberCheckScopeType} rollNumberCheckSummary={rollNumberCheckSummary} selectedRollCheckBatch={selectedRollCheckBatch} selectedRollCheckDegree={selectedRollCheckDegree} selectedRollCheckDepartment={selectedRollCheckDepartment} selectedRollCheckGroup={selectedRollCheckGroup} setError={setError} setRollNumberCheckSummary={setRollNumberCheckSummary} setSelectedRollCheckBatch={setSelectedRollCheckBatch} setSelectedRollCheckDegree={setSelectedRollCheckDegree} setSelectedRollCheckDepartment={setSelectedRollCheckDepartment} setSelectedRollCheckGroup={setSelectedRollCheckGroup} uploadStatus={uploadStatus} />}

      {/* Day Scholar Tab */}
      {activeTab === "dayScholar" && (
        <DayScholarTab
          mode={dayScholarMode}
          onModeChange={setDayScholarMode}
          dayScholarData={dayScholarData}
          error={error}
          status={uploadStatus}
          onDataParsed={handleDayScholarDataParsed}
          onSaveManual={setDayScholarData}
          onError={setError}
          onSaved={(count) => toast.success(`${count} students ready for update`)}
        />
      )}

      <div style={styles.footer}>
        {activeTab === "basic" && step === 1 ? (
          <Button onClick={handleCloseModal} variant="secondary" size="md" disabled={isUpdating}>
            Cancel
          </Button>
        ) : activeTab === "basic" && step === 2 ? (
          <Button onClick={resetForm} variant="secondary" size="md" disabled={isUpdating}>
            Back
          </Button>
        ) : activeTab === "basic" && step === 3 ? (
          <Button
            onClick={() => {
              setStep(1)
              setCsvFile(null)
              setParsedData([])
              setBasicValidationIssues([])
              setBasicInvalidCellMap({})
              setError("")
              setUpdateResultRows([])
              setUpdateProgress({
                phase: "idle",
                total: 0,
                processed: 0,
                updated: 0,
                failed: 0,
                message: null,
              })
              updateJobIdRef.current = null
            }}
            variant="secondary"
            size="md"
            disabled={isUpdating}
          >
            Update Another File
          </Button>
        ) : (
          <Button onClick={handleCloseModal} variant="secondary" size="md" disabled={isUpdating}>
            Cancel
          </Button>
        )}

        {(step === 2 || activeTab !== "basic") && (
          <Button
            onClick={handleUpdate}
            variant="primary"
            size="md"
            loading={isUpdating}
            disabled={
              (activeTab === "basic" && (parsedData.length === 0 || Object.keys(basicInvalidCellMap).length > 0)) ||
              (activeTab === "batch" && (
                !selectedBatchDegree ||
                !selectedBatchDepartment ||
                !selectedBatch ||
                (batchSelectionMode === "csv" && batchAssignmentData.length === 0) ||
                (batchSelectionMode === "range" && (!batchRangeStart || !batchRangeEnd))
              )) ||
              (activeTab === "groups" && (
                selectedGroups.length === 0 ||
                (groupSelectionMode === "csv" && groupAssignmentData.length === 0) ||
                (groupSelectionMode === "range" && (!groupRangeStart || !groupRangeEnd))
              )) ||
              (activeTab === "health" && healthData.length === 0) ||
              (activeTab === "family" && familyData.length === 0) ||
              (activeTab === "status" && statusData.length === 0) ||
              (activeTab === "rollCheck" && (
                rollNumberCheckData.length === 0 ||
                (rollNumberCheckScopeType === "group" && !selectedRollCheckGroup) ||
                (rollNumberCheckScopeType === "batch" && (
                  !selectedRollCheckDegree ||
                  !selectedRollCheckDepartment ||
                  !selectedRollCheckBatch
                ))
              )) ||
              (activeTab === "dayScholar" && dayScholarData.length === 0) ||
              isLoading ||
              isUpdating
            }
          >
            <FaCheck />
            {isUpdating
              ? (activeTab === "rollCheck" ? "Checking Roll Numbers..." : "Updating Students...")
              : activeTab === "rollCheck"
                ? "Check Roll Numbers"
                : "Confirm Update"}
          </Button>
        )}

        {activeTab === "rollCheck" && rollNumberCheckSummary && (
          <>
            <Button
              onClick={() => {
                const exported = downloadRollNumberCSV(
                  rollNumberCheckSummary.missingRollNumbers || [],
                  "missing_roll_numbers"
                )
                if (!exported) {
                  setError("No missing roll numbers available to export")
                }
              }}
              variant="secondary"
              size="md"
              disabled={isUpdating || !Array.isArray(rollNumberCheckSummary?.missingRollNumbers) || rollNumberCheckSummary.missingRollNumbers.length === 0}
              >
                <FaFileDownload />
                Export Missing
              </Button>
            <Button
              onClick={() => {
                const exported = downloadRollNumberCSV(
                  rollNumberCheckSummary?.statusRollNumbers?.Inactive || [],
                  "inactive_students_from_uploaded_list"
                )
                if (!exported) {
                  setError("No inactive students from the uploaded list are available to export")
                }
              }}
              variant="secondary"
              size="md"
              disabled={isUpdating || !Array.isArray(rollNumberCheckSummary?.statusRollNumbers?.Inactive) || rollNumberCheckSummary.statusRollNumbers.Inactive.length === 0}
            >
              <FaFileDownload />
              Export Inactive
            </Button>
            <Button
              onClick={() => {
                const exported = downloadRollNumberCSV(
                  rollNumberCheckSummary?.statusRollNumbers?.Dropped || [],
                  "dropped_students_from_uploaded_list"
                )
                if (!exported) {
                  setError("No dropped students from the uploaded list are available to export")
                }
              }}
              variant="secondary"
              size="md"
              disabled={isUpdating || !Array.isArray(rollNumberCheckSummary?.statusRollNumbers?.Dropped) || rollNumberCheckSummary.statusRollNumbers.Dropped.length === 0}
            >
              <FaFileDownload />
              Export Dropped
            </Button>
            <Button
              onClick={() => {
                const exported = downloadRollNumberCSV(
                  rollNumberCheckSummary?.statusRollNumbers?.Graduated || [],
                  "graduated_students_from_uploaded_list"
                )
                if (!exported) {
                  setError("No graduated students from the uploaded list are available to export")
                }
              }}
              variant="secondary"
              size="md"
              disabled={isUpdating || !Array.isArray(rollNumberCheckSummary?.statusRollNumbers?.Graduated) || rollNumberCheckSummary.statusRollNumbers.Graduated.length === 0}
            >
              <FaFileDownload />
              Export Graduated
            </Button>
            {rollNumberCheckScopeType !== "system" && (
              <Button
                onClick={() => {
                  const exported = downloadRollNumberCSV(
                    rollNumberCheckSummary.outOfScopeRollNumbers || [],
                    rollNumberCheckScopeType === "group" ? "students_not_in_group" : "students_not_in_batch"
                  )
                  if (!exported) {
                    setError(`No students outside the selected ${rollNumberCheckScopeType === "group" ? "group" : "batch"} to export`)
                  }
                }}
                variant="secondary"
                size="md"
                disabled={isUpdating || !Array.isArray(rollNumberCheckSummary?.outOfScopeRollNumbers) || rollNumberCheckSummary.outOfScopeRollNumbers.length === 0}
              >
                <FaFileDownload />
                Export Outside Scope
              </Button>
            )}
          </>
        )}

        {activeTab === "basic" && step === 3 && (
          <>
            <Button onClick={handleExportUpdateResults} variant="secondary" size="md" disabled={!isBasicUpdateCompleted || updateResultSheetRows.length === 0 || isUpdating}>
              <FaFileDownload />
              Export Results
            </Button>
            <Button onClick={handleCloseModal} variant="primary" size="md" disabled={isUpdating}>
              Close
            </Button>
          </>
        )}
      </div>
    </Modal>
  )
}

export default UpdateStudentsModal
