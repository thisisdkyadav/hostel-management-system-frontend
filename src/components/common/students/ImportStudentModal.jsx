import { useState, useRef, useEffect } from "react"
import { FaFileUpload, FaCheck, FaTimes } from "react-icons/fa"
import StudentTableView from "./StudentTableView"
import Papa from "papaparse"
import { useWarden } from "../../../contexts/WardenProvider"
import Modal from "../../common/Modal"
import StudentDetailModal from "./StudentDetailModal"

const ImportStudentModal = ({ isOpen, onClose, onImport }) => {
  const { profile } = useWarden()
  const hostelId = profile?.hostelId._id || null
  const hostelType = profile?.hostelId.type || null

  const [csvFile, setCsvFile] = useState(null)
  const [parsedData, setParsedData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState(1) // 1: Upload, 2: Preview
  const fileInputRef = useRef(null)
  const [showStudentDetail, setShowStudentDetail] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)

  // Define available fields
  const availableFields = ["name", "email", "phone", "password", "profilePic", "rollNumber", "gender", "dateOfBirth", "degree", "department", "year", "unit", "room", "bedNumber", "address", "admissionDate", "guardian", "guardianPhone"]

  // Base required fields without unit
  const baseRequiredFields = ["name", "email", "rollNumber", "room", "bedNumber"]

  // Dynamically determine required fields based on hostel type
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
          if (results.data.length > 500) {
            setError("Free accounts are limited to 500 records. Please upgrade or reduce your data.")
            setIsLoading(false)
            return
          }

          // Check if all required fields are present
          const headers = results.meta.fields
          const missingFields = requiredFields.filter((field) => !headers.includes(field))

          if (missingFields.length > 0) {
            setError(`Missing required fields: ${missingFields.join(", ")}`)
            setIsLoading(false)
            return
          }

          const parsedData = results.data.map((student, index) => {
            // Create initial student object with only allowed fields
            const studentData = {
              hostelId: hostelId,
            }

            // Add only available fields from CSV
            availableFields.forEach((field) => {
              if (field === "admissionDate") {
                studentData[field] = student[field] || new Date().toISOString().split("T")[0]
              } else {
                studentData[field] = student[field] || ""
              }
            })

            // Add displayRoom for the table view
            if (hostelType === "unit-based") {
              studentData.displayRoom = `${student.unit || ""}-${student.room || ""}`
            } else {
              studentData.displayRoom = student.room || ""
            }

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

  const handleImport = async () => {
    if (parsedData.length === 0) {
      setError("No data to import")
      return
    }

    // Validate data before import
    let hasError = false
    let errorMessage = ""

    // For unit-based hostels, check if unit is provided
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

    console.log("Importing data:", parsedData)

    const isSuccess = await onImport(parsedData)
    if (isSuccess) {
      onClose()
      resetForm()
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
    <Modal title="Import Students" onClose={onClose} width={900}>
      {step === 1 && (
        <div className="space-y-5">
          <div className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors" onDragOver={handleDragOver} onDrop={handleDrop} onClick={() => fileInputRef.current.click()}>
            <FaFileUpload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">Drag and drop a CSV file here, or click to select a file</p>
            <p className="mt-3 text-xs text-gray-500">
              <strong>Required fields:</strong> {requiredFields.join(", ")}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              <strong>Optional fields:</strong> {availableFields.filter((field) => !requiredFields.includes(field)).join(", ")}
            </p>
            <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleFileUpload} />
          </div>

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
            <h3 className="text-lg font-medium text-gray-800">Preview Import Data</h3>
            <div className="mt-2 sm:mt-0 text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">{parsedData.length} students found in CSV</div>
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
          <button onClick={handleImport} className="px-4 py-2.5 text-sm font-medium text-white bg-[#1360AB] rounded-lg hover:bg-[#0d4a8b] transition-colors shadow-sm flex items-center" disabled={parsedData.length === 0 || isLoading}>
            <FaCheck className="mr-2" /> Confirm Import
          </button>
        )}
      </div>
      {showStudentDetail && selectedStudent && <StudentDetailModal selectedStudent={selectedStudent} setShowStudentDetail={setShowStudentDetail} onUpdate={null} isImport={true} />}
    </Modal>
  )
}

export default ImportStudentModal
