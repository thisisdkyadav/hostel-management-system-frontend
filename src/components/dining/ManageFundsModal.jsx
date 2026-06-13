import { useState } from "react"
import { Button, Modal } from "czero/react"
import { Alert, VStack } from "@/components/ui"
import CsvUploader from "@/components/common/CsvUploader"
import { FUND_MODES, getErrorMessage } from "./diningBillingHelpers"

/**
 * Bulk-manage student fund allocations for a billing period via CSV.
 * Mode (add / deduct / set) decides how the uploaded amounts are applied.
 * Conditional-mounted with a `key` so each open starts fresh (no reset effect).
 */
const ManageFundsModal = ({ isOpen, onClose, onSubmit }) => {
  const [mode, setMode] = useState("add")
  const [entries, setEntries] = useState([])
  const [error, setError] = useState("")
  const [report, setReport] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const activeMode = FUND_MODES.find((item) => item.id === mode) || FUND_MODES[0]

  const handleDataParsed = (rows) => {
    setReport(null)
    setError("")
    const parsed = (Array.isArray(rows) ? rows : [])
      .map((row) => ({
        rollNumber: String(row.rollNumber || "").trim().toUpperCase(),
        amount: Number(String(row.amount ?? "").trim()),
      }))
      .filter((row) => row.rollNumber)
    setEntries(parsed)
  }

  const handleApply = async () => {
    if (entries.length === 0) {
      setError("Upload a CSV with rollNumber and amount columns first.")
      return
    }
    setIsSubmitting(true)
    setError("")
    try {
      const result = await onSubmit(mode, entries)
      setReport(result || { updated: entries.length, skipped: [], total: entries.length })
      setEntries([])
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Unable to apply fund changes. Please try again."))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Funds"
      width={620}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>Close</Button>
          <Button type="button" variant="primary" onClick={handleApply} loading={isSubmitting} disabled={isSubmitting || entries.length === 0}>
            {isSubmitting ? "Applying..." : `Apply ${activeMode.label} (${entries.length})`}
          </Button>
        </>
      }
    >
      <VStack gap="large">
        {error && <Alert type="error" icon>{error}</Alert>}

        <div>
          <p style={{ margin: "0 0 var(--spacing-2)", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-secondary)" }}>
            How should uploaded amounts apply?
          </p>
          <div style={{ display: "flex", gap: "var(--spacing-2)", flexWrap: "wrap" }}>
            {FUND_MODES.map((item) => (
              <Button
                key={item.id}
                type="button"
                variant={mode === item.id ? "primary" : "secondary"}
                size="sm"
                onClick={() => { setMode(item.id); setReport(null) }}
              >
                {item.label}
              </Button>
            ))}
          </div>
          <p style={{ margin: "var(--spacing-2) 0 0", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
            {activeMode.hint}
          </p>
        </div>

        <CsvUploader
          onDataParsed={handleDataParsed}
          requiredFields={["rollNumber", "amount"]}
          templateHeaders={["rollNumber", "amount"]}
          templateFileName="dining_billing_allocations_template.csv"
          instructionText="Each row needs a rollNumber and a non-negative amount. Unknown roll numbers are skipped and reported."
        />

        {entries.length > 0 && (
          <Alert type="info" icon>
            {entries.length} row{entries.length === 1 ? "" : "s"} ready. Click &quot;Apply {activeMode.label}&quot; to update allocations.
          </Alert>
        )}

        {report && (
          <Alert type={report.skipped?.length ? "warning" : "success"} icon>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-1)" }}>
              <span><strong>{report.updated}</strong> account(s) updated{report.skipped?.length ? `, ${report.skipped.length} skipped` : ""}.</span>
              {report.skipped?.length > 0 && (
                <span style={{ fontSize: "var(--font-size-xs)" }}>
                  Skipped: {report.skipped.slice(0, 10).map((row) => `${row.rollNumber} (${row.reason})`).join(", ")}
                  {report.skipped.length > 10 ? ` and ${report.skipped.length - 10} more` : ""}
                </span>
              )}
            </div>
          </Alert>
        )}
      </VStack>
    </Modal>
  )
}

export default ManageFundsModal
