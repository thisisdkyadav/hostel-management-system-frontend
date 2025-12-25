import React, { useState } from "react"
import { uploadApi } from "../../../../services/uploadApi"
import { getMediaUrl } from "../../../../utils/mediaUtils"
import Button from "../../../common/Button"

const PaymentInfoForm = ({ onSubmit, onCancel, expectedAmount }) => {
  const [formData, setFormData] = useState({
    amount: expectedAmount || "",
    dateOfPayment: "",
    transactionId: "",
    screenshot: null,
    additionalInfo: "",
  })
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [errors, setErrors] = useState({})

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type - only allow common image formats
    const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]

    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"]
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."))

    if (!allowedImageTypes.includes(file.type.toLowerCase()) || !allowedExtensions.includes(fileExtension)) {
      setErrors((prev) => ({
        ...prev,
        screenshot: "Please select a valid image file (JPEG, PNG, GIF, or WebP only)",
      }))
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        screenshot: "File size must be less than 5MB",
      }))
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("image", file, "payment.jpg")

      const response = await uploadApi.uploadPaymentScreenshot(formData)
      setFormData((prev) => ({
        ...prev,
        screenshot: response.url,
      }))
      setPreviewUrl(getMediaUrl(response.url))
      setErrors((prev) => ({
        ...prev,
        screenshot: "",
      }))
    } catch (error) {
      console.error("Error uploading screenshot:", error)
      setErrors((prev) => ({
        ...prev,
        screenshot: "Failed to upload screenshot. Please try again.",
      }))
    } finally {
      setUploading(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) {
      newErrors.amount = "Please enter a valid payment amount"
    }

    if (!formData.dateOfPayment) {
      newErrors.dateOfPayment = "Please select the payment date"
    } else {
      const paymentDate = new Date(formData.dateOfPayment)
      const today = new Date()
      if (paymentDate > today) {
        newErrors.dateOfPayment = "Payment date cannot be in the future"
      }
    }

    if (!formData.transactionId.trim()) {
      newErrors.transactionId = "Please enter the transaction ID"
    }

    if (!formData.screenshot) {
      newErrors.screenshot = "Please upload a payment screenshot"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit({
        amount: Number(formData.amount),
        dateOfPayment: formData.dateOfPayment,
        transactionId: formData.transactionId.trim(),
        screenshot: formData.screenshot,
        additionalInfo: formData.additionalInfo.trim(),
      })
    }
  }

  const removeScreenshot = () => {
    setFormData((prev) => ({
      ...prev,
      screenshot: null,
    }))
    setPreviewUrl(null)
    setErrors((prev) => ({
      ...prev,
      screenshot: "",
    }))
  }

  return (
    <div style={{ backgroundColor: 'var(--color-info-bg-light)', border: `var(--border-1) solid var(--color-info-bg)`, borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-6)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-4)' }}>
        <div style={{ width: 'var(--avatar-sm)', height: 'var(--avatar-sm)', backgroundColor: 'var(--color-info-bg)', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg style={{ width: 'var(--icon-md)', height: 'var(--icon-md)', color: 'var(--color-primary)' }} fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zM14 6a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h8zM6 8a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4a2 2 0 012-2h2z" />
          </svg>
        </div>
        <div>
          <h4 style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-base)' }}>Submit Payment Information</h4>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-0-5)' }}>Upload your payment details and screenshot for verification</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-4)' }}>
          {/* Payment Amount */}
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>
              Payment Amount <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} step="0.01" min="0" style={{ width: '100%', padding: 'var(--spacing-2) var(--spacing-3)', border: `var(--border-1) solid ${errors.amount ? 'var(--color-danger)' : 'var(--color-border-input)'}`, borderRadius: 'var(--radius-lg)', fontSize: 'var(--font-size-base)', outline: 'none', transition: 'var(--transition-colors)' }} placeholder="Enter payment amount" onFocus={(e) => e.target.style.boxShadow = 'var(--input-focus-ring)'}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
            />
            {errors.amount && <p style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-xs)', marginTop: 'var(--spacing-1)' }}>{errors.amount}</p>}
          </div>

          {/* Date of Payment */}
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>
              Date of Payment <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <input type="date" name="dateOfPayment" value={formData.dateOfPayment} onChange={handleInputChange} max={new Date().toISOString().split("T")[0]} style={{ width: '100%', padding: 'var(--spacing-2) var(--spacing-3)', border: `var(--border-1) solid ${errors.dateOfPayment ? 'var(--color-danger)' : 'var(--color-border-input)'}`, borderRadius: 'var(--radius-lg)', fontSize: 'var(--font-size-base)', outline: 'none', transition: 'var(--transition-colors)' }} onFocus={(e) => e.target.style.boxShadow = 'var(--input-focus-ring)'}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
            />
            {errors.dateOfPayment && <p style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-xs)', marginTop: 'var(--spacing-1)' }}>{errors.dateOfPayment}</p>}
          </div>
        </div>

        {/* Transaction ID */}
        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>
            Transaction ID <span style={{ color: 'var(--color-danger)' }}>*</span>
          </label>
          <input type="text" name="transactionId" value={formData.transactionId} onChange={handleInputChange} style={{ width: '100%', padding: 'var(--spacing-2) var(--spacing-3)', border: `var(--border-1) solid ${errors.transactionId ? 'var(--color-danger)' : 'var(--color-border-input)'}`, borderRadius: 'var(--radius-lg)', fontSize: 'var(--font-size-base)', outline: 'none', transition: 'var(--transition-colors)' }} placeholder="Enter transaction ID" onFocus={(e) => e.target.style.boxShadow = 'var(--input-focus-ring)'}
            onBlur={(e) => e.target.style.boxShadow = 'none'}
          />
          {errors.transactionId && <p style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-xs)', marginTop: 'var(--spacing-1)' }}>{errors.transactionId}</p>}
        </div>

        {/* Payment Screenshot */}
        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>
            Payment Screenshot <span style={{ color: 'var(--color-danger)' }}>*</span>
          </label>

          {!formData.screenshot ? (
            <div style={{ marginTop: 'var(--spacing-1)', display: 'flex', justifyContent: 'center', padding: 'var(--spacing-6) var(--spacing-6) var(--spacing-6)', border: `var(--border-2) dashed var(--color-border-input)`, borderRadius: 'var(--radius-lg)', transition: 'var(--transition-colors)', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-border-dark)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border-input)'}>
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)' }}>
                <svg style={{ margin: '0 auto', height: 'var(--icon-3xl)', width: 'var(--icon-3xl)', color: 'var(--color-text-placeholder)' }} stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div style={{ display: 'flex', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', justifyContent: 'center' }}>
                  <label htmlFor="screenshot-upload" style={{ position: 'relative', cursor: 'pointer', backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-primary)' }}>
                    <span>Upload a file</span>
                    <input id="screenshot-upload" name="screenshot-upload" type="file" style={{ position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: '0' }} accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" onChange={handleFileChange} disabled={uploading} />
                  </label>
                  <p style={{ paddingLeft: 'var(--spacing-1)' }}>or drag and drop</p>
                </div>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-light)' }}>JPEG, PNG, GIF, WebP up to 5MB</p>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 'var(--spacing-1)', border: `var(--border-1) solid var(--color-border-input)`, borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                  <div style={{ width: 'var(--avatar-md)', height: 'var(--avatar-md)', backgroundColor: 'var(--color-success-bg)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg style={{ width: 'var(--icon-lg)', height: 'var(--icon-lg)', color: 'var(--color-success)' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>Payment screenshot uploaded</p>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-light)' }}>Click to view or change</p>
                  </div>
                </div>
                <Button type="button" onClick={removeScreenshot} variant="ghost" size="small">
                  Remove
                </Button>
              </div>
            </div>
          )}

          {uploading && (
            <div style={{ marginTop: 'var(--spacing-2)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
              <div style={{ width: 'var(--icon-md)', height: 'var(--icon-md)', border: `var(--border-2) solid var(--color-primary)`, borderTopColor: 'transparent', borderRadius: 'var(--radius-full)', animation: 'spin 1s linear infinite' }}></div>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Uploading...</span>
            </div>
          )}

          {errors.screenshot && <p style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-xs)', marginTop: 'var(--spacing-1)' }}>{errors.screenshot}</p>}
        </div>

        {/* Additional Information */}
        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>
            Additional Information <span style={{ color: 'var(--color-text-light)' }}>(Optional)</span>
          </label>
          <textarea name="additionalInfo" value={formData.additionalInfo} onChange={handleInputChange} rows={3} style={{ width: '100%', padding: 'var(--spacing-2) var(--spacing-3)', border: `var(--border-1) solid var(--color-border-input)`, borderRadius: 'var(--radius-lg)', fontSize: 'var(--font-size-base)', outline: 'none', transition: 'var(--transition-colors)', resize: 'vertical' }} placeholder="Any additional notes about the payment..." onFocus={(e) => e.target.style.boxShadow = 'var(--input-focus-ring)'}
            onBlur={(e) => e.target.style.boxShadow = 'none'}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-3)', paddingTop: 'var(--spacing-4)' }}>
          <Button type="button" onClick={onCancel} variant="secondary" size="medium">
            Cancel
          </Button>
          <Button type="submit" disabled={uploading} variant="primary" size="medium" isLoading={uploading}>
            {uploading ? "Processing..." : "Submit Payment Info"}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default PaymentInfoForm
