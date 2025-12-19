import React, { useState, useEffect } from "react"
import { FaExclamationTriangle } from "react-icons/fa"
import Modal from "../../common/Modal"
import { visitorApi } from "../../../services/visitorApi"

const EditVisitorRequestModal = ({ isOpen, onClose, request, onRefresh }) => {
  const [formData, setFormData] = useState({
    reason: "",
    fromDate: "",
    toDate: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Calculate minimum selectable date (today + 2 days)
  const today = new Date()
  const minDate = new Date(today)
  minDate.setDate(today.getDate() + 2)
  const minDateString = minDate.toISOString().split("T")[0]

  useEffect(() => {
    if (request) {
      // Format the dates for the date input
      const fromDate = new Date(request.fromDate)
      const toDate = new Date(request.toDate)

      setFormData({
        reason: request.reason || "",
        fromDate: fromDate.toISOString().split("T")[0],
        toDate: toDate.toISOString().split("T")[0],
      })
    }
  }, [request])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Basic validations
    if (!formData.fromDate || !formData.toDate) {
      setError("Please select both from and to dates")
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
      const updatedRequestData = {
        reason: formData.reason,
        fromDate: formData.fromDate,
        toDate: formData.toDate,
      }

      await visitorApi.updateVisitorRequest(request._id, updatedRequestData)
      onRefresh()
      onClose()
    } catch (err) {
      setError(err.message || "An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !request) return null

  return (
    <Modal title="Edit Visitor Request" onClose={onClose} width={600}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
        {error && (
          <div style={{ backgroundColor: 'var(--color-danger-bg-light)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'flex-start' }}>
            <FaExclamationTriangle style={{ color: 'var(--color-danger)', marginTop: 'var(--spacing-1)', marginRight: 'var(--spacing-3)', flexShrink: 0 }} />
            <p style={{ color: 'var(--color-danger-text)' }}>{error}</p>
          </div>
        )}

        <div style={{ backgroundColor: 'var(--color-info-bg-light)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-info-text)' }}>
            <strong>Note:</strong> You can only modify the dates and reason for your visit. If you need to change visitors, please cancel this request and create a new one.
          </p>
        </div>

        {/* Visitor Information (Non-editable) */}
        <div>
          <h3 style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-3)' }}>Visitor Information</h3>
          <div style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)' }}>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              <span style={{ fontWeight: 'var(--font-weight-medium)' }}>Visitors:</span> {request.visitors?.map((v) => v.name).join(", ")}
            </p>
          </div>
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

        {/* Submit Section */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--spacing-4)', borderTop: 'var(--border-1) solid var(--color-border-light)' }}>
          <button type="button" onClick={onClose} style={{ padding: 'var(--spacing-2) var(--spacing-4)', backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-text-secondary)', borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer', transition: 'var(--transition-colors)', marginRight: 'var(--spacing-3)' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-hover)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-bg-muted)'}
          >
            Cancel
          </button>
          <button type="submit" style={{ padding: 'var(--spacing-2) var(--spacing-4)', backgroundColor: loading ? 'var(--color-primary-muted)' : 'var(--button-primary-bg)', color: 'var(--color-white)', borderRadius: 'var(--radius-lg)', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', transition: 'var(--transition-colors)', opacity: loading ? 'var(--opacity-disabled)' : '1' }} onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = 'var(--button-primary-hover)')}
            onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = 'var(--button-primary-bg)')}
            disabled={loading}
          >
            {loading ? "Saving..." : "Update Request"}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default EditVisitorRequestModal
