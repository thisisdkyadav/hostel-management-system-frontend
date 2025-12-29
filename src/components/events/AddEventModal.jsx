import React, { useState } from "react"
import { eventsApi } from "../../services/apiService"
import Modal from "../common/Modal"
import Button from "../common/Button"
import Input from "../common/ui/Input"
import Select from "../common/ui/Select"
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
            <Input type="text" name="eventName" value={formData.eventName} onChange={handleChange} icon={<FaClipboardList />} placeholder="Enter event name" required />
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Hostel</label>
            <Select name="hostelId" value={formData.hostelId} onChange={handleChange} icon={<FaBuilding />} options={[
              { value: "all", label: "All Hostels" },
              ...hostelList?.map((hostel) => ({ value: hostel._id, label: hostel.name })) || []
            ]} required />
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Gender</label>
            <Select name="gender" value={formData.gender} onChange={handleChange} icon={<FaUserFriends />} options={[
              { value: "all", label: "All Genders" },
              { value: "Male", label: "Male" },
              { value: "Female", label: "Female" },
              { value: "Other", label: "Other" }
            ]} required />
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="4" style={{ width: '100%', padding: 'var(--spacing-3)', border: 'var(--border-1) solid var(--color-border-input)', borderRadius: 'var(--radius-lg)', outline: 'none', transition: 'var(--transition-all)', resize: 'none' }} placeholder="Describe the event, location, activities, etc." required></textarea>
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Date and Time</label>
            <Input type="datetime-local" name="dateAndTime" value={formData.dateAndTime} onChange={handleChange} icon={<BsClock />} required />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', paddingTop: 'var(--spacing-5)', marginTop: 'var(--spacing-6)', borderTop: `var(--border-1) solid var(--color-border-light)`, gap: 'var(--spacing-3)' }}>
          <Button type="button" onClick={onClose} variant="secondary" size="medium">
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="medium">
            Add Event
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default AddEventModal
