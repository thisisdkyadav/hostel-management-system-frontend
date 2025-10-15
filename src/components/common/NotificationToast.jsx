import React, { useState, useEffect } from "react"
import { FaCheckCircle, FaExclamationCircle, FaTimes } from "react-icons/fa"

const NotificationToast = ({ message, type = "info", duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(() => onClose && onClose(), 300) // Wait for fade animation
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const getIcon = () => {
    switch (type) {
      case "success":
        return <FaCheckCircle className="text-green-500" />
      case "error":
        return <FaExclamationCircle className="text-red-500" />
      default:
        return <FaCheckCircle className="text-blue-500" />
    }
  }

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200"
      case "error":
        return "bg-red-50 border-red-200"
      default:
        return "bg-blue-50 border-blue-200"
    }
  }

  const getTextColor = () => {
    switch (type) {
      case "success":
        return "text-green-800"
      case "error":
        return "text-red-800"
      default:
        return "text-blue-800"
    }
  }

  if (!visible) return null

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${visible ? "opacity-100 transform translate-y-0" : "opacity-0 transform -translate-y-2"}`}>
      <div className={`max-w-sm w-full ${getBgColor()} border rounded-lg shadow-lg p-4`}>
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-3 mt-0.5">{getIcon()}</div>
          <div className="flex-1">
            <p className={`text-sm font-medium ${getTextColor()}`}>{message}</p>
          </div>
          <button
            onClick={() => {
              setVisible(false)
              setTimeout(() => onClose && onClose(), 300)
            }}
            className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600"
          >
            <FaTimes size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotificationToast
