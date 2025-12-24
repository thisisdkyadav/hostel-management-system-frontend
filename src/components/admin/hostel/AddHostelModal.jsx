import React, { useState } from "react"
import UnitBasedForm from "../forms/UnitBasedForm"
import RoomOnlyForm from "../forms/RoomOnlyForm"
import { adminApi } from "../../../services/apiService"
import Modal from "../../common/Modal"
import Button from "../../common/Button"

const AddHostelModal = ({ show, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: "",
    gender: "Boys",
    type: "unit-based",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const response = await adminApi.addHostel(formData)
    if (!response?.success) {
      alert("Failed to add hostel. Please try again.")
      return
    }
    const hostel = response.data
    onAdd()
    alert(`Hostel ${hostel.name ? hostel.name : ""} added successfully!`)
    onClose()
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: "",
      gender: "Boys",
      type: "unit-based",
    })
  }

  if (!show) return null

  return (
    <Modal title="Add New Hostel" onClose={onClose} width={700}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          <div style={{ backgroundColor: 'var(--color-primary-bg)', padding: 'var(--spacing-3) var(--spacing-4)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--spacing-2)' }}>
            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-primary-dark)' }}>Basic Information</h4>
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--color-text-tertiary)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Hostel Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} style={{ width: '100%', padding: 'var(--spacing-3)', border: 'var(--border-1) solid var(--color-border-input)', borderRadius: 'var(--radius-lg)', outline: 'none', transition: 'var(--transition-all)' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--color-primary)'; }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--color-border-input)'; }} placeholder="Enter hostel name" required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 'var(--spacing-4)' }} className="sm:grid-cols-2">
            <div>
              <label style={{ display: 'block', color: 'var(--color-text-tertiary)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} style={{ width: '100%', padding: 'var(--spacing-3)', border: 'var(--border-1) solid var(--color-border-input)', borderRadius: 'var(--radius-lg)', outline: 'none', transition: 'var(--transition-all)', backgroundColor: 'var(--color-bg-primary)' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--color-primary)'; }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--color-border-input)'; }} required>
                <option value="Boys">Boys</option>
                <option value="Girls">Girls</option>
                <option value="Co-ed">Co-ed</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--color-text-tertiary)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Hostel Type</label>
              <select name="type" value={formData.type} onChange={handleChange} style={{ width: '100%', padding: 'var(--spacing-3)', border: 'var(--border-1) solid var(--color-border-input)', borderRadius: 'var(--radius-lg)', outline: 'none', transition: 'var(--transition-all)', backgroundColor: 'var(--color-bg-primary)' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--color-primary)'; }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--color-border-input)'; }} required>
                <option value="unit-based">Unit-based</option>
                <option value="room-only">Room-only</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ paddingTop: 'var(--spacing-2)' }}>
          <div style={{ backgroundColor: 'var(--color-primary-bg)', padding: 'var(--spacing-3) var(--spacing-4)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--spacing-4)' }}>
            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-primary-dark)' }}>Room Configuration</h4>
          </div>

          <div style={{ backgroundColor: 'var(--color-bg-hover)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', border: 'var(--border-1) solid var(--color-border-light)' }}>{formData.type === "unit-based" ? <UnitBasedForm formData={formData} setFormData={setFormData} /> : <RoomOnlyForm formData={formData} setFormData={setFormData} />}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', paddingTop: 'var(--spacing-5)', marginTop: 'var(--spacing-6)', borderTop: 'var(--border-1) solid var(--color-border-light)', gap: 'var(--spacing-3)' }}>
          <Button
            type="button"
            onClick={onClose}
            variant="secondary"
            size="medium"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="medium"
          >
            Add Hostel
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default AddHostelModal
