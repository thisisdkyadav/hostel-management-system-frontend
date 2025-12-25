import { useState, useRef } from "react"
import { FaFileUpload, FaCheck, FaTimes, FaFileDownload } from "react-icons/fa"
import Papa from "papaparse"
import Modal from "../../common/Modal"
import Button from "../../common/Button"

const BulkStudentInsuranceModal = ({ isOpen, onClose, onUpdate, providerId, providerName }) => {
  const [csvFile, setCsvFile] = useState(null)
  const [parsedData, setParsedData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState(1)
  const fileInputRef = useRef(null)

  const requiredFields = ["rollNumber", "insuranceNumber"]

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
    const headers = ["rollNumber", "insuranceNumber"]
    const csvContent = headers.join(",")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "student_insurance_template.csv")
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
          if (results.data.length > 10000) {
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

          const parsedData = results.data.map((student) => ({
            rollNumber: student.rollNumber,
            insuranceNumber: student.insuranceNumber,
          }))

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
      const payload = {
        insuranceProviderId: providerId,
        studentsData: parsedData,
      }

      const isSuccess = await onUpdate(payload)
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

  if (!isOpen) return null

  return (
    <Modal title={`Update Student Insurance - ${providerName}`} onClose={onClose} width={700}>
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-5)' }}>
          <div style={{ border: 'var(--border-2) dashed var(--color-border-input)', borderRadius: 'var(--radius-xl)', padding: 'var(--spacing-8)', textAlign: 'center', cursor: 'pointer', backgroundColor: 'var(--color-bg-hover)', transition: 'var(--transition-colors)' }} onDragOver={handleDragOver} onDrop={handleDrop} onClick={() => fileInputRef.current.click()} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-muted)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'}>
            <FaFileUpload style={{ margin: '0 auto', height: 'var(--icon-3xl)', width: 'var(--icon-3xl)', color: 'var(--color-text-muted)' }} />
            <p style={{ marginTop: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Drag and drop a CSV file here, or click to select a file</p>
            <p style={{ marginTop: 'var(--spacing-3)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              <strong>Required fields:</strong> rollNumber, insuranceNumber
            </p>
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".csv" onChange={handleFileUpload} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Button onClick={generateCsvTemplate} variant="ghost" size="small" icon={<FaFileDownload />}>
              Download CSV Template
            </Button>

            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-2)', backgroundColor: 'var(--color-bg-hover)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-lg)', maxWidth: '28rem' }}>
              <p style={{ fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-1)' }}>Field Input Types:</p>
              <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-1) var(--spacing-4)' }}>
                <li>
                  <span style={{ fontWeight: 'var(--font-weight-medium)' }}>rollNumber:</span> String (Required)
                </li>
                <li>
                  <span style={{ fontWeight: 'var(--font-weight-medium)' }}>insuranceNumber:</span> String (Required)
                </li>
              </ul>
            </div>
          </div>
          {csvFile && (
            <div style={{ padding: 'var(--spacing-2) var(--spacing-4)', backgroundColor: 'var(--color-primary-bg)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary-dark)' }}>
                Selected file: <span style={{ fontWeight: 'var(--font-weight-medium)' }}>{csvFile.name}</span>
              </span>
              <Button onClick={(e) => {
                e.stopPropagation()
                setCsvFile(null)
              }}
                variant="ghost"
                size="small"
                icon={<FaTimes />}
                aria-label="Remove file"
              />
            </div>
          )}
          {error && <div style={{ padding: 'var(--spacing-2) var(--spacing-4)', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: 'var(--radius-lg)', borderLeft: 'var(--border-4) solid var(--color-danger)' }}>{error}</div>}
          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-4) 0' }}>
              <div style={{ width: 'var(--icon-xl)', height: 'var(--icon-xl)', border: 'var(--border-2) solid var(--color-border-input)', borderTopColor: 'var(--color-primary)', borderRadius: 'var(--radius-full)', animation: 'spin 1s linear infinite' }}></div>
              <span style={{ marginLeft: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Processing file...</span>
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-5)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-4)' }} className="sm:flex-row sm:items-center">
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)' }}>Preview Updates</h3>
            <div style={{ marginTop: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-primary-bg)', padding: 'var(--spacing-1) var(--spacing-3)', borderRadius: 'var(--radius-full)' }} className="sm:mt-0">{parsedData.length} students will be updated</div>
          </div>

          <div style={{ border: 'var(--border-1) solid var(--color-border-light)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', maxHeight: '24rem', overflowY: 'auto' }}>
            <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: 'var(--color-bg-hover)', position: 'sticky', top: 0 }}>
                <tr>
                  <th scope="col" style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Roll Number
                  </th>
                  <th scope="col" style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Insurance Number
                  </th>
                </tr>
              </thead>
              <tbody>
                {parsedData.map((student, index) => (
                  <tr key={index} style={{ backgroundColor: index % 2 === 0 ? 'var(--color-bg-primary)' : 'var(--color-bg-hover)', borderBottom: 'var(--border-1) solid var(--color-border-light)' }}>
                    <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{student.rollNumber}</td>
                    <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{student.insuranceNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {error && <div style={{ padding: 'var(--spacing-2) var(--spacing-4)', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: 'var(--radius-lg)', borderLeft: 'var(--border-4) solid var(--color-danger)' }}>{error}</div>}
        </div>
      )}

      <div style={{ marginTop: 'var(--spacing-6)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-3)', paddingTop: 'var(--spacing-4)', borderTop: 'var(--border-1) solid var(--color-border-light)' }}>
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
          <Button onClick={handleUpdate} variant="primary" size="medium" icon={<FaCheck />} isLoading={isUpdating} disabled={parsedData.length === 0 || isLoading || isUpdating}>
            {isUpdating ? "Updating Insurance..." : "Confirm Update"}
          </Button>
        )}
      </div>
    </Modal>
  )
}

export default BulkStudentInsuranceModal
