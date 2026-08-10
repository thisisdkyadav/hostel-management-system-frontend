import { useEffect, useState } from "react"
import { Alert, Button, Field, Input, Modal, Select, Textarea, useToast, VStack } from "hzero"
import { expenditureApi } from "../../service"
import { OCCURRENCE_STATUS } from "./expenditureConstants"

const CreateExpenditureModal = ({ isOpen, onClose, onSaved, occurrence = null }) => {
  const { toast } = useToast()
  const isEdit = Boolean(occurrence)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [totalBudget, setTotalBudget] = useState("")
  const [status, setStatus] = useState(OCCURRENCE_STATUS.OPEN)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setError("")
    setTitle(occurrence?.title || "")
    setDescription(occurrence?.description || "")
    setTotalBudget(occurrence?.totalBudget != null ? String(occurrence.totalBudget) : "")
    setStatus(occurrence?.status || OCCURRENCE_STATUS.OPEN)
  }, [isOpen, occurrence])

  const handleSubmit = async () => {
    if (!title.trim() || title.trim().length < 2) {
      setError("Title is required (at least 2 characters).")
      return
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      totalBudget: Number(totalBudget) || 0,
    }
    if (isEdit) payload.status = status

    try {
      setSubmitting(true)
      setError("")
      const result = isEdit ? await expenditureApi.update(occurrence._id, payload) : await expenditureApi.create(payload)
      toast.success(isEdit ? "Occurrence updated" : "Occurrence created")
      onSaved?.(result)
      onClose?.()
    } catch (err) {
      setError(err?.message || "Unable to save occurrence. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Expenditure Occurrence" : "New Expenditure Occurrence"}
      width={560}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={submitting} disabled={submitting}>
            {isEdit ? "Save Changes" : "Create"}
          </Button>
        </>
      }
    >
      <VStack gap={4}>
        {error && (
          <Alert type="error" icon>
            {error}
          </Alert>
        )}

        <Field label="Title" htmlFor="exp-title" required>
          <Input id="exp-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Annual Fest 2026" />
        </Field>

        <Field label="Total budget (₹)" htmlFor="exp-budget">
          <Input id="exp-budget" type="number" min={0} value={totalBudget} onChange={(e) => setTotalBudget(e.target.value)} placeholder="0" />
        </Field>

        {isEdit && (
          <Field label="Status" htmlFor="exp-status">
            <Select
              id="exp-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: OCCURRENCE_STATUS.OPEN, label: "Open" },
                { value: OCCURRENCE_STATUS.CLOSED, label: "Closed" },
              ]}
            />
          </Field>
        )}

        <Field label="Description" htmlFor="exp-desc">
          <Textarea
            id="exp-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional notes about this expenditure occurrence"
            rows={3}
          />
        </Field>
      </VStack>
    </Modal>
  )
}

export default CreateExpenditureModal
