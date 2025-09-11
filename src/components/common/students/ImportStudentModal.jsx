import { useState, useRef, useEffect } from "react"
import { FaFileUpload, FaCheck, FaTimes, FaFileDownload, FaUser, FaUpload } from "react-icons/fa"
import StudentTableView from "./StudentTableView"
import Papa from "papaparse"
import Modal from "../../common/Modal"
import StudentDetailModal from "./StudentDetailModal"
import { adminApi } from "../../../services/adminApi"

// Extracted to avoid remounting on each parent render which caused input focus loss
const ManualStudentForm = ({ manualStudent, handleManualInputChange, validDegrees, validDepartments, configLoading, error }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-800">Add Single Student</h3>

      <div className="bg-blue-50 text-blue-700 rounded-lg p-4 mb-6 flex items-start">
        <div className="flex-shrink-0 mt-0.5 mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm">Fill in the student details below. Fields marked with * are required.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Required Fields */}
        <div className="md:col-span-2">
          <h4 className="text-md font-medium text-gray-700 mb-4 border-b border-gray-200 pb-2">Required Information</h4>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input
            type="text"
            value={manualStudent.name}
            onChange={(e) => handleManualInputChange("name", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1360AB] focus:border-[#1360AB]"
            placeholder="Enter student's full name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input
            type="email"
            value={manualStudent.email}
            onChange={(e) => handleManualInputChange("email", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1360AB] focus:border-[#1360AB]"
            placeholder="Enter email address"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number *</label>
          <input
            type="text"
            value={manualStudent.rollNumber}
            onChange={(e) => handleManualInputChange("rollNumber", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1360AB] focus:border-[#1360AB]"
            placeholder="Enter roll number"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            value={manualStudent.phone}
            onChange={(e) => handleManualInputChange("phone", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1360AB] focus:border-[#1360AB]"
            placeholder="Enter phone number"
          />
        </div>

        {/* Optional Fields */}
        <div className="md:col-span-2 mt-6">
          <h4 className="text-md font-medium text-gray-700 mb-4 border-b border-gray-200 pb-2">Optional Information</h4>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            value={manualStudent.password}
            onChange={(e) => handleManualInputChange("password", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1360AB] focus:border-[#1360AB]"
            placeholder="Enter password"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <select value={manualStudent.gender} onChange={(e) => handleManualInputChange("gender", e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1360AB] focus:border-[#1360AB]">
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
          <input type="date" value={manualStudent.dateOfBirth} onChange={(e) => handleManualInputChange("dateOfBirth", e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1360AB] focus:border-[#1360AB]" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
          {validDegrees.length > 0 ? (
            <select value={manualStudent.degree} onChange={(e) => handleManualInputChange("degree", e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1360AB] focus:border-[#1360AB]">
              <option value="">Select degree</option>
              {validDegrees.map((degree) => (
                <option key={degree} value={degree}>
                  {degree}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={manualStudent.degree}
              onChange={(e) => handleManualInputChange("degree", e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1360AB] focus:border-[#1360AB]"
              placeholder="Enter degree"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
          {validDepartments.length > 0 ? (
            <select value={manualStudent.department} onChange={(e) => handleManualInputChange("department", e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1360AB] focus:border-[#1360AB]">
              <option value="">Select department</option>
              {validDepartments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={manualStudent.department}
              onChange={(e) => handleManualInputChange("department", e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1360AB] focus:border-[#1360AB]"
              placeholder="Enter department"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
          <input
            type="number"
            value={manualStudent.year}
            onChange={(e) => handleManualInputChange("year", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1360AB] focus:border-[#1360AB]"
            placeholder="Enter year"
            min="1"
            max="10"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Admission Date</label>
          <input type="date" value={manualStudent.admissionDate} onChange={(e) => handleManualInputChange("admissionDate", e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1360AB] focus:border-[#1360AB]" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <textarea
            value={manualStudent.address}
            onChange={(e) => handleManualInputChange("address", e.target.value)}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1360AB] focus:border-[#1360AB]"
            placeholder="Enter address"
          />
        </div>

        {/* Guardian Information */}
        <div className="md:col-span-2 mt-6">
          <h4 className="text-md font-medium text-gray-700 mb-4 border-b border-gray-200 pb-2">Guardian Information</h4>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Name</label>
          <input
            type="text"
            value={manualStudent.guardian}
            onChange={(e) => handleManualInputChange("guardian", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1360AB] focus:border-[#1360AB]"
            placeholder="Enter guardian's name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Phone</label>
          <input
            type="tel"
            value={manualStudent.guardianPhone}
            onChange={(e) => handleManualInputChange("guardianPhone", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1360AB] focus:border-[#1360AB]"
            placeholder="Enter guardian's phone"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Email</label>
          <input
            type="email"
            value={manualStudent.guardianEmail}
            onChange={(e) => handleManualInputChange("guardianEmail", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1360AB] focus:border-[#1360AB]"
            placeholder="Enter guardian's email"
          />
        </div>
      </div>

      {error && <div className="py-2 px-4 bg-red-50 text-red-600 rounded-lg border-l-4 border-red-500 whitespace-pre-line">{error}</div>}

      {configLoading && (
        <div className="flex items-center justify-center py-4">
          <div className="w-6 h-6 border-2 border-t-2 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="ml-2 text-sm text-gray-600">Loading configuration...</span>
        </div>
      )}
    </div>
  )
}

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
  const [activeTab, setActiveTab] = useState("csv")
  const [manualStudent, setManualStudent] = useState({
    name: "",
    email: "",
    rollNumber: "",
    phone: "",
    password: "",
    gender: "",
    dateOfBirth: "",
    degree: "",
    department: "",
    year: "",
    address: "",
    admissionDate: new Date().toISOString().split("T")[0],
    guardian: "",
    guardianPhone: "",
    guardianEmail: "",
  })

  const availableFields = ["name", "email", "phone", "password", "profileImage", "rollNumber", "gender", "dateOfBirth", "degree", "department", "year", "address", "admissionDate", "guardian", "guardianPhone", "guardianEmail"]
  const requiredFields = ["name", "email", "rollNumber"]

  // Fetch valid degrees and departments from the config API
  useEffect(() => {
    if (isOpen) {
      fetchConfigData()
    }
  }, [isOpen])

  // Clear errors when switching tabs
  useEffect(() => {
    setError("")
  }, [activeTab])

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
    setManualStudent({
      name: "",
      email: "",
      rollNumber: "",
      phone: "",
      password: "",
      gender: "",
      dateOfBirth: "",
      degree: "",
      department: "",
      year: "",
      address: "",
      admissionDate: new Date().toISOString().split("T")[0],
      guardian: "",
      guardianPhone: "",
      guardianEmail: "",
    })
  }

  const handleManualInputChange = (field, value) => {
    setManualStudent((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const validateManualStudent = () => {
    const errors = []

    // Check required fields
    if (!manualStudent.name.trim()) errors.push("Name is required")
    if (!manualStudent.email.trim()) errors.push("Email is required")
    if (!manualStudent.rollNumber.trim()) errors.push("Roll Number is required")

    // Validate email format
    if (manualStudent.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(manualStudent.email)) {
      errors.push("Please enter a valid email address")
    }

    // Validate degree and department
    if (manualStudent.degree && validDegrees.length > 0 && !validDegrees.includes(manualStudent.degree)) {
      errors.push(`Invalid degree: "${manualStudent.degree}"`)
    }

    if (manualStudent.department && validDepartments.length > 0 && !validDepartments.includes(manualStudent.department)) {
      errors.push(`Invalid department: "${manualStudent.department}"`)
    }

    return errors
  }

  const handleManualImport = async () => {
    const validationErrors = validateManualStudent()

    if (validationErrors.length > 0) {
      setError(validationErrors.join("\n"))
      return
    }

    setIsImporting(true)
    setError("")

    try {
      // Create student data in the same format as CSV import
      const studentData = { ...manualStudent }

      // Remove empty fields
      Object.keys(studentData).forEach((key) => {
        if (!studentData[key]) {
          delete studentData[key]
        }
      })

      const isSuccess = await onImport([studentData])
      if (isSuccess) {
        onClose()
        resetForm()
      }
    } catch (error) {
      setError(error.message || "An error occurred while importing the student")
    } finally {
      setIsImporting(false)
    }
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

  // Define tabs
  const tabs = [
    { id: "csv", name: "CSV Import", icon: <FaUpload /> },
    { id: "manual", name: "Single Student", icon: <FaUser /> },
  ]

  if (!isOpen) return null

  return (
    <Modal title="Import Students" onClose={onClose} width={900} tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
      {/* CSV Import Tab */}
      {activeTab === "csv" && (
        <>
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
        </>
      )}

      {/* Manual Student Tab */}
      {activeTab === "manual" && <ManualStudentForm manualStudent={manualStudent} handleManualInputChange={handleManualInputChange} validDegrees={validDegrees} validDepartments={validDepartments} configLoading={configLoading} error={error} />}

      <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-100">
        {/* CSV Tab Buttons */}
        {activeTab === "csv" && (
          <>
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
          </>
        )}

        {/* Manual Tab Buttons */}
        {activeTab === "manual" && (
          <>
            <button onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>

            <button
              onClick={handleManualImport}
              className="px-4 py-2.5 text-sm font-medium text-white bg-[#1360AB] rounded-lg hover:bg-[#0d4a8b] transition-colors shadow-sm flex items-center"
              disabled={!manualStudent.name || !manualStudent.email || !manualStudent.rollNumber || isImporting || configLoading}
            >
              {isImporting ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-t-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding Student...
                </>
              ) : (
                <>
                  <FaCheck className="mr-2" /> Add Student
                </>
              )}
            </button>
          </>
        )}
      </div>
      {showStudentDetail && selectedStudent && <StudentDetailModal selectedStudent={selectedStudent} setShowStudentDetail={setShowStudentDetail} onUpdate={null} isImport={true} />}
    </Modal>
  )
}

export default ImportStudentModal
