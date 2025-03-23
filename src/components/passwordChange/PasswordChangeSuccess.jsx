import React from "react"
import Modal from "../common/Modal"

const PasswordChangeSuccess = ({ email, onClose }) => {
  return (
    <Modal title="Password Updated" onClose={onClose} width={500}>
      <div className="text-center py-4">
        <div className="mx-auto bg-green-100 text-green-600 w-16 h-16 flex items-center justify-center rounded-full mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h3 className="text-xl font-bold text-gray-800 mb-2">Password Changed Successfully</h3>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 flex items-center justify-center mx-auto max-w-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="text-gray-800 font-medium break-all">{email}</span>
        </div>

        <p className="text-gray-600 mb-8 max-w-md mx-auto">Your password has been successfully updated. You will use this new password the next time you log in.</p>

        <div className="flex justify-center">
          <button onClick={onClose} className="px-6 py-3 bg-[#1360AB] text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Done
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default PasswordChangeSuccess
