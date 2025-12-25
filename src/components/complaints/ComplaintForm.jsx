import React, { useState, useEffect } from "react"
import { FaBuilding, FaClipboardList, FaExclamationTriangle } from "react-icons/fa"
import { useAuth } from "../../contexts/AuthProvider"
import { complaintApi } from "../../services/complaintApi"
import Modal from "../common/Modal"
import Button from "../common/Button"

const ComplaintForm = ({ isOpen, setIsOpen }) => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    attachments: "",
    priority: "",
    location: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const complaintData = {
        userId: user._id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        attachments: formData.attachments,
        priority: formData.priority,
        location: formData.location,
      }

      await complaintApi.createComplaint(complaintData)
      alert("Complaint submitted successfully!")
      setIsOpen(false)
      setFormData({
        title: "",
        description: "",
        category: "",
        attachments: "",
        priority: "",
        location: "",
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Submit New Complaint" onClose={() => setIsOpen(false)} width={650}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-5)' }}>
        {error && (
          <div style={{ backgroundColor: 'var(--color-danger-bg)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'flex-start' }}>
            <FaExclamationTriangle style={{ color: 'var(--color-danger)', marginTop: 'var(--spacing-1)', marginRight: 'var(--spacing-3)', flexShrink: 0 }} />
            <p style={{ color: 'var(--color-danger-text)' }}>{error}</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          <div>
            <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Complaint Title</label>
            <input type="text" name="title" placeholder="Brief summary of the issue" style={{ width: '100%', padding: 'var(--input-padding)', border: `var(--border-1) solid var(--input-border)`, borderRadius: 'var(--input-radius)', outline: 'none', transition: 'var(--transition-all)', backgroundColor: 'var(--input-bg)' }} onFocus={(e) => {
              e.target.style.boxShadow = 'var(--input-focus-ring)';
              e.target.style.borderColor = 'var(--input-border-focus)';
            }}
              onBlur={(e) => {
                e.target.style.boxShadow = 'none';
                e.target.style.borderColor = 'var(--input-border)';
              }}
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Description</label>
            <textarea name="description" placeholder="Please provide details about the issue..." style={{ width: '100%', padding: 'var(--input-padding)', border: `var(--border-1) solid var(--input-border)`, borderRadius: 'var(--input-radius)', outline: 'none', transition: 'var(--transition-all)', resize: 'none', height: '112px', backgroundColor: 'var(--input-bg)' }} onFocus={(e) => {
              e.target.style.boxShadow = 'var(--input-focus-ring)';
              e.target.style.borderColor = 'var(--input-border-focus)';
            }}
              onBlur={(e) => {
                e.target.style.boxShadow = 'none';
                e.target.style.borderColor = 'var(--input-border)';
              }}
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          {/* location only for warden, associate warden, hostel supervisor, admin */}
          {["Warden", "Associate Warden", "Hostel Supervisor", "Admin"].includes(user?.role) && (
            <div>
              <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Location</label>
              <input type="text" name="location" placeholder="Location" style={{ width: '100%', padding: 'var(--input-padding)', border: `var(--border-1) solid var(--input-border)`, borderRadius: 'var(--input-radius)', outline: 'none', transition: 'var(--transition-all)', backgroundColor: 'var(--input-bg)' }} onFocus={(e) => {
                e.target.style.boxShadow = 'var(--input-focus-ring)';
                e.target.style.borderColor = 'var(--input-border-focus)';
              }}
                onBlur={(e) => {
                  e.target.style.boxShadow = 'none';
                  e.target.style.borderColor = 'var(--input-border)';
                }}
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-4)' }} className="sm:grid-cols-2">
            <div>
              <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Category</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 'var(--spacing-3)', top: 'var(--spacing-3)', color: 'var(--color-text-placeholder)' }}>
                  <FaClipboardList />
                </div>
                <select name="category" style={{ width: '100%', padding: 'var(--input-padding)', paddingLeft: 'var(--spacing-10)', border: `var(--border-1) solid var(--input-border)`, borderRadius: 'var(--input-radius)', outline: 'none', transition: 'var(--transition-all)', backgroundColor: 'var(--input-bg)' }} onFocus={(e) => {
                  e.target.style.boxShadow = 'var(--input-focus-ring)';
                  e.target.style.borderColor = 'var(--input-border-focus)';
                }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = 'none';
                    e.target.style.borderColor = 'var(--input-border)';
                  }}
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    Select Category
                  </option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Internet">Internet</option>
                  <option value="Cleanliness">Cleanliness</option>
                  <option value="Civil">Civil</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Priority</label>
              <select name="priority" style={{ width: '100%', padding: 'var(--input-padding)', border: `var(--border-1) solid var(--input-border)`, borderRadius: 'var(--input-radius)', outline: 'none', transition: 'var(--transition-all)', backgroundColor: 'var(--input-bg)' }} onFocus={(e) => {
                e.target.style.boxShadow = 'var(--input-focus-ring)';
                e.target.style.borderColor = 'var(--input-border-focus)';
              }}
                onBlur={(e) => {
                  e.target.style.boxShadow = 'none';
                  e.target.style.borderColor = 'var(--input-border)';
                }}
                value={formData.priority}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Select Priority
                </option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', paddingTop: 'var(--spacing-5)', marginTop: 'var(--spacing-6)', borderTop: `var(--border-1) solid var(--color-border-light)`, gap: 'var(--spacing-3)' }}>
          <Button type="button" onClick={() => setIsOpen(false)} variant="secondary" size="medium">
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="medium" isLoading={loading} disabled={loading}>
            {loading ? "Submitting..." : "Submit Complaint"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default ComplaintForm
