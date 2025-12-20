import React from "react"
import { FiAlertCircle } from "react-icons/fi"

const ErrorState = ({ message, onRetry, title = "Something went wrong", buttonText = "Try Again" }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 bg-[var(--color-danger-bg-light)] rounded-full flex items-center justify-center mb-4">
        <FiAlertCircle className="h-8 w-8 text-[var(--color-danger)]" />
      </div>
      <h3 className="text-lg font-medium text-[var(--color-text-body)]">{title}</h3>
      <p className="text-[var(--color-text-muted)] mt-1 max-w-md mx-auto">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-4 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors">
          {buttonText}
        </button>
      )}
    </div>
  )
}

export default ErrorState
