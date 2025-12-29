import React, { useState } from "react"
import Button from "../../../common/Button"
import Input from "../../../common/ui/Input"
import Select from "../../../common/ui/Select"
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
            <Input type="text" name="unitNumber" value={formData.unitNumber} onChange={handleChange} icon={<FaDoorOpen />} placeholder="e.g., 101" error={errors.unitNumber} />
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
          <Input type="text" name="roomNumbers" value={formData.roomNumbers} onChange={handleChange} icon={<FaDoorOpen />} placeholder={isUnitBased ? "e.g., A, B, C or A-E" : "e.g., 101, 102 or 201-205"} error={errors.roomNumbers} />
          <p style={{ marginTop: 'var(--spacing-1)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>You can use commas for lists and hyphens for ranges (e.g., A-D, F, H or 101-105, 201)</p>
          {errors.roomNumbers && <p style={{ marginTop: 'var(--spacing-1)', fontSize: 'var(--font-size-sm)', color: 'var(--color-danger)' }}>{errors.roomNumbers}</p>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 'var(--spacing-4)' }} className="md:grid-cols-2">
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Capacity</label>
            <Input type="number" name="capacity" value={formData.capacity} onChange={handleChange} min="1" icon={<FaUsers />} placeholder="Room capacity" error={errors.capacity} />
            {errors.capacity && <p style={{ marginTop: 'var(--spacing-1-5)', fontSize: 'var(--font-size-sm)', color: 'var(--color-danger)' }}>{errors.capacity}</p>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Status</label>
            <Select name="status" value={formData.status} onChange={handleChange} options={[{ value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }, { value: "Maintenance", label: "Maintenance" }]} error={errors.status} />
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
