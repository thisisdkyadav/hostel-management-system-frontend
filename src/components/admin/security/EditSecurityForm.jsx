import React, { useState } from "react"
import { FaTrash, FaSave, FaBuilding, FaUser, FaExclamationTriangle } from "react-icons/fa"
import { adminApi } from "../../../services/apiService"
import { useAdmin } from "../../../contexts/AdminProvider"
import Modal from "../../common/Modal"

const EditSecurityForm = ({ security, onClose, onUpdate, onDelete }) => {
  const { hostelList } = useAdmin()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [formData, setFormData] = useState({
    name: security.name || "",
    hostelId: security.hostelId || "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)

      const message = await adminApi.updateSecurity(security.id, formData)
      if (!message) {
        setError("Failed to update security staff. Please try again.")
        return
      }

      alert("Security staff updated successfully!")
      if (onUpdate) onUpdate()
      onClose()
    } catch (error) {
      console.error("Failed to update security staff:", error)
      setError("Failed to update security staff. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this security staff account?")
    if (confirmDelete) {
      try {
        setLoading(true)
        setError(null)

        const message = await adminApi.deleteSecurity(security.id)
        if (!message) {
          setError("Failed to delete security staff. Please try again.")
          return
        }

        alert("Security staff deleted successfully!")
        if (onDelete) onDelete()
        onClose()
      } catch (error) {
        console.error("Failed to delete security staff:", error)
        setError("Failed to delete security staff. Please try again.")
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <Modal title="Edit Security Staff" onClose={onClose} width={500}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
        {error && (
          <div style={{ padding: 'var(--spacing-4)', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger-text)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'flex-start' }}>
            <FaExclamationTriangle style={{ marginTop: 'var(--spacing-0-5)', marginRight: 'var(--spacing-2)', flexShrink: 0 }} />
            <p>{error}</p>
          </div>
        )}

        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-2)' }}>Security Name</label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 'var(--spacing-3)', top: 'var(--spacing-3)', color: 'var(--color-text-placeholder)' }}>
              <FaUser />
            </div>
            <input type="text" name="name" value={formData.name} onChange={handleChange} style={{ width: '100%', padding: 'var(--spacing-3)', paddingLeft: 'var(--spacing-10)', border: `var(--border-1) solid var(--color-border-input)`, borderRadius: 'var(--radius-lg)', outline: 'none', backgroundColor: 'var(--input-bg)' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--input-border-focus)' }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--color-border-input)' }} placeholder="Enter security staff name" required />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-2)' }}>Hostel Assignment</label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 'var(--spacing-3)', top: 'var(--spacing-3)', color: 'var(--color-text-placeholder)' }}>
              <FaBuilding />
            </div>
            <select name="hostelId" value={formData.hostelId} onChange={handleChange} style={{ width: '100%', padding: 'var(--spacing-3)', paddingLeft: 'var(--spacing-10)', border: `var(--border-1) solid var(--color-border-input)`, borderRadius: 'var(--radius-lg)', outline: 'none', appearance: 'none', backgroundColor: 'var(--input-bg)' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--input-border-focus)' }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--color-border-input)' }}>
              <option value="">Not assigned to any hostel</option>
              {hostelList.map((hostel) => (
                <option key={hostel._id} value={hostel._id}>
                  {hostel.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: 'var(--spacing-3)', paddingTop: 'var(--spacing-4)', marginTop: 'var(--spacing-5)', borderTop: `var(--border-1) solid var(--color-border-light)` }}>
          <button type="button" onClick={handleDelete} disabled={loading} style={{ padding: 'var(--spacing-2-5) var(--spacing-4)', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger-text)', borderRadius: 'var(--radius-lg)', transition: 'var(--transition-colors)', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: loading ? 'var(--opacity-disabled)' : '1' }} onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = 'var(--color-danger-bg-light)')} onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = 'var(--color-danger-bg)')}>
            {loading ? <span style={{ width: 'var(--spacing-5)', height: 'var(--spacing-5)', border: `var(--border-2) solid var(--color-danger-text)`, borderTopColor: 'transparent', borderRadius: 'var(--radius-full)', animation: 'spin 1s linear infinite', marginRight: 'var(--spacing-2)' }}></span> : <FaTrash style={{ marginRight: 'var(--spacing-2)' }} />}
            Delete Account
          </button>

          <button type="submit" disabled={loading} style={{ padding: 'var(--spacing-2-5) var(--spacing-4)', backgroundColor: 'var(--button-primary-bg)', color: 'var(--color-white)', borderRadius: 'var(--radius-lg)', transition: 'var(--transition-colors)', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: loading ? 'var(--opacity-disabled)' : '1' }} onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = 'var(--button-primary-hover)')} onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = 'var(--button-primary-bg)')}>
            {loading ? <span style={{ width: 'var(--spacing-5)', height: 'var(--spacing-5)', border: `var(--border-2) solid var(--color-white)`, borderTopColor: 'transparent', borderRadius: 'var(--radius-full)', animation: 'spin 1s linear infinite', marginRight: 'var(--spacing-2)' }}></span> : <FaSave style={{ marginRight: 'var(--spacing-2)' }} />}
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default EditSecurityForm
