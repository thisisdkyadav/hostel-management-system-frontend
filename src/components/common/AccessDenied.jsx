import React from "react"
import { useNavigate } from "react-router-dom"

const AccessDenied = ({ title = "Access Denied", message = "You do not have permission to access this page.", icon, suggestion, buttonText = "Return to Home", to = "/" }) => {
  const navigate = useNavigate()

  const handleNavigate = () => {
    navigate(to)
  }

  // Default icon if none provided
  const defaultIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-10v4m6 6a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white rounded-xl shadow-md p-6 md:p-8 max-w-md w-full border border-red-100">
        <div className="flex items-center justify-center bg-red-100 text-red-600 w-14 h-14 rounded-full mb-6 mx-auto">{icon || defaultIcon}</div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">{title}</h2>
        <p className="text-gray-600 text-center mb-3">{message}</p>

        {/* Render suggestion if available */}
        {suggestion && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-6">
            <p className="text-blue-800 text-sm flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{suggestion}</span>
            </p>
          </div>
        )}

        {!suggestion && <div className="mb-3"></div>}

        <div className="flex justify-center">
          <button onClick={handleNavigate} className="px-5 py-2.5 bg-[#1360AB] text-white rounded-lg hover:bg-[#0d4b86] transition-colors shadow-sm">
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AccessDenied
