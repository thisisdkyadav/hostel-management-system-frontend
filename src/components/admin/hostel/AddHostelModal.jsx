import React, { useState } from "react"
import UnitBasedForm from "../forms/UnitBasedForm"
import RoomOnlyForm from "../forms/RoomOnlyForm"
import { adminApi } from "../../../services/apiService"
import Modal from "../../common/Modal"
import Button from "../../common/Button"
import Input from "../../common/ui/Input"
import Select from "../../common/ui/Select"

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
            <Input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter hostel name" required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 'var(--spacing-4)' }} className="sm:grid-cols-2">
            <div>
              <label style={{ display: 'block', color: 'var(--color-text-tertiary)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Gender</label>
              <Select name="gender" value={formData.gender} onChange={handleChange} options={[{ value: "Boys", label: "Boys" }, { value: "Girls", label: "Girls" }, { value: "Co-ed", label: "Co-ed" }]} required />
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--color-text-tertiary)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Hostel Type</label>
              <Select name="type" value={formData.type} onChange={handleChange} options={[{ value: "unit-based", label: "Unit-based" }, { value: "room-only", label: "Room-only" }]} required />
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
