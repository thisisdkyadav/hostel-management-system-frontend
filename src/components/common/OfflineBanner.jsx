import { useState } from "react"
import { IoCloudOfflineOutline } from "react-icons/io5"
import { FaTimes } from "react-icons/fa"
import { Button } from "czero/react"

const OfflineBanner = ({ message = "You are currently offline", className = "", showDismiss = false }) => {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) {
    return null
  }

  return (
    <div className={`bg-[var(--color-warning-bg)] border-l-4 border-[var(--color-warning)] p-3 rounded-md shadow-sm ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <IoCloudOfflineOutline className="text-[var(--color-warning)] text-xl mr-2" />
          <p className="text-[var(--color-warning-dark)] text-sm font-medium">{message}</p>
        </div>
        {showDismiss && (
          <Button onClick={() => setDismissed(true)} variant="ghost" size="sm" aria-label="Dismiss"><FaTimes className="h-4 w-4" /></Button>
        )}
      </div>
    </div>
  )
}

export default OfflineBanner
