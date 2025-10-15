import React, { createContext, useState, useContext } from "react"
import NotificationToast from "../components/common/NotificationToast"

const NotificationContext = createContext(null)
export const useNotification = () => useContext(NotificationContext)

const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])

  const addNotification = (message, type = "info", duration = 3000) => {
    const id = Date.now() + Math.random()
    const notification = { id, message, type, duration }

    setNotifications((prev) => [...prev, notification])

    // Auto-remove notification after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration + 300) // Add extra time for fade animation
    }

    return id
  }

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  const showSuccess = (message, duration = 3000) => {
    return addNotification(message, "success", duration)
  }

  const showError = (message, duration = 5000) => {
    return addNotification(message, "error", duration)
  }

  const showInfo = (message, duration = 3000) => {
    return addNotification(message, "info", duration)
  }

  const value = {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showInfo,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}

      {/* Render notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification, index) => (
          <div key={notification.id} style={{ transform: `translateY(${index * 80}px)` }} className="transition-transform duration-300">
            <NotificationToast
              message={notification.message}
              type={notification.type}
              duration={0} // Duration is handled by the provider
              onClose={() => removeNotification(notification.id)}
            />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

export default NotificationProvider
