import React, { useState } from "react"
import { FaEdit } from "react-icons/fa"
import { BsCalendarDate } from "react-icons/bs"
import { MdInventory } from "react-icons/md"
import { formatDate } from "../../utils/formatters"
import LostAndFoundEditForm from "./LostAndFoundEditForm"
import { lostAndFoundApi } from "../../services/apiService"

const LostAndFoundCard = ({ item, refresh }) => {
  const [isEditing, setIsEditing] = useState(false)

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

  const handleEditClick = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const handleSaveEdit = async (updatedItem) => {
    console.log(updatedItem)

    try {
      const response = await lostAndFoundApi.updateLostItem(updatedItem._id, updatedItem)
      if (response.success) {
        alert("Item updated successfully")
        setIsEditing(false)
        refresh()
      } else {
        alert("Failed to update item")
      }
    } catch (error) {
      alert("An error occurred while updating te item")
    }
  }

  const handleDelete = async (itemId) => {
    console.log(itemId)

    try {
      const response = await lostAndFoundApi.deleteLostItem(itemId)
      if (response.success) {
        alert("Item deleted successfully")
        refresh()
      } else {
        alert("Failed to delete item")
      }
    } catch (error) {
      alert("An error occurred while deleting the item")
    }
  }

  if (isEditing) {
    return <LostAndFoundEditForm item={item} onCancel={handleCancelEdit} onSave={handleSaveEdit} onDelete={handleDelete} />
  }

  return (
    <div className="bg-white rounded-[20px] p-6 shadow-[0px_1px_20px_rgba(0,0,0,0.06)] hover:shadow-lg transition-all duration-300">
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <div className={`p-3 mr-4 rounded-xl ${getStatusColor(item.status)}`}>
            <MdInventory size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg">{item.itemName}</h3>
            <span className="text-sm text-gray-600">ID: {item._id.substring(0, 8)}</span>
          </div>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(item.status)}`}>{item.status}</span>
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex items-center">
          <BsCalendarDate className="text-gray-500 mr-2" />
          <span className="text-sm">Date Found: {formatDate(item.dateFound)}</span>
        </div>
        <div>
          <p className="text-sm text-gray-700">{item.description}</p>
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <button onClick={handleEditClick} className="flex items-center px-5 py-2 bg-[#E4F1FF] text-[#1360AB] rounded-xl hover:bg-[#1360AB] hover:text-white transition-colors">
          <FaEdit className="mr-2" /> Edit
        </button>
      </div>
    </div>
  )
}

export default LostAndFoundCard
