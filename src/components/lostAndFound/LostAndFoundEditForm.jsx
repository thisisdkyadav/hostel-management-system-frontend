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
    <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center mb-4">
          <div className={`p-2.5 mr-3 rounded-lg ${getStatusColor(formData.status)}`}>
            <MdInventory size={20} />
          </div>
          <div className="w-full">
            <input type="text" name="itemName" value={formData.itemName} onChange={handleChange} className="font-bold text-lg w-full border-b border-gray-300 focus:border-[#1360AB] outline-none pb-1" required />
            <span className="text-xs text-gray-500">ID: {item._id.substring(0, 8)}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center">
            <BsCalendarDate className="text-[#1360AB] text-opacity-70 mr-2 flex-shrink-0" />
            <input type="date" name="dateFound" value={formData.dateFound} onChange={handleChange} className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:border-[#1360AB] focus:ring-1 focus:ring-blue-100 outline-none w-full" />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1.5">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full text-sm text-gray-700 border border-gray-300 rounded-lg p-3 focus:border-[#1360AB] focus:ring-1 focus:ring-blue-100 outline-none resize-none"
              placeholder="Item description"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1.5">Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-[#1360AB] focus:ring-1 focus:ring-blue-100 outline-none bg-white">
              <option value="Active">Active</option>
              <option value="Claimed">Claimed</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-between sm:items-center space-y-3 space-y-reverse sm:space-y-0">
          <button type="button" onClick={handleDelete} className="flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
            <MdDelete className="mr-2" /> Delete
          </button>

          <div className="flex flex-col-reverse sm:flex-row space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3">
            <button type="button" onClick={onCancel} className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <MdCancel className="mr-2" /> Cancel
            </button>
            <button type="submit" className="flex items-center justify-center px-4 py-2 bg-[#1360AB] text-white rounded-lg hover:bg-[#0d4b86] transition-colors">
              <MdSave className="mr-2" /> Save
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default LostAndFoundEditForm
