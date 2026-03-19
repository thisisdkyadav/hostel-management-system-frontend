import { useEffect, useMemo, useRef, useState } from "react"
import { FaCheck, FaFileDownload, FaFileUpload, FaTimes, FaUpload, FaUser } from "react-icons/fa"
import Papa from "papaparse"
import { Button, Modal, Input } from "czero/react"
import { FileInput } from "@/components/ui"
import { BULK_RECORD_LIMIT_MESSAGE, MAX_BULK_RECORDS } from "@/constants/systemLimits"
import SheetPreviewTable from "../../sheet/SheetPreviewTable"
import { useSocket } from "../../../contexts/SocketProvider"

const REQUIRED_FIELDS = ["name", "email", "rollNumber"]
const OPTIONAL_FIELDS = ["password"]
const ALLOWED_FIELDS = [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS]
const IMPORT_PROGRESS_EVENT = "students:import:progress"
const MAX_CSV_RESULT_ROWS_SHOWN = MAX_BULK_RECORDS

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const createImportJobId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }

  return `student-import-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

const toSafeString = (value) => (value === null || value === undefined ? "" : String(value).trim())

const normalizeCsvRows = (rows, headers) => {
  const previewRows = rows.map((row) => {
    const normalized = {}
    headers.forEach((header) => {
      normalized[header] = toSafeString(row?.[header])
    })
    return normalized
  })

  const payload = []
  const errors = []
  const seenEmails = new Set()
  const seenRollNumbers = new Set()

  previewRows.forEach((row, index) => {
    const rowNumber = index + 2
    const name = toSafeString(row.name)
    const email = toSafeString(row.email)
    const rollNumber = toSafeString(row.rollNumber).toUpperCase()
    const password = toSafeString(row.password)

    if (!name || !email || !rollNumber) {
      errors.push(`Row ${rowNumber}: Missing required fields (name, email, rollNumber)`)
      return
    }

    if (!emailRegex.test(email)) {
      errors.push(`Row ${rowNumber}: Invalid email format`)
      return
    }

    if (seenEmails.has(email.toLowerCase())) {
      errors.push(`Row ${rowNumber}: Duplicate email ${email} in CSV`)
      return
    }

    if (seenRollNumbers.has(rollNumber)) {
      errors.push(`Row ${rowNumber}: Duplicate roll number ${rollNumber} in CSV`)
      return
    }

    seenEmails.add(email.toLowerCase())
    seenRollNumbers.add(rollNumber)

    const student = { name, email, rollNumber }
    if (password) {
      student.password = password
    }

    payload.push(student)
  })

  return { previewRows, payload, errors }
}

const normalizeRollNumber = (value) => toSafeString(value).toUpperCase()
const normalizeEmail = (value) => toSafeString(value).toLowerCase()

const buildCsvImportResultRows = (students = [], outcome = null) => {
  const results = Array.isArray(outcome?.results)
    ? outcome.results
    : (outcome?.results ? [outcome.results] : [])
  const errors = Array.isArray(outcome?.errors) ? outcome.errors : []

  const successRollNumbers = new Set()
  const successEmails = new Set()
  const failedByRollNumber = new Map()
  const failedByEmail = new Map()

  results.forEach((entry) => {
    const rollCandidates = [
      entry?.profile?.rollNumber,
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
    const message = toSafeString(entry?.message || entry?.reason || entry?.error) || "Import failed"
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

  const requestFailedMessage = toSafeString(outcome?.message) || "Import failed"

  return students.map((student) => {
    const rollNumber = toSafeString(student?.rollNumber) || "—"
    const email = toSafeString(student?.email) || "—"
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
      return { rollNumber, email, successStatus: "Failed", reason: "Not imported" }
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

const toNonNegativeCount = (value) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) return null
  return Math.trunc(parsed)
}

const toSuccessIdentifier = (entry, index) => {
  return (
    toSafeString(entry?.profile?.rollNumber)
    || toSafeString(entry?.rollNumber)
    || toSafeString(entry?.student?.rollNumber)
    || toSafeString(entry?.student)
    || toSafeString(entry?.email)
    || toSafeString(entry?.name)
    || `Record ${index + 1}`
  )
}

const toFailedItem = (entry, index) => {
  return {
    id: (
      toSafeString(entry?.student)
      || toSafeString(entry?.rollNumber)
      || toSafeString(entry?.email)
      || toSafeString(entry?.name)
      || `Record ${index + 1}`
    ),
    message: toSafeString(entry?.message || entry?.reason || entry?.error) || "Unknown error",
  }
}

const buildImportSummary = (outcome, fallbackTotal) => {
  const hasOutcomeObject = Boolean(outcome && typeof outcome === "object")
  const results = Array.isArray(outcome?.results) ? outcome.results : []
  const errors = Array.isArray(outcome?.errors) ? outcome.errors : []

  const successItems = results.map(toSuccessIdentifier)
  const failedItems = errors.map(toFailedItem)

  const resolvedSuccessCount = toNonNegativeCount(outcome?.successCount) ?? successItems.length
  const resolvedErrorCount = toNonNegativeCount(outcome?.errorCount) ?? failedItems.length
  const totalFromOutcome = toNonNegativeCount(outcome?.total)
  const resolvedTotal = (totalFromOutcome ?? (resolvedSuccessCount + resolvedErrorCount)) || fallbackTotal

  const isRequestSuccessful = hasOutcomeObject ? outcome.success !== false : false
  const status = (!isRequestSuccessful && resolvedSuccessCount === 0)
    ? "failed"
    : (resolvedErrorCount > 0 ? "partial" : "success")

  const message = toSafeString(outcome?.message) || (
    status === "success"
      ? "Import completed successfully."
      : status === "partial"
        ? "Import completed with some errors."
        : "Import failed."
  )

  return {
    status,
    message,
    total: resolvedTotal,
    successCount: resolvedSuccessCount,
    errorCount: resolvedErrorCount,
    successItems,
    failedItems,
  }
}

const ImportStudentModal = ({ isOpen, onClose, onImport }) => {
  const { on, isConnected } = useSocket()

  const [activeTab, setActiveTab] = useState("csv")
  const [csvFile, setCsvFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState(1)
  const [previewRows, setPreviewRows] = useState([])
  const [parsedData, setParsedData] = useState([])
  const [manualStudent, setManualStudent] = useState({
    name: "",
    email: "",
    rollNumber: "",
    password: "",
  })
  const [importProgress, setImportProgress] = useState({
    phase: "idle",
    total: 0,
    processed: 0,
    created: 0,
    failed: 0,
    message: null,
  })
  const [importSummary, setImportSummary] = useState(null)
  const [csvImportResultRows, setCsvImportResultRows] = useState([])

  const importJobIdRef = useRef(null)
  const fileInputRef = useRef(null)

  const progressPercent = useMemo(() => {
    if (!importProgress.total) return 0
    return Math.max(0, Math.min(100, Math.round((importProgress.processed / importProgress.total) * 100)))
  }, [importProgress])

  const csvResultSheetRows = useMemo(() => (
    csvImportResultRows.map((row) => ({
      "roll number": row.rollNumber,
      email: row.email,
      "success status": row.successStatus,
      reason: row.reason,
    }))
  ), [csvImportResultRows])
  const csvDisplayedSheetRows = useMemo(
    () => csvResultSheetRows.slice(0, MAX_CSV_RESULT_ROWS_SHOWN),
    [csvResultSheetRows]
  )

  const csvSuccessCount = useMemo(
    () => csvImportResultRows.filter((row) => row.successStatus === "Success").length,
    [csvImportResultRows]
  )
  const csvFailedCount = useMemo(
    () => csvImportResultRows.filter((row) => row.successStatus === "Failed").length,
    [csvImportResultRows]
  )
  const isCsvImportCompleted = importProgress.phase === "completed" || importProgress.phase === "failed"

  useEffect(() => {
    if (!on) return undefined

    const cleanup = on(IMPORT_PROGRESS_EVENT, (payload) => {
      if (!payload || !importJobIdRef.current) return
      if (payload.jobId !== importJobIdRef.current) return

      setImportProgress({
        phase: payload.phase || "processing",
        total: payload.total || 0,
        processed: payload.processed || 0,
        created: payload.created || 0,
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
    if (!isOpen) {
      resetForm()
    }
  }, [isOpen])

  const resetForm = () => {
    setCsvFile(null)
    setIsLoading(false)
    setIsImporting(false)
    setError("")
    setStep(1)
    setPreviewRows([])
    setParsedData([])
    setCsvImportResultRows([])
    setActiveTab("csv")
    setManualStudent({
      name: "",
      email: "",
      rollNumber: "",
      password: "",
    })
    setImportProgress({
      phase: "idle",
      total: 0,
      processed: 0,
      created: 0,
      failed: 0,
      message: null,
    })
    setImportSummary(null)
    importJobIdRef.current = null
  }

  const clearImportSummary = () => {
    setImportSummary(null)
    setError("")
    setImportProgress((prev) => ({
      ...prev,
      phase: "idle",
      message: null,
    }))
    importJobIdRef.current = null
  }

  const generateCsvTemplate = () => {
    const csvContent = ALLOWED_FIELDS.join(",")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "import_students_template.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const parseCSV = (file) => {
    setIsLoading(true)
    setError("")

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rows = Array.isArray(results.data) ? results.data : []
          if (rows.length > MAX_BULK_RECORDS) {
            setError(BULK_RECORD_LIMIT_MESSAGE)
            setIsLoading(false)
            return
          }

          const headers = (results.meta.fields || []).map((field) => toSafeString(field)).filter(Boolean)
          const missingFields = REQUIRED_FIELDS.filter((field) => !headers.includes(field))

          if (missingFields.length > 0) {
            setError(`Missing required fields: ${missingFields.join(", ")}`)
            setIsLoading(false)
            return
          }

          const { previewRows: normalizedRows, payload, errors } = normalizeCsvRows(rows, headers)

          if (errors.length > 0) {
            const topErrors = errors.slice(0, 8)
            const remaining = errors.length - topErrors.length
            const message = remaining > 0 ? `${topErrors.join("\n")}\n... and ${remaining} more errors` : topErrors.join("\n")
            setError(`Invalid CSV data:\n${message}`)
            setIsLoading(false)
            return
          }

          setPreviewRows(normalizedRows)
          setParsedData(payload)
          setStep(2)
          setIsLoading(false)
        } catch {
          setError("Failed to process CSV data. Please check the format.")
          setIsLoading(false)
        }
      },
      error: (parseError) => {
        setError(`Error parsing CSV: ${parseError.message}`)
        setIsLoading(false)
      },
    })
  }

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const isCsv = file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv")
    if (!isCsv) {
      setError("Please upload a valid CSV file")
      return
    }

    setCsvFile(file)
    parseCSV(file)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (!file) return

    const isCsv = file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv")
    if (!isCsv) {
      setError("Please upload a valid CSV file")
      return
    }

    setCsvFile(file)
    parseCSV(file)
  }

  const handleDragOver = (event) => {
    event.preventDefault()
  }

  const startImportProgress = (total) => {
    setImportSummary(null)
    setImportProgress({
      phase: "started",
      total,
      processed: 0,
      created: 0,
      failed: 0,
      message: "Student import started",
    })
  }

  const handleImport = async () => {
    if (parsedData.length === 0) {
      setError("No data to import")
      return
    }

    setError("")
    setIsImporting(true)
    setStep(3)

    const importJobId = createImportJobId()
    importJobIdRef.current = importJobId
    startImportProgress(parsedData.length)
    setCsvImportResultRows([])

    try {
      const outcome = await onImport(parsedData, { importJobId })
      const finalRows = buildCsvImportResultRows(parsedData, outcome)
      const successful = finalRows.filter((row) => row.successStatus === "Success").length
      const failed = finalRows.filter((row) => row.successStatus === "Failed").length
      const total = finalRows.length
      const requestFailed = outcome?.success === false && successful === 0

      setCsvImportResultRows(finalRows)
      setImportProgress({
        phase: requestFailed ? "failed" : "completed",
        total,
        processed: total,
        created: successful,
        failed,
        message: toSafeString(outcome?.message)
          || (failed > 0
            ? `Import completed with ${failed} failed records`
            : "Import completed successfully"),
      })
      setError(requestFailed ? (toSafeString(outcome?.message) || "Import failed") : "")
    } catch (importError) {
      const failedMessage = importError?.message || "Import failed"
      const fallbackOutcome = {
        success: false,
        message: failedMessage,
        errors: [{ student: "All records", message: failedMessage }],
      }
      const finalRows = buildCsvImportResultRows(parsedData, fallbackOutcome)
      setCsvImportResultRows(finalRows)
      setImportProgress({
        phase: "failed",
        total: finalRows.length,
        processed: finalRows.length,
        created: 0,
        failed: finalRows.length,
        message: failedMessage,
      })
      setError(failedMessage)
    } finally {
      setIsImporting(false)
    }
  }

  const handleExportCsvResults = () => {
    if (!isCsvImportCompleted || csvResultSheetRows.length === 0) {
      setError("No completed import results available to export")
      return
    }

    const exported = downloadCSV(csvResultSheetRows, "student_import_results")
    if (!exported) {
      setError("Failed to export import results")
    }
  }

  const handleManualInputChange = (field, value) => {
    setManualStudent((prev) => ({ ...prev, [field]: value }))
  }

  const handleManualImport = async () => {
    const name = toSafeString(manualStudent.name)
    const email = toSafeString(manualStudent.email)
    const rollNumber = toSafeString(manualStudent.rollNumber).toUpperCase()
    const password = toSafeString(manualStudent.password)

    if (!name || !email || !rollNumber) {
      setError("Name, email, and roll number are required")
      return
    }

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      return
    }

    setError("")
    setIsImporting(true)

    const importJobId = createImportJobId()
    importJobIdRef.current = importJobId
    startImportProgress(1)

    const student = { name, email, rollNumber }
    if (password) {
      student.password = password
    }

    try {
      const outcome = await onImport([student], { importJobId })
      const summary = buildImportSummary(outcome, 1)
      setImportSummary(summary)
      setImportProgress({
        phase: summary.status === "failed" ? "failed" : "completed",
        total: summary.total,
        processed: summary.total,
        created: summary.successCount,
        failed: summary.errorCount,
        message: summary.message,
      })
      setError(summary.status === "failed" ? summary.message : "")
    } catch (importError) {
      const failedMessage = importError?.message || "Import failed"
      const summary = buildImportSummary({
        success: false,
        message: failedMessage,
        total: 1,
        successCount: 0,
        errorCount: 1,
        errors: [{ student: rollNumber || email || "Student", message: failedMessage }],
      }, 1)
      setImportSummary(summary)
      setImportProgress({
        phase: "failed",
        total: summary.total,
        processed: summary.total,
        created: summary.successCount,
        failed: summary.errorCount,
        message: summary.message,
      })
      setError(failedMessage)
    } finally {
      setIsImporting(false)
    }
  }

  const renderImportSummary = () => {
    if (!importSummary) return null

    const shownSuccessItems = importSummary.successItems.slice(0, 25)
    const shownFailedItems = importSummary.failedItems.slice(0, 25)
    const remainingSuccessItems = importSummary.successItems.length - shownSuccessItems.length
    const remainingFailedItems = importSummary.failedItems.length - shownFailedItems.length

    const summaryTitle = importSummary.status === "success"
      ? "Import Completed"
      : importSummary.status === "partial"
        ? "Import Completed With Errors"
        : "Import Failed"

    const summaryBg = importSummary.status === "success"
      ? "var(--color-success-bg)"
      : importSummary.status === "partial"
        ? "var(--color-warning-bg)"
        : "var(--color-danger-bg-light)"

    return (
      <div style={{ border: "var(--border-1) solid var(--color-border-primary)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-4)", backgroundColor: summaryBg, display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
        <div>
          <h4 style={{ fontSize: "var(--font-size-base)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)" }}>{summaryTitle}</h4>
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>{importSummary.message}</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "var(--spacing-3)" }}>
          <div style={{ backgroundColor: "var(--color-bg-primary)", borderRadius: "var(--radius-md)", padding: "var(--spacing-3)" }}>
            <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>Total</div>
            <div style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)" }}>{importSummary.total}</div>
          </div>
          <div style={{ backgroundColor: "var(--color-bg-primary)", borderRadius: "var(--radius-md)", padding: "var(--spacing-3)" }}>
            <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>Successfully Done</div>
            <div style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-success)" }}>{importSummary.successCount}</div>
          </div>
          <div style={{ backgroundColor: "var(--color-bg-primary)", borderRadius: "var(--radius-md)", padding: "var(--spacing-3)" }}>
            <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>Not Done (Errors)</div>
            <div style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-danger)" }}>{importSummary.errorCount}</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "var(--spacing-3)" }}>
          <div style={{ backgroundColor: "var(--color-bg-primary)", border: "var(--border-1) solid var(--color-border-primary)", borderRadius: "var(--radius-md)", padding: "var(--spacing-3)", maxHeight: "12rem", overflow: "auto" }}>
            <div style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-2)", color: "var(--color-text-primary)" }}>Done</div>
            {shownSuccessItems.length === 0 ? (
              <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>No successful records.</div>
            ) : (
              <>
                <ul style={{ margin: 0, paddingLeft: "var(--spacing-4)", fontSize: "var(--font-size-xs)", color: "var(--color-text-body)" }}>
                  {shownSuccessItems.map((item, index) => (
                    <li key={`success-${item}-${index}`}>{item}</li>
                  ))}
                </ul>
                {remainingSuccessItems > 0 && (
                  <div style={{ marginTop: "var(--spacing-2)", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>...and {remainingSuccessItems} more</div>
                )}
              </>
            )}
          </div>

          <div style={{ backgroundColor: "var(--color-bg-primary)", border: "var(--border-1) solid var(--color-border-primary)", borderRadius: "var(--radius-md)", padding: "var(--spacing-3)", maxHeight: "12rem", overflow: "auto" }}>
            <div style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-2)", color: "var(--color-text-primary)" }}>Not Done</div>
            {shownFailedItems.length === 0 ? (
              <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>No failed records.</div>
            ) : (
              <>
                <ul style={{ margin: 0, paddingLeft: "var(--spacing-4)", fontSize: "var(--font-size-xs)", color: "var(--color-text-body)" }}>
                  {shownFailedItems.map((item, index) => (
                    <li key={`failed-${item.id}-${index}`}>
                      <strong>{item.id}:</strong> {item.message}
                    </li>
                  ))}
                </ul>
                {remainingFailedItems > 0 && (
                  <div style={{ marginTop: "var(--spacing-2)", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>...and {remainingFailedItems} more</div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: "csv", name: "CSV Import", icon: <FaUpload /> },
    { id: "manual", name: "Single Student", icon: <FaUser /> },
  ]
  const hasImportSummary = Boolean(importSummary)

  const handleTabChange = (nextTab) => {
    if (isImporting) return
    if (hasImportSummary) {
      clearImportSummary()
    }
    setStep(1)
    setCsvFile(null)
    setParsedData([])
    setPreviewRows([])
    setCsvImportResultRows([])
    setActiveTab(nextTab)
  }

  if (!isOpen) return null

  return (
    <Modal title="Import Students" onClose={onClose} width={980} tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange}>
      {activeTab === "csv" && (
        <>
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-5)" }}>
              <div
                style={{
                  border: "var(--border-2) dashed var(--color-border-input)",
                  borderRadius: "var(--radius-xl)",
                  padding: "var(--spacing-8)",
                  textAlign: "center",
                  cursor: "pointer",
                  backgroundColor: "var(--color-bg-tertiary)",
                }}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <FaFileUpload style={{ margin: "0 auto", height: "var(--icon-4xl)", width: "var(--icon-4xl)", color: "var(--color-text-disabled)" }} />
                <p style={{ marginTop: "var(--spacing-2)", fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
                  Drag and drop a CSV file here, or click to select a file
                </p>
                <p style={{ marginTop: "var(--spacing-3)", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                  <strong>Required fields:</strong> {REQUIRED_FIELDS.join(", ")}
                </p>
                <p style={{ marginTop: "var(--spacing-1)", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                  <strong>Optional fields:</strong> {OPTIONAL_FIELDS.join(", ")}
                </p>
                <FileInput ref={fileInputRef} accept=".csv" onChange={handleFileUpload} hidden />
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--spacing-2)" }}>
                <Button onClick={generateCsvTemplate} variant="ghost" size="sm">
                  <FaFileDownload />
                  Download CSV Template
                </Button>
                <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", backgroundColor: "var(--color-bg-tertiary)", padding: "var(--spacing-3)", borderRadius: "var(--radius-lg)", maxWidth: "30rem" }}>
                  <p style={{ fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-1)" }}>Field Input Types:</p>
                  <ul style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "var(--spacing-1) var(--spacing-4)" }}>
                    <li><span style={{ fontWeight: "var(--font-weight-medium)" }}>name:</span> String (Required)</li>
                    <li><span style={{ fontWeight: "var(--font-weight-medium)" }}>email:</span> Email (Required)</li>
                    <li><span style={{ fontWeight: "var(--font-weight-medium)" }}>rollNumber:</span> String (Required)</li>
                    <li><span style={{ fontWeight: "var(--font-weight-medium)" }}>password:</span> String (Optional)</li>
                  </ul>
                </div>
              </div>

              {csvFile && (
                <div style={{ padding: "var(--spacing-2) var(--spacing-4)", backgroundColor: "var(--color-primary-bg)", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-primary)" }}>
                    Selected file: <span style={{ fontWeight: "var(--font-weight-medium)" }}>{csvFile.name}</span>
                  </span>
                  <Button
                    onClick={(event) => {
                      event.stopPropagation()
                      setCsvFile(null)
                    }}
                    variant="ghost"
                    size="sm"
                    title="Remove file"
                  >
                    <FaTimes />
                  </Button>
                </div>
              )}

              {error && (
                <div style={{ padding: "var(--spacing-2) var(--spacing-4)", backgroundColor: "var(--color-danger-bg-light)", color: "var(--color-danger)", borderRadius: "var(--radius-lg)", borderLeft: "var(--border-4) solid var(--color-danger)", whiteSpace: "pre-line" }}>
                  {error}
                </div>
              )}

              {isLoading && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--spacing-4) 0" }}>
                  <div style={{ width: "var(--spacing-6)", height: "var(--spacing-6)", border: "var(--border-2) solid var(--color-bg-muted)", borderTopColor: "var(--color-primary)", borderRadius: "var(--radius-full)", animation: "spin 1s linear infinite" }} />
                  <span style={{ marginLeft: "var(--spacing-2)", fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>Processing file...</span>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-secondary)" }}>Preview Import Data</h3>
                <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)", backgroundColor: "var(--color-primary-bg)", padding: "var(--spacing-1) var(--spacing-3)", borderRadius: "var(--radius-full)" }}>
                  {parsedData.length} valid students
                </div>
              </div>

              <SheetPreviewTable rows={previewRows} />

              {error && (
                <div style={{ padding: "var(--spacing-2) var(--spacing-4)", backgroundColor: "var(--color-danger-bg-light)", color: "var(--color-danger)", borderRadius: "var(--radius-lg)", borderLeft: "var(--border-4) solid var(--color-danger)", whiteSpace: "pre-line" }}>
                  {error}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
              <h3 style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-secondary)" }}>
                Import Progress
              </h3>

              <div style={{ border: "var(--border-1) solid var(--color-border-primary)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-3)", backgroundColor: "var(--color-bg-tertiary)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--spacing-2)", fontSize: "var(--font-size-xs)", color: "var(--color-text-body)" }}>
                  <span>{importProgress.message || "Importing students..."}</span>
                  <span>{progressPercent}%</span>
                </div>
                <div style={{ width: "100%", height: "8px", borderRadius: "999px", backgroundColor: "var(--color-bg-muted)", overflow: "hidden" }}>
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

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "var(--spacing-3)" }}>
                <div style={{ backgroundColor: "var(--color-info-bg)", border: "var(--border-1) solid var(--color-info-light)", borderRadius: "var(--radius-md)", padding: "var(--spacing-3)" }}>
                  <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-info-text)" }}>Imported</div>
                  <div style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-info-text)" }}>
                    {importProgress.processed}/{importProgress.total || parsedData.length}
                  </div>
                </div>
                <div style={{ backgroundColor: "var(--color-success-bg)", border: "var(--border-1) solid var(--color-success-light)", borderRadius: "var(--radius-md)", padding: "var(--spacing-3)" }}>
                  <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-success-text)" }}>Successful</div>
                  <div style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-success-text)" }}>{csvSuccessCount}</div>
                </div>
                <div style={{ backgroundColor: "var(--color-danger-bg)", border: "var(--border-1) solid var(--color-danger-border)", borderRadius: "var(--radius-md)", padding: "var(--spacing-3)" }}>
                  <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-danger-text)" }}>Failed</div>
                  <div style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-danger-text)" }}>{csvFailedCount}</div>
                </div>
                <div style={{ backgroundColor: "var(--color-warning-bg)", border: "var(--border-1) solid var(--color-warning-light)", borderRadius: "var(--radius-md)", padding: "var(--spacing-3)" }}>
                  <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-warning-text)" }}>Shown In Sheet</div>
                  <div style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-warning-text)" }}>
                    {csvDisplayedSheetRows.length}/{csvResultSheetRows.length}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", backgroundColor: "var(--color-bg-tertiary)", border: "var(--border-1) solid var(--color-border-primary)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-2) var(--spacing-3)" }}>
                Status table columns: roll number, email, success status, reason.
                {!isConnected && " Socket offline: showing limited progress"}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button onClick={handleExportCsvResults} variant="secondary" size="sm" disabled={!isCsvImportCompleted || csvResultSheetRows.length === 0}>
                  <FaFileDownload />
                  Export Results
                </Button>
              </div>

              {isCsvImportCompleted ? (
                <SheetPreviewTable rows={csvDisplayedSheetRows} />
              ) : (
                <div style={{ border: "var(--border-1) solid var(--color-border-primary)", borderRadius: "var(--radius-lg)", backgroundColor: "var(--color-bg-tertiary)", padding: "var(--spacing-4)", fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
                  Results sheet will appear when import finishes.
                </div>
              )}

              {error && (
                <div style={{ padding: "var(--spacing-2) var(--spacing-4)", backgroundColor: "var(--color-danger-bg-light)", color: "var(--color-danger)", borderRadius: "var(--radius-lg)", borderLeft: "var(--border-4) solid var(--color-danger)", whiteSpace: "pre-line" }}>
                  {error}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {activeTab === "manual" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
          <h3 style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-secondary)" }}>Add Single Student</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "var(--spacing-4)" }}>
            <div>
              <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-1)" }}>Name *</label>
              <Input type="text" value={manualStudent.name} onChange={(event) => handleManualInputChange("name", event.target.value)} placeholder="Enter student's full name" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-1)" }}>Email *</label>
              <Input type="email" value={manualStudent.email} onChange={(event) => handleManualInputChange("email", event.target.value)} placeholder="Enter email address" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-1)" }}>Roll Number *</label>
              <Input type="text" value={manualStudent.rollNumber} onChange={(event) => handleManualInputChange("rollNumber", event.target.value)} placeholder="Enter roll number" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-1)" }}>Password</label>
              <Input type="password" value={manualStudent.password} onChange={(event) => handleManualInputChange("password", event.target.value)} placeholder="Optional custom password" />
            </div>
          </div>

          {(isImporting || importProgress.phase === "processing" || importProgress.phase === "started") && (
            <div style={{ border: "var(--border-1) solid var(--color-border-primary)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-3)", backgroundColor: "var(--color-bg-tertiary)", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
              {importProgress.message || "Adding student..."}
            </div>
          )}

          {importSummary && renderImportSummary()}

          {error && (
            <div style={{ padding: "var(--spacing-2) var(--spacing-4)", backgroundColor: "var(--color-danger-bg-light)", color: "var(--color-danger)", borderRadius: "var(--radius-lg)", borderLeft: "var(--border-4) solid var(--color-danger)", whiteSpace: "pre-line" }}>
              {error}
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: "var(--spacing-6)", display: "flex", justifyContent: "flex-end", gap: "var(--spacing-3)", paddingTop: "var(--spacing-4)", borderTop: "var(--border-1) solid var(--color-border-light)" }}>
        {activeTab === "csv" && (
          <>
            {step === 1 ? (
              <Button onClick={onClose} variant="secondary" size="md" disabled={isImporting}>Cancel</Button>
            ) : null}

            {step === 2 ? (
              <Button onClick={() => { setStep(1); setError("") }} variant="secondary" size="md" disabled={isImporting}>Back</Button>
            ) : null}

            {step === 2 ? (
              <Button onClick={handleImport} variant="primary" size="md" loading={isImporting} disabled={parsedData.length === 0 || isLoading || isImporting}>
                {!isImporting && <FaCheck />}
                {isImporting ? "Importing Students..." : "Confirm Import"}
              </Button>
            ) : null}

            {step === 3 ? (
              <Button
                onClick={() => {
                  setStep(1)
                  setCsvFile(null)
                  setParsedData([])
                  setPreviewRows([])
                  setCsvImportResultRows([])
                  setError("")
                  setImportProgress({
                    phase: "idle",
                    total: 0,
                    processed: 0,
                    created: 0,
                    failed: 0,
                    message: null,
                  })
                  importJobIdRef.current = null
                }}
                variant="secondary"
                size="md"
                disabled={isImporting}
              >
                Import Another File
              </Button>
            ) : null}

            {step === 3 ? (
              <Button onClick={handleExportCsvResults} variant="secondary" size="md" disabled={!isCsvImportCompleted || csvResultSheetRows.length === 0}>
                <FaFileDownload />
                Export Results
              </Button>
            ) : null}

            {step === 3 ? (
              <Button onClick={onClose} variant="primary" size="md" disabled={isImporting}>
                Close
              </Button>
            ) : null}
          </>
        )}

        {activeTab === "manual" && (
          <>
            {!hasImportSummary ? (
              <Button onClick={onClose} variant="secondary" size="md" disabled={isImporting}>Cancel</Button>
            ) : (
              <Button
                onClick={() => {
                  clearImportSummary()
                  setManualStudent({
                    name: "",
                    email: "",
                    rollNumber: "",
                    password: "",
                  })
                }}
                variant="secondary"
                size="md"
              >
                Add Another Student
              </Button>
            )}

            {!hasImportSummary ? (
              <Button
                onClick={handleManualImport}
                variant="primary"
                size="md"
                loading={isImporting}
                disabled={!manualStudent.name || !manualStudent.email || !manualStudent.rollNumber || isImporting}
              >
                {!isImporting && <FaCheck />}
                {isImporting ? "Adding Student..." : "Add Student"}
              </Button>
            ) : (
              <Button onClick={onClose} variant="primary" size="md">
                Close
              </Button>
            )}
          </>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Modal>
  )
}

export default ImportStudentModal
