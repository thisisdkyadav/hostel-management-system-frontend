/**
 * Reason Prompt Modal
 *
 * Small popup that collects a required reason before confirming an action
 * (used for admin override edits). Calls onConfirm(reason) when submitted.
 */

import { useState } from "react"
import { Button, Modal } from "czero/react"
import { Textarea } from "@/components/ui/form"

const MIN_REASON = 3

const ReasonPromptModal = ({
    isOpen,
    onClose,
    onConfirm,
    loading = false,
    title = "Reason required",
    description = "This change is recorded in the audit log. Please provide a reason.",
    confirmText = "Save changes",
    placeholder = "Reason for this change",
}) => {
    const [reason, setReason] = useState("")

    const trimmed = reason.trim()
    const canConfirm = trimmed.length >= MIN_REASON

    const handleConfirm = async () => {
        if (!canConfirm) return
        await onConfirm(trimmed)
        setReason("")
    }

    const handleClose = () => {
        setReason("")
        onClose?.()
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={title}
            width={480}
            footer={
                <>
                    <Button variant="ghost" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm} loading={loading} disabled={!canConfirm}>
                        {confirmText}
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
                {description}
            </p>
            <Textarea
                name="overrideReason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder={placeholder}
                rows={3}
            />
        </Modal>
    )
}

export default ReasonPromptModal
