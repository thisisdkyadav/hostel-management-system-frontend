import React, { useState } from "react"
import { FiUser, FiMail, FiPhone, FiLock, FiCalendar, FiTag } from "react-icons/fi"
import { adminApi } from "../../../services/apiService"
import Modal from "../../common/Modal"

const AddWardenModal = ({ show, staffType = "warden", onClose, onAdd }) => {
  const staffTitle = staffType === "warden" ? "Warden" : staffType === "associateWarden" ? "Associate Warden" : "Hostel Supervisor"

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    joinDate: "",
    category: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = staffType === "warden" ? await adminApi.addWarden(formData) : staffType === "associateWarden" ? await adminApi.addAssociateWarden(formData) : await adminApi.addHostelSupervisor(formData)

      if (!response) {
        alert(`Failed to add ${staffTitle.toLowerCase()}. Please try again.`)
        return
      }
      onAdd()
      alert(`${staffTitle} added successfully!`)

      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        joinDate: "",
        category: "",
      })

      onClose()
    } catch (error) {
      console.error(`Error adding ${staffTitle.toLowerCase()}:`, error)
      alert(`Failed to add ${staffTitle.toLowerCase()}. Please try again.`)
    }
  }

  if (!show) return null

  return (
    <Modal title={`Add New ${staffTitle}`} onClose={onClose} width={500}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-5)' }}>
        <div style={{ backgroundColor: 'var(--color-primary-bg)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--spacing-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-primary-dark)' }}>
            <FiUser style={{ marginRight: 'var(--spacing-2)' }} />
            <h4 style={{ fontWeight: 'var(--font-weight-medium)' }}>Basic Information</h4>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          <div>
            <label style={{ display: 'block', color: 'var(--color-text-body)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Name</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 'var(--spacing-3)', top: 'var(--spacing-3)', color: 'var(--color-text-muted)' }}>
                <FiUser />
              </div>
              <input type="text" name="name" value={formData.name} onChange={handleChange} style={{ width: '100%', padding: 'var(--spacing-3)', paddingLeft: 'var(--spacing-10)', border: 'var(--border-1) solid var(--color-border-input)', borderRadius: 'var(--radius-lg)', outline: 'none', transition: 'var(--transition-all)' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--color-primary)'; }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--color-border-input)'; }} placeholder="Dr. Full Name" required />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--color-text-body)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Email</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 'var(--spacing-3)', top: 'var(--spacing-3)', color: 'var(--color-text-muted)' }}>
                <FiMail />
              </div>
              <input type="email" name="email" value={formData.email} onChange={handleChange} style={{ width: '100%', padding: 'var(--spacing-3)', paddingLeft: 'var(--spacing-10)', border: 'var(--border-1) solid var(--color-border-input)', borderRadius: 'var(--radius-lg)', outline: 'none', transition: 'var(--transition-all)' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--color-primary)'; }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--color-border-input)'; }} placeholder="email@iiti.ac.in" required />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--color-text-body)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 'var(--spacing-3)', top: 'var(--spacing-3)', color: 'var(--color-text-muted)' }}>
                <FiLock />
              </div>
              <input type="password" name="password" value={formData.password} onChange={handleChange} style={{ width: '100%', padding: 'var(--spacing-3)', paddingLeft: 'var(--spacing-10)', border: 'var(--border-1) solid var(--color-border-input)', borderRadius: 'var(--radius-lg)', outline: 'none', transition: 'var(--transition-all)' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--color-primary)'; }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--color-border-input)'; }} placeholder="Enter password" required />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--color-text-body)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Phone</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 'var(--spacing-3)', top: 'var(--spacing-3)', color: 'var(--color-text-muted)' }}>
                <FiPhone />
              </div>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} style={{ width: '100%', padding: 'var(--spacing-3)', paddingLeft: 'var(--spacing-10)', border: 'var(--border-1) solid var(--color-border-input)', borderRadius: 'var(--radius-lg)', outline: 'none', transition: 'var(--transition-all)' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--color-primary)'; }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--color-border-input)'; }} placeholder="+91 9876543210" />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--color-text-body)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Category</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 'var(--spacing-3)', top: 'var(--spacing-3)', color: 'var(--color-text-muted)' }}>
                <FiTag />
              </div>
              <input type="text" name="category" value={formData.category} onChange={handleChange} style={{ width: '100%', padding: 'var(--spacing-3)', paddingLeft: 'var(--spacing-10)', border: 'var(--border-1) solid var(--color-border-input)', borderRadius: 'var(--radius-lg)', outline: 'none', transition: 'var(--transition-all)' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--color-primary)'; }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--color-border-input)'; }} placeholder="e.g., Senior, Junior" />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--color-text-body)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Join Date</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 'var(--spacing-3)', top: 'var(--spacing-3)', color: 'var(--color-text-muted)' }}>
                <FiCalendar />
              </div>
              <input type="date" name="joinDate" value={formData.joinDate} onChange={handleChange} style={{ width: '100%', padding: 'var(--spacing-3)', paddingLeft: 'var(--spacing-10)', border: 'var(--border-1) solid var(--color-border-input)', borderRadius: 'var(--radius-lg)', outline: 'none', transition: 'var(--transition-all)' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--color-primary)'; }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--color-border-input)'; }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', paddingTop: 'var(--spacing-5)', marginTop: 'var(--spacing-6)', borderTop: 'var(--border-1) solid var(--color-border-light)', gap: 'var(--spacing-3)' }}>
          <button type="button" style={{ padding: 'var(--spacing-2-5) var(--spacing-5)', backgroundColor: 'var(--color-bg-hover)', borderRadius: 'var(--radius-lg)', transition: 'var(--transition-all)' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-muted)'} onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-bg-hover)'} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" style={{ padding: 'var(--spacing-2-5) var(--spacing-5)', backgroundColor: 'var(--color-primary)', color: 'var(--color-white)', borderRadius: 'var(--radius-lg)', transition: 'var(--transition-all)', boxShadow: 'var(--shadow-sm)' }} onMouseEnter={(e) => { e.target.style.backgroundColor = 'var(--color-primary-hover)'; e.target.style.boxShadow = 'var(--shadow-md)'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = 'var(--color-primary)'; e.target.style.boxShadow = 'var(--shadow-sm)'; }}>
            Add {staffTitle}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default AddWardenModal
