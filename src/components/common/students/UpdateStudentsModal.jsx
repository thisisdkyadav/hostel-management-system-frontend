import { useState, useRef } from "react"
import { FaFileUpload, FaCheck, FaTimes, FaFileDownload } from "react-icons/fa"
import StudentTableView from "./StudentTableView"
import Papa from "papaparse"
import Modal from "../../common/Modal"
import StudentDetailModal from "./StudentDetailModal"

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

  const availableFields = ["name", "email", "phone", "password", "profileImage", "gender", "dateOfBirth", "degree", "department", "year", "address", "admissionDate", "guardian", "guardianPhone", "guardianEmail"]
  const requiredFields = ["rollNumber"]

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
          if (results.data.length > 500) {
            setError("Free accounts are limited to 500 records. Please upgrade or reduce your data.")
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

  const handleUpdate = async () => {
    if (parsedData.length === 0) {
      setError("No data to update")
      return
    }

    setIsUpdating(true)

    try {
      const isSuccess = await onUpdate(parsedData)
      if (isSuccess) {
        onClose()
        resetForm()
      }
    } finally {
      setIsUpdating(false)
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
    <Modal title="Update Students in Bulk" onClose={onClose} width={900}>
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
                  <span className="font-medium">gender:</span> Male/Female/Other
                </li>
                <li>
                  <span className="font-medium">dateOfBirth:</span> YYYY-MM-DD
                </li>
                <li>
                  <span className="font-medium">degree:</span> String
                </li>
                <li>
                  <span className="font-medium">department:</span> String
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
            <h3 className="text-lg font-medium text-gray-800">Preview Updates</h3>
            <div className="mt-2 sm:mt-0 text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">{parsedData.length} students will be updated</div>
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
          <button onClick={handleUpdate} className="px-4 py-2.5 text-sm font-medium text-white bg-[#1360AB] rounded-lg hover:bg-[#0d4a8b] transition-colors shadow-sm flex items-center" disabled={parsedData.length === 0 || isLoading || isUpdating}>
            {isUpdating ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-t-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Updating Students...
              </>
            ) : (
              <>
                <FaCheck className="mr-2" /> Confirm Update
              </>
            )}
          </button>
        )}
      </div>
      {showStudentDetail && selectedStudent && <StudentDetailModal selectedStudent={selectedStudent} setShowStudentDetail={setShowStudentDetail} onUpdate={null} isImport={true} />}
    </Modal>
  )
}

export default UpdateStudentsModal
