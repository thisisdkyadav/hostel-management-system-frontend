import { useState, useEffect } from "react"
import { HiCog, HiSave, HiAcademicCap, HiOfficeBuilding, HiUsers, HiAdjustments, HiCalendar, HiCollection } from "react-icons/hi"
import { useAuth } from "../../contexts/AuthProvider"
import { adminApi } from "../../service"
import StudentEditPermissionsForm from "../../components/admin/settings/StudentEditPermissionsForm"
import ConfigListManager from "../../components/admin/settings/ConfigListManager"
import StudentBatchManager from "../../components/admin/settings/StudentBatchManager"
import RegisteredStudentsForm from "../../components/admin/settings/RegisteredStudentsForm"
import ConfigForm from "../../components/admin/settings/ConfigForm"
import AcademicHolidaysForm from "../../components/admin/settings/AcademicHolidaysForm"
import GymkhanaCategoryManager from "../../components/admin/settings/GymkhanaCategoryManager"
import CommonSuccessModal from "../../components/common/CommonSuccessModal"
import SettingsHeader from "../../components/headers/SettingsHeader"
import { getBatchesForSelection, setBatchesForSelection } from "../../utils/studentBatchConfig"
import toast from "react-hot-toast"
import { Card, SearchInput } from "@/components/ui"

const TabSpinner = () => (
  <div className="flex justify-center py-6">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--color-primary)]"></div>
  </div>
)

const SettingsPage = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("studentFields")
  const [loading, setLoading] = useState({
    studentFields: false,
    degrees: false,
    departments: false,
    studentBatches: false,
    studentGroups: false,
    registeredStudents: false,
    academicHolidays: false,
    gymkhanaCategories: false,
    systemSettings: false,
  })
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [navQuery, setNavQuery] = useState("")
  const [studentEditPermissions, setStudentEditPermissions] = useState([])
  const [degrees, setDegrees] = useState([])
  const [departments, setDepartments] = useState([])
  const [studentBatches, setStudentBatches] = useState({})
  const [studentGroups, setStudentGroups] = useState([])
  const [registeredStudents, setRegisteredStudents] = useState({})
  const [academicHolidays, setAcademicHolidays] = useState({})
  const [gymkhanaCategories, setGymkhanaCategories] = useState([])
  const [systemSettings, setSystemSettings] = useState({})
  const [successMessage, setSuccessMessage] = useState("")
  const [error, setError] = useState({
    studentFields: null,
    degrees: null,
    departments: null,
    studentBatches: null,
    studentGroups: null,
    registeredStudents: null,
    academicHolidays: null,
    gymkhanaCategories: null,
    systemSettings: null,
  })

  const SETTINGS_TABS = [
    "studentFields",
    "degrees",
    "departments",
    "studentBatches",
    "studentGroups",
    "registeredStudents",
    "academicHolidays",
    "gymkhanaCategories",
    "systemSettings",
  ]

  const canViewTab = (tab) => {
    return SETTINGS_TABS.includes(tab)
  }

  const canUpdateTab = (tab) => {
    return SETTINGS_TABS.includes(tab)
  }

  const canRenameInTab = (tab) => {
    return canUpdateTab(tab)
  }

  const hasAnySettingsView = SETTINGS_TABS.some((tab) => canViewTab(tab))

  const handleTabChange = (tab) => {
    if (!canViewTab(tab)) {
      toast.error("You do not have access to this settings section.")
      return
    }
    setActiveTab(tab)
  }

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
    if (canViewTab("studentFields")) {
      fetchStudentEditPermissions()
    }
  }, [])

  useEffect(() => {
    if (!canViewTab(activeTab)) {
      const firstAllowedTab = SETTINGS_TABS.find((tab) => canViewTab(tab))
      if (firstAllowedTab && firstAllowedTab !== activeTab) {
        setActiveTab(firstAllowedTab)
      }
      return
    }

    // Fetch data based on active tab
    if (activeTab === "degrees" && degrees.length === 0) {
      fetchDegrees()
    } else if (activeTab === "departments" && departments.length === 0) {
      fetchDepartments()
    } else if (activeTab === "studentBatches") {
      if (degrees.length === 0) {
        fetchDegrees()
      }
      if (departments.length === 0) {
        fetchDepartments()
      }
      if (Object.keys(studentBatches).length === 0) {
        fetchStudentBatches()
      }
    } else if (activeTab === "studentGroups" && studentGroups.length === 0) {
      fetchStudentGroups()
    } else if (activeTab === "registeredStudents") {
      if (degrees.length === 0) {
        fetchDegrees()
      }
      if (Object.keys(registeredStudents).length === 0) {
        fetchRegisteredStudents()
      }
    } else if (activeTab === "academicHolidays" && Object.keys(academicHolidays).length === 0) {
      fetchAcademicHolidays()
    } else if (activeTab === "gymkhanaCategories" && gymkhanaCategories.length === 0) {
      fetchGymkhanaCategories()
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

  const fetchStudentBatches = async () => {
    setLoading((prev) => ({ ...prev, studentBatches: true }))
    setError((prev) => ({ ...prev, studentBatches: null }))
    try {
      const response = await adminApi.getStudentBatches()
      setStudentBatches(response.value || {})
    } catch (err) {
      console.error("Error fetching student batches:", err)
      setError((prev) => ({
        ...prev,
        studentBatches: "Failed to load batch configuration. Please try again later.",
      }))
    } finally {
      setLoading((prev) => ({ ...prev, studentBatches: false }))
    }
  }

  const fetchAcademicHolidays = async () => {
    setLoading((prev) => ({ ...prev, academicHolidays: true }))
    setError((prev) => ({ ...prev, academicHolidays: null }))
    try {
      const response = await adminApi.getAcademicHolidays()
      setAcademicHolidays(response.value || {})
    } catch (err) {
      console.error("Error fetching academic holidays:", err)
      setError((prev) => ({
        ...prev,
        academicHolidays: "Failed to load academic holidays. Please try again later.",
      }))
    } finally {
      setLoading((prev) => ({ ...prev, academicHolidays: false }))
    }
  }

  const fetchStudentGroups = async () => {
    setLoading((prev) => ({ ...prev, studentGroups: true }))
    setError((prev) => ({ ...prev, studentGroups: null }))
    try {
      const response = await adminApi.getStudentGroups()
      setStudentGroups(response.value || [])
    } catch (err) {
      console.error("Error fetching student groups:", err)
      setError((prev) => ({
        ...prev,
        studentGroups: "Failed to load student groups. Please try again later.",
      }))
    } finally {
      setLoading((prev) => ({ ...prev, studentGroups: false }))
    }
  }

  const fetchGymkhanaCategories = async () => {
    setLoading((prev) => ({ ...prev, gymkhanaCategories: true }))
    setError((prev) => ({ ...prev, gymkhanaCategories: null }))
    try {
      const response = await adminApi.getGymkhanaEventCategories()
      setGymkhanaCategories(Array.isArray(response.value) ? response.value : [])
    } catch (err) {
      console.error("Error fetching Gymkhana categories:", err)
      setError((prev) => ({
        ...prev,
        gymkhanaCategories: "Failed to load Gymkhana categories. Please try again later.",
      }))
    } finally {
      setLoading((prev) => ({ ...prev, gymkhanaCategories: false }))
    }
  }

  const handleUpdatePermissions = async (updatedPermissions) => {
    if (!canUpdateTab("studentFields")) {
      toast.error("You do not have permission to update student edit permissions.")
      return
    }

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
    if (!canRenameInTab("degrees")) {
      toast.error("You do not have permission to rename degree values.")
      return false
    }

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
    if (!canRenameInTab("departments")) {
      toast.error("You do not have permission to rename department values.")
      return false
    }

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
    if (!canUpdateTab("degrees")) {
      toast.error("You do not have permission to update degrees.")
      return
    }

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
    if (!canUpdateTab("departments")) {
      toast.error("You do not have permission to update departments.")
      return
    }

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
    if (!canUpdateTab("registeredStudents")) {
      toast.error("You do not have permission to update registered student counts.")
      return
    }

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
    if (!canUpdateTab("systemSettings")) {
      toast.error("You do not have permission to update system settings.")
      return
    }

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

  const handleRenameStudentBatch = async ({ degree, department, oldName, newName }) => {
    if (!canRenameInTab("studentBatches")) {
      toast.error("You do not have permission to rename student batch values.")
      return false
    }

    try {
      await adminApi.renameStudentBatch({ degree, department, oldName, newName })

      setStudentBatches((prev) => {
        const nextBatches = getBatchesForSelection(prev, degree, department).map((batch) => (
          batch === oldName ? newName : batch
        ))
        return setBatchesForSelection(prev, degree, department, nextBatches)
      })

      toast.success(`Batch "${oldName}" has been renamed to "${newName}"`)
      return true
    } catch (err) {
      console.error("Error renaming batch:", err)
      toast.error(`Failed to rename batch: ${err.message || "Unknown error"}`)
      throw err
    }
  }

  const handleUpdateStudentBatches = async (updatedStudentBatches) => {
    if (!canUpdateTab("studentBatches")) {
      toast.error("You do not have permission to update student batches.")
      return
    }

    const confirmUpdate = window.confirm("Are you sure you want to update student batches?")
    if (!confirmUpdate) return

    setLoading((prev) => ({ ...prev, studentBatches: true }))
    try {
      const response = await adminApi.updateStudentBatches(updatedStudentBatches)
      setStudentBatches(response.configuration.value || {})
      setSuccessMessage(`Student batches updated successfully on ${new Date(response.configuration?.lastUpdated || Date.now()).toLocaleString()}`)
      setShowSuccessModal(true)
    } catch (err) {
      console.error("Error updating student batches:", err)
      toast.error("An error occurred while updating student batches. Please try again.")
    } finally {
      setLoading((prev) => ({ ...prev, studentBatches: false }))
    }
  }

  const handleRenameStudentGroup = async (oldName, newName) => {
    if (!canRenameInTab("studentGroups")) {
      toast.error("You do not have permission to rename student group values.")
      return false
    }

    try {
      await adminApi.renameStudentGroup(oldName, newName)

      setStudentGroups((prev) => prev.map((group) => (group === oldName ? newName : group)))
      toast.success(`Group "${oldName}" has been renamed to "${newName}"`)
      return true
    } catch (err) {
      console.error("Error renaming group:", err)
      toast.error(`Failed to rename group: ${err.message || "Unknown error"}`)
      throw err
    }
  }

  const handleUpdateStudentGroups = async (updatedStudentGroups) => {
    if (!canUpdateTab("studentGroups")) {
      toast.error("You do not have permission to update student groups.")
      return
    }

    const confirmUpdate = window.confirm("Are you sure you want to update student groups?")
    if (!confirmUpdate) return

    setLoading((prev) => ({ ...prev, studentGroups: true }))
    try {
      const response = await adminApi.updateStudentGroups(updatedStudentGroups)
      setStudentGroups(response.configuration.value || [])
      setSuccessMessage(`Student groups updated successfully on ${new Date(response.configuration?.lastUpdated || Date.now()).toLocaleString()}`)
      setShowSuccessModal(true)
    } catch (err) {
      console.error("Error updating student groups:", err)
      toast.error("An error occurred while updating student groups. Please try again.")
    } finally {
      setLoading((prev) => ({ ...prev, studentGroups: false }))
    }
  }

  const handleUpdateAcademicHolidays = async (updatedAcademicHolidays) => {
    if (!canUpdateTab("academicHolidays")) {
      toast.error("You do not have permission to update academic holidays.")
      return
    }

    const confirmUpdate = window.confirm("Are you sure you want to update academic holidays?")
    if (!confirmUpdate) return

    setLoading((prev) => ({ ...prev, academicHolidays: true }))
    try {
      const response = await adminApi.updateAcademicHolidays(updatedAcademicHolidays)
      setAcademicHolidays(response.configuration?.value || {})
      setSuccessMessage(`Academic holidays updated successfully on ${new Date().toLocaleString()}`)
      setShowSuccessModal(true)
    } catch (err) {
      console.error("Error updating academic holidays:", err)
      toast.error("An error occurred while updating academic holidays. Please try again.")
    } finally {
      setLoading((prev) => ({ ...prev, academicHolidays: false }))
    }
  }

  const handleUpdateGymkhanaCategories = async (updatedCategories) => {
    if (!canUpdateTab("gymkhanaCategories")) {
      toast.error("You do not have permission to update Gymkhana categories.")
      return
    }

    const confirmUpdate = window.confirm("Are you sure you want to update Gymkhana categories?")
    if (!confirmUpdate) return

    setLoading((prev) => ({ ...prev, gymkhanaCategories: true }))
    try {
      const response = await adminApi.updateGymkhanaEventCategories(updatedCategories)
      setGymkhanaCategories(response.configuration?.value || [])
      setSuccessMessage(`Gymkhana categories updated successfully on ${new Date(response.configuration?.lastUpdated || Date.now()).toLocaleString()}`)
      setShowSuccessModal(true)
    } catch (err) {
      console.error("Error updating Gymkhana categories:", err)
      toast.error(err.message || "An error occurred while updating Gymkhana categories. Please try again.")
    } finally {
      setLoading((prev) => ({ ...prev, gymkhanaCategories: false }))
    }
  }

  // Grouped settings navigation (pure presentation — keys map 1:1 to SETTINGS_TABS)
  const settingsNav = [
    {
      group: "Students",
      items: [
        { key: "studentFields", label: "Edit Permissions", icon: HiCog, description: "Configure which profile fields students are allowed to edit in their profiles. Enable or disable each field as needed." },
        { key: "studentBatches", label: "Batches", icon: HiUsers, description: "Manage batch values by degree and department scope. You can configure exact combinations, Mixed Degree, Mixed Department, or both mixed before assigning students in the batch update flow." },
        { key: "studentGroups", label: "Groups", icon: HiUsers, description: "Manage reusable student groups that are independent of degree, department, and batch. Students can belong to multiple groups, and deleting a group here removes it from student profiles as well." },
        { key: "registeredStudents", label: "Registered Students", icon: HiUsers, description: "Set the total number of registered students for each degree program, broken down by gender. This helps track enrollment statistics and capacity planning with detailed demographics." },
      ],
    },
    {
      group: "Academics",
      items: [
        { key: "degrees", label: "Degrees", icon: HiAcademicCap, description: "Manage the list of academic degrees available in the system. Click on a degree to rename or delete it." },
        { key: "departments", label: "Departments", icon: HiOfficeBuilding, description: "Manage the list of academic departments available in the system. Click on a department to rename or delete it." },
        { key: "academicHolidays", label: "Academic Holidays", icon: HiCalendar, description: "Manage year-wise academic holidays. Create a year first, then add holiday title and date entries for that year." },
      ],
    },
    {
      group: "Gymkhana",
      items: [
        { key: "gymkhanaCategories", label: "Event Categories", icon: HiCollection, description: "Manage the global Gymkhana category catalog. These categories are used across activity calendars, category filters, and budget-cap summaries, so changes here apply everywhere." },
      ],
    },
    {
      group: "System",
      items: [
        { key: "systemSettings", label: "System Settings", icon: HiAdjustments, description: "Edit system configuration values. You can only modify existing configuration keys; adding or removing keys is not allowed through this interface." },
      ],
    },
  ]

  const allNavItems = settingsNav.flatMap((section) => section.items)
  const activeItem = allNavItems.find((item) => item.key === activeTab) || allNavItems[0]
  const ActiveIcon = activeItem.icon

  const normalizedNavQuery = navQuery.trim().toLowerCase()
  const filteredNav = normalizedNavQuery
    ? settingsNav
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => item.label.toLowerCase().includes(normalizedNavQuery)),
      }))
      .filter((section) => section.items.length > 0)
    : settingsNav

  if (user?.role !== "Admin" || !hasAnySettingsView) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--color-bg-tertiary)] px-4">
        <div className="bg-[var(--color-bg-primary)] rounded-xl shadow-md p-6 md:p-8 max-w-md w-full border border-[var(--color-danger-light)]">
          <div className="flex items-center justify-center bg-[var(--color-danger-bg-light)] text-[var(--color-danger)] w-14 h-14 rounded-full mb-6 mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-10v4m6 6a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-center text-[var(--color-text-secondary)] mb-2">Access Denied</h2>
          <p className="text-[var(--color-text-muted)] text-center mb-6">You do not have permission to access this page. Please contact an administrator if you believe this is an error.</p>
          <div className="flex justify-center">
            <a href="/" className="px-5 py-2.5 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors shadow-sm">
              Return to Home
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <SettingsHeader />

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">

        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 items-start">
          {/* Settings navigation */}
          <aside className="w-full lg:w-64 lg:shrink-0 lg:sticky lg:top-0">
            <Card padding="p-3">
              <SearchInput
                value={navQuery}
                onChange={(e) => setNavQuery(e.target.value)}
                placeholder="Search settings"
                size="sm"
              />
              <nav className="mt-3 flex flex-col gap-4" aria-label="Settings sections">
                {filteredNav.map((section) => (
                  <div key={section.group}>
                    <p className="px-2.5 mb-1 text-[0.65rem] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">{section.group}</p>
                    <div className="flex flex-col gap-0.5">
                      {section.items.map((item) => {
                        const ItemIcon = item.icon
                        const isActive = activeTab === item.key
                        return (
                          <button
                            key={item.key}
                            onClick={() => handleTabChange(item.key)}
                            aria-current={isActive ? "page" : undefined}
                            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[var(--radius-md)] text-sm text-left transition-[var(--transition-colors)] ${isActive
                              ? "bg-[var(--color-primary-bg)] text-[var(--color-primary)] font-semibold"
                              : "text-[var(--color-text-body)] hover:bg-[var(--color-bg-hover)]"}`}
                          >
                            <ItemIcon className={`h-4 w-4 shrink-0 ${isActive ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"}`} />
                            <span className="truncate">{item.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
                {filteredNav.length === 0 && (
                  <p className="px-2.5 py-4 text-sm text-[var(--color-text-muted)] text-center">No settings match "{navQuery}"</p>
                )}
              </nav>
            </Card>
          </aside>

          {/* Active settings panel */}
          <main className="flex-1 min-w-0 w-full">
            <Card className="overflow-hidden">

              <Card.Body className="p-6">
              {/* Panel header */}
              <div className="flex items-start gap-3 pb-4 mb-6 border-b border-[var(--color-border-primary)]">
                <div className="w-10 h-10 shrink-0 rounded-[var(--radius-lg)] bg-[var(--color-primary-bg)] text-[var(--color-primary)] flex items-center justify-center">
                  <ActiveIcon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-[var(--color-text-heading)] leading-tight">{activeItem.label}</h2>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)] leading-snug">{activeItem.description}</p>
                </div>
              </div>
              {/* Error messages */}
              {error[activeTab] && (
                <div className="bg-[var(--color-danger-bg-light)] text-[var(--color-danger)] rounded-lg p-4 mb-6">
                  <p>{error[activeTab]}</p>
                </div>
              )}

              {/* Student Edit Permissions Tab */}
              {activeTab === "studentFields" && (
                <>
                  {loading.studentFields && studentEditPermissions.length === 0 ? (
                    <TabSpinner />
                  ) : (
                    <StudentEditPermissionsForm permissions={studentEditPermissions} onUpdate={handleUpdatePermissions} isLoading={loading.studentFields} />
                  )}
                </>
              )}

              {/* Degrees Tab */}
              {activeTab === "degrees" && (
                <>
                  {loading.degrees && degrees.length === 0 ? (
                    <TabSpinner />
                  ) : (
                    <ConfigListManager items={degrees} onUpdate={handleUpdateDegrees} onRename={handleRenameDegree} isLoading={loading.degrees} title="Degree Management" description="Add or rename academic degrees available in the system. Click on a degree to edit it." itemLabel="Degree" placeholder="Enter degree name (e.g., B.Tech, M.Tech, Ph.D)" />
                  )}
                </>
              )}

              {/* Departments Tab */}
              {activeTab === "departments" && (
                <>
                  {loading.departments && departments.length === 0 ? (
                    <TabSpinner />
                  ) : (
                    <ConfigListManager items={departments} onUpdate={handleUpdateDepartments} onRename={handleRenameDepartment} isLoading={loading.departments} title="Department Management" description="Add or rename academic departments available in the system. Click on a department to edit it." itemLabel="Department" placeholder="Enter department name (e.g., Computer Science, Electrical Engineering)" />
                  )}
                </>
              )}

              {activeTab === "studentBatches" && (
                <>
                  {loading.studentBatches && Object.keys(studentBatches).length === 0 ? (
                    <TabSpinner />
                  ) : (
                    <StudentBatchManager
                      degrees={degrees}
                      departments={departments}
                      studentBatches={studentBatches}
                      onUpdate={handleUpdateStudentBatches}
                      onRename={handleRenameStudentBatch}
                      isLoading={loading.studentBatches}
                    />
                  )}
                </>
              )}

              {activeTab === "studentGroups" && (
                <>
                  {loading.studentGroups && studentGroups.length === 0 ? (
                    <TabSpinner />
                  ) : (
                    <ConfigListManager
                      items={studentGroups}
                      onUpdate={handleUpdateStudentGroups}
                      onRename={handleRenameStudentGroup}
                      isLoading={loading.studentGroups}
                      title="Student Group Management"
                      description="Create, rename, or delete direct student groups for clubs, cohorts, committees, or any other grouping that is not tied to academics."
                      itemLabel="Group"
                      placeholder="Enter group name (e.g., Placement Team, Hostel Council, NSS)"
                    />
                  )}
                </>
              )}

              {/* Registered Students Tab */}
              {activeTab === "registeredStudents" && (
                <>
                  {loading.registeredStudents && Object.keys(registeredStudents).length === 0 ? (
                    <TabSpinner />
                  ) : (
                    <RegisteredStudentsForm degrees={degrees} registeredStudents={registeredStudents} onUpdate={handleUpdateRegisteredStudents} isLoading={loading.registeredStudents} />
                  )}
                </>
              )}

              {/* Academic Holidays Tab */}
              {activeTab === "academicHolidays" && (
                <>
                  {loading.academicHolidays && Object.keys(academicHolidays).length === 0 ? (
                    <TabSpinner />
                  ) : (
                    <AcademicHolidaysForm
                      key={JSON.stringify(academicHolidays)}
                      academicHolidays={academicHolidays}
                      onUpdate={handleUpdateAcademicHolidays}
                      isLoading={loading.academicHolidays}
                    />
                  )}
                </>
              )}

              {activeTab === "gymkhanaCategories" && (
                <>
                  {loading.gymkhanaCategories && gymkhanaCategories.length === 0 ? (
                    <TabSpinner />
                  ) : (
                    <GymkhanaCategoryManager
                      categories={gymkhanaCategories}
                      onUpdate={handleUpdateGymkhanaCategories}
                      isLoading={loading.gymkhanaCategories}
                    />
                  )}
                </>
              )}

              {/* System Settings Tab */}
              {activeTab === "systemSettings" && (
                <>
                  {loading.systemSettings && Object.keys(systemSettings).length === 0 ? (
                    <TabSpinner />
                  ) : (
                    <ConfigForm config={systemSettings} onUpdate={handleUpdateSystemSettings} isLoading={loading.systemSettings} />
                  )}
                </>
              )}
              </Card.Body>
            </Card>
          </main>
        </div>

        {/* Success Modal */}
        {showSuccessModal && <CommonSuccessModal show={showSuccessModal} onClose={() => setShowSuccessModal(false)} title="Settings Updated" message={successMessage} infoText="Changes have been applied" infoIcon={HiSave} buttonText="Done" />}
      </div>
    </div>
  )
}

export default SettingsPage

