import React, { useState } from "react"
import { FaPlus, FaSignInAlt, FaSignOutAlt } from "react-icons/fa"
import { useAuth } from "../../contexts/AuthProvider"
import Button from "../common/Button"
import ToggleButtonGroup from "../common/ToggleButtonGroup"
import Input from "../common/ui/Input"

const NewEntryForm = ({ onAddEntry }) => {
  const { user } = useAuth()

  const hostelType = user?.hostel?.type

  const [formData, setFormData] = useState({
    unit: "",
    room: "",
    bed: "",
    time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    date: new Date().toISOString().split("T")[0],
    status: "Checked In",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleStatusChange = (status) => {
    setFormData({ ...formData, status })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const isUnitBased = hostelType === "unit-based"
    const isFormValid = isUnitBased ? formData.unit && formData.room && formData.bed : formData.room && formData.bed

    if (isFormValid) {
      const success = await onAddEntry(formData)

      if (success) {
        setFormData({
          ...formData,
          unit: "",
          room: "",
          bed: "",
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          date: new Date().toISOString().split("T")[0],
        })
      }
    }
  }

  const inputStyle = {
    width: '100%',
    padding: 'var(--spacing-1) var(--spacing-2)',
    fontSize: 'var(--font-size-sm)',
    backgroundColor: 'var(--color-bg-tertiary)',
    border: `var(--border-1) solid var(--color-border-primary)`,
    borderRadius: 'var(--radius-lg)',
    outline: 'none',
    transition: 'var(--transition-colors)'
  }

  return (
    <div style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', padding: 'var(--spacing-4)', marginBottom: 'var(--spacing-4)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-3)' }}>
        <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-primary)' }}>New Check In/Out Entry</h2>

        <ToggleButtonGroup
          options={[
            { value: "Checked In", label: "In", icon: <FaSignInAlt /> },
            { value: "Checked Out", label: "Out", icon: <FaSignOutAlt /> },
          ]}
          value={formData.status}
          onChange={handleStatusChange}
          shape="rounded"
          size="small"
          variant="primary"
          hideLabelsOnMobile={false}
        />
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 'var(--spacing-2)' }}>
        {hostelType === "unit-based" ? (
          <>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)' }}>Unit</label>
              <Input type="text" name="unit" value={formData.unit} onChange={handleChange} placeholder="Unit" required />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)' }}>Room</label>
              <Input type="text" name="room" value={formData.room} onChange={handleChange} placeholder="Room" required />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)' }}>Bed #</label>
              <Input type="text" name="bed" value={formData.bed} onChange={handleChange} placeholder="Bed Number" required />
            </div>
          </>
        ) : (
          <>
            <div style={{ gridColumn: 'span 4' }}>
              <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)' }}>Room Number</label>
              <Input type="text" name="room" value={formData.room} onChange={handleChange} placeholder="Room Number" required />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)' }}>Bed #</label>
              <Input type="text" name="bed" value={formData.bed} onChange={handleChange} placeholder="Bed Number" required />
            </div>
          </>
        )}

        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)' }}>Date</label>
          <Input type="date" name="date" value={formData.date} onChange={handleChange} />
        </div>

        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)' }}>Time</label>
          <Input type="time" name="time" value={formData.time} onChange={handleChange} />
        </div>

        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)' }}>&nbsp;</label>
          <Button type="submit" variant="primary" size="small" icon={<FaPlus />} fullWidth>
            Add
          </Button>
        </div>
      </form>
    </div>
  )
}

export default NewEntryForm
