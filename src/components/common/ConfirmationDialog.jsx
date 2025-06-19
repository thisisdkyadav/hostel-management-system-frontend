import React from "react"
import { FiAlertTriangle } from "react-icons/fi"
import Modal from "./Modal"

const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title = "Confirm Action", message = "Are you sure you want to proceed?", confirmText = "Confirm", cancelText = "Cancel", isDestructive = false }) => {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const renderFooter = () => {
    return (
      <div className="flex justify-end space-x-3">
        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
          {cancelText}
        </button>
        <button type="button" onClick={handleConfirm} className={`px-4 py-2 ${isDestructive ? "bg-red-600 hover:bg-red-700" : "bg-[#1360AB] hover:bg-blue-700"} text-white rounded-lg text-sm font-medium transition-colors`}>
          {confirmText}
        </button>
      </div>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} footer={renderFooter()} width={400}>
      <div className="py-4">
        {isDestructive && (
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-full">
              <FiAlertTriangle size={24} />
            </div>
          </div>
        )}
        <p className="text-center text-gray-700">{message}</p>
      </div>
    </Modal>
  )
}

export default ConfirmationDialog
