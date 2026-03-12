import { useMemo, useRef, useState } from "react"
import {
  FaCheck,
  FaExclamationTriangle,
  FaFileDownload,
  FaFileUpload,
  FaInfoCircle,
  FaSpinner,
  FaTimes,
  FaTrash,
  FaUpload,
  FaKeyboard,
} from "react-icons/fa"
import Papa from "papaparse"

import StudentTableView from "./StudentTableView"
import StudentDetailModal from "./StudentDetailModal"
import { useGlobal } from "../../../contexts/GlobalProvider"
import { hostelApi, studentApi } from "../../../service"
import { Select, FileInput } from "@/components/ui"
import { Button, Input, Modal } from "czero/react"
import { BULK_RECORD_LIMIT_MESSAGE, MAX_BULK_RECORDS } from "@/constants/systemLimits"

const createManualRowId = () => `allocation-row-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

const createEmptyManualRow = () => ({
  id: createManualRowId(),
  rollNumber: "",
  student: null,
  studentLookupState: "idle",
  studentError: "",
  hostelId: "",
  hostelType: "",
  unit: "",
  unitId: "",
  unitError: "",
  roomId: "",
  roomNumber: "",
  bedNumber: "",
  roomsLoading: false,
  validationError: "",
})

const normalizeRollNumber = (value) => String(value || "").trim().toUpperCase()
const normalizeLookupValue = (value) => String(value || "").trim().toLowerCase()

const isManualRowBlank = (row = {}) => (
  !row.rollNumber
  && !row.hostelId
  && !row.unit
  && !row.roomId
  && !row.bedNumber
)

const withTrailingBlankManualRow = (rows = []) => {
  const nextRows = [...rows]

  while (
    nextRows.length > 1
    && isManualRowBlank(nextRows[nextRows.length - 1])
    && isManualRowBlank(nextRows[nextRows.length - 2])
  ) {
    nextRows.pop()
  }

  if (nextRows.length === 0 || !isManualRowBlank(nextRows[nextRows.length - 1])) {
    nextRows.push(createEmptyManualRow())
  }

  return nextRows
}

const getRoomCacheKey = ({ hostelId = "", unitId = "", hostelType = "" } = {}) => {
  if (hostelType === "unit-based" && unitId) return `unit:${unitId}`
  if (hostelId) return `hostel:${hostelId}`
  return ""
}

const getStudentDisplayName = (student) => student?.name || "Student will appear after roll number lookup"

const getSelectedRoom = (row, roomsByCacheKey) => {
  const cacheKey = getRoomCacheKey(row)
  const rooms = roomsByCacheKey[cacheKey] || []
  return rooms.find((room) => room.id === row.roomId) || null
}

const getBedOccupant = (room, bedNumber) => (
  room?.students?.find((student) => String(student.bedNumber) === String(bedNumber)) || null
)

const groupAllocationsByHostel = (rows = []) => {
  const grouped = new Map()

  rows.forEach((row) => {
    const hostelId = row.hostelId
    if (!hostelId) return

    if (!grouped.has(hostelId)) {
      grouped.set(hostelId, [])
    }

    const payload = {
      rollNumber: normalizeRollNumber(row.rollNumber),
      room: row.roomNumber,
      bedNumber: Number(row.bedNumber),
    }

    if (row.hostelType === "unit-based") {
      payload.unit = row.unit
    }

    grouped.get(hostelId).push(payload)
  })

  return Array.from(grouped.entries()).map(([hostelId, allocations]) => ({
    hostelId,
    allocations,
  }))
}

const UpdateAllocationModal = ({ isOpen, onClose, onAllocate }) => {
  const { hostelList = [] } = useGlobal()

  const [activeTab, setActiveTab] = useState("csv")
  const [selectedHostel, setSelectedHostel] = useState(null)
  const hostelId = selectedHostel?._id || null
  const hostelType = selectedHostel?.type || null

  const [csvFile, setCsvFile] = useState(null)
  const [parsedData, setParsedData] = useState([])
  const [step, setStep] = useState(1)

  const [manualRows, setManualRows] = useState([createEmptyManualRow()])
  const [unitsByHostelId, setUnitsByHostelId] = useState({})
  const [roomsByCacheKey, setRoomsByCacheKey] = useState({})

  const [isLoading, setIsLoading] = useState(false)
  const [isAllocating, setIsAllocating] = useState(false)
  const [error, setError] = useState("")

  const [showStudentDetail, setShowStudentDetail] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const fileInputRef = useRef(null)

  const baseRequiredFields = ["rollNumber", "room", "bedNumber"]
  const requiredFields = hostelType === "unit-based" ? [...baseRequiredFields, "unit"] : baseRequiredFields

  const tabs = useMemo(() => ([
    { id: "csv", name: "CSV Upload", icon: <FaUpload /> },
    { id: "manual", name: "Manual Input", icon: <FaKeyboard /> },
  ]), [])

  const nonBlankManualRows = useMemo(
    () => manualRows.filter((row) => !isManualRowBlank(row)),
    [manualRows]
  )

  const manualReadyRows = useMemo(
    () => nonBlankManualRows.filter((row) => (
      row.student
      && !row.studentError
      && !row.unitError
      && !row.validationError
      && row.hostelId
      && (row.hostelType !== "unit-based" || row.unitId)
      && row.roomId
      && row.bedNumber
    )),
    [nonBlankManualRows]
  )

  const resetCsvState = () => {
    setSelectedHostel(null)
    setCsvFile(null)
    setParsedData([])
    setStep(1)
  }

  const resetManualState = () => {
    setManualRows([createEmptyManualRow()])
    setUnitsByHostelId({})
    setRoomsByCacheKey({})
  }

  const resetAllState = () => {
    setActiveTab("csv")
    resetCsvState()
    resetManualState()
    setError("")
    setIsLoading(false)
    setIsAllocating(false)
    setShowStudentDetail(false)
    setSelectedStudent(null)
  }

  const handleClose = () => {
    resetAllState()
    onClose()
  }

  const updateManualRows = (updater) => {
    setManualRows((currentRows) => withTrailingBlankManualRow(typeof updater === "function" ? updater(currentRows) : updater))
  }

  const updateManualRow = (rowId, updater) => {
    updateManualRows((rows) => rows.map((row) => {
      if (row.id !== rowId) return row
      return typeof updater === "function" ? updater(row) : { ...row, ...updater }
    }))
  }

  const loadUnitsForHostel = async (nextHostelId) => {
    if (!nextHostelId) return []
    if (Array.isArray(unitsByHostelId[nextHostelId])) {
      return unitsByHostelId[nextHostelId]
    }

    const units = await hostelApi.getUnits(nextHostelId)
    const safeUnits = Array.isArray(units) ? units : []
    setUnitsByHostelId((current) => ({ ...current, [nextHostelId]: safeUnits }))
    return safeUnits
  }

  const loadRoomOnlyRooms = async (nextHostelId) => {
    if (!nextHostelId) return []

    const cacheKey = getRoomCacheKey({ hostelId: nextHostelId })
    if (Array.isArray(roomsByCacheKey[cacheKey])) {
      return roomsByCacheKey[cacheKey]
    }

    const rooms = await hostelApi.getAllocationRooms(nextHostelId)
    const safeRooms = Array.isArray(rooms) ? rooms : []
    setRoomsByCacheKey((current) => ({ ...current, [cacheKey]: safeRooms }))
    return safeRooms
  }

  const loadUnitRooms = async (unitId) => {
    if (!unitId) return []

    const cacheKey = getRoomCacheKey({ hostelType: "unit-based", unitId })
    if (Array.isArray(roomsByCacheKey[cacheKey])) {
      return roomsByCacheKey[cacheKey]
    }

    const rooms = await hostelApi.getAllocationRoomsByUnit(unitId)
    const safeRooms = Array.isArray(rooms) ? rooms : []
    setRoomsByCacheKey((current) => ({ ...current, [cacheKey]: safeRooms }))
    return safeRooms
  }

  const handleHostelChange = (event) => {
    const nextHostelId = event.target.value
    const nextSelectedHostel = hostelList.find((hostel) => hostel._id === nextHostelId) || null
    setSelectedHostel(nextSelectedHostel)
    setError("")
  }

  const handleCsvFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (file.type !== "text/csv") {
      setError("Please upload a valid CSV file")
      return
    }

    setCsvFile(file)
    parseCSV(file)
  }

  const generateCsvTemplate = () => {
    if (!selectedHostel) {
      setError("Please select a hostel first")
      return
    }

    const csvContent = requiredFields.join(",")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")

    link.href = url
    link.setAttribute("download", "room_allocation_template.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDragOver = (event) => {
    event.preventDefault()
  }

  const handleDrop = (event) => {
    event.preventDefault()

    if (!selectedHostel) {
      setError("Please select a hostel first")
      return
    }

    const file = event.dataTransfer.files[0]
    if (!file) return

    if (file.type !== "text/csv") {
      setError("Please upload a valid CSV file")
      return
    }

    setCsvFile(file)
    parseCSV(file)
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

          const headers = results.meta.fields || []
          const missingFields = requiredFields.filter((field) => !headers.includes(field))

          if (missingFields.length > 0) {
            setError(`Missing required fields: ${missingFields.join(", ")}`)
            setIsLoading(false)
            return
          }

          const nextParsedData = results.data.map((student) => {
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

          setParsedData(nextParsedData)
          setStep(2)
        } catch {
          setError("Failed to process CSV data. Please check the format.")
        } finally {
          setIsLoading(false)
        }
      },
      error: (parseError) => {
        setError(`Error parsing CSV: ${parseError.message}`)
        setIsLoading(false)
      },
    })
  }

  const handleCsvAllocate = async () => {
    if (!selectedHostel) {
      setError("Please select a hostel first")
      return
    }

    if (parsedData.length === 0) {
      setError("No data to allocate")
      return
    }

    if (hostelType === "unit-based") {
      const missingUnitRecords = parsedData.filter((student) => !student.unit)
      if (missingUnitRecords.length > 0) {
        setError(`${missingUnitRecords.length} student(s) are missing the unit number required for a unit-based hostel.`)
        return
      }
    }

    setIsAllocating(true)
    setError("")

    try {
      const result = await onAllocate(parsedData, hostelId)
      if (result?.success) {
        handleClose()
      } else if (result?.message) {
        setError(result.message)
      }
    } finally {
      setIsAllocating(false)
    }
  }

  const handleManualFieldChange = (rowId, field, value) => {
    setError("")

    if (field === "rollNumber") {
      updateManualRow(rowId, (row) => ({
        ...row,
        rollNumber: value,
        student: null,
        studentLookupState: "idle",
        studentError: "",
        validationError: "",
      }))
      return
    }

    if (field === "hostelId") {
      const nextHostel = hostelList.find((hostel) => hostel._id === value) || null

      updateManualRow(rowId, {
        hostelId: value,
        hostelType: nextHostel?.type || "",
        unit: "",
        unitId: "",
        unitError: "",
        roomId: "",
        roomNumber: "",
        bedNumber: "",
        roomsLoading: nextHostel?.type === "room-only",
        validationError: "",
      })

      if (nextHostel?.type === "unit-based") {
        loadUnitsForHostel(value).catch(() => {
          updateManualRow(rowId, {
            unitError: "Failed to load units for this hostel.",
          })
        })
      } else if (nextHostel?.type === "room-only") {
        loadRoomOnlyRooms(value)
          .then(() => {
            updateManualRow(rowId, { roomsLoading: false })
          })
          .catch(() => {
            updateManualRow(rowId, {
              roomsLoading: false,
              validationError: "Failed to load rooms for this hostel.",
            })
          })
      }

      return
    }

    if (field === "unit") {
      updateManualRow(rowId, {
        unit: value,
        unitId: "",
        unitError: "",
        roomId: "",
        roomNumber: "",
        bedNumber: "",
        validationError: "",
      })
      return
    }

    if (field === "roomId") {
      updateManualRow(rowId, (row) => {
        const selectedRoom = getSelectedRoom({ ...row, roomId: value }, roomsByCacheKey)
        return {
          ...row,
          roomId: value,
          roomNumber: selectedRoom?.roomNumber || "",
          bedNumber: "",
          validationError: "",
        }
      })
      return
    }

    if (field === "bedNumber") {
      updateManualRow(rowId, {
        bedNumber: value,
        validationError: "",
      })
    }
  }

  const handleManualRollBlur = async (rowId) => {
    const row = manualRows.find((item) => item.id === rowId)
    const normalizedRollNumber = normalizeRollNumber(row?.rollNumber)

    if (!normalizedRollNumber) {
      updateManualRow(rowId, {
        rollNumber: "",
        student: null,
        studentLookupState: "idle",
        studentError: "",
      })
      return
    }

    updateManualRow(rowId, {
      rollNumber: normalizedRollNumber,
      studentLookupState: "loading",
      studentError: "",
      student: null,
      validationError: "",
    })

    try {
      const student = await studentApi.getAllocationStudentByRollNumber(normalizedRollNumber)

      updateManualRow(rowId, (currentRow) => {
        if (normalizeRollNumber(currentRow.rollNumber) !== normalizedRollNumber) {
          return currentRow
        }

        return {
          ...currentRow,
          rollNumber: student?.rollNumber || normalizedRollNumber,
          student,
          studentLookupState: "success",
          studentError: "",
        }
      })
    } catch (lookupError) {
      updateManualRow(rowId, (currentRow) => {
        if (normalizeRollNumber(currentRow.rollNumber) !== normalizedRollNumber) {
          return currentRow
        }

        return {
          ...currentRow,
          student: null,
          studentLookupState: "error",
          studentError: lookupError.message || "Student not found",
        }
      })
    }
  }

  const handleManualUnitBlur = async (rowId) => {
    const row = manualRows.find((item) => item.id === rowId)
    if (!row?.hostelId || row.hostelType !== "unit-based") return

    const nextUnitValue = String(row.unit || "").trim()
    if (!nextUnitValue) {
      updateManualRow(rowId, {
        unit: "",
        unitId: "",
        unitError: "Unit number is required for this hostel.",
      })
      return
    }

    updateManualRow(rowId, {
      unit: nextUnitValue,
      unitError: "",
      roomsLoading: true,
      roomId: "",
      roomNumber: "",
      bedNumber: "",
      validationError: "",
    })

    try {
      const units = await loadUnitsForHostel(row.hostelId)
      const matchedUnit = units.find((unit) => normalizeLookupValue(unit.unitNumber) === normalizeLookupValue(nextUnitValue))

      if (!matchedUnit) {
        updateManualRow(rowId, (currentRow) => ({
          ...currentRow,
          unitId: "",
          unitError: `Unit ${nextUnitValue} does not exist in the selected hostel.`,
          roomsLoading: false,
        }))
        return
      }

      await loadUnitRooms(matchedUnit.id)

      updateManualRow(rowId, (currentRow) => ({
        ...currentRow,
        unit: matchedUnit.unitNumber,
        unitId: matchedUnit.id,
        unitError: "",
        roomsLoading: false,
      }))
    } catch {
      updateManualRow(rowId, {
        unitId: "",
        unitError: "Failed to load rooms for the selected unit.",
        roomsLoading: false,
      })
    }
  }

  const removeManualRow = (rowId) => {
    updateManualRows((rows) => {
      const nextRows = rows.filter((row) => row.id !== rowId)
      return nextRows.length > 0 ? nextRows : [createEmptyManualRow()]
    })
  }

  const handleManualAllocate = async () => {
    setError("")

    const rowsToSubmit = manualRows.filter((row) => !isManualRowBlank(row))
    if (rowsToSubmit.length === 0) {
      setError("Add at least one manual allocation row before submitting.")
      return
    }

    const nextRows = manualRows.map((row) => {
      if (isManualRowBlank(row)) return row

      let validationError = ""

      if (!row.student) {
        validationError = row.studentError || "Enter a valid roll number and wait for lookup."
      } else if (!row.hostelId) {
        validationError = "Select a hostel."
      } else if (row.hostelType === "unit-based" && !row.unitId) {
        validationError = row.unitError || "Enter a valid unit number."
      } else if (!row.roomId) {
        validationError = "Select a room."
      } else if (!row.bedNumber) {
        validationError = "Select a bed number."
      }

      return {
        ...row,
        validationError,
      }
    })

    const duplicateRollNumbers = rowsToSubmit.reduce((counts, row) => {
      const rollNumber = normalizeRollNumber(row.rollNumber)
      if (!rollNumber) return counts
      counts[rollNumber] = (counts[rollNumber] || 0) + 1
      return counts
    }, {})

    const dedupedRows = nextRows.map((row) => {
      const rollNumber = normalizeRollNumber(row.rollNumber)
      if (!rollNumber || !duplicateRollNumbers[rollNumber] || duplicateRollNumbers[rollNumber] < 2) {
        return row
      }

      return {
        ...row,
        validationError: "This roll number appears more than once in the manual form.",
      }
    })

    setManualRows(withTrailingBlankManualRow(dedupedRows))

    const hasRowErrors = dedupedRows.some((row) => !isManualRowBlank(row) && (
      row.studentLookupState === "loading"
      || row.roomsLoading
      || row.studentError
      || row.unitError
      || row.validationError
    ))

    if (hasRowErrors) {
      setError("Resolve the highlighted manual rows before submitting.")
      return
    }

    const groupedAllocations = groupAllocationsByHostel(
      dedupedRows.filter((row) => !isManualRowBlank(row))
    )

    if (groupedAllocations.length === 0) {
      setError("No valid manual allocations are ready to submit.")
      return
    }

    setIsAllocating(true)

    try {
      const aggregatedErrors = []

      for (const group of groupedAllocations) {
        const result = await onAllocate(group.allocations, group.hostelId, { silent: true })

        if (!result?.success) {
          if (result?.message) {
            aggregatedErrors.push(result.message)
          } else {
            aggregatedErrors.push(`Failed to update allocations for hostel ${group.hostelId}`)
          }
          continue
        }

        if (Array.isArray(result.errors) && result.errors.length > 0) {
          result.errors.forEach((allocationError) => {
            aggregatedErrors.push(`${allocationError.rollNumber || "Unknown"}: ${allocationError.message}`)
          })
        }
      }

      if (aggregatedErrors.length > 0) {
        setError(`Some allocations could not be completed:\n${aggregatedErrors.join("\n")}`)
        return
      }

      alert("Allocations updated successfully")
      handleClose()
    } finally {
      setIsAllocating(false)
    }
  }

  const viewStudentDetails = (student) => {
    setSelectedStudent(student)
    setShowStudentDetail(true)
  }

  if (!isOpen) return null

  return (
    <Modal
      title="Update Room Allocations"
      onClose={handleClose}
      width={980}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(nextTab) => {
        if (isAllocating || isLoading) return
        setError("")
        setActiveTab(nextTab)
      }}
    >
      {activeTab === "csv" && (
        <>
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-5)" }}>
              <div>
                <label
                  htmlFor="hostel-select"
                  style={{
                    display: "block",
                    fontSize: "var(--font-size-sm)",
                    fontWeight: "var(--font-weight-medium)",
                    color: "var(--color-text-body)",
                    marginBottom: "var(--spacing-1)",
                  }}
                >
                  Select Hostel
                </label>
                <Select
                  id="hostel-select"
                  value={selectedHostel?._id || ""}
                  onChange={handleHostelChange}
                  placeholder="-- Select a hostel --"
                  options={hostelList.map((hostel) => ({
                    value: hostel._id,
                    label: `${hostel.name} (${hostel.type})`,
                  }))}
                />
              </div>

              {selectedHostel ? (
                <>
                  <div
                    style={{
                      border: "2px dashed var(--color-border-input)",
                      borderRadius: "var(--radius-xl)",
                      padding: "var(--spacing-8)",
                      textAlign: "center",
                      cursor: "pointer",
                      backgroundColor: "var(--color-bg-secondary)",
                      transition: "var(--transition-colors)",
                    }}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FaFileUpload style={{ margin: "0 auto", height: "3rem", width: "3rem", color: "var(--color-text-placeholder)" }} />
                    <p style={{ marginTop: "var(--spacing-2)", fontSize: "var(--font-size-sm)", color: "var(--color-text-tertiary)" }}>
                      Drag and drop a CSV file here, or click to select a file
                    </p>
                    <p style={{ marginTop: "var(--spacing-3)", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                      <strong>Required fields:</strong> {requiredFields.join(", ")}
                    </p>
                    <FileInput ref={fileInputRef} hidden accept=".csv" onChange={handleCsvFileUpload} />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Button onClick={generateCsvTemplate} variant="ghost" size="sm">
                      <FaFileDownload />
                      Download CSV Template
                    </Button>

                    <div
                      style={{
                        fontSize: "var(--font-size-xs)",
                        color: "var(--color-text-tertiary)",
                        marginTop: "var(--spacing-2)",
                        backgroundColor: "var(--color-bg-secondary)",
                        padding: "var(--spacing-3)",
                        borderRadius: "var(--radius-lg)",
                        maxWidth: "28rem",
                      }}
                    >
                      <p style={{ fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-1)" }}>Field Input Types:</p>
                      <ul style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "var(--spacing-1) var(--spacing-4)" }}>
                        <li><span style={{ fontWeight: "var(--font-weight-medium)" }}>rollNumber:</span> String (Required)</li>
                        <li><span style={{ fontWeight: "var(--font-weight-medium)" }}>room:</span> String/Number (Required)</li>
                        <li><span style={{ fontWeight: "var(--font-weight-medium)" }}>bedNumber:</span> Number (Required)</li>
                        {hostelType === "unit-based" && (
                          <li><span style={{ fontWeight: "var(--font-weight-medium)" }}>unit:</span> String (Required)</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ padding: "var(--spacing-8)", textAlign: "center", color: "var(--color-text-muted)" }}>
                  Please select a hostel to continue with room allocation
                </div>
              )}

              {csvFile && (
                <div
                  style={{
                    padding: "var(--spacing-2) var(--spacing-4)",
                    backgroundColor: "var(--color-info-bg)",
                    borderRadius: "var(--radius-lg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-info-text)" }}>
                    Selected file: <span style={{ fontWeight: "var(--font-weight-medium)" }}>{csvFile.name}</span>
                  </span>
                  <Button
                    onClick={(event) => {
                      event.stopPropagation()
                      setCsvFile(null)
                    }}
                    variant="ghost"
                    size="sm"
                    aria-label="Remove file"
                  >
                    <FaTimes />
                  </Button>
                </div>
              )}

              {isLoading && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--spacing-4)" }}>
                  <FaSpinner className="animate-spin" style={{ width: "var(--spacing-5)", height: "var(--spacing-5)", color: "var(--color-primary)" }} />
                  <span style={{ marginLeft: "var(--spacing-2)", fontSize: "var(--font-size-sm)", color: "var(--color-text-tertiary)" }}>
                    Processing file...
                  </span>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-5)" }}>
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", marginBottom: "var(--spacing-4)" }} className="sm:flex-row sm:items-center">
                <h3 style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-secondary)" }}>
                  Preview Room Allocations - {selectedHostel?.name}
                </h3>
                <div
                  style={{
                    marginTop: "var(--spacing-2)",
                    fontSize: "var(--font-size-sm)",
                    color: "var(--color-text-tertiary)",
                    backgroundColor: "var(--color-info-bg)",
                    padding: "var(--spacing-1) var(--spacing-3)",
                    borderRadius: "var(--radius-full)",
                  }}
                  className="sm:mt-0"
                >
                  {parsedData.length} room allocations found in CSV
                </div>
              </div>

              <div style={{ border: "1px solid var(--color-border-primary)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                <StudentTableView currentStudents={parsedData} sortField="name" sortDirection="asc" handleSort={() => {}} viewStudentDetails={viewStudentDetails} />
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "manual" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--spacing-4)", flexWrap: "wrap" }}>
            <div>
              <h3 style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-secondary)" }}>
                Manual Allocation Rows
              </h3>
              <p style={{ marginTop: "var(--spacing-1)", fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
                Fill a row and the next empty row appears automatically. Roll number lookup runs on blur.
              </p>
            </div>

            <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-tertiary)", backgroundColor: "var(--color-info-bg)", padding: "var(--spacing-2) var(--spacing-3)", borderRadius: "var(--radius-full)" }}>
              {manualReadyRows.length} ready to submit
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)", maxHeight: "32rem", overflowY: "auto", paddingRight: "var(--spacing-1)" }}>
            {manualRows.map((row, index) => {
              const currentHostel = hostelList.find((hostel) => hostel._id === row.hostelId) || null
              const currentRoom = getSelectedRoom(row, roomsByCacheKey)
              const occupiedBedStudent = getBedOccupant(currentRoom, row.bedNumber)

              const units = unitsByHostelId[row.hostelId] || []
              const roomOptions = (roomsByCacheKey[getRoomCacheKey(row)] || [])
                .filter((room) => room.status === "Active")
                .map((room) => ({
                  value: room.id,
                  label: `${room.roomNumber} (${room.currentOccupancy || 0}/${room.capacity})`,
                }))

              const bedOptions = currentRoom
                ? Array.from({ length: currentRoom.capacity }, (_, bedIndex) => {
                    const bedNumber = bedIndex + 1
                    const occupiedStudent = getBedOccupant(currentRoom, bedNumber)
                    return {
                      value: String(bedNumber),
                      label: occupiedStudent
                        ? `Bed ${bedNumber} - Occupied by ${occupiedStudent.name}`
                        : `Bed ${bedNumber} - Available`,
                    }
                  })
                : []

              const hostelOptions = hostelList.map((hostel) => ({
                value: hostel._id,
                label: `${hostel.name} (${hostel.type})`,
              }))

              return (
                <div
                  key={row.id}
                  style={{
                    border: "1px solid var(--color-border-primary)",
                    borderRadius: "var(--radius-card-sm)",
                    padding: "var(--spacing-4)",
                    backgroundColor: isManualRowBlank(row) ? "var(--color-bg-secondary)" : "var(--color-bg-primary)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--spacing-3)" }}>
                    <div style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-secondary)" }}>
                      Row {index + 1}
                    </div>
                    {!isManualRowBlank(row) && (
                      <Button onClick={() => removeManualRow(row.id)} variant="ghost" size="sm">
                        <FaTrash />
                      </Button>
                    )}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "var(--spacing-3)" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-1)" }}>
                        Roll Number
                      </label>
                      <Input
                        type="text"
                        value={row.rollNumber}
                        onChange={(event) => handleManualFieldChange(row.id, "rollNumber", event.target.value)}
                        onBlur={() => handleManualRollBlur(row.id)}
                        placeholder="Enter roll number"
                        error={Boolean(row.studentError || row.validationError)}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-1)" }}>
                        Student
                      </label>
                      <div
                        style={{
                          minHeight: "40px",
                          display: "flex",
                          alignItems: "center",
                          padding: "0 var(--spacing-3)",
                          border: "1px solid var(--color-border-input)",
                          borderRadius: "var(--radius-input)",
                          backgroundColor: "var(--color-bg-secondary)",
                          color: row.student ? "var(--color-text-primary)" : "var(--color-text-muted)",
                          fontSize: "var(--font-size-sm)",
                        }}
                      >
                        {row.studentLookupState === "loading" ? (
                          <>
                            <FaSpinner className="animate-spin" style={{ marginRight: "var(--spacing-2)", color: "var(--color-primary)" }} />
                            Looking up student...
                          </>
                        ) : (
                          getStudentDisplayName(row.student)
                        )}
                      </div>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-1)" }}>
                        Hostel
                      </label>
                      <Select
                        value={row.hostelId}
                        onChange={(event) => handleManualFieldChange(row.id, "hostelId", event.target.value)}
                        options={hostelOptions}
                        placeholder="Select hostel"
                        error={Boolean(row.validationError && !row.hostelId)}
                      />
                    </div>

                    {row.hostelType === "unit-based" && (
                      <div>
                        <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-1)" }}>
                          Unit Number
                        </label>
                        <Input
                          type="text"
                          value={row.unit}
                          onChange={(event) => handleManualFieldChange(row.id, "unit", event.target.value)}
                          onBlur={() => handleManualUnitBlur(row.id)}
                          placeholder={units.length > 0 ? `Example: ${units[0].unitNumber}` : "Enter unit number"}
                          error={Boolean(row.unitError || (row.validationError && !row.unitId))}
                        />
                      </div>
                    )}

                    <div>
                      <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-1)" }}>
                        Room
                      </label>
                      <Select
                        value={row.roomId}
                        onChange={(event) => handleManualFieldChange(row.id, "roomId", event.target.value)}
                        options={roomOptions}
                        placeholder={
                          row.hostelType === "unit-based"
                            ? row.unitId ? "Select room" : "Enter unit first"
                            : row.hostelId ? "Select room" : "Select hostel first"
                        }
                        disabled={!row.hostelId || (row.hostelType === "unit-based" && !row.unitId) || row.roomsLoading}
                        error={Boolean(row.validationError && !row.roomId)}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-1)" }}>
                        Bed Number
                      </label>
                      <Select
                        value={row.bedNumber}
                        onChange={(event) => handleManualFieldChange(row.id, "bedNumber", event.target.value)}
                        options={bedOptions}
                        placeholder={row.roomId ? "Select bed" : "Select room first"}
                        disabled={!row.roomId}
                        error={Boolean(row.validationError && !row.bedNumber)}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)", marginTop: "var(--spacing-3)" }}>
                    {row.student?.currentAllocation && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "var(--spacing-2)",
                          padding: "var(--spacing-2) var(--spacing-3)",
                          borderRadius: "var(--radius-lg)",
                          backgroundColor: "var(--color-info-bg)",
                          color: "var(--color-info-text)",
                          fontSize: "var(--font-size-sm)",
                        }}
                      >
                        <FaInfoCircle style={{ marginTop: "2px" }} />
                        <span>
                          {row.student.name} is currently allocated to{" "}
                          <strong>
                            {row.student.currentAllocation.hostelName}
                            {row.student.currentAllocation.unitNumber ? ` / ${row.student.currentAllocation.unitNumber}` : ""}
                            {row.student.currentAllocation.roomNumber ? ` / ${row.student.currentAllocation.roomNumber}` : ""}
                            {row.student.currentAllocation.bedNumber ? ` / Bed ${row.student.currentAllocation.bedNumber}` : ""}
                          </strong>.
                          Saving this row will move the student.
                        </span>
                      </div>
                    )}

                    {occupiedBedStudent && row.student && occupiedBedStudent.id !== row.student.id && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "var(--spacing-2)",
                          padding: "var(--spacing-2) var(--spacing-3)",
                          borderRadius: "var(--radius-lg)",
                          backgroundColor: "var(--color-warning-bg)",
                          color: "var(--color-warning-text)",
                          fontSize: "var(--font-size-sm)",
                        }}
                      >
                        <FaExclamationTriangle style={{ marginTop: "2px" }} />
                        <span>
                          Bed {row.bedNumber} is currently occupied by <strong>{occupiedBedStudent.name}</strong>.
                          Assigning {row.student.name} here will unallocate that student.
                        </span>
                      </div>
                    )}

                    {row.studentError && (
                      <div style={{ padding: "var(--spacing-2) var(--spacing-3)", borderRadius: "var(--radius-lg)", backgroundColor: "var(--color-danger-bg-light)", color: "var(--color-danger)", fontSize: "var(--font-size-sm)" }}>
                        {row.studentError}
                      </div>
                    )}

                    {row.unitError && (
                      <div style={{ padding: "var(--spacing-2) var(--spacing-3)", borderRadius: "var(--radius-lg)", backgroundColor: "var(--color-danger-bg-light)", color: "var(--color-danger)", fontSize: "var(--font-size-sm)" }}>
                        {row.unitError}
                      </div>
                    )}

                    {row.validationError && (
                      <div style={{ padding: "var(--spacing-2) var(--spacing-3)", borderRadius: "var(--radius-lg)", backgroundColor: "var(--color-danger-bg-light)", color: "var(--color-danger)", fontSize: "var(--font-size-sm)" }}>
                        {row.validationError}
                      </div>
                    )}

                    {row.roomsLoading && (
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)", fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
                        <FaSpinner className="animate-spin" />
                        Loading rooms...
                      </div>
                    )}

                    {currentHostel && currentHostel.type === "unit-based" && row.hostelId && !row.unit && !row.unitError && units.length > 0 && (
                      <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                        Available units include: {units.slice(0, 6).map((unit) => unit.unitNumber).join(", ")}
                        {units.length > 6 ? "..." : ""}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {error && (
        <div
          style={{
            marginTop: "var(--spacing-5)",
            padding: "var(--spacing-2) var(--spacing-4)",
            backgroundColor: "var(--color-danger-bg-light)",
            color: "var(--color-danger)",
            borderRadius: "var(--radius-lg)",
            borderLeft: "4px solid var(--color-danger)",
            whiteSpace: "pre-line",
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          marginTop: "var(--spacing-6)",
          display: "flex",
          justifyContent: "flex-end",
          gap: "var(--spacing-3)",
          paddingTop: "var(--spacing-4)",
          borderTop: "1px solid var(--color-border-light)",
        }}
      >
        {activeTab === "csv" && (
          <>
            {step === 1 ? (
              <Button onClick={handleClose} variant="secondary" size="md">
                Cancel
              </Button>
            ) : (
              <Button
                onClick={() => {
                  resetCsvState()
                  setError("")
                }}
                variant="secondary"
                size="md"
              >
                Back
              </Button>
            )}

            {step === 1 && selectedHostel && csvFile && (
              <Button onClick={() => parseCSV(csvFile)} variant="primary" size="md" disabled={isLoading}>
                Preview CSV
              </Button>
            )}

            {step === 2 && (
              <Button onClick={handleCsvAllocate} variant="primary" size="md" loading={isAllocating} disabled={parsedData.length === 0 || isLoading || isAllocating}>
                <FaCheck />
                {isAllocating ? "Updating Allocations..." : "Confirm Allocations"}
              </Button>
            )}
          </>
        )}

        {activeTab === "manual" && (
          <>
            <Button onClick={handleClose} variant="secondary" size="md" disabled={isAllocating}>
              Cancel
            </Button>
            <Button onClick={handleManualAllocate} variant="primary" size="md" loading={isAllocating} disabled={manualReadyRows.length === 0 || isAllocating}>
              <FaCheck />
              {isAllocating ? "Updating Allocations..." : "Submit Manual Allocations"}
            </Button>
          </>
        )}
      </div>

      {showStudentDetail && selectedStudent && (
        <StudentDetailModal
          selectedStudent={selectedStudent}
          setShowStudentDetail={setShowStudentDetail}
          onUpdate={null}
          isImport={true}
        />
      )}
    </Modal>
  )
}

export default UpdateAllocationModal
