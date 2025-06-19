import React, { useState, useEffect } from "react"
import Modal from "../../common/Modal"
import FormField from "../../common/FormField"
import Button from "../../common/Button"
import { FaTrash } from "react-icons/fa"

const DisCoActionModal = ({ isOpen, onClose, onSubmit, initialData = null, isEditing = false, onDelete = null }) => {
  const [formData, setFormData] = useState({
    reason: "",
    actionTaken: "",
    date: "",
    remarks: "",
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
      })
    } else {
      setFormData({
        reason: "",
        actionTaken: "",
        date: "",
        remarks: "",
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

    return newErrors
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
      await onSubmit(formData)
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

  if (!isOpen) return null

  return (
    <Modal title={isEditing ? "Edit Disciplinary Action" : "Add Disciplinary Action"} onClose={onClose} width={600}>
      {showDeleteConfirm ? (
        <div className="p-4">
          <h3 className="text-lg font-medium text-red-600 mb-3">Confirm Deletion</h3>
          <p className="mb-4">Are you sure you want to delete this disciplinary action? This action cannot be undone.</p>
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={cancelDelete}>
              Cancel
            </Button>
            <Button type="button" variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Action Taken" name="actionTaken" value={formData.actionTaken} onChange={handleChange} required error={errors.actionTaken} placeholder="Enter action taken" />

          <FormField label="Reason" name="reason" value={formData.reason} onChange={handleChange} required error={errors.reason} placeholder="Enter reason for the action" />

          <FormField label="Date" name="date" type="date" value={formData.date} onChange={handleChange} required error={errors.date} />

          <FormField label="Remarks" name="remarks" type="textarea" value={formData.remarks} onChange={handleChange} error={errors.remarks} placeholder="Enter additional remarks (optional)" rows={3} />

          <div className="flex justify-between pt-4 mt-4 border-t border-gray-100">
            {isEditing && onDelete && (
              <Button type="button" variant="danger" size="small" icon={<FaTrash />} onClick={confirmDelete}>
                Delete
              </Button>
            )}
            <div className="flex space-x-3 ml-auto">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
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
