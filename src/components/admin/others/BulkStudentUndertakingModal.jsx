import { useState, useRef } from "react"
import { FaFileUpload, FaCheck, FaTimes, FaFileDownload } from "react-icons/fa"
import Papa from "papaparse"
import { Alert, FileInput, Grid, Heading, HStack, Spinner, Surface, Text, VStack } from "@/components/ui"
import { Button, Table } from "czero/react"
import { Modal } from "@/components/ui"
import { BULK_RECORD_LIMIT_MESSAGE, MAX_BULK_RECORDS } from "@/constants/systemLimits"
import { adminApi } from "../../../service"

const BulkStudentUndertakingModal = ({ isOpen, onClose, onUpdate, undertakingId, undertakingTitle }) => {
  const [csvFile, setCsvFile] = useState(null)
  const [parsedData, setParsedData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState(1)
  const fileInputRef = useRef(null)

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
    const headers = ["rollNumber"]
    const csvContent = headers.join(",")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "undertaking_students_template.csv")
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
          if (results.data.length > MAX_BULK_RECORDS) {
            setError(BULK_RECORD_LIMIT_MESSAGE)
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
            rollNumber: student.rollNumber.trim(),
          }))

          // Filter out empty roll numbers
          const validData = parsedData.filter((item) => item.rollNumber)

          // Check for duplicate roll numbers
          const uniqueRollNumbers = new Set()
          const duplicates = []

          validData.forEach((item) => {
            if (uniqueRollNumbers.has(item.rollNumber)) {
              duplicates.push(item.rollNumber)
            } else {
              uniqueRollNumbers.add(item.rollNumber)
            }
          })

          if (duplicates.length > 0) {
            setError(`Duplicate roll numbers found: ${duplicates.slice(0, 3).join(", ")}${duplicates.length > 3 ? ` and ${duplicates.length - 3} more` : ""}`)
            setIsLoading(false)
            return
          }

          setParsedData(validData)
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
      // Extract roll numbers from parsed data
      const rollNumbers = parsedData.map((item) => item.rollNumber)

      // Send roll numbers directly to the API
      await adminApi.addStudentsToUndertakingByRollNumbers(undertakingId, rollNumbers)

      if (onUpdate) onUpdate()
      onClose()
      resetForm()
    } catch (error) {
      console.error("Error adding students to undertaking:", error)
      setError(error.message || "Failed to add students to undertaking")
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
    <Modal title={`Add Students to Undertaking - ${undertakingTitle}`} onClose={onClose} width={700}>
      {step === 1 && (
        <VStack gap={5}>
          <div style={{ border: 'var(--border-2) dashed var(--color-border-input)', borderRadius: 'var(--radius-xl)', padding: 'var(--spacing-8)', textAlign: 'center', cursor: 'pointer', backgroundColor: 'var(--color-bg-hover)', transition: 'var(--transition-colors)' }} onDragOver={handleDragOver} onDrop={handleDrop} onClick={() => fileInputRef.current.click()} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-muted)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'}>
            <FaFileUpload style={{ margin: '0 auto', height: 'var(--icon-3xl)', width: 'var(--icon-3xl)', color: 'var(--color-text-muted)' }} />
            <Text size="sm" color="muted" style={{ marginTop: 'var(--spacing-2)' }}>Drag and drop a CSV file here, or click to select a file</Text>
            <Text size="xs" color="muted" style={{ marginTop: 'var(--spacing-3)' }}>
              <strong>Required fields:</strong> rollNumber
            </Text>
            <FileInput ref={fileInputRef} accept=".csv" onChange={handleFileUpload} hidden />
          </div>
          <VStack gap="none" align="center">
            <Button onClick={generateCsvTemplate} variant="ghost" size="sm">
              <FaFileDownload /> Download CSV Template
            </Button>

            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-2)', backgroundColor: 'var(--color-bg-hover)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-lg)', maxWidth: '28rem' }}>
              <Text weight="medium" style={{ marginBottom: 'var(--spacing-1)' }}>Field Input Types:</Text>
              <Grid as="ul" cols={1} gap={1}>
                <li>
                  <Text as="span" weight="medium">rollNumber:</Text> String (Required) - Student roll number (e.g., CS21B001)
                </li>
              </Grid>
            </div>
          </VStack>
          {csvFile && (
            <div style={{ padding: 'var(--spacing-2) var(--spacing-4)', backgroundColor: 'var(--color-primary-bg)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text as="span" size="sm" color="var(--color-primary-dark)">
                Selected file: <Text as="span" weight="medium">{csvFile.name}</Text>
              </Text>
              <Button onClick={(e) => {
                e.stopPropagation()
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
          {error && <Surface bg="danger" color="danger" padding="var(--spacing-2) var(--spacing-4)" radius="lg" accent="danger">{error}</Surface>}
          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-4) 0' }}>
              <Spinner size="var(--icon-xl)" thickness="thin" />
              <Text as="span" size="sm" color="muted" style={{ marginLeft: 'var(--spacing-2)' }}>Processing file...</Text>
            </div>
          )}
        </VStack>
      )}

      {step === 2 && (
        <VStack gap={5}>
          <VStack gap="none" align="start" justify="between" style={{ marginBottom: 'var(--spacing-4)' }} className="sm:flex-row sm:items-center">
            <Heading as="h3" size="lg" weight="medium" color="secondary">Preview Students</Heading>
            <div style={{ marginTop: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-primary-bg)', padding: 'var(--spacing-1) var(--spacing-3)', borderRadius: 'var(--radius-full)' }} className="sm:mt-0">{parsedData.length} students will be added</div>
          </VStack>

          <div style={{ border: 'var(--border-1) solid var(--color-border-light)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', maxHeight: '24rem', overflowY: 'auto' }}>
            <Table>
              <Table.Header style={{ position: 'sticky', top: 0 }}>
                <Table.Row>
                  <Table.Head scope="col">
                    Roll Number
                  </Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {parsedData.map((student, index) => (
                  <Table.Row style={{ backgroundColor: index % 2 === 0 ? 'var(--color-bg-primary)' : 'var(--color-bg-hover)' }} key={index}>
                    <Table.Cell style={{ whiteSpace: 'nowrap', fontSize: 'var(--font-size-sm)' }}>{student.rollNumber}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>

          {error && <Surface bg="danger" color="danger" padding="var(--spacing-2) var(--spacing-4)" radius="lg" accent="danger">{error}</Surface>}
        </VStack>
      )}

      <div style={{ marginTop: 'var(--spacing-6)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-3)', paddingTop: 'var(--spacing-4)', borderTop: 'var(--border-1) solid var(--color-border-light)' }}>
        {step === 1 ? (
          <Button onClick={onClose} variant="secondary" size="md">
            Cancel
          </Button>
        ) : (
          <Button onClick={resetForm} variant="secondary" size="md">
            Back
          </Button>
        )}

        {step === 2 && (
          <Button onClick={handleUpdate} variant="primary" size="md" loading={isUpdating} disabled={parsedData.length === 0 || isLoading || isUpdating}>
            <FaCheck /> {isUpdating ? "Adding Students..." : "Confirm Add"}
          </Button>
        )}
      </div>
    </Modal>
  )
}

export default BulkStudentUndertakingModal
