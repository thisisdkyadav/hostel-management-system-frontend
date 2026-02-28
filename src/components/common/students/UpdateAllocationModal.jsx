import { useState, useRef } from "react"
import { FaFileUpload, FaCheck, FaTimes, FaFileDownload } from "react-icons/fa"
import StudentTableView from "./StudentTableView"
import Papa from "papaparse"

import { useGlobal } from "../../../contexts/GlobalProvider"
import { Select, FileInput } from "@/components/ui"
import { Button, Modal } from "czero/react"
import { BULK_RECORD_LIMIT_MESSAGE, MAX_BULK_RECORDS } from "@/constants/systemLimits"
import StudentDetailModal from "./StudentDetailModal"

const UpdateAllocationModal = ({ isOpen, onClose, onAllocate }) => {
  const { hostelList } = useGlobal()

  const [selectedHostel, setSelectedHostel] = useState(null)
  const hostelId = selectedHostel?._id || null
  const hostelType = selectedHostel?.type || null

  const [csvFile, setCsvFile] = useState(null)
  const [parsedData, setParsedData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAllocating, setIsAllocating] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState(1)
  const fileInputRef = useRef(null)
  const [showStudentDetail, setShowStudentDetail] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)

  const baseRequiredFields = ["rollNumber", "room", "bedNumber"]
  const requiredFields = hostelType === "unit-based" ? [...baseRequiredFields, "unit"] : baseRequiredFields

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

  const handleHostelChange = (e) => {
    const hostelId = e.target.value
    const selected = hostelList.find((hostel) => hostel._id === hostelId)
    setSelectedHostel(selected)
    setError("")
  }

  const generateCsvTemplate = () => {
    if (!selectedHostel) {
      setError("Please select a hostel first")
      return
    }

    const headers = requiredFields
    const csvContent = headers.join(",")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "room_allocation_template.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e) => {
    e.preventDefault()

    if (!selectedHostel) {
      setError("Please select a hostel first")
      return
    }

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
    if (!selectedHostel) {
      setError("Please select a hostel first")
      return
    }

    setIsLoading(true)
    setError("")

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

          const parsedData = results.data.map((student, index) => {
            const studentData = {
              rollNumber: student.rollNumber,
              room: student.room,
              bedNumber: student.bedNumber,
            }

            if (hostelType === "unit-based") {
              studentData.unit = student.unit
              studentData.displayRoom = `${student.unit || ""}-${student.room || ""}`
            } else {
              studentData.displayRoom = student.room || ""
            }

            studentData.hostel = selectedHostel.name || "N/A"

            return studentData
          })

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

  const handleAllocate = async () => {
    if (!selectedHostel) {
      setError("Please select a hostel first")
      return
    }

    if (parsedData.length === 0) {
      setError("No data to allocate")
      return
    }

    let hasError = false
    let errorMessage = ""

    if (hostelType === "unit-based") {
      const missingUnitRecords = parsedData.filter((student) => !student.unit)
      if (missingUnitRecords.length > 0) {
        hasError = true
        errorMessage = `${missingUnitRecords.length} student(s) missing unit number, which is required for unit-based hostels.`
      }
    }

    if (hasError) {
      setError(errorMessage)
      return
    }

    setIsAllocating(true)

    try {
      const isSuccess = await onAllocate(parsedData, hostelId)
      if (isSuccess) {
        onClose(false)
        resetForm()
      }
    } finally {
      setIsAllocating(false)
    }
  }

  const resetForm = () => {
    setCsvFile(null)
    setParsedData([])
    setError("")
    setStep(1)
  }

  const viewStudentDetails = (student) => {
    setSelectedStudent(student)
    setShowStudentDetail(true)
  }

  if (!isOpen) return null

  return (
    <Modal title="Update Room Allocations" onClose={onClose} width={900}>
      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-5)" }}>
          {/* Add hostel selection dropdown */}
          <div style={{ marginBottom: "var(--spacing-4)" }}>
            <label htmlFor="hostel-select" style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-body)", marginBottom: "var(--spacing-1)" }}>
              Select Hostel
            </label>
            <Select
              id="hostel-select"
              value={selectedHostel?._id || ""}
              onChange={handleHostelChange}
              placeholder="-- Select a hostel --"
              options={hostelList.map((hostel) => ({
                value: hostel._id,
                label: `${hostel.name} (${hostel.type})`
              }))}
            />
          </div>

          {selectedHostel ? (
            <>
              <div style={{ border: "2px dashed var(--color-border-input)", borderRadius: "var(--radius-xl)", padding: "var(--spacing-8)", textAlign: "center", cursor: "pointer", backgroundColor: "var(--color-bg-secondary)", transition: "var(--transition-colors)" }} onDragOver={handleDragOver} onDrop={handleDrop} onClick={() => fileInputRef.current.click()}>
                <FaFileUpload style={{ margin: "0 auto", height: "3rem", width: "3rem", color: "var(--color-text-placeholder)" }} />
                <p style={{ marginTop: "var(--spacing-2)", fontSize: "var(--font-size-sm)", color: "var(--color-text-tertiary)" }}>Drag and drop a CSV file here, or click to select a file</p>
                <p style={{ marginTop: "var(--spacing-3)", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                  <strong>Required fields:</strong> {requiredFields.join(", ")}
                </p>
                <FileInput ref={fileInputRef} hidden accept=".csv" onChange={handleFileUpload} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Button onClick={generateCsvTemplate} variant="ghost" size="sm">
                  <FaFileDownload />
                  Download CSV Template
                </Button>

                <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-tertiary)", marginTop: "var(--spacing-2)", backgroundColor: "var(--color-bg-secondary)", padding: "var(--spacing-3)", borderRadius: "var(--radius-lg)", maxWidth: "28rem" }}>
                  <p style={{ fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-1)" }}>Field Input Types:</p>
                  <ul style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "var(--spacing-1) var(--spacing-4)" }}>
                    <li>
                      <span style={{ fontWeight: "var(--font-weight-medium)" }}>rollNumber:</span> String (Required)
                    </li>
                    <li>
                      <span style={{ fontWeight: "var(--font-weight-medium)" }}>room:</span> String/Number (Required)
                    </li>
                    <li>
                      <span style={{ fontWeight: "var(--font-weight-medium)" }}>bedNumber:</span> Number (Required)
                    </li>
                    {hostelType === "unit-based" && (
                      <li>
                        <span style={{ fontWeight: "var(--font-weight-medium)" }}>unit:</span> String (Required)
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </>
          ) : (
            <div style={{ padding: "var(--spacing-8)", textAlign: "center", color: "var(--color-text-muted)" }}>Please select a hostel to continue with room allocation</div>
          )}

          {csvFile && (
            <div style={{ padding: "var(--spacing-2) var(--spacing-4)", backgroundColor: "var(--color-info-bg)", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-info-text)" }}>
                Selected file: <span style={{ fontWeight: "var(--font-weight-medium)" }}>{csvFile.name}</span>
              </span>
              <Button onClick={(e) => {
                e.stopPropagation()
                setCsvFile(null)
              }} variant="ghost" size="sm" aria-label="Remove file"><FaTimes /></Button>
            </div>
          )}

          {error && <div style={{ padding: "var(--spacing-2) var(--spacing-4)", backgroundColor: "var(--color-danger-bg)", color: "var(--color-danger-text)", borderRadius: "var(--radius-lg)", borderLeft: "4px solid var(--color-danger)" }}>{error}</div>}

          {isLoading && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--spacing-4)" }}>
              <div className="animate-spin" style={{ width: "var(--spacing-6)", height: "var(--spacing-6)", border: "2px solid var(--skeleton-base)", borderTop: "2px solid var(--color-primary)", borderRadius: "var(--radius-full)" }}></div>
              <span style={{ marginLeft: "var(--spacing-2)", fontSize: "var(--font-size-sm)", color: "var(--color-text-tertiary)" }}>Processing file...</span>
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-5)" }}>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", marginBottom: "var(--spacing-4)" }} className="sm:flex-row sm:items-center">
            <h3 style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-secondary)" }}>Preview Room Allocations - {selectedHostel?.name}</h3>
            <div style={{ marginTop: "var(--spacing-2)", fontSize: "var(--font-size-sm)", color: "var(--color-text-tertiary)", backgroundColor: "var(--color-info-bg)", padding: "var(--spacing-1) var(--spacing-3)", borderRadius: "var(--radius-full)" }} className="sm:mt-0">{parsedData.length} room allocations found in CSV</div>
          </div>

          <div style={{ border: "1px solid var(--color-border-primary)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
            <StudentTableView currentStudents={parsedData} sortField="name" sortDirection="asc" handleSort={() => { }} viewStudentDetails={viewStudentDetails} />
          </div>

          {error && <div style={{ padding: "var(--spacing-2) var(--spacing-4)", backgroundColor: "var(--color-danger-bg)", color: "var(--color-danger-text)", borderRadius: "var(--radius-lg)", borderLeft: "4px solid var(--color-danger)" }}>{error}</div>}
        </div>
      )}

      <div style={{ marginTop: "var(--spacing-6)", display: "flex", justifyContent: "flex-end", gap: "var(--spacing-3)", paddingTop: "var(--spacing-4)", borderTop: "1px solid var(--color-border-light)" }}>
        {step === 1 ? (
          <Button onClick={onClose} variant="secondary" size="md">
            Cancel
          </Button>
        ) : (
          <Button onClick={resetForm} variant="secondary" size="md">
            Back
          </Button>
        )}

        {step === 2 && (
          <Button onClick={handleAllocate} variant="primary" size="md" loading={isAllocating} disabled={parsedData.length === 0 || isLoading || isAllocating}>
            <FaCheck />
            {isAllocating ? "Updating Allocations..." : "Confirm Allocations"}
          </Button>
        )}
      </div>
      {showStudentDetail && selectedStudent && <StudentDetailModal selectedStudent={selectedStudent} setShowStudentDetail={setShowStudentDetail} onUpdate={null} isImport={true} />}
    </Modal>
  )
}

export default UpdateAllocationModal
