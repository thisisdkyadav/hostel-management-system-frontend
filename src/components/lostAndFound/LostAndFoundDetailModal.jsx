import React, { useState } from "react"
import { FaCalendarAlt, FaInfoCircle, FaImage, FaTimes } from "react-icons/fa"
import { getStatusColor } from "../../utils/adminUtils"
import Modal from "../common/Modal"
import { formatDate } from "../../utils/formatters"
import { getMediaUrl } from "../../utils/mediaUtils"

const LostAndFoundDetailModal = ({ selectedItem, setShowDetailModal }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(null)

  if (!selectedItem) return null

  const openImageViewer = (index) => {
    setSelectedImageIndex(index)
  }

  const closeImageViewer = () => {
    setSelectedImageIndex(null)
  }

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % selectedItem.images.length)
  }

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + selectedItem.images.length) % selectedItem.images.length)
  }

  return (
    <>
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

          {/* Images Section */}
          {selectedItem.images && selectedItem.images.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center mb-3 text-[#1360AB]">
                <FaImage className="mr-2" />
                <h3 className="font-semibold">Item Images</h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {selectedItem.images.map((imageUrl, index) => (
                  <img key={index} src={getMediaUrl(imageUrl)} alt={`${selectedItem.itemName} ${index + 1}`} onClick={() => openImageViewer(index)} className="w-full h-32 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity" />
                ))}
              </div>
            </div>
          )}

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

      {/* Image Viewer Modal */}
      {selectedImageIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-[9999] flex items-center justify-center" onClick={closeImageViewer}>
          <button onClick={closeImageViewer} className="absolute top-4 right-4 text-white hover:text-gray-300 z-10">
            <FaTimes size={30} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              prevImage()
            }}
            className="absolute left-4 text-white hover:text-gray-300 text-4xl font-bold"
          >
            ‹
          </button>

          <div className="max-w-4xl max-h-screen p-4" onClick={(e) => e.stopPropagation()}>
            <img src={getMediaUrl(selectedItem.images[selectedImageIndex])} alt={`${selectedItem.itemName} ${selectedImageIndex + 1}`} className="max-w-full max-h-[90vh] object-contain rounded-lg" />
            <p className="text-white text-center mt-4">
              Image {selectedImageIndex + 1} of {selectedItem.images.length}
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation()
              nextImage()
            }}
            className="absolute right-4 text-white hover:text-gray-300 text-4xl font-bold"
          >
            ›
          </button>
        </div>
      )}
    </>
  )
}

export default LostAndFoundDetailModal
