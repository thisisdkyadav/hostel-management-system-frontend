import React, { useState } from "react"
import Button from "../../../common/Button"
import { FaDoorOpen, FaUsers, FaPlusCircle } from "react-icons/fa"
import { hostelApi } from "../../../../services/hostelApi"

const AddRoomForm = ({ hostel, onRoomsUpdated, setIsLoading }) => {
  const isUnitBased = hostel.type === "unit-based"

  const [formData, setFormData] = useState({
    unitNumber: "",
    roomNumbers: "",
    capacity: 1,
    status: "Active",
    commonAreaDetails: "",
  })

  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState("")

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "capacity" ? parseInt(value) : value,
    }))

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }

    if (successMessage) {
      setSuccessMessage("")
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (isUnitBased && !formData.unitNumber.trim()) {
      newErrors.unitNumber = "Unit number is required"
    }

    if (!formData.roomNumbers.trim()) {
      newErrors.roomNumbers = `Room ${isUnitBased ? "letter(s)" : "number(s)"} required`
    }

    if (!formData.capacity || formData.capacity < 1) {
      newErrors.capacity = "Capacity must be at least 1"
    }

    if (!formData.status) {
      newErrors.status = "Status is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const parseRoomNumbers = () => {
    // Handle comma-separated values, ranges with hyphens, and combinations
    const roomsString = formData.roomNumbers.trim()
    let roomNumbers = []

    // Split by commas first
    const segments = roomsString
      .split(",")
      .map((segment) => segment.trim())
      .filter(Boolean)

    for (const segment of segments) {
      if (segment.includes("-")) {
        // Handle ranges like 101-105 or A-E
        const [start, end] = segment.split("-").map((part) => part.trim())

        if (isUnitBased) {
          // For unit-based, handle letter ranges like A-E
          const startCode = start.charCodeAt(0)
          const endCode = end.charCodeAt(0)

          if (startCode <= endCode && /^[A-Za-z]$/.test(start) && /^[A-Za-z]$/.test(end)) {
            for (let code = startCode; code <= endCode; code++) {
              roomNumbers.push(String.fromCharCode(code))
            }
          } else {
            roomNumbers.push(start, end)
          }
        } else {
          // For room-only, handle numeric ranges like 101-105
          const startNum = parseInt(start)
          const endNum = parseInt(end)

          if (!isNaN(startNum) && !isNaN(endNum) && startNum <= endNum) {
            for (let num = startNum; num <= endNum; num++) {
              roomNumbers.push(num.toString())
            }
          } else {
            roomNumbers.push(start, end)
          }
        }
      } else {
        roomNumbers.push(segment)
      }
    }

    return roomNumbers
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    const roomNumbers = parseRoomNumbers()

    const roomsToAdd = roomNumbers.map((roomNumber) => ({
      unitNumber: isUnitBased ? formData.unitNumber : undefined,
      roomNumber: roomNumber,
      capacity: formData.capacity,
      status: formData.status,
    }))

    // Generate units data for unit-based hostels
    let unitsToAdd = []
    if (isUnitBased) {
      // Check if we need to add a new unit
      unitsToAdd = [
        {
          unitNumber: formData.unitNumber,
          floor: parseInt(formData.unitNumber.substring(0, 1)) - 1,
          commonAreaDetails: formData.commonAreaDetails || "",
        },
      ]
    }

    setIsLoading(true)

    try {
      const response = await hostelApi.addRooms(hostel.id, {
        rooms: roomsToAdd,
        units: isUnitBased ? unitsToAdd : undefined,
      })

      if (response?.success) {
        setSuccessMessage(`Successfully added ${roomsToAdd.length} room(s)`)
        onRoomsUpdated()

        // Reset form
        setFormData({
          unitNumber: "",
          roomNumbers: "",
          capacity: 1,
          status: "Active",
          commonAreaDetails: "",
        })
      } else {
        setErrors({ form: "Failed to add rooms. Please try again." })
      }
    } catch (error) {
      setErrors({ form: error.message || "Failed to add rooms. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
      <div style={{ backgroundColor: 'var(--color-primary-bg)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--spacing-4)' }}>
        <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-primary-dark)' }}>Add New {isUnitBased ? "Unit Rooms" : "Rooms"}</h4>
        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginTop: 'var(--spacing-1)' }}>{isUnitBased ? "Enter a unit number and specify room letters to add multiple rooms to a unit" : "Add one or multiple rooms at once"}</p>
      </div>

      {successMessage && (
        <div style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success-text)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'flex-start' }}>
          <svg xmlns="http://www.w3.org/2000/svg" style={{ height: 'var(--icon-lg)', width: 'var(--icon-lg)', marginRight: 'var(--spacing-2)', marginTop: 'var(--spacing-0-5)', flexShrink: 0 }} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {successMessage}
        </div>
      )}

      {errors.form && (
        <div style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger-text)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'flex-start' }}>
          <svg xmlns="http://www.w3.org/2000/svg" style={{ height: 'var(--icon-lg)', width: 'var(--icon-lg)', marginRight: 'var(--spacing-2)', marginTop: 'var(--spacing-0-5)', flexShrink: 0 }} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {errors.form}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
        {isUnitBased && (
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Unit Number</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 'var(--spacing-3)', top: 'var(--spacing-3)', color: 'var(--color-text-muted)' }}>
                <FaDoorOpen style={{ height: 'var(--icon-lg)', width: 'var(--icon-lg)' }} />
              </div>
              <input type="text" name="unitNumber" value={formData.unitNumber} onChange={handleChange} style={{ width: '100%', padding: 'var(--spacing-3)', paddingLeft: 'var(--spacing-10)', border: `var(--border-1) solid ${errors.unitNumber ? 'var(--color-danger)' : 'var(--color-border-input)'}`, borderRadius: 'var(--radius-lg)', backgroundColor: errors.unitNumber ? 'var(--color-danger-bg)' : 'var(--color-bg-primary)', outline: 'none', transition: 'var(--transition-all)' }} onFocus={(e) => { if (!errors.unitNumber) { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--color-primary)'; } }} onBlur={(e) => { if (!errors.unitNumber) { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--color-border-input)'; } }} placeholder="e.g., 101" />
            </div>
            {errors.unitNumber && <p style={{ marginTop: 'var(--spacing-1-5)', fontSize: 'var(--font-size-sm)', color: 'var(--color-danger)' }}>{errors.unitNumber}</p>}
          </div>
        )}

        {isUnitBased && (
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Common Area Details (Optional)</label>
            <textarea name="commonAreaDetails" value={formData.commonAreaDetails} onChange={handleChange} rows="2" style={{ width: '100%', padding: 'var(--spacing-3)', border: 'var(--border-1) solid var(--color-border-input)', borderRadius: 'var(--radius-lg)', outline: 'none', transition: 'var(--transition-all)' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--color-primary)'; }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--color-border-input)'; }} placeholder="e.g., Common kitchen, TV area" />
          </div>
        )}

        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Room {isUnitBased ? "Letter(s)" : "Number(s)"}</label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 'var(--spacing-3)', top: 'var(--spacing-3)', color: 'var(--color-text-muted)' }}>
              <FaDoorOpen style={{ height: 'var(--icon-lg)', width: 'var(--icon-lg)' }} />
            </div>
            <input type="text" name="roomNumbers" value={formData.roomNumbers} onChange={handleChange} style={{ width: '100%', padding: 'var(--spacing-3)', paddingLeft: 'var(--spacing-10)', border: `var(--border-1) solid ${errors.roomNumbers ? 'var(--color-danger)' : 'var(--color-border-input)'}`, borderRadius: 'var(--radius-lg)', backgroundColor: errors.roomNumbers ? 'var(--color-danger-bg)' : 'var(--color-bg-primary)', outline: 'none', transition: 'var(--transition-all)' }} onFocus={(e) => { if (!errors.roomNumbers) { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--color-primary)'; } }} onBlur={(e) => { if (!errors.roomNumbers) { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--color-border-input)'; } }} placeholder={isUnitBased ? "e.g., A, B, C or A-E" : "e.g., 101, 102 or 201-205"} />
          </div>
          <p style={{ marginTop: 'var(--spacing-1)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>You can use commas for lists and hyphens for ranges (e.g., A-D, F, H or 101-105, 201)</p>
          {errors.roomNumbers && <p style={{ marginTop: 'var(--spacing-1)', fontSize: 'var(--font-size-sm)', color: 'var(--color-danger)' }}>{errors.roomNumbers}</p>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 'var(--spacing-4)' }} className="md:grid-cols-2">
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Capacity</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 'var(--spacing-3)', top: 'var(--spacing-3)', color: 'var(--color-text-muted)' }}>
                <FaUsers style={{ height: 'var(--icon-lg)', width: 'var(--icon-lg)' }} />
              </div>
              <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} min="1" style={{ width: '100%', padding: 'var(--spacing-3)', paddingLeft: 'var(--spacing-10)', border: `var(--border-1) solid ${errors.capacity ? 'var(--color-danger)' : 'var(--color-border-input)'}`, borderRadius: 'var(--radius-lg)', backgroundColor: errors.capacity ? 'var(--color-danger-bg)' : 'var(--color-bg-primary)', outline: 'none', transition: 'var(--transition-all)' }} onFocus={(e) => { if (!errors.capacity) { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--color-primary)'; } }} onBlur={(e) => { if (!errors.capacity) { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--color-border-input)'; } }} placeholder="Room capacity" />
            </div>
            {errors.capacity && <p style={{ marginTop: 'var(--spacing-1-5)', fontSize: 'var(--font-size-sm)', color: 'var(--color-danger)' }}>{errors.capacity}</p>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Status</label>
            <div style={{ position: 'relative' }}>
              <select name="status" value={formData.status} onChange={handleChange} style={{ width: '100%', padding: 'var(--spacing-3)', border: `var(--border-1) solid ${errors.status ? 'var(--color-danger)' : 'var(--color-border-input)'}`, borderRadius: 'var(--radius-lg)', backgroundColor: errors.status ? 'var(--color-danger-bg)' : 'var(--color-bg-primary)', outline: 'none', transition: 'var(--transition-all)', appearance: 'none' }} onFocus={(e) => { if (!errors.status) { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--color-primary)'; } }} onBlur={(e) => { if (!errors.status) { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--color-border-input)'; } }}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Maintenance">Maintenance</option>
              </select>
              <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, display: 'flex', alignItems: 'center', padding: '0 var(--spacing-2)', pointerEvents: 'none' }}>
                <svg style={{ width: 'var(--icon-lg)', height: 'var(--icon-lg)', color: 'var(--color-text-muted)' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            {errors.status && <p style={{ marginTop: 'var(--spacing-1-5)', fontSize: 'var(--font-size-sm)', color: 'var(--color-danger)' }}>{errors.status}</p>}
          </div>
        </div>

        <div style={{ paddingTop: 'var(--spacing-4)' }}>
          <Button type="submit" variant="primary" size="medium" icon={<FaPlusCircle />} animation="ripple">
            Add Room(s)
          </Button>
        </div>
      </form>
    </div>
  )
}

export default AddRoomForm
