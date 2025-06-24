import React, { useState, useEffect } from "react"
import { FiSave, FiUser, FiCalendar, FiMap, FiPhone, FiUsers } from "react-icons/fi"
import { HiPhone, HiUser, HiHome, HiCalendar, HiCamera, HiUsers, HiMail } from "react-icons/hi"
import { FaUserShield } from "react-icons/fa"
import { GiDroplets } from "react-icons/gi"
import Modal from "../common/Modal"
import { studentProfileApi } from "../../services/apiService"
import ImageUploadModal from "../common/ImageUploadModal"
import { getMediaUrl } from "../../utils/mediaUtils"
import StudentFamilyDetails from "./StudentFamilyDetails"

const StudentEditProfileModal = ({ isOpen, onClose, onUpdate, userId, currentData }) => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [editableData, setEditableData] = useState({})
  const [editableFields, setEditableFields] = useState([])
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  const [canManageFamilyMembers, setCanManageFamilyMembers] = useState(false)

  useEffect(() => {
    const fetchEditableFields = async () => {
      try {
        setLoading(true)
        const response = await studentProfileApi.getEditableProfile()

        setEditableFields(response.editableFields || [])
        setEditableData(response.data || {})

        // Check if family members management is allowed
        if (response.editableFields?.includes("familyMembers")) {
          setCanManageFamilyMembers(true)
        }
      } catch (error) {
        console.error("Error fetching editable fields:", error)
        setError("Failed to load editable profile data")
      } finally {
        setLoading(false)
      }
    }

    fetchEditableFields()
  }, [])

  const handleChange = (field, value) => {
    setEditableData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleImageUpload = (imageUrl) => {
    setEditableData((prev) => ({
      ...prev,
      profileImage: imageUrl,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setSaving(true)

      // Create a copy of the data to modify
      const dataToSubmit = { ...editableData }

      // If emergency contact fields exist, structure them as a nested object
      if (editableFields.includes("emergencyContact")) {
        dataToSubmit.emergencyContact = {
          guardian: editableData.guardian || "",
          guardianPhone: editableData.guardianPhone || "",
          guardianEmail: editableData.guardianEmail || "",
        }

        // Remove individual fields to avoid duplication
        delete dataToSubmit.guardian
        delete dataToSubmit.guardianPhone
        delete dataToSubmit.guardianEmail
      }

      await studentProfileApi.updateProfile(dataToSubmit)
      onUpdate()
    } catch (error) {
      console.error("Error updating profile:", error)
      setError("Failed to update profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const renderField = (field, type = "text") => {
    console.log(field)
    const fieldConfig = {
      profileImage: {
        label: "Profile Image",
        icon: <HiCamera className="text-blue-600" size={20} />,
      },
      name: {
        label: "Full Name",
        icon: <HiUser className="text-blue-600" size={20} />,
      },
      dateOfBirth: {
        label: "Date of Birth",
        icon: <HiCalendar className="text-blue-600" size={20} />,
      },
      phone: {
        label: "Phone Number",
        icon: <HiPhone className="text-blue-600" size={20} />,
      },
      address: {
        label: "Address",
        icon: <HiHome className="text-blue-600" size={20} />,
      },
      gender: {
        label: "Gender",
        icon: <HiUser className="text-blue-600" size={20} />,
      },
      bloodGroup: {
        label: "Blood Group",
        icon: <GiDroplets className="text-blue-600" size={20} />,
      },
      guardian: {
        label: "Guardian Name",
        icon: <FaUserShield className="text-blue-600" size={20} />,
      },
      guardianPhone: {
        label: "Guardian Phone",
        icon: <HiPhone className="text-blue-600" size={20} />,
      },
      guardianEmail: {
        label: "Guardian Email",
        icon: <HiMail className="text-blue-600" size={20} />,
      },
    }

    const config = fieldConfig[field] || {
      label: field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, " $1"),
      icon: <HiUser className="text-blue-600" size={20} />,
    }

    if (field === "profileImage") {
      return (
        <div key={field} className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            {config.icon}
            <span className="ml-2">{config.label}</span>
          </label>
          <div className="flex items-center">
            <div className="relative h-20 w-20 rounded-full overflow-hidden mr-4">
              <img src={editableData.profileImage ? getMediaUrl(editableData.profileImage) : "https://via.placeholder.com/100"} alt="Profile" className="h-20 w-20 object-cover" />
            </div>
            <div>
              <button type="button" onClick={() => setIsImageModalOpen(true)} className="px-3 py-2 bg-blue-100 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors">
                Change Photo
              </button>
              <p className="text-xs text-gray-500 mt-1">Maximum file size: 500KB</p>
            </div>
          </div>
        </div>
      )
    }

    if (field === "gender") {
      return (
        <div key={field} className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            {config.icon}
            <span className="ml-2">{config.label}</span>
          </label>
          <select value={editableData[field] || ""} onChange={(e) => handleChange(field, e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500">
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      )
    }

    if (field === "bloodGroup") {
      return (
        <div key={field} className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            {config.icon}
            <span className="ml-2">{config.label}</span>
          </label>
          <select value={editableData[field] || ""} onChange={(e) => handleChange(field, e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500">
            <option value="">Select Blood Group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>
      )
    }

    if (type === "date") {
      return (
        <div key={field} className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            {config.icon}
            <span className="ml-2">{config.label}</span>
          </label>
          <input type="date" value={editableData[field] ? new Date(editableData[field]).toISOString().split("T")[0] : ""} onChange={(e) => handleChange(field, e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500" />
        </div>
      )
    }

    if (field === "address") {
      return (
        <div key={field} className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            {config.icon}
            <span className="ml-2">{config.label}</span>
          </label>
          <textarea value={editableData[field] || ""} onChange={(e) => handleChange(field, e.target.value)} rows={3} className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500" />
        </div>
      )
    }

    return (
      <div key={field} className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
          {config.icon}
          <span className="ml-2">{config.label}</span>
        </label>
        <input type={type} value={editableData[field] || ""} onChange={(e) => handleChange(field, e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500" />
      </div>
    )
  }

  const renderFooter = () => {
    return (
      <div className="flex justify-end space-x-3">
        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors" disabled={saving}>
          Cancel
        </button>
        {activeTab === "profile" && (
          <button type="submit" form="edit-profile-form" className="px-4 py-2 bg-[#1360AB] text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center" disabled={saving}>
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <FiSave className="mr-2" size={16} />
                Save Changes
              </>
            )}
          </button>
        )}
      </div>
    )
  }

  const getTabs = () => {
    const tabs = [{ id: "profile", name: "Profile Info", icon: <FiUser /> }]

    if (canManageFamilyMembers) {
      tabs.push({ id: "family", name: "Family Members", icon: <FiUsers /> })
    }

    return tabs
  }

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-[#1360AB]"></div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
          <p>{error}</p>
        </div>
      )
    }

    if (activeTab === "profile") {
      return (
        <form id="edit-profile-form" onSubmit={handleSubmit}>
          {editableFields.length === 0 ? (
            <div className="text-center py-8">
              <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md">
                <p>You don't have permission to edit any profile fields. Contact an administrator for assistance.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-blue-50 text-blue-700 p-4 rounded-md mb-6">
                <p className="text-sm">You can edit the following fields in your profile. Any changes will be saved once you submit the form.</p>
              </div>

              <div className="space-y-2">
                {editableFields.includes("profileImage") && renderField("profileImage")}
                {editableFields.includes("name") && renderField("name")}
                {editableFields.includes("gender") && renderField("gender")}
                {editableFields.includes("dateOfBirth") && renderField("dateOfBirth", "date")}
                {editableFields.includes("bloodGroup") && renderField("bloodGroup")}
                {editableFields.includes("phone") && renderField("phone", "tel")}
                {editableFields.includes("address") && renderField("address")}

                {editableFields.includes("emergencyContact") && (
                  <>
                    <div className="mt-6 mb-4 border-t pt-4">
                      <h3 className="text-md font-medium text-gray-800 mb-3">Emergency Contact Information</h3>
                    </div>
                    {renderField("guardian")}
                    {renderField("guardianPhone", "tel")}
                    {renderField("guardianEmail", "email")}
                  </>
                )}
              </div>
            </>
          )}
        </form>
      )
    } else if (activeTab === "family" && canManageFamilyMembers) {
      return <StudentFamilyDetails userId={userId} editable={true} />
    }
  }

  return (
    <>
      <Modal title="Edit Profile" onClose={onClose} width={700} footer={renderFooter()} tabs={getTabs()} activeTab={activeTab} onTabChange={setActiveTab} hideTitle={true}>
        {renderTabContent()}
      </Modal>

      {isImageModalOpen && <ImageUploadModal userId={userId} isOpen={isImageModalOpen} onClose={() => setIsImageModalOpen(false)} onImageUpload={handleImageUpload} />}
    </>
  )
}

export default StudentEditProfileModal
