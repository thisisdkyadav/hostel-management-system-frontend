import React, { useState } from "react"
import { MdInventory, MdSave, MdCancel, MdDelete } from "react-icons/md"
import { BsCalendarDate } from "react-icons/bs"

const LostAndFoundEditForm = ({ item, onCancel, onSave, onDelete }) => {
  const [formData, setFormData] = useState({
    itemName: item.itemName,
    description: item.description,
    status: item.status,
    dateFound: item.dateFound.split("T")[0],
  })

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-600"
      case "Claimed":
        return "bg-blue-100 text-blue-600"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      ...item,
      ...formData,
    })
  }

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
      onDelete(item._id)
    }
  }

  return (
    <div className="bg-white rounded-[20px] p-6 shadow-[0px_1px_20px_rgba(0,0,0,0.06)]">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center mb-5">
          <div className={`p-3 mr-4 rounded-xl ${getStatusColor(formData.status)}`}>
            <MdInventory size={24} />
          </div>
          <div className="w-full">
            <input type="text" name="itemName" value={formData.itemName} onChange={handleChange} className="font-bold text-lg w-full border-b border-gray-300 focus:border-blue-500 outline-none" required />
            <span className="text-sm text-gray-600">ID: {item._id.substring(0, 8)}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center">
            <BsCalendarDate className="text-gray-500 mr-2" />
            <input type="date" name="dateFound" value={formData.dateFound} onChange={handleChange} className="text-sm border-b border-gray-300 focus:border-blue-500 outline-none" />
          </div>

          <div>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full text-sm text-gray-700 border rounded-md p-2 focus:border-blue-500 outline-none" placeholder="Item description"></textarea>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">Status:</label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border rounded-md focus:border-blue-500 outline-none">
              <option value="Active">Active</option>
              <option value="Claimed">Claimed</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        </div>

        <div className="mt-5 flex justify-between">
          <button type="button" onClick={handleDelete} className="flex items-center px-4 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors">
            <MdDelete className="mr-2" /> Delete
          </button>

          <div className="flex space-x-3">
            <button type="button" onClick={onCancel} className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors">
              <MdCancel className="mr-2" /> Cancel
            </button>
            <button type="submit" className="flex items-center px-4 py-2 bg-[#1360AB] text-white rounded-xl hover:bg-[#0d4b86] transition-colors">
              <MdSave className="mr-2" /> Save
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default LostAndFoundEditForm
