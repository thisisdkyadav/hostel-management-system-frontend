import { useState, useRef, useEffect } from "react"
import { FaFileUpload, FaCheck, FaTimes, FaFileDownload, FaUser, FaUpload } from "react-icons/fa"
import StudentTableView from "./StudentTableView"
import Papa from "papaparse"
import Modal from "../../common/Modal"
import Button from "../../common/Button"
import FileInput from "../../common/ui/FileInput"
import StudentDetailModal from "./StudentDetailModal"
import { adminApi } from "../../../services/adminApi"

// Extracted to avoid remounting on each parent render which caused input focus loss
const ManualStudentForm = ({ manualStudent, handleManualInputChange, validDegrees, validDepartments, configLoading, error }) => {
  const formStyles = {
    container: { display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' },
    title: { fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)' },
    infoBox: { backgroundColor: 'var(--color-primary-bg)', color: 'var(--color-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-4)', marginBottom: 'var(--spacing-6)', display: 'flex', alignItems: 'flex-start' },
    infoIcon: { flexShrink: 0, marginTop: 'var(--spacing-0-5)', marginRight: 'var(--spacing-3)', height: 'var(--icon-lg)', width: 'var(--icon-lg)' },
    infoText: { fontSize: 'var(--font-size-sm)' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-6)' },
    sectionHeader: { gridColumn: 'span 2' },
    sectionTitle: { fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-4)', borderBottom: 'var(--border-1) solid var(--color-border-primary)', paddingBottom: 'var(--spacing-2)' },
    label: { display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' },
    input: { width: '100%', borderRadius: 'var(--radius-md)', border: 'var(--border-1) solid var(--color-border-input)', padding: 'var(--spacing-2) var(--spacing-3)', fontSize: 'var(--font-size-sm)', backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-body)' },
    errorBox: { padding: 'var(--spacing-2) var(--spacing-4)', backgroundColor: 'var(--color-danger-bg-light)', color: 'var(--color-danger)', borderRadius: 'var(--radius-lg)', borderLeft: 'var(--border-4) solid var(--color-danger)', whiteSpace: 'pre-line' },
    loadingContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-4) 0' },
    spinner: { width: 'var(--spacing-6)', height: 'var(--spacing-6)', border: 'var(--border-2) solid var(--color-bg-muted)', borderTopColor: 'var(--color-primary)', borderRadius: 'var(--radius-full)', animation: 'spin 1s linear infinite' },
    loadingText: { marginLeft: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' },
  }
  return (
    <div style={formStyles.container}>
      <h3 style={formStyles.title}>Add Single Student</h3>

      <div style={formStyles.infoBox}>
        <div style={formStyles.infoIcon}>
          <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '100%', width: '100%' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p style={formStyles.infoText}>Fill in the student details below. Fields marked with * are required.</p>
      </div>

      <div style={formStyles.grid}>
        {/* Required Fields */}
        <div style={formStyles.sectionHeader}>
          <h4 style={formStyles.sectionTitle}>Required Information</h4>
        </div>

        <div>
          <label style={formStyles.label}>Name *</label>
          <input type="text" value={manualStudent.name} onChange={(e) => handleManualInputChange("name", e.target.value)}
            style={formStyles.input}
            placeholder="Enter student's full name"
            required
          />
        </div>

        <div>
          <label style={formStyles.label}>Email *</label>
          <input type="email" value={manualStudent.email} onChange={(e) => handleManualInputChange("email", e.target.value)}
            style={formStyles.input}
            placeholder="Enter email address"
            required
          />
        </div>

        <div>
          <label style={formStyles.label}>Roll Number *</label>
          <input type="text" value={manualStudent.rollNumber} onChange={(e) => handleManualInputChange("rollNumber", e.target.value)}
            style={formStyles.input}
            placeholder="Enter roll number"
            required
          />
        </div>

        <div>
          <label style={formStyles.label}>Phone</label>
          <input type="tel" value={manualStudent.phone} onChange={(e) => handleManualInputChange("phone", e.target.value)}
            style={formStyles.input}
            placeholder="Enter phone number"
          />
        </div>

        {/* Optional Fields */}
        <div style={{ ...formStyles.sectionHeader, marginTop: 'var(--spacing-6)' }}>
          <h4 style={formStyles.sectionTitle}>Optional Information</h4>
        </div>

        <div>
          <label style={formStyles.label}>Password</label>
          <input type="password" value={manualStudent.password} onChange={(e) => handleManualInputChange("password", e.target.value)}
            style={formStyles.input}
            placeholder="Enter password"
          />
        </div>

        <div>
          <label style={formStyles.label}>Gender</label>
          <select value={manualStudent.gender} onChange={(e) => handleManualInputChange("gender", e.target.value)} style={formStyles.input}>
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div>
          <label style={formStyles.label}>Date of Birth</label>
          <input type="date" value={manualStudent.dateOfBirth} onChange={(e) => handleManualInputChange("dateOfBirth", e.target.value)} style={formStyles.input} />
        </div>

        <div>
          <label style={formStyles.label}>Degree</label>
          {validDegrees.length > 0 ? (
            <select value={manualStudent.degree} onChange={(e) => handleManualInputChange("degree", e.target.value)} style={formStyles.input}>
              <option value="">Select degree</option>
              {validDegrees.map((degree) => (
                <option key={degree} value={degree}>
                  {degree}
                </option>
              ))}
            </select>
          ) : (
            <input type="text" value={manualStudent.degree} onChange={(e) => handleManualInputChange("degree", e.target.value)}
              style={formStyles.input}
              placeholder="Enter degree"
            />
          )}
        </div>

        <div>
          <label style={formStyles.label}>Department</label>
          {validDepartments.length > 0 ? (
            <select value={manualStudent.department} onChange={(e) => handleManualInputChange("department", e.target.value)} style={formStyles.input}>
              <option value="">Select department</option>
              {validDepartments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          ) : (
            <input type="text" value={manualStudent.department} onChange={(e) => handleManualInputChange("department", e.target.value)}
              style={formStyles.input}
              placeholder="Enter department"
            />
          )}
        </div>

        <div>
          <label style={formStyles.label}>Year</label>
          <input type="number" value={manualStudent.year} onChange={(e) => handleManualInputChange("year", e.target.value)}
            style={formStyles.input}
            placeholder="Enter year"
            min="1"
            max="10"
          />
        </div>

        <div>
          <label style={formStyles.label}>Admission Date</label>
          <input type="date" value={manualStudent.admissionDate} onChange={(e) => handleManualInputChange("admissionDate", e.target.value)} style={formStyles.input} />
        </div>

        <div style={{ gridColumn: 'span 2' }}>
          <label style={formStyles.label}>Address</label>
          <textarea value={manualStudent.address} onChange={(e) => handleManualInputChange("address", e.target.value)}
            rows={3}
            style={formStyles.input}
            placeholder="Enter address"
          />
        </div>

        {/* Guardian Information */}
        <div style={{ ...formStyles.sectionHeader, marginTop: 'var(--spacing-6)' }}>
          <h4 style={formStyles.sectionTitle}>Guardian Information</h4>
        </div>

        <div>
          <label style={formStyles.label}>Guardian Name</label>
          <input type="text" value={manualStudent.guardian} onChange={(e) => handleManualInputChange("guardian", e.target.value)}
            style={formStyles.input}
            placeholder="Enter guardian's name"
          />
        </div>

        <div>
          <label style={formStyles.label}>Guardian Phone</label>
          <input type="tel" value={manualStudent.guardianPhone} onChange={(e) => handleManualInputChange("guardianPhone", e.target.value)}
            style={formStyles.input}
            placeholder="Enter guardian's phone"
          />
        </div>

        <div style={{ gridColumn: 'span 2' }}>
          <label style={formStyles.label}>Guardian Email</label>
          <input type="email" value={manualStudent.guardianEmail} onChange={(e) => handleManualInputChange("guardianEmail", e.target.value)}
            style={formStyles.input}
            placeholder="Enter guardian's email"
          />
        </div>
      </div>

      {error && <div style={formStyles.errorBox}>{error}</div>}

      {configLoading && (
        <div style={formStyles.loadingContainer}>
          <div style={formStyles.spinner}></div>
          <span style={formStyles.loadingText}>Loading configuration...</span>
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
          const validGenders = ["Male", "Female"]
          const parsedData = results.data.map((student, index) => {
            const studentData = {}

            availableFields.forEach((field) => {
              if (field === "admissionDate") {
                studentData[field] = student[field] || new Date().toISOString().split("T")[0]
              } else {
                studentData[field] = student[field] || ""
              }
            })

            // Validate gender if provided
            if (studentData.gender && !validGenders.includes(studentData.gender)) {
              invalidRecords.push({
                row: index + 2,
                field: "gender",
                value: studentData.gender,
                message: `Invalid gender: "${studentData.gender}". Only "Male" or "Female" are allowed.`,
              })
            }

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
    const validGenders = ["Male", "Female"]

    // Check required fields
    if (!manualStudent.name.trim()) errors.push("Name is required")
    if (!manualStudent.email.trim()) errors.push("Email is required")
    if (!manualStudent.rollNumber.trim()) errors.push("Roll Number is required")

    // Validate email format
    if (manualStudent.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(manualStudent.email)) {
      errors.push("Please enter a valid email address")
    }

    // Validate gender if provided
    if (manualStudent.gender && !validGenders.includes(manualStudent.gender)) {
      errors.push(`Invalid gender: "${manualStudent.gender}". Only "Male" or "Female" are allowed.`)
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-5)' }}>
              <div style={{ border: 'var(--border-2) dashed var(--color-border-input)', borderRadius: 'var(--radius-xl)', padding: 'var(--spacing-8)', textAlign: 'center', cursor: 'pointer', backgroundColor: 'var(--color-bg-tertiary)', transition: 'var(--transition-all)' }} onDragOver={handleDragOver} onDrop={handleDrop} onClick={() => fileInputRef.current.click()}>
                <FaFileUpload style={{ margin: '0 auto', height: 'var(--icon-4xl)', width: 'var(--icon-4xl)', color: 'var(--color-text-disabled)' }} />
                <p style={{ marginTop: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Drag and drop a CSV file here, or click to select a file</p>
                <p style={{ marginTop: 'var(--spacing-3)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                  <strong>Required fields:</strong> {requiredFields.join(", ")}
                </p>
                <p style={{ marginTop: 'var(--spacing-1)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                  <strong>Optional fields:</strong> {availableFields.filter((field) => !requiredFields.includes(field)).join(", ")}
                </p>
                <FileInput ref={fileInputRef} accept=".csv" onChange={handleFileUpload} hidden />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Button onClick={generateCsvTemplate} variant="ghost" size="small" icon={<FaFileDownload />}>
                  Download CSV Template
                </Button>

                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-2)', backgroundColor: 'var(--color-bg-tertiary)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-lg)', maxWidth: '28rem' }}>
                  <p style={{ fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-1)' }}>Field Input Types:</p>
                  <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', columnGap: 'var(--spacing-4)', rowGap: 'var(--spacing-1)' }}>
                    <li><span style={{ fontWeight: 'var(--font-weight-medium)' }}>name:</span> String (Required)</li>
                    <li><span style={{ fontWeight: 'var(--font-weight-medium)' }}>email:</span> Email (Required)</li>
                    <li><span style={{ fontWeight: 'var(--font-weight-medium)' }}>rollNumber:</span> String (Required)</li>
                    <li><span style={{ fontWeight: 'var(--font-weight-medium)' }}>phone:</span> Number</li>
                    <li><span style={{ fontWeight: 'var(--font-weight-medium)' }}>password:</span> String</li>
                    <li><span style={{ fontWeight: 'var(--font-weight-medium)' }}>gender:</span> Male/Female</li>
                    <li><span style={{ fontWeight: 'var(--font-weight-medium)' }}>dateOfBirth:</span> YYYY-MM-DD</li>
                    <li><span style={{ fontWeight: 'var(--font-weight-medium)' }}>degree:</span> {configLoading ? "Loading..." : validDegrees.length > 0 ? "Must be one of the valid degrees" : "String"}</li>
                    <li><span style={{ fontWeight: 'var(--font-weight-medium)' }}>department:</span> {configLoading ? "Loading..." : validDepartments.length > 0 ? "Must be one of the valid departments" : "String"}</li>
                    <li><span style={{ fontWeight: 'var(--font-weight-medium)' }}>year:</span> Number</li>
                    <li><span style={{ fontWeight: 'var(--font-weight-medium)' }}>address:</span> String</li>
                    <li><span style={{ fontWeight: 'var(--font-weight-medium)' }}>admissionDate:</span> YYYY-MM-DD</li>
                    <li><span style={{ fontWeight: 'var(--font-weight-medium)' }}>guardian:</span> String</li>
                    <li><span style={{ fontWeight: 'var(--font-weight-medium)' }}>guardianPhone:</span> Number</li>
                    <li><span style={{ fontWeight: 'var(--font-weight-medium)' }}>guardianEmail:</span> Email</li>
                  </ul>

                  {/* Display valid degrees and departments */}
                  {!configLoading && (
                    <div style={{ marginTop: 'var(--spacing-3)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                      {validDegrees.length > 0 && (
                        <div>
                          <p style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-primary)' }}>Valid Degrees:</p>
                          <p style={{ color: 'var(--color-text-body)', backgroundColor: 'var(--color-primary-bg)', padding: 'var(--spacing-1)', borderRadius: 'var(--radius-md)' }}>{formatArrayForDisplay(validDegrees)}</p>
                        </div>
                      )}

                      {validDepartments.length > 0 && (
                        <div>
                          <p style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-primary)' }}>Valid Departments:</p>
                          <p style={{ color: 'var(--color-text-body)', backgroundColor: 'var(--color-primary-bg)', padding: 'var(--spacing-1)', borderRadius: 'var(--radius-md)' }}>{formatArrayForDisplay(validDepartments)}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {csvFile && (
                <div style={{ padding: 'var(--spacing-2) var(--spacing-4)', backgroundColor: 'var(--color-primary-bg)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)' }}>
                    Selected file: <span style={{ fontWeight: 'var(--font-weight-medium)' }}>{csvFile.name}</span>
                  </span>
                  <Button onClick={(e) => {
                    e.stopPropagation()
                    setCsvFile(null)
                  }} variant="ghost" size="small" icon={<FaTimes />} title="Remove file" />
                </div>
              )}

              {error && <div style={{ padding: 'var(--spacing-2) var(--spacing-4)', backgroundColor: 'var(--color-danger-bg-light)', color: 'var(--color-danger)', borderRadius: 'var(--radius-lg)', borderLeft: 'var(--border-4) solid var(--color-danger)', whiteSpace: 'pre-line' }}>{error}</div>}

              {(isLoading || configLoading) && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-4) 0' }}>
                  <div style={{ width: 'var(--spacing-6)', height: 'var(--spacing-6)', border: 'var(--border-2) solid var(--color-bg-muted)', borderTopColor: 'var(--color-primary)', borderRadius: 'var(--radius-full)', animation: 'spin 1s linear infinite' }}></div>
                  <span style={{ marginLeft: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{isLoading ? "Processing file..." : "Loading configuration..."}</span>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)' }}>Preview Import Data</h3>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-primary-bg)', padding: 'var(--spacing-1) var(--spacing-3)', borderRadius: 'var(--radius-full)' }}>{parsedData.length} students found in CSV</div>
              </div>

              <div style={{ border: 'var(--border-1) solid var(--color-border-primary)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                <StudentTableView currentStudents={parsedData} sortField="name" sortDirection="asc" handleSort={() => { }} viewStudentDetails={viewStudentDetails} />
              </div>

              {error && <div style={{ padding: 'var(--spacing-2) var(--spacing-4)', backgroundColor: 'var(--color-danger-bg-light)', color: 'var(--color-danger)', borderRadius: 'var(--radius-lg)', borderLeft: 'var(--border-4) solid var(--color-danger)', whiteSpace: 'pre-line' }}>{error}</div>}
            </div>
          )}
        </>
      )}

      {/* Manual Student Tab */}
      {activeTab === "manual" && <ManualStudentForm manualStudent={manualStudent} handleManualInputChange={handleManualInputChange} validDegrees={validDegrees} validDepartments={validDepartments} configLoading={configLoading} error={error} />}

      <div style={{ marginTop: 'var(--spacing-6)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-3)', paddingTop: 'var(--spacing-4)', borderTop: 'var(--border-1) solid var(--color-border-light)' }}>
        {/* CSV Tab Buttons */}
        {activeTab === "csv" && (
          <>
            {step === 1 ? (
              <Button onClick={onClose} variant="secondary" size="medium">
                Cancel
              </Button>
            ) : (
              <Button onClick={resetForm} variant="secondary" size="medium">
                Back
              </Button>
            )}

            {step === 2 && (
              <Button onClick={handleImport} variant="primary" size="medium" icon={!isImporting ? <FaCheck /> : null} isLoading={isImporting} disabled={parsedData.length === 0 || isLoading || isImporting}>
                {isImporting ? "Importing Students..." : "Confirm Import"}
              </Button>
            )}
          </>
        )}

        {/* Manual Tab Buttons */}
        {activeTab === "manual" && (
          <>
            <Button onClick={onClose} variant="secondary" size="medium">
              Cancel
            </Button>

            <Button onClick={handleManualImport} variant="primary" size="medium" icon={!isImporting ? <FaCheck /> : null} isLoading={isImporting} disabled={!manualStudent.name || !manualStudent.email || !manualStudent.rollNumber || isImporting || configLoading}>
              {isImporting ? "Adding Student..." : "Add Student"}
            </Button>
          </>
        )}
      </div>
      {showStudentDetail && selectedStudent && <StudentDetailModal selectedStudent={selectedStudent} setShowStudentDetail={setShowStudentDetail} onUpdate={null} isImport={true} />}
    </Modal>
  )
}

export default ImportStudentModal
