import React, { useState } from "react"
import UnitBasedForm from "../forms/UnitBasedForm"
import RoomOnlyForm from "../forms/RoomOnlyForm"
import { adminApi } from "../../../services/apiService"
import Modal from "../../common/Modal"

const AddHostelModal = ({ show, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: "",
    gender: "Boys",
    type: "unit-based",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const response = await adminApi.addHostel(formData)
    if (!response?.success) {
      alert("Failed to add hostel. Please try again.")
      return
    }
    const hostel = response.data
    onAdd()
    alert(`Hostel ${hostel.name ? hostel.name : ""} added successfully!`)
    onClose()
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: "",
      gender: "Boys",
      type: "unit-based",
    })
  }

  if (!show) return null

  return (
    <Modal title="Add New Hostel" onClose={onClose} width={700}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="bg-blue-50 px-4 py-3 rounded-lg mb-2">
            <h4 className="text-sm font-medium text-blue-800">Basic Information</h4>
          </div>

          <div>
            <label className="block text-[var(--color-text-tertiary)] text-sm font-medium mb-2">Hostel Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-3 border border-[var(--color-border-input)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary-bg-hover)] focus:border-[var(--color-primary)] outline-none transition-all" placeholder="Enter hostel name" required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[var(--color-text-tertiary)] text-sm font-medium mb-2">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-3 border border-[var(--color-border-input)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary-bg-hover)] focus:border-[var(--color-primary)] outline-none transition-all bg-[var(--color-bg-primary)]" required>
                <option value="Boys">Boys</option>
                <option value="Girls">Girls</option>
                <option value="Co-ed">Co-ed</option>
              </select>
            </div>

            <div>
              <label className="block text-[var(--color-text-tertiary)] text-sm font-medium mb-2">Hostel Type</label>
              <select name="type" value={formData.type} onChange={handleChange} className="w-full p-3 border border-[var(--color-border-input)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary-bg-hover)] focus:border-[var(--color-primary)] outline-none transition-all bg-[var(--color-bg-primary)]" required>
                <option value="unit-based">Unit-based</option>
                <option value="room-only">Room-only</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <div className="bg-blue-50 px-4 py-3 rounded-lg mb-4">
            <h4 className="text-sm font-medium text-blue-800">Room Configuration</h4>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">{formData.type === "unit-based" ? <UnitBasedForm formData={formData} setFormData={setFormData} /> : <RoomOnlyForm formData={formData} setFormData={setFormData} />}</div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end pt-5 mt-6 border-t border-gray-100 space-y-3 sm:space-y-0 sm:space-x-3">
          <button type="button" className="order-last sm:order-first px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all font-medium" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="px-5 py-2.5 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition-all shadow-sm hover:shadow font-medium">
            Add Hostel
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default AddHostelModal
