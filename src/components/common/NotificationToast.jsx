import React, { useState, useEffect } from "react"
import { FaCheckCircle, FaExclamationCircle, FaTimes } from "react-icons/fa"
import { Button } from "czero/react"

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
        return <FaCheckCircle className="text-[var(--color-success)]" />
      case "error":
        return <FaExclamationCircle className="text-[var(--color-danger)]" />
      default:
        return <FaCheckCircle className="text-[var(--color-primary)]" />
    }
  }

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-[var(--color-success-bg-light)] border-[var(--color-success-light)]"
      case "error":
        return "bg-[var(--color-danger-bg-light)] border-[var(--color-danger-light)]"
      default:
        return "bg-[var(--color-primary-bg)] border-[var(--color-primary-light)]"
    }
  }

  const getTextColor = () => {
    switch (type) {
      case "success":
        return "text-[var(--color-success-dark)]"
      case "error":
        return "text-[var(--color-danger-dark)]"
      default:
        return "text-[var(--color-primary-dark)]"
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
          <Button onClick={() => {
            setVisible(false)
            setTimeout(() => onClose && onClose(), 300)
          }}
            variant="ghost"
            size="sm"
            aria-label="Close notification"
            style={{ flexShrink: 0, marginLeft: '0.75rem' }}
          ><FaTimes size={14} /></Button>
        </div>
      </div>
    </div>
  )
}

export default NotificationToast
