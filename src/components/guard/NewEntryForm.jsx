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

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-medium text-[#1360AB]">New Check In/Out Entry</h2>

        <div className="flex border border-gray-200 rounded-lg overflow-hidden">
          <button type="button" className={`py-1 px-3 text-xs flex items-center gap-1 ${formData.status === "Checked In" ? "bg-[#1360AB] text-white" : "bg-gray-50 text-gray-700 hover:bg-gray-100"}`} onClick={() => handleStatusChange("Checked In")}>
            <FaSignInAlt size={12} /> In
          </button>
          <button type="button" className={`py-1 px-3 text-xs flex items-center gap-1 ${formData.status === "Checked Out" ? "bg-[#1360AB] text-white" : "bg-gray-50 text-gray-700 hover:bg-gray-100"}`} onClick={() => handleStatusChange("Checked Out")}>
            <FaSignOutAlt size={12} /> Out
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-2">
        {hostelType === "unit-based" ? (
          <>
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-700">Unit</label>
              <input type="text" name="unit" value={formData.unit} onChange={handleChange} placeholder="Unit" className="w-full px-2 py-1 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#1360AB] focus:outline-none" required />
            </div>

            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-700">Room</label>
              <input type="text" name="room" value={formData.room} onChange={handleChange} placeholder="Room" className="w-full px-2 py-1 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#1360AB] focus:outline-none" required />
            </div>

            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-700">Bed #</label>
              <input type="text" name="bed" value={formData.bed} onChange={handleChange} placeholder="Bed Number" className="w-full px-2 py-1 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#1360AB] focus:outline-none" required />
            </div>
          </>
        ) : (
          <>
            <div className="col-span-4">
              <label className="text-xs font-medium text-gray-700">Room Number</label>
              <input type="text" name="room" value={formData.room} onChange={handleChange} placeholder="Room Number" className="w-full px-2 py-1 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#1360AB] focus:outline-none" required />
            </div>

            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-700">Bed #</label>
              <input type="text" name="bed" value={formData.bed} onChange={handleChange} placeholder="Bed Number" className="w-full px-2 py-1 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#1360AB] focus:outline-none" required />
            </div>
          </>
        )}

        <div className="col-span-2">
          <label className="text-xs font-medium text-gray-700">Date</label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full px-2 py-1 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#1360AB] focus:outline-none" />
        </div>

        <div className="col-span-2">
          <label className="text-xs font-medium text-gray-700">Time</label>
          <input type="time" name="time" value={formData.time} onChange={handleChange} className="w-full px-2 py-1 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#1360AB] focus:outline-none" />
        </div>

        <div className="col-span-2">
          <label className="text-xs font-medium text-gray-700">&nbsp;</label>
          <button type="submit" className="w-full flex items-center justify-center gap-1 bg-[#1360AB] text-white py-1 px-2 text-sm rounded-lg hover:bg-blue-700 transition mt-[4px]">
            <FaPlus size={12} /> Add
          </button>
        </div>
      </form>
    </div>
  )
}

export default NewEntryForm
