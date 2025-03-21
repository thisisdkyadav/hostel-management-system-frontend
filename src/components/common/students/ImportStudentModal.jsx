import { useState, useRef } from "react"
import { FaFileUpload, FaCheck, FaTimes } from "react-icons/fa"
import StudentTableView from "./StudentTableView"
import Papa from "papaparse"
import { useWarden } from "../../../contexts/WardenProvider"

const ImportStudentModal = ({ isOpen, onClose, onImport }) => {
  const { profile } = useWarden()

  const hostelId = profile?.hostelId._id || null

  const [csvFile, setCsvFile] = useState(null)
  const [parsedData, setParsedData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState(1) // 1: Upload, 2: Preview
  const fileInputRef = useRef(null)

  // Define available and required fields
  const availableFields = ["name", "email", "password", "rollNumber", "gender", "dateOfBirth", "degree", "department", "year", "unit", "room", "bed", "phone", "address", "admissionDate"]
  const requiredFields = ["name", "email", "rollNumber", "room", "unit"]

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
            studentData.displayRoom = `${student.unit || ""}-${student.room || ""}`

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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl max-h-[90vh] overflow-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Import Students</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer bg-gray-50 hover:bg-gray-100" onDragOver={handleDragOver} onDrop={handleDrop} onClick={() => fileInputRef.current.click()}>
                <FaFileUpload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">Drag and drop a CSV file here, or click to select a file</p>
                <p className="mt-1 text-xs text-gray-500">
                  <strong>Required fields:</strong> {requiredFields.join(", ")}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  <strong>Optional fields:</strong> {availableFields.filter((field) => !requiredFields.includes(field)).join(", ")}
                </p>
                <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleFileUpload} />
              </div>
              {csvFile && <p className="text-sm text-gray-600">Selected file: {csvFile.name}</p>}
              {error && <p className="text-sm text-red-500">{error}</p>}
              {isLoading && <p className="text-sm text-gray-600">Processing file...</p>}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Preview Import Data</h3>
                <div className="text-sm text-gray-600">{parsedData.length} students found in CSV</div>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <StudentTableView currentStudents={parsedData} sortField="name" sortDirection="asc" handleSort={() => {}} viewStudentDetails={() => {}} />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-3 pt-4 border-t">
            {step === 1 ? (
              <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                Cancel
              </button>
            ) : (
              <button onClick={resetForm} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                Back
              </button>
            )}

            {step === 2 && (
              <button onClick={handleImport} className="px-4 py-2 text-sm font-medium text-white bg-[#1360AB] rounded-md hover:bg-[#0d4a8b] focus:outline-none" disabled={parsedData.length === 0 || isLoading}>
                <FaCheck className="inline mr-2" /> Confirm Import
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImportStudentModal
