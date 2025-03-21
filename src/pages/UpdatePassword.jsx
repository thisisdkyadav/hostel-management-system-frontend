import { useState } from "react"
import { HiKey } from "react-icons/hi"
import UpdatePasswordForm from "../components/password/UpdatePasswordForm"
import SuccessModal from "../components/password/SuccessModal"
import { useAuth } from "../contexts/AuthProvider"
import { adminApi } from "../services/apiService"

const UpdatePassword = () => {
  const { user } = useAuth()
  const [showSuccessModal, setShowSuccessModal] = useState(false)
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

  return (
    <div className="px-10 py-6 flex-1">
      <header className="flex items-center w-full px-3 py-4 rounded-[12px]">
        <div className="p-3 mr-4 rounded-xl bg-blue-100 text-blue-600">
          <HiKey size={24} />
        </div>
        <h1 className="text-2xl font-bold">Update User Password</h1>
      </header>

      <div className="mt-6 max-w-2xl mx-auto">
        <div className="bg-white rounded-[20px] p-8 shadow-[0px_1px_20px_rgba(0,0,0,0.06)]">
          <h2 className="text-xl font-semibold mb-6">Reset Password for User</h2>
          <p className="text-gray-600 mb-6">As an administrator, you can reset the password for any user in the system. The user will need to use this new password for their next login.</p>

          <UpdatePasswordForm onSubmit={handlePasswordUpdate} />
        </div>
      </div>

      <SuccessModal show={showSuccessModal} email={updatedEmail} onClose={() => setShowSuccessModal(false)} />
    </div>
  )
}

export default UpdatePassword
