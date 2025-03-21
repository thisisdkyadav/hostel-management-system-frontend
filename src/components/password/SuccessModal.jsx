import { HiCheckCircle } from "react-icons/hi"

const SuccessModal = ({ show, email, onClose }) => {
  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-[20px] w-[500px] max-w-[95%] text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-green-100 text-green-600 p-3 rounded-full">
            <HiCheckCircle size={40} />
          </div>
        </div>

        <h2 className="text-xl font-bold mb-3">Password Updated Successfully</h2>

        <p className="mb-6 text-gray-600">
          The password for <span className="font-medium">{email}</span> has been successfully updated. The user will need to use this new password for their next login.
        </p>

        <div className="flex justify-center">
          <button onClick={onClose} className="px-6 py-3 bg-[#1360AB] text-white rounded-xl hover:bg-[#0d4b86] transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default SuccessModal
