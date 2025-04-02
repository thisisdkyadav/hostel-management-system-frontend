import React from "react"
import { FiWifiOff } from "react-icons/fi"

/**
 * A reusable offline notification banner component
 * @param {Object} props
 * @param {string} props.message - Custom message to display in the banner
 * @param {string} props.className - Additional CSS classes to apply to the banner
 */
const OfflineBanner = ({ message = "You are currently offline. Viewing cached data.", className = "" }) => {
  return (
    <div className={`p-3 bg-amber-100 border border-amber-300 rounded-md flex items-center text-amber-800 ${className}`}>
      <FiWifiOff className="mr-2 text-lg" />
      <span>{message}</span>
    </div>
  )
}

export default OfflineBanner
