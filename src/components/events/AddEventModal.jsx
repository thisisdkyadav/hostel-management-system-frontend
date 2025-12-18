import React, { useState } from "react"
import { eventsApi } from "../../services/apiService"
import Modal from "../common/Modal"
import { FaCalendarAlt, FaClipboardList, FaBuilding, FaUserFriends } from "react-icons/fa"
import { BsClock } from "react-icons/bs"
import { useGlobal } from "../../contexts/GlobalProvider"
import { getCurrentDateTimeForInput, toISOString } from "../../utils/dateUtils"

const AddEventModal = ({ show, onClose, onEventAdded }) => {
  const { hostelList } = useGlobal()

  const [formData, setFormData] = useState({
    eventName: "",
    description: "",
    dateAndTime: getCurrentDateTimeForInput(),
    hostelId: "all",
    gender: "all",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const { eventName, description, dateAndTime, hostelId, gender } = formData
    if (!eventName || !description || !dateAndTime) {
      alert("Please fill in all fields.")
      return
    }

    const eventData = {
      eventName,
      description,
      dateAndTime: toISOString(dateAndTime),
      ...(hostelId !== "all" && { hostelId }),
      ...(gender !== "all" ? { gender } : { gender: null }),
    }

    try {
      const newEvent = await eventsApi.addEvent(eventData)
      if (!newEvent) {
        alert("Failed to add event. Please try again.")
        return
      }
      alert(`Event "${newEvent.eventName}" added successfully!`)
      onEventAdded && onEventAdded()
      onClose()
    } catch (error) {
      console.error("Error adding event:", error)
      alert("Failed to add event. Please try again.")
    }
  }

  if (!show) return null

  return (
    <Modal title="Add New Event" onClose={onClose} width={600}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          <div>
            <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Event Name</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 'var(--spacing-3)', top: 'var(--spacing-3)', color: 'var(--color-text-placeholder)' }}>
                <FaClipboardList />
              </div>
              <input type="text" name="eventName" value={formData.eventName} onChange={handleChange} style={{ width: '100%', padding: 'var(--spacing-3)', paddingLeft: 'var(--spacing-10)', border: `var(--border-1) solid var(--color-border-input)`, borderRadius: 'var(--radius-lg)', outline: 'none', transition: 'var(--transition-all)' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--input-border-focus)'; }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--color-border-input)'; }} placeholder="Enter event name" required />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Hostel</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 'var(--spacing-3)', top: 'var(--spacing-3)', color: 'var(--color-text-placeholder)' }}>
                <FaBuilding />
              </div>
              <select name="hostelId" value={formData.hostelId} onChange={handleChange} style={{ width: '100%', padding: 'var(--spacing-3)', paddingLeft: 'var(--spacing-10)', border: `var(--border-1) solid var(--color-border-input)`, borderRadius: 'var(--radius-lg)', outline: 'none', transition: 'var(--transition-all)' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--input-border-focus)'; }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--color-border-input)'; }} required>
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
            <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Gender</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 'var(--spacing-3)', top: 'var(--spacing-3)', color: 'var(--color-text-placeholder)' }}>
                <FaUserFriends />
              </div>
              <select name="gender" value={formData.gender} onChange={handleChange} style={{ width: '100%', padding: 'var(--spacing-3)', paddingLeft: 'var(--spacing-10)', border: `var(--border-1) solid var(--color-border-input)`, borderRadius: 'var(--radius-lg)', outline: 'none', transition: 'var(--transition-all)' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--input-border-focus)'; }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--color-border-input)'; }} required>
                <option value="all">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              style={{ width: '100%', padding: 'var(--spacing-3)', border: `var(--border-1) solid var(--color-border-input)`, borderRadius: 'var(--radius-lg)', outline: 'none', transition: 'var(--transition-all)', resize: 'none' }}
              onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--input-border-focus)'; }}
              onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--color-border-input)'; }}
              placeholder="Describe the event, location, activities, etc."
              required
            ></textarea>
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Date and Time</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 'var(--spacing-3)', top: 'var(--spacing-3)', color: 'var(--color-text-placeholder)' }}>
                <BsClock />
              </div>
              <input type="datetime-local" name="dateAndTime" value={formData.dateAndTime} onChange={handleChange} style={{ width: '100%', padding: 'var(--spacing-3)', paddingLeft: 'var(--spacing-10)', border: `var(--border-1) solid var(--color-border-input)`, borderRadius: 'var(--radius-lg)', outline: 'none', transition: 'var(--transition-all)' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--input-border-focus)'; }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--color-border-input)'; }} required />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', paddingTop: 'var(--spacing-5)', marginTop: 'var(--spacing-6)', borderTop: `var(--border-1) solid var(--color-border-light)`, gap: 'var(--spacing-3)' }}>
          <button type="button" style={{ padding: 'var(--spacing-2-5) var(--spacing-5)', backgroundColor: 'var(--color-bg-muted)', borderRadius: 'var(--radius-lg)', transition: 'var(--transition-all)', fontWeight: 'var(--font-weight-medium)', border: 'none', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-hover)'} onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-bg-muted)'} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" style={{ padding: 'var(--spacing-2-5) var(--spacing-5)', backgroundColor: 'var(--button-primary-bg)', color: 'var(--color-white)', borderRadius: 'var(--radius-lg)', transition: 'var(--transition-all)', boxShadow: 'var(--shadow-sm)', fontWeight: 'var(--font-weight-medium)', border: 'none', cursor: 'pointer' }} onMouseEnter={(e) => { e.target.style.backgroundColor = 'var(--button-primary-hover)'; e.target.style.boxShadow = 'var(--shadow-md)'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = 'var(--button-primary-bg)'; e.target.style.boxShadow = 'var(--shadow-sm)'; }}>
            Add Event
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default AddEventModal
