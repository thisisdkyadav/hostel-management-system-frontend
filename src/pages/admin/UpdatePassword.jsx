import { useState } from "react"
import { HiKey, HiUpload, HiTrash } from "react-icons/hi"
import UpdatePasswordForm from "../../components/admin/password/UpdatePasswordForm"
import BulkPasswordUpdateModal from "../../components/admin/password/BulkPasswordUpdateModal"
import RemovePasswordsByRoleModal from "../../components/admin/password/RemovePasswordsByRoleModal"
import { useAuth } from "../../contexts/AuthProvider"
import { adminApi } from "../../services/apiService"
import CommonSuccessModal from "../../components/common/CommonSuccessModal"
import UpdatePasswordHeader from "../../components/headers/UpdatePasswordHeader"

const UpdatePassword = () => {
  const { user } = useAuth()
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [showRemoveByRoleModal, setShowRemoveByRoleModal] = useState(false)
  const [updatedEmail, setUpdatedEmail] = useState("")
  const [bulkUpdateResults, setBulkUpdateResults] = useState(null)
  const [bulkSuccessModalOpen, setBulkSuccessModalOpen] = useState(false)
  const [removeByRoleResults, setRemoveByRoleResults] = useState(null)
  const [removeByRoleSuccessModalOpen, setRemoveByRoleSuccessModalOpen] = useState(false)

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

  const handleBulkPasswordUpdate = async (passwordUpdates) => {
    try {
      const response = await adminApi.bulkUpdatePasswords(passwordUpdates)

      if (response) {
        setBulkUpdateResults(response.results)
        setBulkSuccessModalOpen(true)
        return true
      }
      return false
    } catch (error) {
      console.error("Error in bulk password update:", error)
      alert("An error occurred during bulk password update. Please try again.")
      return false
    }
  }

  const handleRemovePasswordsByRole = async (role) => {
    try {
      const response = await adminApi.removePasswordsByRole(role)

      if (response) {
        setRemoveByRoleResults({
          role,
          count: response.count,
          message: response.message,
        })
        setRemoveByRoleSuccessModalOpen(true)
        return true
      }
      return false
    } catch (error) {
      console.error("Error removing passwords by role:", error)
      throw error
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
    <div className="flex flex-col h-full">
      <UpdatePasswordHeader 
        onBulkUpdate={() => setShowBulkModal(true)}
        onRemoveByRole={() => setShowRemoveByRoleModal(true)}
      />

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">

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

      {/* Single Password Update Success Modal */}
      {showSuccessModal && (
        <CommonSuccessModal
          show={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          title="Password Updated Successfully"
          message="The password has been successfully updated. The user will need to use this new password for their next login."
          infoText={updatedEmail}
          infoIcon={HiKey}
          buttonText="Done"
        />
      )}

      {/* Bulk Password Update Modal */}
      <BulkPasswordUpdateModal isOpen={showBulkModal} onClose={() => setShowBulkModal(false)} onUpdate={handleBulkPasswordUpdate} />

      {/* Remove Passwords by Role Modal */}
      <RemovePasswordsByRoleModal isOpen={showRemoveByRoleModal} onClose={() => setShowRemoveByRoleModal(false)} onRemove={handleRemovePasswordsByRole} />

      {/* Bulk Update Success Modal */}
      {bulkSuccessModalOpen && bulkUpdateResults && (
        <CommonSuccessModal
          show={bulkSuccessModalOpen}
          onClose={() => setBulkSuccessModalOpen(false)}
          title="Bulk Password Update Completed"
          message={`Successfully updated ${bulkUpdateResults.successful.length} user passwords. ${bulkUpdateResults.failed.length > 0 ? `Failed to update ${bulkUpdateResults.failed.length} users.` : ""}`}
          infoText={`${bulkUpdateResults.successful.length} updates successful, ${bulkUpdateResults.failed.length} failed`}
          infoIcon={HiKey}
          buttonText="Done"
          width={600}
        />
      )}

      {/* Remove by Role Success Modal */}
      {removeByRoleSuccessModalOpen && removeByRoleResults && (
        <CommonSuccessModal
          show={removeByRoleSuccessModalOpen}
          onClose={() => setRemoveByRoleSuccessModalOpen(false)}
          title="Passwords Removed by Role"
          message={removeByRoleResults.message}
          infoText={`${removeByRoleResults.count} users with role: ${removeByRoleResults.role}`}
          infoIcon={HiTrash}
          buttonText="Done"
          width={600}
        />
      )}
      </div>
    </div>
  )
}

export default UpdatePassword
