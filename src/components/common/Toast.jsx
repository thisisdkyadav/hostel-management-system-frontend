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
    <div className="fixed bottom-4 right-4 z-50 flex items-center bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] px-4 py-3 rounded-lg shadow-lg max-w-sm animate-fade-in">
      <div className="mr-3 flex-grow text-[var(--color-text-body)]">{message}</div>
      {action && (
        <button onClick={() => {
          if (onAction) onAction()
          setVisible(false)
        }}
          className="bg-[var(--color-primary)] text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
        >
          {action}
        </button>
      )}
      {onClose && (
        <button onClick={() => {
          setVisible(false)
          onClose()
        }}
          className="ml-2 text-[var(--color-text-disabled)] hover:text-[var(--color-text-muted)]"
          aria-label="Close"
        >
          ×
        </button>
      )}
    </div>
  ) : null
}

export default Toast
