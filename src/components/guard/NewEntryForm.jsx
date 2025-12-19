import React, { useState } from "react"
import { FaPlus, FaSignInAlt, FaSignOutAlt } from "react-icons/fa"
import { useAuth } from "../../contexts/AuthProvider"

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

        <div style={{ display: 'flex', border: `var(--border-1) solid var(--color-border-primary)`, borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <button type="button" style={{ padding: 'var(--spacing-1) var(--spacing-3)', fontSize: 'var(--font-size-xs)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)', backgroundColor: formData.status === "Checked In" ? 'var(--button-primary-bg)' : 'var(--color-bg-tertiary)', color: formData.status === "Checked In" ? 'var(--color-white)' : 'var(--color-text-body)', border: 'none', cursor: 'pointer', transition: 'var(--transition-colors)' }} onClick={() => handleStatusChange("Checked In")}
            onMouseEnter={(e) => formData.status !== "Checked In" && (e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)')}
            onMouseLeave={(e) => formData.status !== "Checked In" && (e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)')}
          >
            <FaSignInAlt size={parseInt(getComputedStyle(document.documentElement).getPropertyValue('--icon-xs'))} /> In
          </button>
          <button type="button" style={{ padding: 'var(--spacing-1) var(--spacing-3)', fontSize: 'var(--font-size-xs)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)', backgroundColor: formData.status === "Checked Out" ? 'var(--button-primary-bg)' : 'var(--color-bg-tertiary)', color: formData.status === "Checked Out" ? 'var(--color-white)' : 'var(--color-text-body)', border: 'none', cursor: 'pointer', transition: 'var(--transition-colors)' }} onClick={() => handleStatusChange("Checked Out")}
            onMouseEnter={(e) => formData.status !== "Checked Out" && (e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)')}
            onMouseLeave={(e) => formData.status !== "Checked Out" && (e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)')}
          >
            <FaSignOutAlt size={parseInt(getComputedStyle(document.documentElement).getPropertyValue('--icon-xs'))} /> Out
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 'var(--spacing-2)' }}>
        {hostelType === "unit-based" ? (
          <>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)' }}>Unit</label>
              <input type="text" name="unit" value={formData.unit} onChange={handleChange} placeholder="Unit" style={inputStyle} onFocus={(e) => e.currentTarget.style.boxShadow = 'var(--input-focus-ring)'}
                onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                required
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)' }}>Room</label>
              <input type="text" name="room" value={formData.room} onChange={handleChange} placeholder="Room" style={inputStyle} onFocus={(e) => e.currentTarget.style.boxShadow = 'var(--input-focus-ring)'}
                onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                required
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)' }}>Bed #</label>
              <input type="text" name="bed" value={formData.bed} onChange={handleChange} placeholder="Bed Number" style={inputStyle} onFocus={(e) => e.currentTarget.style.boxShadow = 'var(--input-focus-ring)'}
                onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                required
              />
            </div>
          </>
        ) : (
          <>
            <div style={{ gridColumn: 'span 4' }}>
              <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)' }}>Room Number</label>
              <input type="text" name="room" value={formData.room} onChange={handleChange} placeholder="Room Number" style={inputStyle} onFocus={(e) => e.currentTarget.style.boxShadow = 'var(--input-focus-ring)'}
                onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                required
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)' }}>Bed #</label>
              <input type="text" name="bed" value={formData.bed} onChange={handleChange} placeholder="Bed Number" style={inputStyle} onFocus={(e) => e.currentTarget.style.boxShadow = 'var(--input-focus-ring)'}
                onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                required
              />
            </div>
          </>
        )}

        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)' }}>Date</label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} style={inputStyle} onFocus={(e) => e.currentTarget.style.boxShadow = 'var(--input-focus-ring)'}
            onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
          />
        </div>

        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)' }}>Time</label>
          <input type="time" name="time" value={formData.time} onChange={handleChange} style={inputStyle} onFocus={(e) => e.currentTarget.style.boxShadow = 'var(--input-focus-ring)'}
            onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
          />
        </div>

        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)' }}>&nbsp;</label>
          <button type="submit" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-1)', backgroundColor: 'var(--button-primary-bg)', color: 'var(--color-white)', padding: 'var(--spacing-1) var(--spacing-2)', fontSize: 'var(--font-size-sm)', borderRadius: 'var(--radius-lg)', transition: 'var(--transition-colors)', marginTop: 'var(--spacing-1)', border: 'none', cursor: 'pointer', fontWeight: 'var(--font-weight-medium)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--button-primary-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--button-primary-bg)'}
          >
            <FaPlus size={parseInt(getComputedStyle(document.documentElement).getPropertyValue('--icon-xs'))} /> Add
          </button>
        </div>
      </form>
    </div>
  )
}

export default NewEntryForm
