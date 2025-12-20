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
    uploadSection: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--spacing-2)",
    },
    uploadLabel: {
      display: "block",
      fontSize: "var(--font-size-sm)",
      fontWeight: "var(--font-weight-medium)",
      color: "var(--color-text-body)",
    },
    requiredMark: {
      color: "var(--color-danger)",
    },
    uploadContainer: {
      display: "flex",
      alignItems: "center",
      gap: "var(--spacing-3)",
    },
    uploadButton: {
      padding: "var(--spacing-2) var(--spacing-4)",
      backgroundColor: "var(--color-primary-bg)",
      color: "var(--color-primary)",
      borderRadius: "var(--radius-md)",
      transition: "var(--transition-all)",
      display: "flex",
      alignItems: "center",
      gap: "var(--spacing-2)",
      cursor: "pointer",
      border: "none",
      fontSize: "var(--font-size-base)",
      fontWeight: "var(--font-weight-medium)",
    },
    hiddenInput: {
      display: "none",
    },
    uploadedFileName: {
      fontSize: "var(--font-size-sm)",
      color: "var(--color-text-muted)",
    },
    uploadedSuccess: {
      fontSize: "var(--font-size-sm)",
      color: "var(--color-success)",
    },
    errorText: {
      fontSize: "var(--font-size-sm)",
      color: "var(--color-danger)",
    },
    hintText: {
      fontSize: "var(--font-size-xs)",
      color: "var(--color-text-muted)",
    },
    submitError: {
      padding: "var(--spacing-3)",
      backgroundColor: "var(--color-danger-bg-light)",
      color: "var(--color-danger)",
      borderRadius: "var(--radius-md)",
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
    <Modal title={isEditing ? "Edit Certificate" : "Add Certificate"} onClose={onClose} width={600}>
      {showDeleteConfirm ? (
        <div style={styles.deleteConfirmContainer}>
          <h3 style={styles.deleteTitle}>Confirm Deletion</h3>
          <p style={styles.deleteMessage}>Are you sure you want to delete this certificate? This action cannot be undone.</p>
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
          <FormField label="Certificate Type" name="certificateType" value={formData.certificateType} onChange={handleChange} required error={errors.certificateType} placeholder="e.g., Bonafide Certificate, No Dues Certificate" />

          <div style={styles.uploadSection}>
            <label style={styles.uploadLabel}>
              Upload Certificate <span style={styles.requiredMark}>*</span>
            </label>
            <div style={styles.uploadContainer}>
              <label style={{ cursor: isUploading ? "not-allowed" : "pointer" }}>
                <input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.gif" onChange={handleFileChange} style={styles.hiddenInput} disabled={isUploading} />
                <div
                  style={styles.uploadButton}
                  onMouseEnter={(e) => {
                    if (!isUploading) e.currentTarget.style.backgroundColor = "var(--color-primary-bg-hover)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--color-primary-bg)"
                  }}
                >
                  <FaUpload />
                  <span>{isUploading ? "Uploading..." : "Choose File"}</span>
                </div>
              </label>
              {uploadedFile && <span style={styles.uploadedFileName}>{uploadedFile}</span>}
              {formData.certificateUrl && !uploadedFile && <span style={styles.uploadedSuccess}>File uploaded</span>}
            </div>
            {errors.file && <p style={styles.errorText}>{errors.file}</p>}
            {errors.certificateUrl && <p style={styles.errorText}>{errors.certificateUrl}</p>}
            <p style={styles.hintText}>Accepted formats: PDF, PNG, JPG, JPEG, WEBP, GIF</p>
          </div>

          <FormField label="Issue Date" name="issueDate" type="date" value={formData.issueDate} onChange={handleChange} required error={errors.issueDate} />

          <FormField label="Remarks" name="remarks" type="textarea" value={formData.remarks} onChange={handleChange} error={errors.remarks} placeholder="Enter additional remarks (optional)" rows={3} />

          {errors.submit && <div style={styles.submitError}>{errors.submit}</div>}

          <div style={styles.footerContainer}>
            {isEditing && onDelete && (
              <Button type="button" variant="danger" size="small" icon={<FaTrash />} onClick={confirmDelete}>
                Delete
              </Button>
            )}
            <div style={styles.actionButtonsRight}>
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
