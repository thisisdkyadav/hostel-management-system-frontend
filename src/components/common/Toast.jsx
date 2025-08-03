import { useState, useEffect } from "react"

const Toast = ({ message, action, onAction, onClose, duration = 0, persistent = false }) => {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (duration > 0 && !persistent) {
      const timer = setTimeout(() => {
        setVisible(false)
        if (onClose) onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose, persistent])

  return visible ? (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center ${persistent ? "bg-blue-50 border-blue-300" : "bg-white border-gray-200"} border px-4 py-3 rounded-lg shadow-lg max-w-sm animate-fade-in`}>
      <div className="mr-3 flex-grow">{message}</div>
      {action && (
        <button
          onClick={() => {
            if (onAction) onAction()
            setVisible(false)
          }}
          className={`${persistent ? "bg-blue-600" : "bg-[#1360AB]"} text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors`}
        >
          {action}
        </button>
      )}
      {onClose && (
        <button
          onClick={() => {
            setVisible(false)
            onClose()
          }}
          className="ml-2 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          ×
        </button>
      )}
    </div>
  ) : null
}

export default Toast
