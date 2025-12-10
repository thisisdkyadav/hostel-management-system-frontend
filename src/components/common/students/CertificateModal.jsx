import React, { useState, useEffect } from "react"
import Modal from "../../common/Modal"
import FormField from "../../common/FormField"
import Button from "../../common/Button"
import { FaTrash, FaUpload } from "react-icons/fa"
import { uploadApi } from "../../../services/uploadApi"
import { addCertificate, updateCertificate } from "../../../services/certificatesApi"

const CertificateModal = ({ isOpen, onClose, onSubmit, initialData = null, isEditing = false, onDelete = null, studentId }) => {
  const [formData, setFormData] = useState({
    certificateType: "",
    certificateUrl: "",
    issueDate: "",
    remarks: "",
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData({
        certificateType: initialData.certificateType || "",
        certificateUrl: initialData.certificateUrl || "",
        issueDate: initialData.issueDate ? initialData.issueDate.split("T")[0] : "",
        remarks: initialData.remarks || "",
      })
    } else {
      setFormData({
        certificateType: "",
        certificateUrl: "",
        issueDate: "",
        remarks: "",
      })
    }
    // Reset delete confirmation when modal opens/closes
    setShowDeleteConfirm(false)
    setUploadedFile(null)
  }, [initialData, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({ ...prev, file: "Only PDF and image files are allowed" }))
      return
    }

    // Clear previous errors
    setErrors((prev) => ({ ...prev, file: null }))

    try {
      setIsUploading(true)
      const formData = new FormData()
      formData.append("file", file)

      const response = await uploadApi.uploadCertificate(formData)
      setFormData((prev) => ({ ...prev, certificateUrl: response.url }))
      setUploadedFile(file.name)
    } catch (error) {
      console.error("Upload error:", error)
      setErrors((prev) => ({ ...prev, file: error.message || "Failed to upload file" }))
    } finally {
      setIsUploading(false)
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.certificateType.trim()) {
      newErrors.certificateType = "Certificate type is required"
    }

    if (!formData.certificateUrl.trim()) {
      newErrors.certificateUrl = "Please upload a certificate file"
    }

    if (!formData.issueDate) {
      newErrors.issueDate = "Issue date is required"
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
      const submitFunction = async () => {
        if (isEditing) {
          await updateCertificate(initialData._id, formData)
        } else {
          await addCertificate({ ...formData, studentId })
        }
      }

      await onSubmit({ onSubmit: submitFunction })
    } catch (error) {
      console.error("Error in form submission:", error)
      setErrors((prev) => ({ ...prev, submit: error.message || "Failed to save certificate" }))
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
    <Modal title={isEditing ? "Edit Certificate" : "Add Certificate"} onClose={onClose} width={600}>
      {showDeleteConfirm ? (
        <div className="p-4">
          <h3 className="text-lg font-medium text-red-600 mb-3">Confirm Deletion</h3>
          <p className="mb-4">Are you sure you want to delete this certificate? This action cannot be undone.</p>
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
          <FormField label="Certificate Type" name="certificateType" value={formData.certificateType} onChange={handleChange} required error={errors.certificateType} placeholder="e.g., Bonafide Certificate, No Dues Certificate" />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Upload Certificate <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-3">
              <label className="cursor-pointer">
                <input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.gif" onChange={handleFileChange} className="hidden" disabled={isUploading} />
                <div className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition-colors flex items-center space-x-2">
                  <FaUpload />
                  <span>{isUploading ? "Uploading..." : "Choose File"}</span>
                </div>
              </label>
              {uploadedFile && <span className="text-sm text-gray-600">{uploadedFile}</span>}
              {formData.certificateUrl && !uploadedFile && <span className="text-sm text-green-600">File uploaded</span>}
            </div>
            {errors.file && <p className="text-sm text-red-600">{errors.file}</p>}
            {errors.certificateUrl && <p className="text-sm text-red-600">{errors.certificateUrl}</p>}
            <p className="text-xs text-gray-500">Accepted formats: PDF, PNG, JPG, JPEG, WEBP, GIF</p>
          </div>

          <FormField label="Issue Date" name="issueDate" type="date" value={formData.issueDate} onChange={handleChange} required error={errors.issueDate} />

          <FormField label="Remarks" name="remarks" type="textarea" value={formData.remarks} onChange={handleChange} error={errors.remarks} placeholder="Enter additional remarks (optional)" rows={3} />

          {errors.submit && <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">{errors.submit}</div>}

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
              <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={isUploading}>
                {isEditing ? "Update" : "Add"} Certificate
              </Button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  )
}

export default CertificateModal
