import React, { useState } from "react"
import { FaExclamationTriangle, FaPlus, FaUserAlt, FaUpload, FaFileAlt, FaCheckCircle } from "react-icons/fa"
import Modal from "../../common/Modal"
import { uploadApi } from "../../../services/uploadApi"

const AddVisitorRequestModal = ({ isOpen, onClose, onSubmit, visitorProfiles, handleAddProfile }) => {
  const [formData, setFormData] = useState({
    selectedVisitorIds: [],
    reason: "",
    fromDate: "",
    toDate: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [h2FormFile, setH2FormFile] = useState(null)
  const [h2FormUploading, setH2FormUploading] = useState(false)
  const [h2FormUploaded, setH2FormUploaded] = useState(false)
  const [h2FormUrl, setH2FormUrl] = useState("")

  const today = new Date()
  const minDate = new Date(today)
  minDate.setDate(today.getDate() + 1)
  const minDateString = minDate.toISOString().split("T")[0]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleVisitorSelection = (visitorId) => {
    setFormData((prev) => {
      const currentSelected = [...prev.selectedVisitorIds]

      if (currentSelected.includes(visitorId)) {
        return {
          ...prev,
          selectedVisitorIds: currentSelected.filter((id) => id !== visitorId),
        }
      } else {
        return {
          ...prev,
          selectedVisitorIds: [...currentSelected, visitorId],
        }
      }
    })
  }

  const handleH2FormFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type (PDF only)
      const validTypes = ["application/pdf"]
      if (!validTypes.includes(file.type)) {
        setError("Please upload a PDF file for the H2 form")
        return
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        setError(`H2 form file size exceeds 5MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`)
        return
      }

      setH2FormFile(file)
      setError(null)
    }
  }

  const uploadH2Form = async () => {
    if (!h2FormFile) return

    try {
      setH2FormUploading(true)
      setError(null)

      const formData = new FormData()
      formData.append("h2Form", h2FormFile)

      const response = await uploadApi.uploadH2Form(formData)
      setH2FormUrl(response.url)
      setH2FormUploaded(true)
    } catch (err) {
      setError(err.message || "Failed to upload H2 form. Please try again.")
    } finally {
      setH2FormUploading(false)
    }
  }

  const removeH2Form = () => {
    setH2FormFile(null)
    setH2FormUploaded(false)
    setH2FormUrl("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Basic validations
    if (formData.selectedVisitorIds.length === 0) {
      setError("Please select at least one visitor")
      return
    }

    if (!formData.fromDate || !formData.toDate) {
      setError("Please select both from and to dates")
      return
    }

    if (!h2FormUploaded) {
      setError("Please upload the H2 form before submitting the request")
      return
    }

    const fromDate = new Date(formData.fromDate)
    const toDate = new Date(formData.toDate)

    if (fromDate < minDate) {
      setError("Please select a from date that is at least 2 days from today")
      return
    }

    if (toDate < fromDate) {
      setError("To date cannot be earlier than from date")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const selectedVisitors = visitorProfiles.filter((profile) => formData.selectedVisitorIds.includes(profile._id))

      const requestData = {
        visitors: selectedVisitors,
        reason: formData.reason,
        fromDate: formData.fromDate,
        toDate: formData.toDate,
        h2FormUrl: h2FormUrl,
      }

      const success = await onSubmit(requestData)
      if (success) {
        setFormData({
          selectedVisitorIds: [],
          reason: "",
          fromDate: "",
          toDate: "",
        })
        removeH2Form()
        onClose()
      } else {
        setError("Failed to submit visitor request. Please try again.")
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <Modal title="Create Visitor Request" onClose={onClose} width={650}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 p-4 rounded-lg flex items-start">
            <FaExclamationTriangle className="text-red-500 mt-1 mr-3 flex-shrink-0" />
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Visitor Selection */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-gray-700">Select Visitors</h3>
            <button type="button" onClick={handleAddProfile} className="text-sm text-[#1360AB] hover:text-blue-700 flex items-center">
              <FaPlus size={12} className="mr-1" /> Add New Profile
            </button>
          </div>

          {visitorProfiles.length === 0 ? (
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-gray-500 text-sm">No visitor profiles found. Add some profiles first.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2">
              {visitorProfiles.map((visitor) => (
                <div key={visitor._id} onClick={() => handleVisitorSelection(visitor._id)} className={`border p-3 rounded-lg cursor-pointer transition-colors ${formData.selectedVisitorIds.includes(visitor._id) ? "border-[#1360AB] bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}>
                  <div className="flex items-start">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${formData.selectedVisitorIds.includes(visitor._id) ? "bg-[#1360AB] text-white" : "bg-gray-200 text-gray-500"}`}>
                      <FaUserAlt size={12} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">{visitor.name}</h4>
                      <div className="text-xs text-gray-500">
                        <p>{visitor.relation}</p>
                        <p>{visitor.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Visit Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">From Date</label>
            <input type="date" name="fromDate" className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#1360AB] focus:ring-1 focus:ring-[#1360AB] outline-none transition" value={formData.fromDate} onChange={handleChange} min={minDateString} required />
            <p className="text-xs text-gray-500 mt-1">Must be at least 2 days from today</p>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">To Date</label>
            <input type="date" name="toDate" className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#1360AB] focus:ring-1 focus:ring-[#1360AB] outline-none transition" value={formData.toDate} onChange={handleChange} min={formData.fromDate || minDateString} required />
          </div>
        </div>

        {/* Reason for Visit */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">Reason for Visit</label>
          <textarea
            name="reason"
            rows="4"
            className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#1360AB] focus:ring-1 focus:ring-[#1360AB] outline-none transition resize-none"
            value={formData.reason}
            onChange={handleChange}
            placeholder="Please provide details about the purpose of the visit"
            required
          />
        </div>

        {/* H2 Form Upload */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-gray-700 text-sm font-medium">
              H2 Form Upload <span className="text-red-500">*</span>
            </label>
            <a href="https://hostel.iiti.ac.in/docs/H2%20Form.pdf" target="_blank" rel="noopener noreferrer" className="text-xs text-[#1360AB] hover:text-blue-700 underline">
              Download H2 Form
            </a>
          </div>

          {!h2FormUploaded ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                  <FaFileAlt className="w-6 h-6 text-[#1360AB]" />
                </div>
                <div className="space-y-2">
                  <p className="text-gray-700 text-sm">Upload filled H2 form</p>
                  <p className="text-gray-500 text-xs">PDF only (max 5MB)</p>
                </div>

                {h2FormFile ? (
                  <div className="mt-4 space-y-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-center space-x-2">
                        <FaFileAlt className="text-gray-600" />
                        <span className="text-sm text-gray-700">{h2FormFile.name}</span>
                      </div>
                    </div>
                    <div className="flex justify-center space-x-3">
                      <button type="button" onClick={removeH2Form} className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors">
                        Remove
                      </button>
                      <button type="button" onClick={uploadH2Form} disabled={h2FormUploading} className="px-4 py-2 bg-[#1360AB] text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center">
                        {h2FormUploading ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <FaUpload className="mr-2" size={12} />
                            Upload
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4">
                    <label className="inline-block">
                      <input type="file" className="hidden" accept=".pdf" onChange={handleH2FormFileChange} />
                      <span className="px-4 py-2 bg-[#1360AB] text-white text-sm rounded-lg hover:bg-blue-700 cursor-pointer inline-block transition-colors">Select File</span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <FaCheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-green-800 font-medium text-sm">H2 Form Uploaded Successfully</p>
                  <p className="text-green-600 text-xs">Ready to submit visitor request</p>
                </div>
                <button type="button" onClick={removeH2Form} className="text-green-600 hover:text-green-800 text-xs underline">
                  Change
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Submit Section */}
        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors mr-3">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 bg-[#1360AB] text-white rounded-lg hover:bg-blue-700 transition-colors" disabled={loading || visitorProfiles.length === 0 || !h2FormUploaded}>
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default AddVisitorRequestModal
