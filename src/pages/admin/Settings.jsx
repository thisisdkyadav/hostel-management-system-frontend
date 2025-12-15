import { useState, useEffect } from "react"
import { HiCog, HiSave, HiAcademicCap, HiOfficeBuilding, HiUsers, HiAdjustments } from "react-icons/hi"
import { useAuth } from "../../contexts/AuthProvider"
import { adminApi } from "../../services/adminApi"
import StudentEditPermissionsForm from "../../components/admin/settings/StudentEditPermissionsForm"
import ConfigListManager from "../../components/admin/settings/ConfigListManager"
import RegisteredStudentsForm from "../../components/admin/settings/RegisteredStudentsForm"
import ConfigForm from "../../components/admin/settings/ConfigForm"
import CommonSuccessModal from "../../components/common/CommonSuccessModal"
import PageHeader from "../../components/common/PageHeader"
import toast from "react-hot-toast"

const Settings = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("studentFields")
  const [loading, setLoading] = useState({
    studentFields: false,
    degrees: false,
    departments: false,
    registeredStudents: false,
    systemSettings: false,
  })
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [studentEditPermissions, setStudentEditPermissions] = useState([])
  const [degrees, setDegrees] = useState([])
  const [departments, setDepartments] = useState([])
  const [registeredStudents, setRegisteredStudents] = useState({})
  const [systemSettings, setSystemSettings] = useState({})
  const [successMessage, setSuccessMessage] = useState("")
  const [error, setError] = useState({
    studentFields: null,
    degrees: null,
    departments: null,
    registeredStudents: null,
    systemSettings: null,
  })

  // List of all possible student editable fields with their labels
  const availableFields = [
    { field: "profileImage", label: "Profile Image" },
    { field: "name", label: "Name" },
    { field: "dateOfBirth", label: "Date of Birth" },
    { field: "address", label: "Address" },
    { field: "gender", label: "Gender" },
    { field: "familyMembers", label: "Family Members" },
    { field: "phone", label: "Phone" },
    { field: "emergencyContact", label: "Emergency Contact" },
    { field: "bloodGroup", label: "Blood Group" },
    { field: "admissionDate", label: "Admission Date" },
  ]

  useEffect(() => {
    fetchStudentEditPermissions()
  }, [])

  useEffect(() => {
    // Fetch data based on active tab
    if (activeTab === "degrees" && degrees.length === 0) {
      fetchDegrees()
    } else if (activeTab === "departments" && departments.length === 0) {
      fetchDepartments()
    } else if (activeTab === "registeredStudents") {
      if (degrees.length === 0) {
        fetchDegrees()
      }
      if (Object.keys(registeredStudents).length === 0) {
        fetchRegisteredStudents()
      }
    } else if (activeTab === "systemSettings" && Object.keys(systemSettings).length === 0) {
      fetchSystemSettings()
    }
  }, [activeTab])

  const fetchStudentEditPermissions = async () => {
    setLoading((prev) => ({ ...prev, studentFields: true }))
    setError((prev) => ({ ...prev, studentFields: null }))
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
    } catch (err) {
      console.error("Error fetching student edit permissions:", err)
      setError((prev) => ({
        ...prev,
        studentFields: "Failed to load student edit permissions. Please try again later.",
      }))
    } finally {
      setLoading((prev) => ({ ...prev, studentFields: false }))
    }
  }

  const fetchDegrees = async () => {
    setLoading((prev) => ({ ...prev, degrees: true }))
    setError((prev) => ({ ...prev, degrees: null }))
    try {
      const response = await adminApi.getDegrees()
      setDegrees(response.value || [])
    } catch (err) {
      console.error("Error fetching degrees:", err)
      setError((prev) => ({
        ...prev,
        degrees: "Failed to load degrees. Please try again later.",
      }))
    } finally {
      setLoading((prev) => ({ ...prev, degrees: false }))
    }
  }

  const fetchDepartments = async () => {
    setLoading((prev) => ({ ...prev, departments: true }))
    setError((prev) => ({ ...prev, departments: null }))
    try {
      const response = await adminApi.getDepartments()
      setDepartments(response.value || [])
    } catch (err) {
      console.error("Error fetching departments:", err)
      setError((prev) => ({
        ...prev,
        departments: "Failed to load departments. Please try again later.",
      }))
    } finally {
      setLoading((prev) => ({ ...prev, departments: false }))
    }
  }

  const fetchRegisteredStudents = async () => {
    setLoading((prev) => ({ ...prev, registeredStudents: true }))
    setError((prev) => ({ ...prev, registeredStudents: null }))
    try {
      const response = await adminApi.getRegisteredStudents()
      setRegisteredStudents(response.value || {})
    } catch (err) {
      console.error("Error fetching registered students:", err)
      setError((prev) => ({
        ...prev,
        registeredStudents: "Failed to load registered students data. Please try again later.",
      }))
    } finally {
      setLoading((prev) => ({ ...prev, registeredStudents: false }))
    }
  }

  const fetchSystemSettings = async () => {
    setLoading((prev) => ({ ...prev, systemSettings: true }))
    setError((prev) => ({ ...prev, systemSettings: null }))
    try {
      const response = await adminApi.getSystemSettings()
      setSystemSettings(response.value || {})
    } catch (err) {
      console.error("Error fetching system settings:", err)
      setError((prev) => ({
        ...prev,
        systemSettings: "Failed to load system settings data. Please try again later.",
      }))
    } finally {
      setLoading((prev) => ({ ...prev, systemSettings: false }))
    }
  }

  const handleUpdatePermissions = async (updatedPermissions) => {
    const confirmUpdate = window.confirm("Are you sure you want to update student edit permissions?")
    if (!confirmUpdate) return

    setLoading((prev) => ({ ...prev, studentFields: true }))
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
    } catch (err) {
      console.error("Error updating permissions:", err)
      toast.error("An error occurred while updating permissions. Please try again.")
    } finally {
      setLoading((prev) => ({ ...prev, studentFields: false }))
    }
  }

  const handleRenameDegree = async (oldName, newName) => {
    try {
      // Only call the API to rename the degree in the database
      await adminApi.renameDegree(oldName, newName)

      // Only update the UI state, don't trigger a full config save
      const updatedDegrees = degrees.map((degree) => (degree === oldName ? newName : degree))
      setDegrees(updatedDegrees)

      toast.success(`Degree "${oldName}" has been renamed to "${newName}"`)
      return true
    } catch (err) {
      console.error("Error renaming degree:", err)
      toast.error(`Failed to rename degree: ${err.message || "Unknown error"}`)
      throw err
    }
  }

  const handleRenameDepartment = async (oldName, newName) => {
    try {
      // Only call the API to rename the department in the database
      await adminApi.renameDepartment(oldName, newName)

      // Only update the UI state, don't trigger a full config save
      const updatedDepartments = departments.map((dept) => (dept === oldName ? newName : dept))
      setDepartments(updatedDepartments)

      toast.success(`Department "${oldName}" has been renamed to "${newName}"`)
      return true
    } catch (err) {
      console.error("Error renaming department:", err)
      toast.error(`Failed to rename department: ${err.message || "Unknown error"}`)
      throw err
    }
  }

  const handleUpdateDegrees = async (updatedDegrees) => {
    const confirmUpdate = window.confirm("Are you sure you want to update degrees?")
    if (!confirmUpdate) return

    setLoading((prev) => ({ ...prev, degrees: true }))
    try {
      const response = await adminApi.updateDegrees(updatedDegrees)
      setDegrees(response.configuration.value || [])
      setSuccessMessage(`Degrees updated successfully on ${new Date(response.lastUpdated).toLocaleString()}`)
      setShowSuccessModal(true)
    } catch (err) {
      console.error("Error updating degrees:", err)
      toast.error("An error occurred while updating degrees. Please try again.")
    } finally {
      setLoading((prev) => ({ ...prev, degrees: false }))
    }
  }

  const handleUpdateDepartments = async (updatedDepartments) => {
    const confirmUpdate = window.confirm("Are you sure you want to update departments?")
    if (!confirmUpdate) return

    setLoading((prev) => ({ ...prev, departments: true }))
    try {
      const response = await adminApi.updateDepartments(updatedDepartments)
      setDepartments(response.configuration.value || [])
      setSuccessMessage(`Departments updated successfully on ${new Date(response.lastUpdated).toLocaleString()}`)
      setShowSuccessModal(true)
    } catch (err) {
      console.error("Error updating departments:", err)
      toast.error("An error occurred while updating departments. Please try again.")
    } finally {
      setLoading((prev) => ({ ...prev, departments: false }))
    }
  }

  const handleUpdateRegisteredStudents = async (updatedRegisteredStudents) => {
    const confirmUpdate = window.confirm("Are you sure you want to update registered students counts?")
    if (!confirmUpdate) return

    setLoading((prev) => ({ ...prev, registeredStudents: true }))
    try {
      const response = await adminApi.updateRegisteredStudents(updatedRegisteredStudents)
      setRegisteredStudents(response.configuration.value || {})
      setSuccessMessage(`Registered students counts updated successfully on ${new Date(response.lastUpdated).toLocaleString()}`)
      setShowSuccessModal(true)
    } catch (err) {
      console.error("Error updating registered students:", err)
      toast.error("An error occurred while updating registered students counts. Please try again.")
    } finally {
      setLoading((prev) => ({ ...prev, registeredStudents: false }))
    }
  }

  const handleUpdateSystemSettings = async (updatedSettings) => {
    const confirmUpdate = window.confirm("Are you sure you want to update the system settings?")
    if (!confirmUpdate) return

    setLoading((prev) => ({ ...prev, systemSettings: true }))
    try {
      const response = await adminApi.updateSystemSettings(updatedSettings)
      setSystemSettings(response.configuration.value || {})
      setSuccessMessage(`System settings updated successfully on ${new Date(response.lastUpdated).toLocaleString()}`)
      setShowSuccessModal(true)
    } catch (err) {
      console.error("Error updating system settings:", err)
      toast.error("An error occurred while updating system settings. Please try again.")
    } finally {
      setLoading((prev) => ({ ...prev, systemSettings: false }))
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
      <PageHeader title="Application Settings" />

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">

      <div className="max-w-3xl mx-auto">
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <ul className="flex flex-wrap -mb-px">
            <li className="mr-2">
              <button onClick={() => setActiveTab("studentFields")} className={`inline-flex items-center px-4 py-2 text-sm font-medium ${activeTab === "studentFields" ? "text-[#1360AB] border-b-2 border-[#1360AB]" : "text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
                <HiCog className="mr-2 h-5 w-5" />
                Student Edit Permissions
              </button>
            </li>
            <li className="mr-2">
              <button onClick={() => setActiveTab("degrees")} className={`inline-flex items-center px-4 py-2 text-sm font-medium ${activeTab === "degrees" ? "text-[#1360AB] border-b-2 border-[#1360AB]" : "text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
                <HiAcademicCap className="mr-2 h-5 w-5" />
                Degrees
              </button>
            </li>
            <li className="mr-2">
              <button onClick={() => setActiveTab("departments")} className={`inline-flex items-center px-4 py-2 text-sm font-medium ${activeTab === "departments" ? "text-[#1360AB] border-b-2 border-[#1360AB]" : "text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
                <HiOfficeBuilding className="mr-2 h-5 w-5" />
                Departments
              </button>
            </li>
            <li className="mr-2">
              <button onClick={() => setActiveTab("registeredStudents")} className={`inline-flex items-center px-4 py-2 text-sm font-medium ${activeTab === "registeredStudents" ? "text-[#1360AB] border-b-2 border-[#1360AB]" : "text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
                <HiUsers className="mr-2 h-5 w-5" />
                Registered Students
              </button>
            </li>
            <li className="mr-2">
              <button onClick={() => setActiveTab("systemSettings")} className={`inline-flex items-center px-4 py-2 text-sm font-medium ${activeTab === "systemSettings" ? "text-[#1360AB] border-b-2 border-[#1360AB]" : "text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
                <HiAdjustments className="mr-2 h-5 w-5" />
                System Settings
              </button>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              {activeTab === "studentFields" && (
                <>
                  <HiCog className="mr-2 text-[#1360AB]" size={20} />
                  Student Profile Edit Permissions
                </>
              )}
              {activeTab === "degrees" && (
                <>
                  <HiAcademicCap className="mr-2 text-[#1360AB]" size={20} />
                  Academic Degrees
                </>
              )}
              {activeTab === "departments" && (
                <>
                  <HiOfficeBuilding className="mr-2 text-[#1360AB]" size={20} />
                  Academic Departments
                </>
              )}
              {activeTab === "registeredStudents" && (
                <>
                  <HiUsers className="mr-2 text-[#1360AB]" size={20} />
                  Registered Students
                </>
              )}
              {activeTab === "systemSettings" && (
                <>
                  <HiAdjustments className="mr-2 text-[#1360AB]" size={20} />
                  System Settings
                </>
              )}
            </h2>
          </div>

          <div className="p-6">
            {/* Error messages */}
            {error[activeTab] && (
              <div className="bg-red-50 text-red-700 rounded-lg p-4 mb-6">
                <p>{error[activeTab]}</p>
              </div>
            )}

            {/* Student Edit Permissions Tab */}
            {activeTab === "studentFields" && (
              <>
                <div className="bg-blue-50 text-blue-700 rounded-lg p-4 mb-6 flex items-start">
                  <div className="flex-shrink-0 mt-0.5 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm">Configure which profile fields students are allowed to edit in their profiles. Enable or disable each field as needed.</p>
                </div>

                {loading.studentFields && studentEditPermissions.length === 0 ? (
                  <div className="flex justify-center py-6">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1360AB]"></div>
                  </div>
                ) : (
                  <StudentEditPermissionsForm permissions={studentEditPermissions} onUpdate={handleUpdatePermissions} isLoading={loading.studentFields} />
                )}
              </>
            )}

            {/* Degrees Tab */}
            {activeTab === "degrees" && (
              <>
                <div className="bg-blue-50 text-blue-700 rounded-lg p-4 mb-6 flex items-start">
                  <div className="flex-shrink-0 mt-0.5 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm">Manage the list of academic degrees available in the system. Click on a degree to rename or delete it.</p>
                </div>

                {loading.degrees && degrees.length === 0 ? (
                  <div className="flex justify-center py-6">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1360AB]"></div>
                  </div>
                ) : (
                  <ConfigListManager
                    items={degrees}
                    onUpdate={handleUpdateDegrees}
                    onRename={handleRenameDegree}
                    isLoading={loading.degrees}
                    title="Degree Management"
                    description="Add or rename academic degrees available in the system. Click on a degree to edit it."
                    itemLabel="Degree"
                    placeholder="Enter degree name (e.g., B.Tech, M.Tech, Ph.D)"
                  />
                )}
              </>
            )}

            {/* Departments Tab */}
            {activeTab === "departments" && (
              <>
                <div className="bg-blue-50 text-blue-700 rounded-lg p-4 mb-6 flex items-start">
                  <div className="flex-shrink-0 mt-0.5 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm">Manage the list of academic departments available in the system. Click on a department to rename or delete it.</p>
                </div>

                {loading.departments && departments.length === 0 ? (
                  <div className="flex justify-center py-6">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1360AB]"></div>
                  </div>
                ) : (
                  <ConfigListManager
                    items={departments}
                    onUpdate={handleUpdateDepartments}
                    onRename={handleRenameDepartment}
                    isLoading={loading.departments}
                    title="Department Management"
                    description="Add or rename academic departments available in the system. Click on a department to edit it."
                    itemLabel="Department"
                    placeholder="Enter department name (e.g., Computer Science, Electrical Engineering)"
                  />
                )}
              </>
            )}

            {/* Registered Students Tab */}
            {activeTab === "registeredStudents" && (
              <>
                <div className="bg-blue-50 text-blue-700 rounded-lg p-4 mb-6 flex items-start">
                  <div className="flex-shrink-0 mt-0.5 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm">Set the total number of registered students for each degree program, broken down by gender. This helps track enrollment statistics and capacity planning with detailed demographics.</p>
                </div>

                {loading.registeredStudents && Object.keys(registeredStudents).length === 0 ? (
                  <div className="flex justify-center py-6">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1360AB]"></div>
                  </div>
                ) : (
                  <RegisteredStudentsForm degrees={degrees} registeredStudents={registeredStudents} onUpdate={handleUpdateRegisteredStudents} isLoading={loading.registeredStudents} />
                )}
              </>
            )}

            {/* System Settings Tab */}
            {activeTab === "systemSettings" && (
              <>
                <div className="bg-blue-50 text-blue-700 rounded-lg p-4 mb-6 flex items-start">
                  <div className="flex-shrink-0 mt-0.5 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm">Edit system configuration values. You can only modify existing configuration keys; adding or removing keys is not allowed through this interface.</p>
                </div>

                {loading.systemSettings && Object.keys(systemSettings).length === 0 ? (
                  <div className="flex justify-center py-6">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1360AB]"></div>
                  </div>
                ) : (
                  <ConfigForm config={systemSettings} onUpdate={handleUpdateSystemSettings} isLoading={loading.systemSettings} />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && <CommonSuccessModal show={showSuccessModal} onClose={() => setShowSuccessModal(false)} title="Settings Updated" message={successMessage} infoText="Changes have been applied" infoIcon={HiSave} buttonText="Done" />}
      </div>
    </div>
  )
}

export default Settings
