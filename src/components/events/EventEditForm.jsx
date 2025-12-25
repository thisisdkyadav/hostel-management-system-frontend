import React, { useState } from "react"
import { FaCalendarAlt, FaSave, FaBuilding, FaUserFriends } from "react-icons/fa"
import { MdCancel, MdDelete } from "react-icons/md"
import { BsClock } from "react-icons/bs"
import { useGlobal } from "../../contexts/GlobalProvider"
import { formatDateTimeForInput, toISOString } from "../../utils/dateUtils"
import Button from "../common/Button"

const EventEditForm = ({ event, onCancel, onSave, onDelete }) => {
  const { hostelList } = useGlobal()

  const [formData, setFormData] = useState({
    eventName: event.eventName,
    description: event.description,
    dateAndTime: formatDateTimeForInput(event.dateAndTime),
    hostelId: event.hostelId || "all",
    gender: event.gender || "all",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const updatedEvent = {
      ...event,
      ...formData,
      dateAndTime: toISOString(formData.dateAndTime),
    }

    if (updatedEvent.hostelId === "all") {
      delete updatedEvent.hostelId
    }

    if (updatedEvent.gender === "all") {
      updatedEvent.gender = null
    }

    onSave(updatedEvent)
  }

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      onDelete(event._id)
    }
  }

  return (
    <div style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-xl)', padding: 'var(--spacing-5)', boxShadow: 'var(--shadow-sm)', border: `var(--border-1) solid var(--color-border-light)`, transition: 'var(--transition-all)' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
          <div style={{ padding: 'var(--spacing-2-5)', marginRight: 'var(--spacing-3)', borderRadius: 'var(--radius-xl)', backgroundColor: 'var(--color-info-bg)', color: 'var(--color-info-text)' }}>
            <FaCalendarAlt size={20} />
          </div>
          <div style={{ width: '100%' }}>
            <input type="text" name="eventName" value={formData.eventName} onChange={handleChange} style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-lg)', width: '100%', borderBottom: `var(--border-1) solid var(--color-border-input)`, outline: 'none', paddingBottom: 'var(--spacing-1)', transition: 'var(--transition-all)' }} onFocus={(e) => e.target.style.borderColor = 'var(--input-border-focus)'} onBlur={(e) => e.target.style.borderColor = 'var(--color-border-input)'} required />
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>ID: {event._id.substring(0, 8)}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--spacing-1-5)' }}>Date and Time</label>
            <input type="datetime-local" name="dateAndTime" value={formData.dateAndTime} onChange={handleChange} style={{ width: '100%', padding: 'var(--spacing-2-5)', border: `var(--border-1) solid var(--color-border-input)`, borderRadius: 'var(--radius-lg)', outline: 'none', transition: 'var(--transition-all)' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--input-border-focus)'; }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--color-border-input)'; }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--spacing-1-5)' }}>Hostel</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 'var(--spacing-3)', top: 'var(--spacing-3)', color: 'var(--color-text-placeholder)' }}>
                <FaBuilding />
              </div>
              <select name="hostelId" value={formData.hostelId} onChange={handleChange} style={{ width: '100%', padding: 'var(--spacing-2-5)', paddingLeft: 'var(--spacing-10)', border: `var(--border-1) solid var(--color-border-input)`, borderRadius: 'var(--radius-lg)', outline: 'none', transition: 'var(--transition-all)' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--input-border-focus)'; }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--color-border-input)'; }}>
                <option value="all">All Hostels</option>
                {hostelList?.map((hostel) => (
                  <option key={hostel._id} value={hostel._id}>
                    {hostel.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--spacing-1-5)' }}>Gender</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 'var(--spacing-3)', top: 'var(--spacing-3)', color: 'var(--color-text-placeholder)' }}>
                <FaUserFriends />
              </div>
              <select name="gender" value={formData.gender} onChange={handleChange} style={{ width: '100%', padding: 'var(--spacing-2-5)', paddingLeft: 'var(--spacing-10)', border: `var(--border-1) solid var(--color-border-input)`, borderRadius: 'var(--radius-lg)', outline: 'none', transition: 'var(--transition-all)' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--input-border-focus)'; }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--color-border-input)'; }}>
                <option value="all">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--spacing-1-5)' }}>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="4" style={{ width: '100%', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-body)', border: `var(--border-1) solid var(--color-border-input)`, borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-3)', outline: 'none', resize: 'none', transition: 'var(--transition-all)' }} onFocus={(e) => { e.target.style.borderColor = 'var(--input-border-focus)'; e.target.style.boxShadow = 'var(--input-focus-ring)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--color-border-input)'; e.target.style.boxShadow = 'none'; }}
              placeholder="Event description"
            ></textarea>
          </div>
        </div>

        <div style={{ marginTop: 'var(--spacing-5)', paddingTop: 'var(--spacing-3)', borderTop: `var(--border-1) solid var(--color-border-light)`, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--spacing-3)' }}>
          <Button type="button" onClick={handleDelete} variant="danger" size="medium" icon={<MdDelete />}>
            Delete
          </Button>

          <div style={{ display: 'flex', flexDirection: 'row', gap: 'var(--spacing-3)' }}>
            <Button type="button" onClick={onCancel} variant="secondary" size="medium" icon={<MdCancel />}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="medium" icon={<FaSave />}>
              Save
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default EventEditForm
