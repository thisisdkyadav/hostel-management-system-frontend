import React, { useState, useEffect } from "react"
import { FormField } from "@/components/ui"
import { FaTrash } from "react-icons/fa"
import { Modal, Button } from "czero/react"

const DisCoActionModal = ({ isOpen, onClose, onSubmit, initialData = null, isEditing = false, onDelete = null }) => {
  const toReminderState = (items = []) =>
    Array.isArray(items)
      ? items.map((item) => ({
        _id: item?._id || undefined,
        action: item?.action || "",
        dueDate: item?.dueDate ? String(item.dueDate).split("T")[0] : "",
        isDone: Boolean(item?.isDone),
        doneAt: item?.doneAt || null,
        doneBy: item?.doneBy || null,
      }))
      : []

  const [formData, setFormData] = useState({
    reason: "",
    actionTaken: "",
    date: "",
    remarks: "",
    reminderItems: [],
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData({
        reason: initialData.reason || "",
        actionTaken: initialData.actionTaken || "",
        date: initialData.date ? initialData.date.split("T")[0] : "",
        remarks: initialData.remarks || "",
        reminderItems: toReminderState(initialData.reminderItems),
      })
    } else {
      setFormData({
        reason: "",
        actionTaken: "",
        date: "",
        remarks: "",
        reminderItems: [],
      })
    }
    // Reset delete confirmation when modal opens/closes
    setShowDeleteConfirm(false)
  }, [initialData, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.actionTaken.trim()) {
      newErrors.actionTaken = "Action taken is required"
    }

    if (!formData.reason.trim()) {
      newErrors.reason = "Reason is required"
    }

    if (!formData.date) {
      newErrors.date = "Date is required"
    }

    const invalidReminder = formData.reminderItems.find(
      (item) =>
        (item.action.trim() && !item.dueDate) ||
        (!item.action.trim() && item.dueDate)
    )
    if (invalidReminder) {
      newErrors.reminderItems = "Each reminder row needs action text and due date"
    }

    return newErrors
  }

  const handleReminderChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      reminderItems: prev.reminderItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }))
    if (errors.reminderItems) {
      setErrors((prev) => ({ ...prev, reminderItems: null }))
    }
  }

  const handleAddReminder = () => {
    setFormData((prev) => ({
      ...prev,
      reminderItems: [
        ...prev.reminderItems,
        {
          action: "",
          dueDate: "",
          isDone: false,
          doneAt: null,
          doneBy: null,
        },
      ],
    }))
  }

  const handleRemoveReminder = (index) => {
    setFormData((prev) => ({
      ...prev,
      reminderItems: prev.reminderItems.filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit({
        ...formData,
        reminderItems: formData.reminderItems
          .filter((item) => item.action.trim() && item.dueDate)
          .map((item) => ({
            ...(item._id ? { _id: item._id } : {}),
            action: item.action.trim(),
            dueDate: item.dueDate,
            isDone: Boolean(item.isDone),
            doneAt: item.doneAt || null,
            doneBy: item.doneBy?._id || item.doneBy || null,
          })),
      })
    } catch (error) {
      console.error("Error in form submission:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmDelete = () => {
    setShowDeleteConfirm(true)
  }

  const handleDelete = () => {
    if (onDelete && initialData?._id) {
      onDelete(initialData._id)
      onClose()
    }
  }

  const cancelDelete = () => {
    setShowDeleteConfirm(false)
  }

  const styles = {
    deleteConfirmContainer: {
      padding: "var(--spacing-4)",
    },
    deleteTitle: {
      fontSize: "var(--font-size-lg)",
      fontWeight: "var(--font-weight-medium)",
      color: "var(--color-danger)",
      marginBottom: "var(--spacing-3)",
    },
    deleteMessage: {
      marginBottom: "var(--spacing-4)",
      color: "var(--color-text-body)",
      fontSize: "var(--font-size-base)",
    },
    deleteButtonContainer: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "var(--spacing-3)",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--spacing-4)",
    },
    reminderSection: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--spacing-3)",
      padding: "var(--spacing-3)",
      border: "var(--border-1) solid var(--color-border-primary)",
      borderRadius: "var(--radius-md)",
      backgroundColor: "var(--color-bg-secondary)",
    },
    reminderRow: {
      display: "grid",
      gridTemplateColumns: "1fr 180px auto",
      gap: "var(--spacing-2)",
      alignItems: "center",
    },
    reminderInput: {
      width: "100%",
      border: "var(--border-1) solid var(--color-border-primary)",
      borderRadius: "var(--radius-md)",
      padding: "var(--spacing-2)",
      backgroundColor: "var(--color-bg-primary)",
      color: "var(--color-text-primary)",
    },
    reminderError: {
      color: "var(--color-danger)",
      fontSize: "var(--font-size-sm)",
    },
    footerContainer: {
      display: "flex",
      justifyContent: "space-between",
      paddingTop: "var(--spacing-4)",
      marginTop: "var(--spacing-4)",
      borderTop: "var(--border-1) solid var(--color-border-light)",
    },
    actionButtonsRight: {
      display: "flex",
      gap: "var(--spacing-3)",
      marginLeft: "auto",
    },
  }

  if (!isOpen) return null

  return (
    <Modal title={isEditing ? "Edit Disciplinary Action" : "Add Disciplinary Action"} onClose={onClose} width={600}>
      {showDeleteConfirm ? (
        <div style={styles.deleteConfirmContainer}>
          <h3 style={styles.deleteTitle}>Confirm Deletion</h3>
          <p style={styles.deleteMessage}>Are you sure you want to delete this disciplinary action? This action cannot be undone.</p>
          <div style={styles.deleteButtonContainer}>
            <Button type="button" variant="outline" onClick={cancelDelete}>
              Cancel
            </Button>
            <Button type="button" variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={styles.form}>
          <FormField label="Action Taken" name="actionTaken" value={formData.actionTaken} onChange={handleChange} required error={errors.actionTaken} placeholder="Enter action taken" />

          <FormField label="Reason" name="reason" value={formData.reason} onChange={handleChange} required error={errors.reason} placeholder="Enter reason for the action" />

          <FormField label="Date" name="date" type="date" value={formData.date} onChange={handleChange} required error={errors.date} />

          <FormField label="Remarks" name="remarks" type="textarea" value={formData.remarks} onChange={handleChange} error={errors.remarks} placeholder="Enter additional remarks (optional)" rows={3} />

          <div style={styles.reminderSection}>
            <div style={{ fontWeight: "var(--font-weight-medium)", color: "var(--color-text-primary)" }}>
              Reminder Items (Optional)
            </div>
            {formData.reminderItems.length === 0 ? (
              <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                No reminders added yet
              </div>
            ) : (
              formData.reminderItems.map((item, index) => (
                <div key={item._id || `reminder-${index}`} style={styles.reminderRow}>
                  <input
                    type="text"
                    value={item.action}
                    onChange={(event) => handleReminderChange(index, "action", event.target.value)}
                    placeholder="Reminder action"
                    style={styles.reminderInput}
                  />
                  <input
                    type="date"
                    value={item.dueDate}
                    onChange={(event) => handleReminderChange(index, "dueDate", event.target.value)}
                    style={styles.reminderInput}
                  />
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveReminder(index)}>
                    <FaTrash />
                  </Button>
                </div>
              ))
            )}
            {errors.reminderItems && <div style={styles.reminderError}>{errors.reminderItems}</div>}
            <div>
              <Button type="button" variant="secondary" size="sm" onClick={handleAddReminder}>
                Add Reminder
              </Button>
            </div>
          </div>

          <div style={styles.footerContainer}>
            {isEditing && onDelete && (
              <Button type="button" variant="danger" size="sm" onClick={confirmDelete}>
                <FaTrash /> Delete
              </Button>
            )}
            <div style={styles.actionButtonsRight}>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={isSubmitting}>
                {isEditing ? "Update" : "Add"} Disciplinary Action
              </Button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  )
}

export default DisCoActionModal
