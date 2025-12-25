import { useState, useEffect } from "react"
import Button from "./Button"

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
        <Button onClick={() => {
          if (onAction) onAction()
          setVisible(false)
        }} variant="primary" size="small">
          {action}
        </Button>
      )}
      {onClose && (
        <Button onClick={() => {
          setVisible(false)
          onClose()
        }} variant="ghost" size="small" aria-label="Close">
          ×
        </Button>
      )}
    </div>
  ) : null
}

export default Toast
