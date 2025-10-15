import React from "react"
import { FaKeyboard, FaArrowDown, FaArrowRight, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa"
import { useQRScanner } from "../../contexts/QRScannerProvider"

const ScannerStatusIndicator = () => {
  const { pendingCrossHostelEntries, error } = useQRScanner()

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">External Scanner Status</h3>
        <div className="flex items-center text-green-600">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          <span className="text-xs">Active</span>
        </div>
      </div>

      <div className="space-y-2 text-xs text-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FaKeyboard className="mr-2 text-blue-500" />
            <span>Check-in Scanner</span>
          </div>
          <div className="flex items-center">
            <FaArrowDown className="text-green-600" />
            <span className="ml-1">Down Arrow</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FaKeyboard className="mr-2 text-blue-500" />
            <span>Check-out Scanner</span>
          </div>
          <div className="flex items-center">
            <FaArrowRight className="text-orange-600 transform rotate-90" />
            <span className="ml-1">Tab Key</span>
          </div>
        </div>
      </div>

      {pendingCrossHostelEntries.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center text-orange-600">
            <FaExclamationTriangle className="mr-2" />
            <span className="text-xs">
              {pendingCrossHostelEntries.length} cross-hostel check-in {pendingCrossHostelEntries.length === 1 ? "entry" : "entries"} pending reason
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center text-red-600">
            <FaExclamationTriangle className="mr-2" />
            <span className="text-xs">Scanner Error</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default ScannerStatusIndicator
