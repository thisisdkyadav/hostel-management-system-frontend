import React, { useState } from "react"
import { HiAnnotation, HiUser, HiCalendar, HiClock, HiEye } from "react-icons/hi"
import { wardenApi } from "../services/apiService"

const FeedbackCard = ({ feedback, refresh }) => {
  const [isUpdating, setIsUpdating] = useState(false)
  const [status, setStatus] = useState(feedback.status)

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status) => {
    return status === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"
  }

  const handleMarkAsSeen = async () => {
    if (status === "Seen") return

    try {
      setIsUpdating(true)
      const response = await wardenApi.updateFeedbackStatus(feedback._id, "Seen")
      if (response.success) {
        setStatus("Seen")
        refresh()
      } else {
        alert("Failed to update feedback status")
      }
    } catch (error) {
      console.error("Error updating feedback status:", error)
      alert("An error occurred while updating feedback status")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <div className="p-2.5 mr-3 rounded-xl bg-blue-100 text-[#1360AB]">
            <HiAnnotation size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-base md:text-lg line-clamp-1">{feedback.title}</h3>
            <span className="text-xs text-gray-500">ID: {feedback._id.substring(0, 8)}</span>
          </div>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full ${getStatusColor(status)}`}>{status}</span>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center flex-wrap">
          <div className="flex items-center mr-4 mb-1">
            <HiUser className="text-[#1360AB] text-opacity-70 mr-2 flex-shrink-0" />
            <span className="text-sm text-gray-700">{feedback.userId.name}</span>
          </div>
          <div className="flex items-center mr-4 mb-1">
            <HiCalendar className="text-[#1360AB] text-opacity-70 mr-2 flex-shrink-0" />
            <span className="text-sm text-gray-700">{formatDate(feedback.createdAt)}</span>
          </div>
          <div className="flex items-center">
            <HiClock className="text-[#1360AB] text-opacity-70 mr-2 flex-shrink-0" />
            <span className="text-sm text-gray-700">{formatTime(feedback.createdAt)}</span>
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg min-h-[80px]">
          <p className="text-sm text-gray-700">{feedback.description}</p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
        {status === "Pending" && (
          <button onClick={handleMarkAsSeen} disabled={isUpdating} className="flex items-center px-4 py-2 bg-[#E4F1FF] text-[#1360AB] rounded-lg hover:bg-[#1360AB] hover:text-white transition-all duration-300">
            {isUpdating ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                Updating...
              </>
            ) : (
              <>
                <HiEye className="mr-2" /> Mark as Seen
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

export default FeedbackCard
