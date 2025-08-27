import React, { useState, useEffect } from "react"
import { FaTrash, FaSave, FaBuilding, FaPhone, FaCalendarAlt, FaShieldAlt, FaRedo } from "react-icons/fa"
import { FiTag } from "react-icons/fi"
import { HiCamera } from "react-icons/hi"
import { adminApi } from "../../../services/apiService"
import { accessControlApi } from "../../../services/accessControlApi"
import { useAdmin } from "../../../contexts/AdminProvider"
import Modal from "../../common/Modal"
import ImageUploadModal from "../../common/ImageUploadModal"
import { getMediaUrl } from "../../../utils/mediaUtils"
const EditWardenForm = ({ warden, staffType = "warden", onClose, onSave, onDelete }) => {
  const { hostelList } = useAdmin()
  const staffTitle = staffType === "warden" ? "Warden" : staffType === "associateWarden" ? "Associate Warden" : "Hostel Supervisor"
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")

  const [formData, setFormData] = useState({
    phone: warden.phone || "",
    hostelIds: warden.hostelIds?.map((h) => h._id || h) || [],
    joinDate: warden.joinDate ? new Date(warden.joinDate).toISOString().split("T")[0] : "",
    profileImage: warden.profileImage || "",
    category: warden.category || "",
  })

  const [permissions, setPermissions] = useState(null)

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      phone: warden.phone || "",
      hostelIds: warden.hostelIds?.map((h) => h._id || h) || [],
      joinDate: warden.joinDate ? new Date(warden.joinDate).toISOString().split("T")[0] : "",
      profileImage: warden.profileImage || "",
      category: warden.category || "",
    }))

    // Fetch user permissions
    fetchUserPermissions()
  }, [warden])

  const fetchUserPermissions = async () => {
    try {
      setIsLoading(true)
      const response = await accessControlApi.getUserPermissions(warden.userId)
      if (response && response.data) {
        setPermissions(response.data.permissions)
      }
    } catch (error) {
      console.error("Failed to fetch permissions:", error)
      alert("Failed to load user permissions. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name === "hostelIds") {
      const hostelId = value
      setFormData((prev) => {
        const currentHostelIds = prev.hostelIds || []
        if (checked) {
          return { ...prev, hostelIds: [...new Set([...currentHostelIds, hostelId])] }
        } else {
          return { ...prev, hostelIds: currentHostelIds.filter((id) => id !== hostelId) }
        }
      })
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handlePermissionChange = (resource, action, checked) => {
    setPermissions((prev) => ({
      ...prev,
      [resource]: {
        ...prev[resource],
        [action]: checked,
      },
    }))
  }

  const handleResetPermissions = async () => {
    const confirmReset = window.confirm("Are you sure you want to reset permissions to default?")
    if (confirmReset) {
      try {
        setIsLoading(true)
        const response = await accessControlApi.resetUserPermissions(warden.userId)
        if (response && response.data) {
          setPermissions(response.data.permissions)
          alert("Permissions reset successfully!")
        }
      } catch (error) {
        console.error("Failed to reset permissions:", error)
        alert("Failed to reset permissions. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleImageUpload = (imageUrl) => {
    setFormData((prev) => ({
      ...prev,
      profileImage: imageUrl,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const payload = {
        phone: formData.phone,
        hostelIds: formData.hostelIds,
        joinDate: formData.joinDate,
        profileImage: formData.profileImage,
        category: formData.category,
      }

      // Update user info
      const message = staffType === "warden" ? await adminApi.updateWarden(warden.id, payload) : staffType === "associateWarden" ? await adminApi.updateAssociateWarden(warden.id, payload) : await adminApi.updateHostelSupervisor(warden.id, payload)

      if (!message) {
        alert(`Failed to update ${staffTitle.toLowerCase()}. Please try again.`)
        setIsLoading(false)
        return
      }

      // Update permissions if on permissions tab
      if (activeTab === "permissions" && permissions) {
        await accessControlApi.updateUserPermissions(warden.userId, permissions)
      }

      alert(`${staffTitle} updated successfully!`)
      if (onSave) onSave()
      onClose()
    } catch (error) {
      console.error(`Failed to update ${staffTitle.toLowerCase()}:`, error)
      alert(`Failed to update ${staffTitle.toLowerCase()}. Please try again.`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    const confirmDelete = window.confirm(`Are you sure you want to delete this ${staffTitle.toLowerCase()}?`)
    if (confirmDelete) {
      setIsLoading(true)
      try {
        const message = staffType === "warden" ? await adminApi.deleteWarden(warden.id) : staffType === "associateWarden" ? await adminApi.deleteAssociateWarden(warden.id) : await adminApi.deleteHostelSupervisor(warden.id)

        if (!message) {
          alert(`Failed to delete ${staffTitle.toLowerCase()}. Please try again.`)
          setIsLoading(false)
          return
        }
        alert(`${staffTitle} deleted successfully!`)
        if (onDelete) onDelete()
        onClose()
      } catch (error) {
        console.error(`Failed to delete ${staffTitle.toLowerCase()}:`, error)
        alert(`Failed to delete ${staffTitle.toLowerCase()}. Please try again.`)
      } finally {
        setIsLoading(false)
      }
    }
  }

  /**
   * only permissions listed below can be changed by admin
   * other permissions will only show default permissions
   * in future, we can allow more permissions to be changed by admin
   */
  const currentAllowedChanges = {
    students_info: ["edit"],
    student_inventory: ["edit", "create"],
    lost_and_found: ["edit", "create"],
    events: [],
    visitors: ["react"],
    complaints: ["create"],
    feedback: ["react"],
  }

  const resources = [
    { id: "students_info", label: "Student Information" },
    { id: "student_inventory", label: "Student Inventory" },
    { id: "lost_and_found", label: "Lost and Found" },
    { id: "events", label: "Event Management" },
    { id: "visitors", label: "Visitor Management" },
    { id: "complaints", label: "Complaint Handling" },
    { id: "feedback", label: "Feedback Management" },
  ]

  const actions = [
    { id: "view", label: "View" },
    { id: "react", label: "React" },
    { id: "edit", label: "Edit" },
    { id: "create", label: "Create" },
    { id: "delete", label: "Delete" },
  ]

  return (
    <Modal title={`Edit ${staffTitle}: ${warden.name}`} onClose={onClose} width={activeTab === "permissions" ? 800 : 500}>
      <div className="mb-4 border-b">
        <div className="flex">
          <button className={`px-4 py-2 font-medium ${activeTab === "basic" ? "text-[#1360AB] border-b-2 border-[#1360AB]" : "text-gray-500"}`} onClick={() => setActiveTab("basic")}>
            Basic Information
          </button>
          <button className={`px-4 py-2 font-medium ${activeTab === "permissions" ? "text-[#1360AB] border-b-2 border-[#1360AB]" : "text-gray-500"}`} onClick={() => setActiveTab("permissions")}>
            Permissions
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {activeTab === "basic" && (
          <>
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <div className="flex items-center text-blue-800">
                <FaBuilding className="mr-2" />
                <h4 className="font-medium">{staffTitle} Information</h4>
              </div>
            </div>

            <div className="flex flex-col items-center mb-6">
              <div className="relative h-24 w-24 rounded-full mb-2">
                {formData.profileImage ? (
                  <img src={getMediaUrl(formData.profileImage)} alt={warden.name} className="h-24 w-24 rounded-full object-cover border-4 border-[#1360AB] shadow-md" />
                ) : (
                  <div className="flex items-center justify-center h-24 w-24 rounded-full bg-blue-100 border-4 border-[#1360AB] shadow-md">
                    <FaBuilding className="h-12 w-12 text-[#1360AB]" />
                  </div>
                )}
                <div onClick={() => setIsImageModalOpen(true)} className="absolute bottom-0 right-0 bg-[#1360AB] text-white p-1.5 rounded-full cursor-pointer hover:bg-[#0F4C81] transition-colors">
                  <HiCamera className="w-4 h-4" />
                </div>
              </div>
              <span className="text-sm text-gray-500">Click the camera icon to change profile photo</span>
            </div>

            {isImageModalOpen && <ImageUploadModal userId={warden.id} isOpen={isImageModalOpen} onClose={() => setIsImageModalOpen(false)} onImageUpload={handleImageUpload} />}

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Phone Number</label>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-gray-400">
                    <FaPhone />
                  </div>
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all" placeholder="Enter phone number" />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Category</label>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-gray-400">
                    <FiTag />
                  </div>
                  <input type="text" name="category" value={formData.category} onChange={handleChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all" placeholder="e.g., Senior, Junior" />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Hostel Assignments</label>
                <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
                  {hostelList.length > 0 ? (
                    hostelList.map((hostel) => (
                      <div key={hostel._id} className="flex items-center">
                        <input id={`hostel-${hostel._id}`} name="hostelIds" type="checkbox" value={hostel._id} checked={formData.hostelIds.includes(hostel._id)} onChange={handleChange} className="h-4 w-4 text-[#1360AB] border-gray-300 rounded focus:ring-[#1360AB]" />
                        <label htmlFor={`hostel-${hostel._id}`} className="ml-3 block text-sm text-gray-700">
                          {hostel.name}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No hostels available.</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Join Date</label>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-gray-400">
                    <FaCalendarAlt />
                  </div>
                  <input type="date" name="joinDate" value={formData.joinDate} onChange={handleChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all" />
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "permissions" && (
          <>
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-blue-800">
                  <FaShieldAlt className="mr-2" />
                  <h4 className="font-medium">Manage Permissions</h4>
                </div>
                <button type="button" onClick={handleResetPermissions} className="flex items-center text-sm text-gray-600 hover:text-gray-800">
                  <FaRedo className="mr-1" /> Reset to Default
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">Configure what {warden.name} can access and modify in the system.</p>
              <div className="mt-3 flex items-center text-xs text-gray-500">
                <span className="flex items-center mr-4">
                  <span className="w-3 h-3 bg-gray-200 rounded-sm mr-1"></span>
                  Locked (system default)
                </span>
                <span className="flex items-center">
                  <span className="w-3 h-3 bg-white border border-gray-300 rounded-sm mr-1"></span>
                  Configurable
                </span>
              </div>
            </div>

            {isLoading && !permissions ? (
              <div className="text-center p-4">Loading permissions...</div>
            ) : permissions ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg overflow-hidden">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium text-gray-600">Resource</th>
                      {actions.map((action) => (
                        <th key={action.id} className="text-center p-3 text-sm font-medium text-gray-600">
                          {action.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {resources.map((resource) => (
                      <tr key={resource.id} className="hover:bg-gray-50">
                        <td className="p-3 text-sm text-gray-700 font-medium">{resource.label}</td>
                        {actions.map((action) => (
                          <td key={`${resource.id}-${action.id}`} className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={permissions[resource.id]?.[action.id] || false}
                              onChange={(e) => handlePermissionChange(resource.id, action.id, e.target.checked)}
                              className={`h-4 w-4 text-[#1360AB] border-gray-300 rounded focus:ring-[#1360AB] ${!currentAllowedChanges[resource.id]?.includes(action.id) ? "opacity-60 bg-gray-100" : ""}`}
                              disabled={!currentAllowedChanges[resource.id]?.includes(action.id)}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center p-4 text-red-500">Failed to load permissions. Please try again.</div>
            )}
          </>
        )}

        <div className="flex flex-col-reverse sm:flex-row justify-between pt-5 mt-6 border-t border-gray-100">
          <button type="button" onClick={handleDelete} disabled={isLoading} className="mt-3 sm:mt-0 px-4 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all flex items-center justify-center disabled:opacity-50">
            <FaTrash className="mr-2" /> Delete {staffTitle}
          </button>

          <button type="submit" disabled={isLoading} className="px-4 py-2.5 bg-[#1360AB] text-white rounded-lg hover:bg-[#0F4C81] transition-all shadow-sm hover:shadow flex items-center justify-center disabled:opacity-50">
            <FaSave className="mr-2" /> {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default EditWardenForm
