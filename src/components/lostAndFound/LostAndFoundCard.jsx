import React, { useState } from "react"
import { FaEdit } from "react-icons/fa"
import { BsCalendarDate } from "react-icons/bs"
import { MdInventory } from "react-icons/md"
import { formatDate } from "../../utils/formatters"
import { getMediaUrl } from "../../utils/mediaUtils"
import LostAndFoundEditForm from "./LostAndFoundEditForm"
import LostAndFoundDetailModal from "./LostAndFoundDetailModal"
import { lostAndFoundApi } from "../../services/apiService"
import { useAuth } from "../../contexts/AuthProvider"

const LostAndFoundCard = ({ item, refresh }) => {
  const { user, canAccess } = useAuth()

  const [isEditing, setIsEditing] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)

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

  const handleEditClick = (e) => {
    e.stopPropagation()
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const handleSaveEdit = async (updatedItem) => {
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

  const handleCardClick = () => {
    setShowDetailModal(true)
  }

  if (isEditing) {
    return <LostAndFoundEditForm item={item} onCancel={handleCancelEdit} onSave={handleSaveEdit} onDelete={handleDelete} />
  }

  return (
    <>
      <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 cursor-pointer" onClick={handleCardClick}>
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div className={`p-2.5 mr-3 rounded-lg ${getStatusColor(item.status)}`}>
              <MdInventory size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-base md:text-lg line-clamp-1">{item.itemName}</h3>
              <span className="text-xs text-gray-500">ID: {item._id.substring(0, 8)}</span>
            </div>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full ${getStatusColor(item.status)}`}>{item.status}</span>
        </div>

        {item.images && item.images.length > 0 && (
          <div className="mt-4">
            <div className="grid grid-cols-3 gap-2">
              {item.images.slice(0, 3).map((imageUrl, index) => (
                <img key={index} src={getMediaUrl(imageUrl)} alt={`${item.itemName} ${index + 1}`} className="w-full h-20 object-cover rounded-lg border border-gray-200" />
              ))}
            </div>
            {item.images.length > 3 && <p className="text-xs text-gray-500 mt-2">+{item.images.length - 3} more images</p>}
          </div>
        )}

        <div className="mt-4 space-y-3">
          <div className="flex items-center">
            <BsCalendarDate className="text-[#1360AB] text-opacity-70 mr-2 flex-shrink-0" />
            <span className="text-sm text-gray-700">{formatDate(item.dateFound)}</span>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700 line-clamp-3">{item.description}</p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
          {user && canAccess("lost_and_found", "edit") && ["Admin", "Warden", "Associate Warden", "Hostel Supervisor", "Security", "Hostel Gate"].includes(user?.role) && (
            <button onClick={handleEditClick} className="flex items-center px-4 py-2 bg-[#E4F1FF] text-[#1360AB] rounded-lg hover:bg-[#1360AB] hover:text-white transition-all duration-300">
              <FaEdit className="mr-2" /> Edit
            </button>
          )}
        </div>
      </div>

      {showDetailModal && <LostAndFoundDetailModal selectedItem={item} setShowDetailModal={setShowDetailModal} />}
    </>
  )
}

export default LostAndFoundCard
