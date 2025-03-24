import React from "react"
import { FiAlertCircle } from "react-icons/fi"

const ErrorState = ({ message, onRetry, title = "Something went wrong", buttonText = "Try Again" }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <FiAlertCircle className="h-8 w-8 text-red-500" />
      </div>
      <h3 className="text-lg font-medium text-gray-700">{title}</h3>
      <p className="text-gray-500 mt-1 max-w-md mx-auto">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-4 px-4 py-2 bg-[#1360AB] text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          {buttonText}
        </button>
      )}
    </div>
  )
}

export default ErrorState
