import { useState, useEffect } from "react"

const Toast = ({ message, action, onAction, onClose, duration = 0 }) => {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false)
        if (onClose) onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  return visible ? (
    <div className="fixed bottom-4 right-4 z-50 flex items-center bg-white border border-gray-200 px-4 py-3 rounded-lg shadow-lg max-w-sm animate-fade-in">
      <div className="mr-3 flex-grow">{message}</div>
      {action && (
        <button onClick={() => {
            if (onAction) onAction()
            setVisible(false)
          }}
          className="bg-[#1360AB] text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          {action}
        </button>
      )}
      {onClose && (
        <button onClick={() => {
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
