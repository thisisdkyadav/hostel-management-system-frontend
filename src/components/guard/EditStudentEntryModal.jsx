import React, { useState } from "react"
import { FaSignInAlt, FaSignOutAlt } from "react-icons/fa"
import Button from "../common/Button"
import Modal from "../common/Modal"
import { useSecurity } from "../../contexts/SecurityProvider"

const EditStudentEntryModal = ({ entry, onClose, onSave }) => {
  const { securityInfo } = useSecurity()

  const [formData, setFormData] = useState({
    ...entry,
    date: new Date(entry.dateAndTime).toISOString().split("T")[0],
    time: new Date(entry.dateAndTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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

    // Combine date and time into a dateTime field
    const dateTime = new Date(`${formData.date}T${formData.time}`).toISOString()

    const updatedEntry = {
      ...formData,
      dateTime,
    }

    await onSave(updatedEntry)
    onClose()
  }

  return (
    <Modal title="Edit Student Entry" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <div className="flex border border-gray-200 rounded-lg overflow-hidden mb-4 w-fit">
            <button type="button" className={`py-2 px-4 text-sm flex items-center gap-1 ${formData.status === "Checked In" ? "bg-[#1360AB] text-white" : "bg-gray-50 text-gray-700 hover:bg-gray-100"}`} onClick={() => handleStatusChange("Checked In")}>
              <FaSignInAlt size={14} /> Checked In
            </button>
            <button type="button" className={`py-2 px-4 text-sm flex items-center gap-1 ${formData.status === "Checked Out" ? "bg-[#1360AB] text-white" : "bg-gray-50 text-gray-700 hover:bg-gray-100"}`} onClick={() => handleStatusChange("Checked Out")}>
              <FaSignOutAlt size={14} /> Checked Out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student Email</label>
            <input type="text" name="studentId" value={formData.userId.email} onChange={handleChange} readOnly className="w-full bg-[#EFF3F4] text-gray-800 px-4 py-2 rounded-md" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
            <input type="text" name="studentName" value={formData.userId.name} onChange={handleChange} readOnly className="w-full bg-[#EFF3F4] text-gray-800 px-4 py-2 rounded-md" required />
          </div>

          {securityInfo?.hostelType === "unit-based" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <input type="text" name="unit" value={formData.unit || ""} onChange={handleChange} className="w-full bg-[#EFF3F4] text-gray-800 px-4 py-2 rounded-md" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
            <input type="text" name="room" value={formData.room} onChange={handleChange} className="w-full bg-[#EFF3F4] text-gray-800 px-4 py-2 rounded-md" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bed</label>
            <input type="text" name="bed" value={formData.bed} onChange={handleChange} className="w-full bg-[#EFF3F4] text-gray-800 px-4 py-2 rounded-md" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full bg-[#EFF3F4] text-gray-800 px-4 py-2 rounded-md" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
            <input type="time" name="time" value={formData.time} onChange={handleChange} className="w-full bg-[#EFF3F4] text-gray-800 px-4 py-2 rounded-md" required />
          </div>
        </div>

        {/* <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
          <textarea name="notes" value={formData.notes || ""} onChange={handleChange} className="w-full bg-[#EFF3F4] text-gray-800 px-4 py-2 rounded-md" rows="2" />
        </div> */}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default EditStudentEntryModal
