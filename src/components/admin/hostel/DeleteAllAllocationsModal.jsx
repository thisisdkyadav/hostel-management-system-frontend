import React from "react"
import Modal from "../../common/Modal"
import { FiAlertTriangle } from "react-icons/fi"
import Button from "../../common/Button"

const DeleteAllAllocationsModal = ({ onClose, onConfirm, hostelName, isLoading }) => {
  return (
    <Modal onClose={onClose} title="Delete All Allocations" width={450}>
      <div className="py-4">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-100 text-red-700 rounded-full">
            <FiAlertTriangle size={32} />
          </div>
        </div>

        <div className="text-center space-y-4 mb-6">
          <p className="text-red-600 font-bold text-lg">CRITICAL WARNING</p>
          <p className="text-gray-800">
            This will remove <span className="font-bold">ALL</span> student room allocations from <span className="font-bold">{hostelName}</span>.
          </p>
          <p className="text-gray-800">All students will be immediately removed from their rooms.</p>
          <p className="text-red-600 font-semibold">This action CANNOT be undone.</p>
        </div>

        <div className="flex justify-center space-x-4 pt-4">
          <Button onClick={onClose} variant="outline" disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} variant="danger" disabled={isLoading} isLoading={isLoading}>
            Delete All Allocations
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default DeleteAllAllocationsModal
