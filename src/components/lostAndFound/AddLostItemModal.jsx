import React, { useState } from "react"
import { lostAndFoundApi } from "../../services/apiService"

const AddLostItemModal = ({ show, onClose, onItemAdded }) => {
  const [formData, setFormData] = useState({
    itemName: "",
    description: "",
    dateFound: new Date().toISOString().split("T")[0],
    status: "Active",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const newItem = await lostAndFoundApi.addLostItem(formData)
      if (!newItem) {
        alert("Failed to add item. Please try again.")
        return
      }
      alert(`Item "${newItem.itemName}" added successfully!`)
      onItemAdded && onItemAdded()
      onClose()
    } catch (error) {
      console.error("Error adding lost item:", error)
      alert("Failed to add item. Please try again.")
    }
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-[20px] w-[600px] max-w-[95%] max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-5">Add Lost Item</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Item Name</label>
            <input type="text" name="itemName" value={formData.itemName} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" placeholder="Enter item name" required />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full p-2 border border-gray-300 rounded-lg resize-none" placeholder="Describe the item, condition, where it was found, etc." required></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Date Found</label>
              <input type="date" name="dateFound" value={formData.dateFound} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" required />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" required>
                <option value="Active">Active</option>
                <option value="Claimed">Claimed</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-6 space-x-3">
            <button type="button" className="px-5 py-2 bg-gray-200 rounded-lg" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 bg-[#1360AB] text-white rounded-lg">
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddLostItemModal
