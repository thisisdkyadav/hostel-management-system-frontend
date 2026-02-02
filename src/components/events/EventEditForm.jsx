import React, { useState } from "react"
import { FaCalendarAlt, FaSave, FaBuilding, FaUserFriends } from "react-icons/fa"
import { MdCancel, MdDelete } from "react-icons/md"
import { BsClock } from "react-icons/bs"
import { useGlobal } from "../../contexts/GlobalProvider"
import { formatDateTimeForInput, toISOString } from "../../utils/dateUtils"
import { Input, Select } from "@/components/ui"
import { Button } from "czero/react"

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
            <Input type="text" name="eventName" value={formData.eventName} onChange={handleChange} style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-lg)', borderBottom: 'var(--border-1) solid var(--color-border-input)', borderRadius: 0, paddingBottom: 'var(--spacing-1)' }} required />
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>ID: {event._id.substring(0, 8)}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--spacing-1-5)' }}>Date and Time</label>
            <Input type="datetime-local" name="dateAndTime" value={formData.dateAndTime} onChange={handleChange} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--spacing-1-5)' }}>Hostel</label>
            <Select name="hostelId" value={formData.hostelId} onChange={handleChange} icon={<FaBuilding />} options={[
              { value: "all", label: "All Hostels" },
              ...hostelList?.map((hostel) => ({ value: hostel._id, label: hostel.name })) || []
            ]} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--spacing-1-5)' }}>Gender</label>
            <Select name="gender" value={formData.gender} onChange={handleChange} icon={<FaUserFriends />} options={[
              { value: "all", label: "All Genders" },
              { value: "Male", label: "Male" },
              { value: "Female", label: "Female" },
              { value: "Other", label: "Other" }
            ]} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--spacing-1-5)' }}>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="4" style={{ width: '100%', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-body)', border: 'var(--border-1) solid var(--color-border-input)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-3)', outline: 'none', resize: 'none', transition: 'var(--transition-all)' }} placeholder="Event description"></textarea>
          </div>
        </div>

        <div style={{ marginTop: 'var(--spacing-5)', paddingTop: 'var(--spacing-3)', borderTop: `var(--border-1) solid var(--color-border-light)`, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--spacing-3)' }}>
          <Button type="button" onClick={handleDelete} variant="danger" size="md">
            <MdDelete /> Delete
          </Button>

          <div style={{ display: 'flex', flexDirection: 'row', gap: 'var(--spacing-3)' }}>
            <Button type="button" onClick={onCancel} variant="secondary" size="md">
              <MdCancel /> Cancel
            </Button>
            <Button type="submit" variant="primary" size="md">
              <FaSave /> Save
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default EventEditForm
