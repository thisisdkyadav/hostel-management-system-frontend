import { useState, useEffect } from "react"
import { HiCog, HiSave } from "react-icons/hi"
import { useAuth } from "../../contexts/AuthProvider"
import { adminApi } from "../../services/adminApi"
import StudentEditPermissionsForm from "../../components/admin/settings/StudentEditPermissionsForm"
import CommonSuccessModal from "../../components/common/CommonSuccessModal"

const Settings = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [studentEditPermissions, setStudentEditPermissions] = useState([])
  const [successMessage, setSuccessMessage] = useState("")
  const [error, setError] = useState(null)

  // List of all possible student editable fields with their labels
  const availableFields = [
    { field: "profileImage", label: "Profile Image" },
    { field: "name", label: "Name" },
    { field: "dateOfBirth", label: "Date of Birth" },
    { field: "address", label: "Address" },
    { field: "gender", label: "Gender" },
    { field: "familyMembers", label: "Family Members" },
  ]

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await adminApi.getStudentEditPermissions()

        // Map the allowed fields from API to our permissions format
        const allowedFields = response.value || []

        // Create the full permissions array with allowed status
        const permissionsData = availableFields.map((field) => ({
          ...field,
          allowed: allowedFields.includes(field.field),
        }))

        setStudentEditPermissions(permissionsData)
      } catch (error) {
        console.error("Error fetching settings:", error)
        setError("Failed to load settings. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleUpdatePermissions = async (updatedPermissions) => {
    const confirmUpdate = window.confirm("Are you sure you want to update student edit permissions?")
    if (!confirmUpdate) return

    setLoading(true)
    try {
      const response = await adminApi.updateStudentEditPermissions(updatedPermissions)

      // Update state with the new permissions based on API response
      const allowedFields = response.configuration.value || []
      const permissionsData = availableFields.map((field) => ({
        ...field,
        allowed: allowedFields.includes(field.field),
      }))

      setStudentEditPermissions(permissionsData)
      setSuccessMessage(`Student edit permissions updated successfully on ${new Date(response.lastUpdated).toLocaleString()}`)
      setShowSuccessModal(true)
    } catch (error) {
      console.error("Error updating permissions:", error)
      alert("An error occurred while updating permissions. Please try again.")
    } finally {
      setLoading(false)
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
            <HiCog size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Application Settings</h1>
            <p className="text-gray-500 text-sm mt-1 max-w-xl">Configure system-wide settings for the hostel management application.</p>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <HiCog className="mr-2 text-[#1360AB]" size={20} />
              Student Profile Edit Permissions
            </h2>
          </div>

          <div className="p-6">
            <div className="bg-blue-50 text-blue-700 rounded-lg p-4 mb-6 flex items-start">
              <div className="flex-shrink-0 mt-0.5 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm">Configure which profile fields students are allowed to edit in their profiles. Enable or disable each field as needed.</p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 rounded-lg p-4 mb-6">
                <p>{error}</p>
              </div>
            )}

            {loading && studentEditPermissions.length === 0 ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1360AB]"></div>
              </div>
            ) : (
              <StudentEditPermissionsForm permissions={studentEditPermissions} onUpdate={handleUpdatePermissions} isLoading={loading} />
            )}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && <CommonSuccessModal show={showSuccessModal} onClose={() => setShowSuccessModal(false)} title="Settings Updated" message={successMessage} infoText="Changes have been applied" infoIcon={HiSave} buttonText="Done" />}
    </div>
  )
}

export default Settings
