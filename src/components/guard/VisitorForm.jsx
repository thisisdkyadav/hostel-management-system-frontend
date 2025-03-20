import React, { useState } from "react"
import Button from "../common/Button"

const VisitorForm = ({ onAddVisitor }) => {
  const [visitorData, setVisitorData] = useState({
    name: "",
    phone: "",
    date: "",
    time: "",
    room: "",
    status: "Checked In",
  })

  const handleReset = () => {
    setVisitorData({
      name: "",
      phone: "",
      date: "",
      time: "",
      room: "",
      status: "Checked In",
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setVisitorData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const isSuccess = await onAddVisitor(visitorData)
    if (isSuccess) {
      alert("Visitor added successfully!")
      handleReset()
    } else {
      alert("Failed to add visitor.")
    }
  }

  return (
    <div className="bg-white rounded-[20px] p-6 shadow-[0px_1px_20px_rgba(0,0,0,0.06)]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Add New Visitor</h2>
        <Button type="button" variant="primary" onClick={handleReset} className="flex items-center">
          Reset
        </Button>
      </div>

      <form id="visitorForm" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Visitor Name</label>
            <input type="text" name="name" value={visitorData.name} onChange={handleChange} className="w-full bg-[#EFF3F4] text-gray-800 px-4 py-2 rounded-md" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input type="tel" name="phone" value={visitorData.phone} onChange={handleChange} className="w-full bg-[#EFF3F4] text-gray-800 px-4 py-2 rounded-md" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
            <input type="text" name="room" value={visitorData.room} onChange={handleChange} className="w-full bg-[#EFF3F4] text-gray-800 px-4 py-2 rounded-md" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Visit Date</label>
            <input type="date" name="date" value={visitorData.date} onChange={handleChange} className="w-full bg-[#EFF3F4] text-gray-800 px-4 py-2 rounded-md" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Visit Time</label>
            <input type="time" name="time" value={visitorData.time} onChange={handleChange} className="w-full bg-[#EFF3F4] text-gray-800 px-4 py-2 rounded-md" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select name="status" value={visitorData.status} onChange={handleChange} className="w-full bg-[#EFF3F4] text-gray-800 px-4 py-2 rounded-md" required>
              <option value="Checked In">Checked In</option>
              <option value="Checked Out">Checked Out</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="submit" variant="primary">
            Register Visitor
          </Button>
        </div>
      </form>
    </div>
  )
}

export default VisitorForm
