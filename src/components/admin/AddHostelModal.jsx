import React, { useState } from "react"
import UnitBasedForm from "./forms/UnitBasedForm"
import RoomOnlyForm from "./forms/RoomOnlyForm"
import { adminApi } from "../../services/apiService"

const AddHostelModal = ({ show, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    gender: "Male",
    type: "unit-based",
    location: "",
    wardenId: "",
  })

  const [wardens] = useState([
    { id: "1", name: "Dr. Rajesh Kumar" },
    { id: "2", name: "Dr. Amit Sharma" },
    { id: "3", name: "Dr. Priya Singh" },
    { id: "4", name: "Dr. Meera Patel" },
  ])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const hostel = await adminApi.addHostel(formData)
    alert(`Hostel ${hostel.name} added successfully!`)
    onClose()
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-[20px] w-[700px] max-w-[95%] max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-5">Add New Hostel</h2>
        <form onSubmit={handleSubmit}>
          {/* Basic Hostel Info */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Hostel Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" placeholder="Enter hostel name" required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" required>
                <option value="Boys">Boys</option>
                <option value="Girls">Girls</option>
                <option value="Co-ed">Co-ed</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Hostel Type</label>
              <select name="type" value={formData.type} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" required>
                <option value="unit-based">Unit-based</option>
                <option value="room-only">Room-only</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Location</label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" placeholder="Enter hostel location" />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Assign Warden</label>
            <select name="wardenId" value={formData.wardenId} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg">
              <option value="">Select Warden</option>
              {wardens.map((warden) => (
                <option key={warden.id} value={warden.id}>
                  {warden.name}
                </option>
              ))}
            </select>
          </div>

          {/* Dynamic Form based on hostel type */}
          <div className="mt-6 border-t pt-4">
            <h3 className="text-lg font-semibold mb-3">Room Configuration</h3>
            {formData.type === "unit-based" ? <UnitBasedForm formData={formData} setFormData={setFormData} /> : <RoomOnlyForm formData={formData} setFormData={setFormData} />}
          </div>

          <div className="flex justify-end mt-6 space-x-3">
            <button type="button" className="px-5 py-2 bg-gray-200 rounded-lg" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 bg-[#1360AB] text-white rounded-lg">
              Add Hostel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddHostelModal
