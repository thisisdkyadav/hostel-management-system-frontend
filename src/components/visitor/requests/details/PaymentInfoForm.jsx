import React, { useState } from "react"
import { uploadApi } from "../../../../services/uploadApi"
import { getMediaUrl } from "../../../../utils/mediaUtils"

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
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-[#1360AB]" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zM14 6a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h8zM6 8a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4a2 2 0 012-2h2z" />
          </svg>
        </div>
        <div>
          <h4 className="font-semibold text-gray-800">Submit Payment Information</h4>
          <p className="text-sm text-gray-600">Upload your payment details and screenshot for verification</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Payment Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.amount ? "border-red-500" : "border-gray-300"}`}
              placeholder="Enter payment amount"
            />
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
          </div>

          {/* Date of Payment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Payment <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="dateOfPayment"
              value={formData.dateOfPayment}
              onChange={handleInputChange}
              max={new Date().toISOString().split("T")[0]}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.dateOfPayment ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.dateOfPayment && <p className="text-red-500 text-xs mt-1">{errors.dateOfPayment}</p>}
          </div>
        </div>

        {/* Transaction ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Transaction ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="transactionId"
            value={formData.transactionId}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.transactionId ? "border-red-500" : "border-gray-300"}`}
            placeholder="Enter transaction ID"
          />
          {errors.transactionId && <p className="text-red-500 text-xs mt-1">{errors.transactionId}</p>}
        </div>

        {/* Payment Screenshot */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Screenshot <span className="text-red-500">*</span>
          </label>

          {!formData.screenshot ? (
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="screenshot-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-[#1360AB] hover:text-blue-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>Upload a file</span>
                    <input id="screenshot-upload" name="screenshot-upload" type="file" className="sr-only" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" onChange={handleFileChange} disabled={uploading} />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">JPEG, PNG, GIF, WebP up to 5MB</p>
              </div>
            </div>
          ) : (
            <div className="mt-1 border border-gray-300 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Payment screenshot uploaded</p>
                    <p className="text-xs text-gray-500">Click to view or change</p>
                  </div>
                </div>
                <button type="button" onClick={removeScreenshot} className="text-red-600 hover:text-red-800 text-sm font-medium">
                  Remove
                </button>
              </div>
            </div>
          )}

          {uploading && (
            <div className="mt-2 flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-gray-600">Uploading...</span>
            </div>
          )}

          {errors.screenshot && <p className="text-red-500 text-xs mt-1">{errors.screenshot}</p>}
        </div>

        {/* Additional Information */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Information <span className="text-gray-500">(Optional)</span>
          </label>
          <textarea name="additionalInfo" value={formData.additionalInfo} onChange={handleInputChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Any additional notes about the payment..." />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={uploading} className="px-4 py-2 bg-[#1360AB] text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2">
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </>
            ) : (
              <span>Submit Payment Info</span>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default PaymentInfoForm
