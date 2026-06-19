/**
 * Admin Entity Actions
 *
 * Self-contained admin "Delete" control with a required-reason confirm modal,
 * used inside the proposal / bill modals. The actual API call + refresh live in
 * the parent (passed as `onDelete(reason)`); this component only owns the
 * confirm UI + reason input. Reason is recorded in the audit log server-side.
 */

import { useState } from "react"
import { Button, Modal } from "czero/react"
import { Textarea } from "@/components/ui/form"
import { Trash2 } from "lucide-react"

const MIN_REASON = 3

const AdminEntityActions = ({ onDelete, deleting = false, label = "item" }) => {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")

  const trimmed = reason.trim()
  const canConfirm = trimmed.length >= MIN_REASON

  const handleConfirm = async () => {
    if (!canConfirm) return
    await onDelete(trimmed)
    setOpen(false)
    setReason("")
  }

  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)} disabled={deleting}>
        <Trash2 size={16} /> Delete
      </Button>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={`Delete ${label}`}
        width={480}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirm} loading={deleting} disabled={!canConfirm}>
              Delete {label}
            </Button>
          </>
        }
      >
        <p
          style={{
            marginBottom: "var(--spacing-3)",
            color: "var(--color-text-body)",
            fontSize: "var(--font-size-sm)",
          }}
        >
          This {label} will be soft-deleted (reversible) and unlinked from its event.
          The action and your reason are recorded in the audit log.
        </p>
        <Textarea
          name="adminDeleteReason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder={`Reason for deleting this ${label} (required)`}
          rows={3}
        />
      </Modal>
    </>
  )
}

export default AdminEntityActions
