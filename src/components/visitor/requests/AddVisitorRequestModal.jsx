import React, { useState } from "react"
import { FaExclamationTriangle, FaPlus, FaUserAlt, FaUpload, FaFileAlt, FaCheckCircle } from "react-icons/fa"
import Modal from "../../common/Modal"
import { uploadApi } from "../../../services/uploadApi"
import Button from "../../common/Button"

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
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
        {error && (
          <div style={{ backgroundColor: 'var(--color-danger-bg-light)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'flex-start' }}>
            <FaExclamationTriangle style={{ color: 'var(--color-danger)', marginTop: 'var(--spacing-1)', marginRight: 'var(--spacing-3)', flexShrink: 0 }} />
            <p style={{ color: 'var(--color-danger-text)' }}>{error}</p>
          </div>
        )}

        {/* Visitor Selection */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-3)' }}>
            <h3 style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)' }}>Select Visitors</h3>
            <Button type="button" onClick={handleAddProfile} variant="ghost" size="small" icon={<FaPlus size={12} />}>
              Add New Profile
            </Button>
          </div>

          {visitorProfiles.length === 0 ? (
            <div style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>No visitor profiles found. Add some profiles first.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 'var(--spacing-3)', maxHeight: '240px', overflowY: 'auto', padding: 'var(--spacing-2)' }}>
              {visitorProfiles.map((visitor) => (
                <div key={visitor._id} onClick={() => handleVisitorSelection(visitor._id)}
                  style={{
                    border: `var(--border-1) solid ${formData.selectedVisitorIds.includes(visitor._id) ? 'var(--color-primary)' : 'var(--color-border-input)'}`,
                    backgroundColor: formData.selectedVisitorIds.includes(visitor._id) ? 'var(--color-primary-bg)' : 'transparent',
                    padding: 'var(--spacing-3)',
                    borderRadius: 'var(--radius-lg)',
                    cursor: 'pointer',
                    transition: 'var(--transition-colors)'
                  }}
                  onMouseEnter={(e) => {
                    if (!formData.selectedVisitorIds.includes(visitor._id)) {
                      e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!formData.selectedVisitorIds.includes(visitor._id)) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <div style={{ width: 'var(--avatar-sm)', height: 'var(--avatar-sm)', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 'var(--spacing-3)', backgroundColor: formData.selectedVisitorIds.includes(visitor._id) ? 'var(--color-primary)' : 'var(--color-bg-muted)', color: formData.selectedVisitorIds.includes(visitor._id) ? 'var(--color-white)' : 'var(--color-text-muted)' }}>
                      <FaUserAlt size={12} />
                    </div>
                    <div>
                      <h4 style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>{visitor.name}</h4>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-4)' }}>
          <div>
            <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>From Date</label>
            <input type="date" name="fromDate" style={{ width: '100%', padding: 'var(--input-padding)', border: 'var(--border-1) solid var(--input-border)', borderRadius: 'var(--input-radius)', outline: 'none', transition: 'var(--transition-colors)' }} onFocus={(e) => {
              e.target.style.borderColor = 'var(--input-border-focus)';
              e.target.style.boxShadow = 'var(--input-focus-ring)';
            }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--input-border)';
                e.target.style.boxShadow = 'none';
              }}
              value={formData.fromDate}
              onChange={handleChange}
              min={minDateString}
              required
            />
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>Must be at least 2 days from today</p>
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>To Date</label>
            <input type="date" name="toDate" style={{ width: '100%', padding: 'var(--input-padding)', border: 'var(--border-1) solid var(--input-border)', borderRadius: 'var(--input-radius)', outline: 'none', transition: 'var(--transition-colors)' }} onFocus={(e) => {
              e.target.style.borderColor = 'var(--input-border-focus)';
              e.target.style.boxShadow = 'var(--input-focus-ring)';
            }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--input-border)';
                e.target.style.boxShadow = 'none';
              }}
              value={formData.toDate}
              onChange={handleChange}
              min={formData.fromDate || minDateString}
              required
            />
          </div>
        </div>

        {/* Reason for Visit */}
        <div>
          <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Reason for Visit</label>
          <textarea name="reason" rows="4" style={{ width: '100%', padding: 'var(--input-padding)', border: 'var(--border-1) solid var(--input-border)', borderRadius: 'var(--input-radius)', outline: 'none', transition: 'var(--transition-colors)', resize: 'none' }} onFocus={(e) => {
            e.target.style.borderColor = 'var(--input-border-focus)';
            e.target.style.boxShadow = 'var(--input-focus-ring)';
          }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--input-border)';
              e.target.style.boxShadow = 'none';
            }}
            value={formData.reason}
            onChange={handleChange}
            placeholder="Please provide details about the purpose of the visit"
            required
          />
        </div>

        {/* H2 Form Upload */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-3)' }}>
            <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
              H2 Form Upload <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <a href="https://hostel.iiti.ac.in/docs/H2%20Form.pdf" target="_blank" rel="noopener noreferrer" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', textDecoration: 'underline', transition: 'var(--transition-colors)' }} onMouseEnter={(e) => e.target.style.color = 'var(--color-primary-hover)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--color-primary)'}
            >
              Download H2 Form
            </a>
          </div>

          {!h2FormUploaded ? (
            <div style={{ border: 'var(--border-2) dashed var(--color-border-input)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-6)' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ margin: '0 auto var(--spacing-3)', width: '48px', height: '48px', backgroundColor: 'var(--color-primary-bg)', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaFileAlt style={{ width: 'var(--icon-xl)', height: 'var(--icon-xl)', color: 'var(--color-primary)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>Upload filled H2 form</p>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>PDF only (max 5MB)</p>
                </div>

                {h2FormFile ? (
                  <div style={{ marginTop: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                    <div style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-lg)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-2)' }}>
                        <FaFileAlt style={{ color: 'var(--color-text-tertiary)' }} />
                        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{h2FormFile.name}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--spacing-3)' }}>
                      <Button type="button" onClick={removeH2Form} variant="secondary" size="small">
                        Remove
                      </Button>
                      <Button type="button" onClick={uploadH2Form} disabled={h2FormUploading} variant="primary" size="small" icon={h2FormUploading ? null : <FaUpload size={12} />} isLoading={h2FormUploading}>
                        {h2FormUploading ? "Uploading..." : "Upload"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: 'var(--spacing-4)' }}>
                    <label style={{ display: 'inline-block' }}>
                      <input type="file" style={{ display: 'none' }} accept=".pdf" onChange={handleH2FormFileChange} />
                      <span style={{ padding: 'var(--spacing-2) var(--spacing-4)', backgroundColor: 'var(--button-primary-bg)', color: 'var(--color-white)', fontSize: 'var(--font-size-sm)', borderRadius: 'var(--radius-lg)', cursor: 'pointer', display: 'inline-block', transition: 'var(--transition-colors)' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--button-primary-hover)'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--button-primary-bg)'}
                      >
                        Select File
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ backgroundColor: 'var(--color-success-bg-light)', border: 'var(--border-1) solid var(--color-success-bg)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: 'var(--avatar-sm)', height: 'var(--avatar-sm)', backgroundColor: 'var(--color-success-bg)', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 'var(--spacing-3)' }}>
                  <FaCheckCircle style={{ width: 'var(--icon-lg)', height: 'var(--icon-lg)', color: 'var(--color-success)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: 'var(--color-success-text)', fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)' }}>H2 Form Uploaded Successfully</p>
                  <p style={{ color: 'var(--color-success)', fontSize: 'var(--font-size-xs)' }}>Ready to submit visitor request</p>
                </div>
                <Button type="button" onClick={removeH2Form} variant="ghost" size="small">
                  Change
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Submit Section */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--spacing-4)', borderTop: 'var(--border-1) solid var(--color-border-light)', gap: 'var(--spacing-3)' }}>
          <Button type="button" onClick={onClose} variant="secondary" size="medium">
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="medium" disabled={loading || visitorProfiles.length === 0 || !h2FormUploaded} isLoading={loading}>
            {loading ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default AddVisitorRequestModal
