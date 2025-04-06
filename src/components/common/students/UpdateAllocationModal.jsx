import { useState, useRef } from "react"
import { FaFileUpload, FaCheck, FaTimes, FaFileDownload } from "react-icons/fa"
import StudentTableView from "./StudentTableView"
import Papa from "papaparse"

import { useGlobal } from "../../../contexts/GlobalProvider"
import Modal from "../Modal"
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
        <div className="space-y-5">
          {/* Add hostel selection dropdown */}
          <div className="mb-4">
            <label htmlFor="hostel-select" className="block text-sm font-medium text-gray-700 mb-1">
              Select Hostel
            </label>
            <select id="hostel-select" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" value={selectedHostel?._id || ""} onChange={handleHostelChange}>
              <option value="">-- Select a hostel --</option>
              {hostelList.map((hostel) => (
                <option key={hostel._id} value={hostel._id}>
                  {hostel.name} ({hostel.type})
                </option>
              ))}
            </select>
          </div>

          {selectedHostel ? (
            <>
              <div className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors" onDragOver={handleDragOver} onDrop={handleDrop} onClick={() => fileInputRef.current.click()}>
                <FaFileUpload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">Drag and drop a CSV file here, or click to select a file</p>
                <p className="mt-3 text-xs text-gray-500">
                  <strong>Required fields:</strong> {requiredFields.join(", ")}
                </p>
                <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleFileUpload} />
              </div>

              <div className="flex flex-col items-center">
                <button onClick={generateCsvTemplate} className="flex items-center text-sm text-blue-600 hover:text-blue-800 mb-2">
                  <FaFileDownload className="mr-1" />
                  Download CSV Template
                </button>

                <div className="text-xs text-gray-600 mt-2 bg-gray-50 p-3 rounded-lg max-w-md">
                  <p className="font-medium mb-1">Field Input Types:</p>
                  <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <li>
                      <span className="font-medium">rollNumber:</span> String (Required)
                    </li>
                    <li>
                      <span className="font-medium">room:</span> String/Number (Required)
                    </li>
                    <li>
                      <span className="font-medium">bedNumber:</span> Number (Required)
                    </li>
                    {hostelType === "unit-based" && (
                      <li>
                        <span className="font-medium">unit:</span> String (Required)
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-gray-500">Please select a hostel to continue with room allocation</div>
          )}

          {csvFile && (
            <div className="py-2 px-4 bg-blue-50 rounded-lg flex items-center justify-between">
              <span className="text-sm text-blue-700">
                Selected file: <span className="font-medium">{csvFile.name}</span>
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setCsvFile(null)
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
          )}

          {error && <div className="py-2 px-4 bg-red-50 text-red-600 rounded-lg border-l-4 border-red-500">{error}</div>}

          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <div className="w-6 h-6 border-2 border-t-2 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
              <span className="ml-2 text-sm text-gray-600">Processing file...</span>
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">Preview Room Allocations - {selectedHostel?.name}</h3>
            <div className="mt-2 sm:mt-0 text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">{parsedData.length} room allocations found in CSV</div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <StudentTableView currentStudents={parsedData} sortField="name" sortDirection="asc" handleSort={() => {}} viewStudentDetails={viewStudentDetails} />
          </div>

          {error && <div className="py-2 px-4 bg-red-50 text-red-600 rounded-lg border-l-4 border-red-500">{error}</div>}
        </div>
      )}

      <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-100">
        {step === 1 ? (
          <button onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        ) : (
          <button onClick={resetForm} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Back
          </button>
        )}

        {step === 2 && (
          <button onClick={handleAllocate} className="px-4 py-2.5 text-sm font-medium text-white bg-[#1360AB] rounded-lg hover:bg-[#0d4a8b] transition-colors shadow-sm flex items-center" disabled={parsedData.length === 0 || isLoading || isAllocating}>
            {isAllocating ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-t-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Updating Allocations...
              </>
            ) : (
              <>
                <FaCheck className="mr-2" /> Confirm Allocations
              </>
            )}
          </button>
        )}
      </div>
      {showStudentDetail && selectedStudent && <StudentDetailModal selectedStudent={selectedStudent} setShowStudentDetail={setShowStudentDetail} onUpdate={null} isImport={true} />}
    </Modal>
  )
}

export default UpdateAllocationModal
