import React, { useState } from "react"
import Button from "../common/Button"
import { useSecurity } from "../../contexts/SecurityProvider"
import { FaSignInAlt, FaSignOutAlt } from "react-icons/fa"

const StudentEntryForm = ({ onAddEntry }) => {
  const { securityInfo } = useSecurity()

  const [entryData, setEntryData] = useState({
    unit: "",
    room: "",
    bed: "",
    studentName: "",
    studentId: "",
    date: new Date().toISOString().split("T")[0],
    time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    status: "Checked In",
    notes: "",
  })

  const handleReset = () => {
    setEntryData({
      unit: "",
      room: "",
      bed: "",
      studentName: "",
      studentId: "",
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      status: "Checked In",
      notes: "",
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setEntryData((prev) => ({ ...prev, [name]: value }))
  }

  const handleStatusChange = (status) => {
    setEntryData({ ...entryData, status })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const isSuccess = await onAddEntry(entryData)
    if (isSuccess) {
      alert("Student entry added successfully!")
      handleReset()
    } else {
      alert("Failed to add student entry.")
    }
  }

  return (
    <div className="bg-white rounded-[20px] p-6 shadow-[0px_1px_20px_rgba(0,0,0,0.06)]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Add New Student Entry</h2>
        <div className="flex items-center gap-4">
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button type="button" className={`py-2 px-4 text-sm flex items-center gap-1 ${entryData.status === "Checked In" ? "bg-[#1360AB] text-white" : "bg-gray-50 text-gray-700 hover:bg-gray-100"}`} onClick={() => handleStatusChange("Checked In")}>
              <FaSignInAlt size={14} /> Checked In
            </button>
            <button type="button" className={`py-2 px-4 text-sm flex items-center gap-1 ${entryData.status === "Checked Out" ? "bg-[#1360AB] text-white" : "bg-gray-50 text-gray-700 hover:bg-gray-100"}`} onClick={() => handleStatusChange("Checked Out")}>
              <FaSignOutAlt size={14} /> Checked Out
            </button>
          </div>
          <Button type="button" variant="primary" onClick={handleReset} className="flex items-center">
            Reset
          </Button>
        </div>
      </div>

      <form id="studentEntryForm" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
            <input type="text" name="studentId" value={entryData.studentId} onChange={handleChange} className="w-full bg-[#EFF3F4] text-gray-800 px-4 py-2 rounded-md" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
            <input type="text" name="studentName" value={entryData.studentName} onChange={handleChange} className="w-full bg-[#EFF3F4] text-gray-800 px-4 py-2 rounded-md" required />
          </div>

          {securityInfo?.hostelType === "unit-based" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <input type="text" name="unit" value={entryData.unit} onChange={handleChange} className="w-full bg-[#EFF3F4] text-gray-800 px-4 py-2 rounded-md" required />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
            <input type="text" name="room" value={entryData.room} onChange={handleChange} className="w-full bg-[#EFF3F4] text-gray-800 px-4 py-2 rounded-md" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bed</label>
            <input type="text" name="bed" value={entryData.bed} onChange={handleChange} className="w-full bg-[#EFF3F4] text-gray-800 px-4 py-2 rounded-md" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" name="date" value={entryData.date} onChange={handleChange} className="w-full bg-[#EFF3F4] text-gray-800 px-4 py-2 rounded-md" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
            <input type="time" name="time" value={entryData.time} onChange={handleChange} className="w-full bg-[#EFF3F4] text-gray-800 px-4 py-2 rounded-md" required />
          </div>

          <div className="lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea name="notes" value={entryData.notes} onChange={handleChange} className="w-full bg-[#EFF3F4] text-gray-800 px-4 py-2 rounded-md" rows="2" />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="submit" variant="primary">
            Register Entry
          </Button>
        </div>
      </form>
    </div>
  )
}

export default StudentEntryForm
