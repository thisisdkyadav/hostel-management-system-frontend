import { useState } from "react"
import { HiKey } from "react-icons/hi"
import UpdatePasswordForm from "../../components/admin/password/UpdatePasswordForm"
import SuccessModal from "../../components/admin/password/SuccessModal"
import { useAuth } from "../../contexts/AuthProvider"
import { adminApi } from "../../services/apiService"

const UpdatePassword = () => {
  const { user } = useAuth()
  const [showSuccessModal, setShowSuccessModal] = useState(true)
  const [updatedEmail, setUpdatedEmail] = useState("")

  if (user?.role !== "Admin") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-100 text-red-700 p-6 rounded-lg">
          <h2 className="text-xl font-bold">Access Denied</h2>
          <p>You do not have permission to access this page.</p>
        </div>
      </div>
    )
  }

  const handlePasswordUpdate = async (email, newPassword) => {
    // confirm the action
    const confirmUpdate = window.confirm("Are you sure you want to update this user's password?")
    if (!confirmUpdate) return
    try {
      const response = await adminApi.updateUserPassword(email, newPassword)
      if (response.success) {
        setUpdatedEmail(email)
        setShowSuccessModal(true)
      } else {
        alert("Failed to update password. Please try again.")
      }
    } catch (error) {
      console.error("Error updating password:", error)
      alert("An error occurred while updating the password. Please try again.")
    }
  }

  if (user?.role !== "Admin") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8 max-w-md w-full border border-red-100">
          <div className="flex items-center justify-center bg-red-100 text-red-600 w-14 h-14 rounded-full mb-6 mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-10v4m6 6a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 text-center mb-6">You do not have permission to access this page. Please contact an administrator if you believe this is an error.</p>
          <div className="flex justify-center">
            <a href="/" className="px-5 py-2.5 bg-[#1360AB] text-white rounded-lg hover:bg-[#0d4b86] transition-colors shadow-sm">
              Return to Home
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 flex-1">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="flex items-center mb-4 sm:mb-0">
          <div className="p-3 mr-4 rounded-xl bg-blue-100 text-[#1360AB] flex-shrink-0">
            <HiKey size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Update User Password</h1>
            <p className="text-gray-500 text-sm mt-1 max-w-xl">Reset password for any user in the system. They'll use this new password for their next login.</p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <HiKey className="mr-2 text-[#1360AB]" size={20} />
              Password Reset Form
            </h2>
          </div>

          <div className="p-6">
            <div className="bg-blue-50 text-blue-700 rounded-lg p-4 mb-6 flex items-start">
              <div className="flex-shrink-0 mt-0.5 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm">As an administrator, you can reset the password for any user. This action cannot be undone, and the user will be required to use this new password for their next login.</p>
            </div>

            <UpdatePasswordForm onSubmit={handlePasswordUpdate} />
          </div>
        </div>
      </div>

      {showSuccessModal && <SuccessModal show={showSuccessModal} email={updatedEmail} onClose={() => setShowSuccessModal(false)} />}
    </div>
  )
}

export default UpdatePassword
