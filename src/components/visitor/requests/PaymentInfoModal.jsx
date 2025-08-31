import React from "react"
import Modal from "../../common/Modal"
import { getMediaUrl } from "../../../utils/mediaUtils"

const PaymentInfoModal = ({ isOpen, onClose, paymentScreenshot }) => {
  if (!isOpen) return null

  return (
    <Modal title="Payment Screenshot" onClose={onClose} width={800}>
      <div className="p-4">
        {paymentScreenshot ? (
          <div className="flex justify-center">
            <img src={getMediaUrl(paymentScreenshot)} alt="Payment Screenshot" className="max-w-full max-h-96 object-contain rounded-lg shadow-lg" />
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-gray-500">No payment screenshot available</p>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default PaymentInfoModal
