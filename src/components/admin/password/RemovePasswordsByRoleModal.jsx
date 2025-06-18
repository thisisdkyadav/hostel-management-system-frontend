import { useState } from "react"
import { HiExclamationCircle, HiShieldExclamation } from "react-icons/hi"
import Modal from "../../common/Modal"

const ROLES = ["Student", "Maintenance Staff", "Warden", "Associate Warden", "Admin", "Security", "Super Admin", "Hostel Supervisor", "Hostel Gate"]

const RemovePasswordsByRoleModal = ({ isOpen, onClose, onRemove }) => {
  const [selectedRole, setSelectedRole] = useState("")
  const [confirmText, setConfirmText] = useState("")
  const [isConfirming, setIsConfirming] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value)
    setError("")
  }

  const handleConfirmTextChange = (e) => {
    setConfirmText(e.target.value)
  }

  const handleProceed = () => {
    if (!selectedRole) {
      setError("Please select a role")
      return
    }
    setIsConfirming(true)
    setConfirmText("")
  }

  const handleConfirmRemove = async () => {
    setIsProcessing(true)
    setError("")

    try {
      await onRemove(selectedRole)
      onClose()
      setSelectedRole("")
      setConfirmText("")
      setIsConfirming(false)
    } catch (error) {
      setError(error.message || "Failed to remove passwords")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBack = () => {
    setIsConfirming(false)
  }

  const handleClose = () => {
    setSelectedRole("")
    setConfirmText("")
    setIsConfirming(false)
    setError("")
    onClose()
  }

  if (!isOpen) return null

  return (
    <Modal title="Remove Passwords by Role" onClose={handleClose} width={500}>
      {!isConfirming ? (
        <div className="space-y-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <HiExclamationCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  This action will remove passwords for <strong>all users</strong> with the selected role. Users will need to use password recovery to regain access.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Select Role
            </label>
            <select id="role" name="role" value={selectedRole} onChange={handleRoleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
              <option value="">Select a role</option>
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <HiExclamationCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={handleProceed} disabled={!selectedRole} className="px-4 py-2 text-sm font-medium text-white bg-[#1360AB] rounded-lg hover:bg-[#0d4a8b] disabled:bg-blue-300 disabled:cursor-not-allowed">
              Proceed
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <HiShieldExclamation className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Warning: This action cannot be undone</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    You are about to remove passwords for <strong>all {selectedRole}</strong> users. They will need to use password recovery to regain access.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              Please type <strong>{selectedRole}</strong> below to confirm:
            </p>
            <input type="text" className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder={`Type "${selectedRole}" to confirm`} value={confirmText} onChange={handleConfirmTextChange} />
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <HiExclamationCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button onClick={handleBack} disabled={isProcessing} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
              Back
            </button>
            <button onClick={handleConfirmRemove} disabled={isProcessing || confirmText !== selectedRole} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed flex items-center">
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-t-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                "Remove Passwords"
              )}
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default RemovePasswordsByRoleModal
