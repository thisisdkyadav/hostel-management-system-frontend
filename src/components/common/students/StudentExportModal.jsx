import { useMemo, useRef, useState } from "react"
import Papa from "papaparse"
import { Button, Modal } from "czero/react"
import { CheckCircle2, Download, FileText, Filter, Upload, Users } from "lucide-react"
import { FileInput } from "@/components/ui"
import { MAX_BULK_RECORDS } from "@/constants/systemLimits"

const EXPORT_MODES = {
  VISIBLE: "visible",
  FILTERED: "filtered",
  ROLL_NUMBERS: "rollNumbers",
}

const toSafeString = (value) => (value === null || value === undefined ? "" : String(value).trim())
const normalizeRollNumber = (value) => toSafeString(value).toUpperCase()

const getRollNumberFromRow = (row) => {
  const keys = ["rollNumber", "roll number", "roll_number", "roll no", "rollNo", "roll_no", "roll"]
  for (const key of keys) {
    if (row?.[key]) return row[key]
  }

  const values = Object.values(row || {})
  return values.length === 1 ? values[0] : ""
}

const hasKnownRollNumberHeader = (fields = []) => {
  const normalizedFields = new Set(fields.map((field) => toSafeString(field).toLowerCase()))
  return ["rollnumber", "roll number", "roll_number", "roll no", "rollno", "roll_no", "roll"]
    .some((field) => normalizedFields.has(field))
}

const downloadRollNumberTemplate = () => {
  const blob = new Blob(["rollNumber\n"], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", "student_roll_numbers_template.csv")
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const OptionCard = ({ active, disabled, icon, title, description, meta, onClick }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    style={{
      width: "100%",
      display: "flex",
      gap: "var(--spacing-3)",
      alignItems: "flex-start",
      textAlign: "left",
      padding: "var(--spacing-4)",
      border: `1px solid ${active ? "var(--color-primary)" : "var(--color-border-primary)"}`,
      borderRadius: "var(--radius-lg)",
      background: active ? "var(--color-primary-bg)" : "var(--color-bg-primary)",
      color: disabled ? "var(--color-text-disabled)" : "var(--color-text-primary)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.65 : 1,
    }}
  >
    <span
      style={{
        width: 36,
        height: 36,
        borderRadius: "var(--radius-md)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color: active ? "var(--color-primary)" : "var(--color-text-muted)",
        background: active ? "var(--color-bg-primary)" : "var(--color-bg-tertiary)",
        flexShrink: 0,
      }}
    >
      {icon}
    </span>
    <span style={{ flex: 1, minWidth: 0 }}>
      <span style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)", fontWeight: "var(--font-weight-semibold)" }}>
        {title}
        {active && <CheckCircle2 size={16} color="var(--color-primary)" />}
      </span>
      <span style={{ display: "block", marginTop: "var(--spacing-1)", fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)", lineHeight: 1.45 }}>
        {description}
      </span>
      {meta && (
        <span style={{ display: "block", marginTop: "var(--spacing-2)", fontSize: "var(--font-size-xs)", color: "var(--color-text-tertiary)" }}>
          {meta}
        </span>
      )}
    </span>
  </button>
)

const StudentExportModal = ({ isOpen, onClose, onExport, visibleCount = 0, filteredCount = 0 }) => {
  const [mode, setMode] = useState(EXPORT_MODES.VISIBLE)
  const [rollNumbers, setRollNumbers] = useState([])
  const [fileName, setFileName] = useState("")
  const [error, setError] = useState("")
  const [isExporting, setIsExporting] = useState(false)
  const fileInputRef = useRef(null)

  const canExport = useMemo(() => {
    if (isExporting) return false
    if (mode === EXPORT_MODES.VISIBLE) return visibleCount > 0
    if (mode === EXPORT_MODES.FILTERED) return filteredCount > 0
    return rollNumbers.length > 0
  }, [filteredCount, isExporting, mode, rollNumbers.length, visibleCount])

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError("")
    setFileName(file.name)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const includeHeaderAsValue = !hasKnownRollNumberHeader(results.meta.fields) && results.meta.fields?.length === 1
        const headerValues = includeHeaderAsValue ? results.meta.fields : []
        const parsed = results.data
          .map(getRollNumberFromRow)
          .concat(headerValues)
          .map(normalizeRollNumber)
          .filter(Boolean)
        const uniqueRollNumbers = [...new Set(parsed)]

        if (uniqueRollNumbers.length === 0) {
          setRollNumbers([])
          setError("The CSV must include a rollNumber column or one roll number per row.")
          return
        }

        if (uniqueRollNumbers.length > MAX_BULK_RECORDS) {
          setRollNumbers([])
          setError(`Maximum ${MAX_BULK_RECORDS} roll numbers are allowed per export.`)
          return
        }

        setRollNumbers(uniqueRollNumbers)
      },
      error: (parseError) => {
        setRollNumbers([])
        setError(parseError.message || "Failed to read the CSV file.")
      },
    })
  }

  const handleExport = async () => {
    if (!canExport) return

    setIsExporting(true)
    setError("")
    try {
      await onExport({ mode, rollNumbers })
      onClose()
    } catch (exportError) {
      setError(exportError.message || "Failed to export students.")
    } finally {
      setIsExporting(false)
    }
  }

  if (!isOpen) return null

  return (
    <Modal title="Export Students" onClose={onClose} width={720}>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
        <OptionCard
          active={mode === EXPORT_MODES.VISIBLE}
          disabled={visibleCount === 0}
          icon={<Users size={19} />}
          title="Export visible students"
          description="Exports the students currently shown on this page."
          meta={`${visibleCount} visible student${visibleCount === 1 ? "" : "s"}`}
          onClick={() => setMode(EXPORT_MODES.VISIBLE)}
        />

        <OptionCard
          active={mode === EXPORT_MODES.FILTERED}
          disabled={filteredCount === 0}
          icon={<Filter size={19} />}
          title="Export all under current filter"
          description="Exports every student matching the active search, filters, and sort order."
          meta={`${filteredCount} matching student${filteredCount === 1 ? "" : "s"}`}
          onClick={() => setMode(EXPORT_MODES.FILTERED)}
        />

        <OptionCard
          active={mode === EXPORT_MODES.ROLL_NUMBERS}
          icon={<FileText size={19} />}
          title="Upload roll number list"
          description="Upload a CSV and export matching student profiles in one file."
          meta={rollNumbers.length > 0 ? `${rollNumbers.length} roll number${rollNumbers.length === 1 ? "" : "s"} loaded` : "CSV column: rollNumber"}
          onClick={() => setMode(EXPORT_MODES.ROLL_NUMBERS)}
        />

        {mode === EXPORT_MODES.ROLL_NUMBERS && (
          <div
            style={{
              border: "1px dashed var(--color-border-primary)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--spacing-4)",
              background: "var(--color-bg-tertiary)",
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--spacing-3)", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)" }}>
                  {fileName || "No file selected"}
                </div>
                <div style={{ marginTop: "var(--spacing-1)", fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
                  {rollNumbers.length > 0 ? `${rollNumbers.length} unique roll numbers ready` : "Upload a CSV file to continue"}
                </div>
              </div>
              <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
                <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Upload size={16} /> Upload CSV
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={downloadRollNumberTemplate}>
                  <Download size={16} /> Template
                </Button>
              </div>
            </div>
            <FileInput ref={fileInputRef} accept=".csv,text/csv" onChange={handleFileUpload} hidden />
          </div>
        )}

        {error && (
          <div style={{ padding: "var(--spacing-3)", borderRadius: "var(--radius-md)", background: "var(--color-danger-bg)", color: "var(--color-danger-text)", fontSize: "var(--font-size-sm)" }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-3)", paddingTop: "var(--spacing-2)" }}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
          <Button type="button" variant="primary" onClick={handleExport} disabled={!canExport}>
            <Download size={16} /> {isExporting ? "Exporting..." : "Export"}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default StudentExportModal
