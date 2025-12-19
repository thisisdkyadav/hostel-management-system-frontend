import { useState, useRef } from "react"
import { FaFileUpload, FaCheck, FaTimes, FaFileDownload } from "react-icons/fa"
import Papa from "papaparse"
import Modal from "../../common/Modal"

const styles = {
  spaceY5: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-5)',
  },
  dropzone: {
    border: 'var(--border-2) dashed var(--color-border-primary)',
    borderRadius: 'var(--radius-xl)',
    padding: 'var(--spacing-8)',
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: 'var(--color-bg-tertiary)',
    transition: 'var(--transition-colors)',
  },
  dropzoneHover: {
    backgroundColor: 'var(--color-bg-hover)',
  },
  uploadIcon: {
    margin: '0 auto',
    height: 'var(--icon-4xl)',
    width: 'var(--icon-4xl)',
    color: 'var(--color-text-disabled)',
  },
  dropzoneText: {
    marginTop: 'var(--spacing-2)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-muted)',
  },
  dropzoneHint: {
    marginTop: 'var(--spacing-3)',
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-light)',
  },
  hiddenInput: {
    display: 'none',
  },
  centerColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  downloadButton: {
    display: 'flex',
    alignItems: 'center',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-info)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    marginBottom: 'var(--spacing-2)',
    transition: 'var(--transition-colors)',
    padding: 'var(--spacing-1)',
  },
  downloadButtonHover: {
    color: 'var(--color-info-hover)',
  },
  downloadIcon: {
    marginRight: 'var(--spacing-1)',
  },
  infoBox: {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-muted)',
    marginTop: 'var(--spacing-2)',
    backgroundColor: 'var(--color-bg-tertiary)',
    padding: 'var(--spacing-3)',
    borderRadius: 'var(--radius-lg)',
    maxWidth: '28rem',
  },
  infoTitle: {
    fontWeight: 'var(--font-weight-medium)',
    marginBottom: 'var(--spacing-1)',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    columnGap: 'var(--spacing-4)',
    rowGap: 'var(--spacing-1)',
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  fieldLabel: {
    fontWeight: 'var(--font-weight-medium)',
  },
  infoNote: {
    marginTop: 'var(--spacing-2)',
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-light)',
  },
  fileSelected: {
    padding: 'var(--spacing-2) var(--spacing-4)',
    backgroundColor: 'var(--color-info-bg)',
    borderRadius: 'var(--radius-lg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fileSelectedText: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-info-text)',
  },
  fileName: {
    fontWeight: 'var(--font-weight-medium)',
  },
  removeFileButton: {
    color: 'var(--color-text-light)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 'var(--spacing-1)',
    transition: 'var(--transition-colors)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeFileButtonHover: {
    color: 'var(--color-text-body)',
  },
  errorBox: {
    padding: 'var(--spacing-2) var(--spacing-4)',
    backgroundColor: 'var(--color-danger-bg)',
    color: 'var(--color-danger)',
    borderRadius: 'var(--radius-lg)',
    borderLeft: '4px solid var(--color-danger)',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--spacing-4) 0',
  },
  spinner: {
    width: 'var(--spacing-6)',
    height: 'var(--spacing-6)',
    border: 'var(--border-2) solid var(--color-border-primary)',
    borderTopColor: 'var(--color-primary)',
    borderRadius: 'var(--radius-full)',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginLeft: 'var(--spacing-2)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-muted)',
  },
  previewHeader: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 'var(--spacing-4)',
  },
  previewHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  previewTitle: {
    fontSize: 'var(--font-size-lg)',
    fontWeight: 'var(--font-weight-medium)',
    color: 'var(--color-text-secondary)',
  },
  countBadge: {
    marginTop: 'var(--spacing-2)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-muted)',
    backgroundColor: 'var(--color-info-bg)',
    padding: 'var(--spacing-1) var(--spacing-3)',
    borderRadius: 'var(--radius-full)',
  },
  tableContainer: {
    border: 'var(--border-1) solid var(--color-border-primary)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    maxHeight: '24rem',
    overflowY: 'auto',
  },
  table: {
    minWidth: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    backgroundColor: 'var(--color-bg-tertiary)',
    position: 'sticky',
    top: 0,
  },
  tableHeaderCell: {
    padding: 'var(--spacing-3) var(--spacing-6)',
    textAlign: 'left',
    fontSize: 'var(--font-size-xs)',
    fontWeight: 'var(--font-weight-medium)',
    color: 'var(--color-text-light)',
    textTransform: 'uppercase',
    letterSpacing: 'var(--letter-spacing-wider)',
  },
  tableBody: {
    backgroundColor: 'var(--color-bg-primary)',
  },
  tableRowEven: {
    backgroundColor: 'var(--color-bg-primary)',
  },
  tableRowOdd: {
    backgroundColor: 'var(--color-bg-tertiary)',
  },
  tableCell: {
    padding: 'var(--spacing-4) var(--spacing-6)',
    whiteSpace: 'nowrap',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-primary)',
    borderBottom: 'var(--border-1) solid var(--color-border-primary)',
  },
  removePasswordText: {
    color: 'var(--color-danger)',
  },
  passwordMask: {
    color: 'var(--color-text-primary)',
  },
  footer: {
    marginTop: 'var(--spacing-6)',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 'var(--spacing-3)',
    paddingTop: 'var(--spacing-4)',
    borderTop: 'var(--border-1) solid var(--color-border-light)',
  },
  cancelButton: {
    padding: 'var(--spacing-2-5) var(--spacing-4)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-medium)',
    color: 'var(--color-text-body)',
    backgroundColor: 'var(--color-bg-primary)',
    border: 'var(--border-1) solid var(--color-border-input)',
    borderRadius: 'var(--radius-lg)',
    cursor: 'pointer',
    transition: 'var(--transition-colors)',
  },
  cancelButtonHover: {
    backgroundColor: 'var(--color-bg-tertiary)',
  },
  confirmButton: {
    padding: 'var(--spacing-2-5) var(--spacing-4)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-medium)',
    color: 'var(--color-white)',
    backgroundColor: 'var(--color-primary)',
    border: 'none',
    borderRadius: 'var(--radius-lg)',
    cursor: 'pointer',
    transition: 'var(--transition-colors)',
    boxShadow: 'var(--shadow-sm)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
  },
  confirmButtonHover: {
    backgroundColor: 'var(--color-primary-hover)',
  },
  confirmButtonDisabled: {
    opacity: 'var(--opacity-disabled)',
    cursor: 'not-allowed',
  },
  buttonSpinner: {
    width: 'var(--spacing-4)',
    height: 'var(--spacing-4)',
    border: 'var(--border-2) solid var(--color-white)',
    borderTopColor: 'transparent',
    borderRadius: 'var(--radius-full)',
    animation: 'spin 1s linear infinite',
  },
}

const BulkPasswordUpdateModal = ({ isOpen, onClose, onUpdate }) => {
  const [csvFile, setCsvFile] = useState(null)
  const [parsedData, setParsedData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState(1)
  const fileInputRef = useRef(null)
  const [dropzoneHover, setDropzoneHover] = useState(false)

  const requiredFields = ["email", "password"]

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
    const headers = ["email", "password"]
    const csvContent = headers.join(",")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "bulk_password_update_template.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDropzoneHover(true)
  }

  const handleDragLeave = () => {
    setDropzoneHover(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDropzoneHover(false)
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

          const parsedData = results.data.map((user) => ({
            email: user.email,
            password: user.password === "null" ? null : user.password,
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

  if (!isOpen) return null

  return (
    <Modal title="Bulk Password Update" onClose={onClose} width={700}>
      {step === 1 && (
        <div style={styles.spaceY5}>
          <div
            style={{ ...styles.dropzone, ...(dropzoneHover ? styles.dropzoneHover : {}) }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
          >
            <FaFileUpload style={styles.uploadIcon} />
            <p style={styles.dropzoneText}>Drag and drop a CSV file here, or click to select a file</p>
            <p style={styles.dropzoneHint}>
              <strong>Required fields:</strong> email, password
            </p>
            <input type="file" ref={fileInputRef} style={styles.hiddenInput} accept=".csv" onChange={handleFileUpload} />
          </div>
          <div style={styles.centerColumn}>
            <button onClick={generateCsvTemplate} style={styles.downloadButton}>
              <FaFileDownload style={styles.downloadIcon} />
              Download CSV Template
            </button>

            <div style={styles.infoBox}>
              <p style={styles.infoTitle}>Field Input Types:</p>
              <ul style={styles.infoGrid}>
                <li>
                  <span style={styles.fieldLabel}>email:</span> String (Required)
                </li>
                <li>
                  <span style={styles.fieldLabel}>password:</span> String (Required)
                </li>
              </ul>
              <p style={styles.infoNote}>Set password to empty string or "null" to remove password</p>
            </div>
          </div>
          {csvFile && (
            <div style={styles.fileSelected}>
              <span style={styles.fileSelectedText}>
                Selected file: <span style={styles.fileName}>{csvFile.name}</span>
              </span>
              <button onClick={(e) => {
                e.stopPropagation()
                setCsvFile(null)
              }}
                style={styles.removeFileButton}
              >
                <FaTimes />
              </button>
            </div>
          )}
          {error && <div style={styles.errorBox}>{error}</div>}
          {isLoading && (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <span style={styles.loadingText}>Processing file...</span>
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div style={styles.spaceY5}>
          <div style={styles.previewHeaderRow}>
            <h3 style={styles.previewTitle}>Preview Password Updates</h3>
            <div style={styles.countBadge}>{parsedData.length} users will be updated</div>
          </div>

          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead style={styles.tableHeader}>
                <tr>
                  <th scope="col" style={styles.tableHeaderCell}>
                    Email
                  </th>
                  <th scope="col" style={styles.tableHeaderCell}>
                    Password
                  </th>
                </tr>
              </thead>
              <tbody style={styles.tableBody}>
                {parsedData.map((user, index) => (
                  <tr key={index} style={index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd}>
                    <td style={styles.tableCell}>{user.email}</td>
                    <td style={styles.tableCell}>{user.password === "" || user.password === "null" || user.password === null ? <span style={styles.removePasswordText}>Remove password</span> : <span style={styles.passwordMask}>••••••••</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}
        </div>
      )}

      <div style={styles.footer}>
        {step === 1 ? (
          <button onClick={onClose} style={styles.cancelButton}>
            Cancel
          </button>
        ) : (
          <button onClick={resetForm} style={styles.cancelButton}>
            Back
          </button>
        )}

        {step === 2 && (
          <button
            onClick={handleUpdate}
            style={{
              ...styles.confirmButton,
              ...(parsedData.length === 0 || isLoading || isUpdating ? styles.confirmButtonDisabled : {})
            }}
            disabled={parsedData.length === 0 || isLoading || isUpdating}
          >
            {isUpdating ? (
              <>
                <div style={styles.buttonSpinner}></div>
                Updating Passwords...
              </>
            ) : (
              <>
                <FaCheck /> Confirm Update
              </>
            )}
          </button>
        )}
      </div>
    </Modal>
  )
}

export default BulkPasswordUpdateModal
