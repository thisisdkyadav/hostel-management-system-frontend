import { useState, useRef, useEffect } from "react"
import { FaFileUpload, FaCheck, FaTimes, FaFileDownload } from "react-icons/fa"
import StudentTableView from "./StudentTableView"
import Papa from "papaparse"
import Modal from "../../common/Modal"
import StudentDetailModal from "./StudentDetailModal"
import { adminApi } from "../../../services/adminApi"

const ImportStudentModal = ({ isOpen, onClose, onImport }) => {
  const [csvFile, setCsvFile] = useState(null)
  const [parsedData, setParsedData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState(1)
  const fileInputRef = useRef(null)
  const [showStudentDetail, setShowStudentDetail] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [validDegrees, setValidDegrees] = useState([])
  const [validDepartments, setValidDepartments] = useState([])
  const [configLoading, setConfigLoading] = useState(false)

  const availableFields = ["name", "email", "phone", "password", "profileImage", "rollNumber", "gender", "dateOfBirth", "degree", "department", "year", "address", "admissionDate", "guardian", "guardianPhone", "guardianEmail"]
  const requiredFields = ["name", "email", "rollNumber"]

  // Fetch valid degrees and departments from the config API
  useEffect(() => {
    if (isOpen) {
      fetchConfigData()
    }
  }, [isOpen])

  const fetchConfigData = async () => {
    setConfigLoading(true)
    try {
      const [degreesResponse, departmentsResponse] = await Promise.all([adminApi.getDegrees(), adminApi.getDepartments()])

      setValidDegrees(degreesResponse.value || [])
      setValidDepartments(departmentsResponse.value || [])
    } catch (err) {
      console.error("Error fetching config data:", err)
      setError("Failed to load degree and department options. Some validations may not work properly.")
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
    const headers = availableFields
    const csvContent = headers.join(",")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "import_students_template.csv")
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

          const invalidRecords = []
          const parsedData = results.data.map((student, index) => {
            const studentData = {}

            availableFields.forEach((field) => {
              if (field === "admissionDate") {
                studentData[field] = student[field] || new Date().toISOString().split("T")[0]
              } else {
                studentData[field] = student[field] || ""
              }
            })

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

  const handleImport = async () => {
    if (parsedData.length === 0) {
      setError("No data to import")
      return
    }

    setIsImporting(true)

    try {
      const isSuccess = await onImport(parsedData)
      if (isSuccess) {
        onClose()
        resetForm()
      }
    } finally {
      setIsImporting(false)
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

  // Format array for display in the UI
  const formatArrayForDisplay = (arr) => {
    if (!arr || arr.length === 0) return "Loading..."

    if (arr.length <= 5) {
      return arr.join(", ")
    }

    return arr.slice(0, 5).join(", ") + `, ... (${arr.length - 5} more)`
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

          <div className="flex flex-col items-center">
            <button onClick={generateCsvTemplate} className="flex items-center text-sm text-blue-600 hover:text-blue-800 mb-2">
              <FaFileDownload className="mr-1" />
              Download CSV Template
            </button>

            <div className="text-xs text-gray-600 mt-2 bg-gray-50 p-3 rounded-lg max-w-md">
              <p className="font-medium mb-1">Field Input Types:</p>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
                <li>
                  <span className="font-medium">name:</span> String (Required)
                </li>
                <li>
                  <span className="font-medium">email:</span> Email (Required)
                </li>
                <li>
                  <span className="font-medium">rollNumber:</span> String (Required)
                </li>
                <li>
                  <span className="font-medium">phone:</span> Number
                </li>
                <li>
                  <span className="font-medium">password:</span> String
                </li>
                <li>
                  <span className="font-medium">gender:</span> Male/Female/Other
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
            <h3 className="text-lg font-medium text-gray-800">Preview Import Data</h3>
            <div className="mt-2 sm:mt-0 text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">{parsedData.length} students found in CSV</div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <StudentTableView currentStudents={parsedData} sortField="name" sortDirection="asc" handleSort={() => {}} viewStudentDetails={viewStudentDetails} />
          </div>

          {error && <div className="py-2 px-4 bg-red-50 text-red-600 rounded-lg border-l-4 border-red-500 whitespace-pre-line">{error}</div>}
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
          <button onClick={handleImport} className="px-4 py-2.5 text-sm font-medium text-white bg-[#1360AB] rounded-lg hover:bg-[#0d4a8b] transition-colors shadow-sm flex items-center" disabled={parsedData.length === 0 || isLoading || isImporting}>
            {isImporting ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-t-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Importing Students...
              </>
            ) : (
              <>
                <FaCheck className="mr-2" /> Confirm Import
              </>
            )}
          </button>
        )}
      </div>
      {showStudentDetail && selectedStudent && <StudentDetailModal selectedStudent={selectedStudent} setShowStudentDetail={setShowStudentDetail} onUpdate={null} isImport={true} />}
    </Modal>
  )
}

export default ImportStudentModal
