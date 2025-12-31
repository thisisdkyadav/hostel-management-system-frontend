import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react"
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaExclamationTriangle, FaTimes } from "react-icons/fa"

/**
 * Toast context for managing toasts
 */
const ToastContext = createContext(null)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return context
}

/**
 * Individual Toast Component
 */
const ToastItem = ({ toast, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false)
  const timeoutRef = useRef(null)

  const variants = {
    success: {
      icon: <FaCheckCircle />,
      color: "var(--color-success)",
      background: "var(--color-success-bg)",
    },
    error: {
      icon: <FaExclamationCircle />,
      color: "var(--color-danger)",
      background: "var(--color-danger-bg)",
    },
    warning: {
      icon: <FaExclamationTriangle />,
      color: "var(--color-warning)",
      background: "var(--color-warning-bg)",
    },
    info: {
      icon: <FaInfoCircle />,
      color: "var(--color-primary)",
      background: "var(--color-primary-bg)",
    },
  }

  const currentVariant = variants[toast.type] || variants.info

  useEffect(() => {
    if (toast.duration !== Infinity) {
      timeoutRef.current = setTimeout(() => {
        setIsExiting(true)
        setTimeout(() => onRemove(toast.id), 200)
      }, toast.duration || 5000)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [toast.id, toast.duration, onRemove])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => onRemove(toast.id), 200)
  }

  const toastStyles = {
    display: "flex",
    alignItems: "flex-start",
    gap: "var(--spacing-3)",
    padding: "var(--spacing-3) var(--spacing-4)",
    background: "var(--color-bg-primary)",
    borderRadius: "var(--radius-lg)",
    boxShadow: "var(--shadow-dropdown)",
    borderLeft: `4px solid ${currentVariant.color}`,
    minWidth: "300px",
    maxWidth: "400px",
    animation: isExiting ? "toastOut 0.2s ease-in forwards" : "toastIn 0.3s ease-out",
  }

  const iconStyles = {
    flexShrink: 0,
    color: currentVariant.color,
    fontSize: "var(--font-size-lg)",
    marginTop: "2px",
  }

  const contentStyles = {
    flex: 1,
    minWidth: 0,
  }

  const titleStyles = {
    fontSize: "var(--font-size-sm)",
    fontWeight: "var(--font-weight-medium)",
    color: "var(--color-text-heading)",
    margin: 0,
  }

  const messageStyles = {
    fontSize: "var(--font-size-sm)",
    color: "var(--color-text-muted)",
    marginTop: toast.title ? "var(--spacing-1)" : 0,
  }

  const closeButtonStyles = {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "24px",
    height: "24px",
    borderRadius: "var(--radius-sm)",
    background: "transparent",
    border: "none",
    color: "var(--color-text-muted)",
    cursor: "pointer",
    transition: "var(--transition-colors)",
  }

  return (
    <div style={toastStyles}>
      <span style={iconStyles}>{currentVariant.icon}</span>
      <div style={contentStyles}>
        {toast.title && <p style={titleStyles}>{toast.title}</p>}
        <p style={messageStyles}>{toast.message}</p>
      </div>
      <button
        onClick={handleClose}
        style={closeButtonStyles}
        aria-label="Dismiss toast"
        onMouseEnter={(e) => {
          e.target.style.background = "var(--color-bg-hover)"
        }}
        onMouseLeave={(e) => {
          e.target.style.background = "transparent"
        }}
      >
        <FaTimes size={12} />
      </button>
    </div>
  )
}

/**
 * ToastProvider Component
 * 
 * @param {React.ReactNode} children - App children
 * @param {string} position - Toast position: top-right, top-left, bottom-right, bottom-left, top-center, bottom-center
 */
export const ToastProvider = ({
  children,
  position = "top-right",
}) => {
  const [toasts, setToasts] = useState([])

  const positions = {
    "top-right": { top: "var(--spacing-4)", right: "var(--spacing-4)", alignItems: "flex-end" },
    "top-left": { top: "var(--spacing-4)", left: "var(--spacing-4)", alignItems: "flex-start" },
    "top-center": { top: "var(--spacing-4)", left: "50%", transform: "translateX(-50%)", alignItems: "center" },
    "bottom-right": { bottom: "var(--spacing-4)", right: "var(--spacing-4)", alignItems: "flex-end" },
    "bottom-left": { bottom: "var(--spacing-4)", left: "var(--spacing-4)", alignItems: "flex-start" },
    "bottom-center": { bottom: "var(--spacing-4)", left: "50%", transform: "translateX(-50%)", alignItems: "center" },
  }

  const addToast = useCallback((options) => {
    const id = Date.now() + Math.random()
    const toast = {
      id,
      type: "info",
      duration: 5000,
      ...options,
    }
    setToasts((prev) => [...prev, toast])
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((message, options = {}) => {
    return addToast({ message, ...options })
  }, [addToast])

  toast.success = (message, options = {}) => addToast({ message, type: "success", ...options })
  toast.error = (message, options = {}) => addToast({ message, type: "error", ...options })
  toast.warning = (message, options = {}) => addToast({ message, type: "warning", ...options })
  toast.info = (message, options = {}) => addToast({ message, type: "info", ...options })

  const containerStyles = {
    position: "fixed",
    zIndex: 9999,
    display: "flex",
    flexDirection: "column",
    gap: "var(--spacing-3)",
    pointerEvents: "none",
    ...positions[position],
  }

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast }}>
      {children}
      <style>
        {`
          @keyframes toastIn {
            from { opacity: 0; transform: translateX(100%); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes toastOut {
            from { opacity: 1; transform: translateX(0); }
            to { opacity: 0; transform: translateX(100%); }
          }
        `}
      </style>
      <div style={containerStyles}>
        {toasts.map((t) => (
          <div key={t.id} style={{ pointerEvents: "auto" }}>
            <ToastItem toast={t} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

/**
 * Standalone Toast Component for controlled usage
 */
const Toast = ({
  message,
  title,
  type = "info",
  isVisible,
  onClose,
  duration = 5000,
}) => {
  useEffect(() => {
    if (isVisible && duration !== Infinity) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  return (
    <ToastItem
      toast={{ id: "standalone", message, title, type, duration }}
      onRemove={onClose}
    />
  )
}

Toast.displayName = "Toast"

export default Toast
