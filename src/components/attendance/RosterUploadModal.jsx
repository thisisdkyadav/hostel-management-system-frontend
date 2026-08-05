import { useState } from "react"
import { Button } from "czero/react"
import { Modal, Alert } from "@/components/ui"
import { useToast } from "@/components/ui/feedback"
import CsvUploader from "../common/CsvUploader"
import { attendanceApi } from "../../service"
import { MAX_ROSTER } from "./attendanceConstants"

const RosterUploadModal = ({ isOpen, onClose, occurrenceId, currentCount = 0, onUploaded }) => {
  const { toast } = useToast()
  const [rollNumbers, setRollNumbers] = useState([])
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleParsed = (rows) => {
    setError("")
    const parsed = rows
      .map((row) => String(row.rollNumber || "").trim().toUpperCase())
      .filter(Boolean)
    const unique = [...new Set(parsed)]
    if (unique.length === 0) {
      setError("No valid roll numbers found in the file.")
      setRollNumbers([])
      return
    }
    setRollNumbers(unique)
  }

  const handleSubmit = async () => {
    if (rollNumbers.length === 0) {
      setError("Upload a CSV with a 'rollNumber' column first.")
      return
    }
    try {
      setSubmitting(true)
      setError("")
      const result = await attendanceApi.uploadRoster(occurrenceId, rollNumbers)
      toast.success(`Roster updated (${result?.rosterCount ?? rollNumbers.length} roll numbers)`)
      onUploaded?.()
      onClose?.()
    } catch (submitError) {
      setError(submitError?.message || "Failed to upload roster. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Expected Roster"
      width={560}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={submitting} disabled={submitting || rollNumbers.length === 0}>
            Save Roster {rollNumbers.length > 0 ? `(${rollNumbers.length})` : ""}
          </Button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
        {currentCount > 0 && (
          <Alert type="info" icon>
            This occurrence already has a roster of {currentCount} roll numbers. Uploading a new file replaces it.
          </Alert>
        )}
        {error && <Alert type="error" icon>{error}</Alert>}

        <CsvUploader
          onDataParsed={handleParsed}
          requiredFields={["rollNumber"]}
          templateFileName="attendance-roster-template.csv"
          templateHeaders={["rollNumber"]}
          maxRecords={MAX_ROSTER}
          instructionText="Upload a CSV with a single 'rollNumber' column listing every student expected at this occurrence. This is used to compute absent and extra counts."
        />

        {rollNumbers.length > 0 && (
          <div className="text-sm text-[var(--color-text-muted)]">
            {rollNumbers.length} unique roll number{rollNumbers.length === 1 ? "" : "s"} ready to upload.
          </div>
        )}
      </div>
    </Modal>
  )
}

export default RosterUploadModal
