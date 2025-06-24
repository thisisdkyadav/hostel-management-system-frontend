import React from "react"
import { FaCalendarAlt, FaInfoCircle } from "react-icons/fa"
import { getStatusColor } from "../../utils/adminUtils"
import Modal from "../common/Modal"
import { formatDate } from "../../utils/formatters"

const LostAndFoundDetailModal = ({ selectedItem, setShowDetailModal }) => {
  if (!selectedItem) return null

  return (
    <Modal title="Found Item Details" onClose={() => setShowDetailModal(false)} width={700}>
      <div className="relative">
        {/* Status Badge - Positioned at top right */}
        <div className="absolute top-0 right-0">
          <span className={`px-4 py-1.5 text-sm font-medium rounded-full shadow-sm ${getStatusColor(selectedItem.status)}`}>{selectedItem.status}</span>
        </div>

        {/* Header */}
        <div className="mb-6 pt-2">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">{selectedItem.itemName}</h2>
          <div className="flex items-center text-gray-500">
            <FaCalendarAlt className="mr-2 text-sm" />
            <span>{formatDate(selectedItem.dateFound)}</span>
          </div>
        </div>

        {/* Description */}
        <div className="bg-gray-50 p-6 rounded-xl mb-6">
          <div className="flex items-center mb-3 text-[#1360AB]">
            <FaInfoCircle className="mr-2" />
            <h3 className="font-semibold">Description</h3>
          </div>
          <p className="text-gray-700 leading-relaxed">{selectedItem.description}</p>
        </div>
      </div>
    </Modal>
  )
}

export default LostAndFoundDetailModal
