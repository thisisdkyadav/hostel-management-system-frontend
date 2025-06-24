import { useState } from "react"
import { IoCloudOfflineOutline } from "react-icons/io5"

const OfflineBanner = ({ message = "You are currently offline", className = "", showDismiss = false }) => {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) {
    return null
  }

  return (
    <div className={`bg-amber-50 border-l-4 border-amber-500 p-3 rounded-md shadow-sm ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <IoCloudOfflineOutline className="text-amber-500 text-xl mr-2" />
          <p className="text-amber-800 text-sm font-medium">{message}</p>
        </div>
        {showDismiss && (
          <button onClick={() => setDismissed(true)} className="text-amber-700 hover:text-amber-900 ml-2">
            <span className="sr-only">Dismiss</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

export default OfflineBanner
