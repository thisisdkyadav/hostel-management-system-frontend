import React from "react"
import { HiCheckCircle } from "react-icons/hi"
import Modal from "../common/Modal"

const CommonSuccessModal = ({ show, onClose, title = "Success", message = "Operation completed successfully.", buttonText = "Done", infoText = "", infoIcon = null, width = 500 }) => {
  if (!show) return null

  const InfoIcon = infoIcon

  return (
    <Modal title={title} onClose={onClose} width={width}>
      <div className="text-center py-4">
        <div className="mx-auto bg-green-100 text-green-600 w-16 h-16 flex items-center justify-center rounded-full mb-6">
          <HiCheckCircle size={40} />
        </div>

        <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>

        {infoText && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 flex items-center justify-center mx-auto max-w-md">
            {InfoIcon && <InfoIcon className="text-gray-400 mr-2 flex-shrink-0" size={20} />}
            <span className="text-gray-800 font-medium break-all">{infoText}</span>
          </div>
        )}

        <p className="text-gray-600 mb-8 max-w-md mx-auto">{message}</p>

        <div className="flex justify-center">
          <button onClick={onClose} className="px-6 py-3 bg-[#1360AB] text-white rounded-lg hover:bg-[#0d4b86] transition-colors shadow-sm hover:shadow flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {buttonText}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default CommonSuccessModal
