import React, { useState, useEffect } from "react"
import { FiSave, FiUser, FiCalendar, FiMap, FiPhone, FiUsers, FiCamera } from "react-icons/fi"
import { HiPhone, HiUser, HiHome, HiCalendar, HiCamera, HiUsers, HiMail } from "react-icons/hi"
import { FaUserShield } from "react-icons/fa"
import { GiDroplets } from "react-icons/gi"
import { Modal, Input, Select, Textarea } from "@/components/ui"
import { Button } from "czero/react"
import { studentProfileApi } from "../../service"
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
        icon: <HiCamera style={{ color: "var(--color-primary)" }} size={parseInt(getComputedStyle(document.documentElement).getPropertyValue("--icon-lg"))} />,
      },
      name: {
        label: "Full Name",
        icon: <HiUser style={{ color: "var(--color-primary)" }} size={parseInt(getComputedStyle(document.documentElement).getPropertyValue("--icon-lg"))} />,
      },
      dateOfBirth: {
        label: "Date of Birth",
        icon: <HiCalendar style={{ color: "var(--color-primary)" }} size={parseInt(getComputedStyle(document.documentElement).getPropertyValue("--icon-lg"))} />,
      },
      admissionDate: {
        label: "Admission Date",
        icon: <HiCalendar style={{ color: "var(--color-primary)" }} size={parseInt(getComputedStyle(document.documentElement).getPropertyValue("--icon-lg"))} />,
      },
      phone: {
        label: "Phone Number",
        icon: <HiPhone style={{ color: "var(--color-primary)" }} size={parseInt(getComputedStyle(document.documentElement).getPropertyValue("--icon-lg"))} />,
      },
      address: {
        label: "Address",
        icon: <HiHome style={{ color: "var(--color-primary)" }} size={parseInt(getComputedStyle(document.documentElement).getPropertyValue("--icon-lg"))} />,
      },
      gender: {
        label: "Gender",
        icon: <HiUser style={{ color: "var(--color-primary)" }} size={parseInt(getComputedStyle(document.documentElement).getPropertyValue("--icon-lg"))} />,
      },
      bloodGroup: {
        label: "Blood Group",
        icon: <GiDroplets style={{ color: "var(--color-primary)" }} size={parseInt(getComputedStyle(document.documentElement).getPropertyValue("--icon-lg"))} />,
      },
      guardian: {
        label: "Guardian Name",
        icon: <FaUserShield style={{ color: "var(--color-primary)" }} size={parseInt(getComputedStyle(document.documentElement).getPropertyValue("--icon-lg"))} />,
      },
      guardianPhone: {
        label: "Guardian Phone",
        icon: <HiPhone style={{ color: "var(--color-primary)" }} size={parseInt(getComputedStyle(document.documentElement).getPropertyValue("--icon-lg"))} />,
      },
      guardianEmail: {
        label: "Guardian Email",
        icon: <HiMail style={{ color: "var(--color-primary)" }} size={parseInt(getComputedStyle(document.documentElement).getPropertyValue("--icon-lg"))} />,
      },
    }

    const config = fieldConfig[field] || {
      label: field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, " $1"),
      icon: <HiUser style={{ color: "var(--color-primary)" }} size={parseInt(getComputedStyle(document.documentElement).getPropertyValue("--icon-lg"))} />,
    }

    if (field === "profileImage") {
      return (
        <div key={field} style={{ marginBottom: "var(--spacing-6)" }}>
          <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-secondary)", marginBottom: "var(--spacing-2)" }} className="flex items-center">
            {config.icon}
            <span style={{ marginLeft: "var(--spacing-2)" }}>{config.label}</span>
          </label>
          <div className="flex items-center">
            <div style={{ position: "relative", height: "var(--avatar-2xl)", width: "var(--avatar-2xl)", borderRadius: "var(--radius-avatar)", overflow: "hidden", marginRight: "var(--spacing-4)" }}>
              <img src={editableData.profileImage ? getMediaUrl(editableData.profileImage) : "https://via.placeholder.com/100"} alt="Profile" style={{ height: "var(--avatar-2xl)", width: "var(--avatar-2xl)", objectFit: "cover" }} />
            </div>
            <div>
              <Button type="button" onClick={() => setIsImageModalOpen(true)} variant="outline" size="sm">
                <FiCamera /> Change Photo
              </Button>
              <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "var(--spacing-1)" }}>Maximum file size: 500KB</p>
            </div>
          </div>
        </div>
      )
    }

    if (field === "gender") {
      return (
        <div key={field} style={{ marginBottom: "var(--spacing-6)" }}>
          <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-secondary)", marginBottom: "var(--spacing-2)" }} className="flex items-center">
            {config.icon}
            <span style={{ marginLeft: "var(--spacing-2)" }}>{config.label}</span>
          </label>
          <Select
            value={editableData[field] || ""}
            onChange={(e) => handleChange(field, e.target.value)}
            options={[
              { value: "", label: "Select Gender" },
              { value: "Male", label: "Male" },
              { value: "Female", label: "Female" },
              { value: "Other", label: "Other" },
            ]}
          />
        </div>
      )
    }

    if (field === "bloodGroup") {
      return (
        <div key={field} style={{ marginBottom: "var(--spacing-6)" }}>
          <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-secondary)", marginBottom: "var(--spacing-2)" }} className="flex items-center">
            {config.icon}
            <span style={{ marginLeft: "var(--spacing-2)" }}>{config.label}</span>
          </label>
          <Select
            value={editableData[field] || ""}
            onChange={(e) => handleChange(field, e.target.value)}
            options={[
              { value: "", label: "Select Blood Group" },
              { value: "A+", label: "A+" },
              { value: "A-", label: "A-" },
              { value: "B+", label: "B+" },
              { value: "B-", label: "B-" },
              { value: "AB+", label: "AB+" },
              { value: "AB-", label: "AB-" },
              { value: "O+", label: "O+" },
              { value: "O-", label: "O-" },
            ]}
          />
        </div>
      )
    }

    if (type === "date") {
      return (
        <div key={field} style={{ marginBottom: "var(--spacing-6)" }}>
          <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-secondary)", marginBottom: "var(--spacing-2)" }} className="flex items-center">
            {config.icon}
            <span style={{ marginLeft: "var(--spacing-2)" }}>{config.label}</span>
          </label>
          <Input type="date" value={editableData[field] ? new Date(editableData[field]).toISOString().split("T")[0] : ""} onChange={(e) => handleChange(field, e.target.value)} />
        </div>
      )
    }

    if (field === "address") {
      return (
        <div key={field} style={{ marginBottom: "var(--spacing-6)" }}>
          <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-secondary)", marginBottom: "var(--spacing-2)" }} className="flex items-center">
            {config.icon}
            <span style={{ marginLeft: "var(--spacing-2)" }}>{config.label}</span>
          </label>
          <Textarea value={editableData[field] || ""} onChange={(e) => handleChange(field, e.target.value)} rows={3} />
        </div>
      )
    }

    return (
      <div key={field} style={{ marginBottom: "var(--spacing-6)" }}>
        <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-secondary)", marginBottom: "var(--spacing-2)" }} className="flex items-center">
          {config.icon}
          <span style={{ marginLeft: "var(--spacing-2)" }}>{config.label}</span>
        </label>
        <Input type={type} value={editableData[field] || ""} onChange={(e) => handleChange(field, e.target.value)} />
      </div>
    )
  }

  const renderFooter = () => {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-3)" }}>
        <Button type="button" onClick={onClose} variant="secondary" size="md" disabled={saving}>
          Cancel
        </Button>
        {activeTab === "profile" && (
          <Button type="submit" form="edit-profile-form" variant="primary" size="md" loading={saving} disabled={saving}>
            <FiSave /> {saving ? "Saving..." : "Save Changes"}
          </Button>
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
        <div style={{ display: "flex", justifyContent: "center", padding: "var(--spacing-12) 0" }}>
          <div style={{ animation: "spin 1s linear infinite", borderRadius: "var(--radius-full)", height: "var(--spacing-12)", width: "var(--spacing-12)", border: `var(--border-4) solid var(--color-primary-pale)`, borderTopColor: "var(--color-primary)" }}></div>
        </div>
      )
    }

    if (error) {
      return (
        <div style={{ backgroundColor: "var(--color-danger-bg)", color: "var(--color-danger-text)", padding: "var(--spacing-4)", borderRadius: "var(--radius-md)", marginBottom: "var(--spacing-4)" }}>
          <p>{error}</p>
        </div>
      )
    }

    if (activeTab === "profile") {
      return (
        <form id="edit-profile-form" onSubmit={handleSubmit}>
          {editableFields.length === 0 ? (
            <div style={{ textAlign: "center", padding: "var(--spacing-8) 0" }}>
              <div style={{ backgroundColor: "var(--color-warning-bg)", color: "var(--color-warning-text)", padding: "var(--spacing-4)", borderRadius: "var(--radius-md)" }}>
                <p>You don't have permission to edit any profile fields. Contact an administrator for assistance.</p>
              </div>
            </div>
          ) : (
            <>
              <div style={{ backgroundColor: "var(--color-info-bg)", color: "var(--color-info-text)", padding: "var(--spacing-4)", borderRadius: "var(--radius-md)", marginBottom: "var(--spacing-6)" }}>
                <p style={{ fontSize: "var(--font-size-sm)" }}>You can edit the following fields in your profile. Any changes will be saved once you submit the form.</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
                {editableFields.includes("profileImage") && renderField("profileImage")}
                {editableFields.includes("name") && renderField("name")}
                {editableFields.includes("gender") && renderField("gender")}
                {editableFields.includes("dateOfBirth") && renderField("dateOfBirth", "date")}
                {editableFields.includes("admissionDate") && renderField("admissionDate", "date")}
                {editableFields.includes("bloodGroup") && renderField("bloodGroup")}
                {editableFields.includes("phone") && renderField("phone", "tel")}
                {editableFields.includes("address") && renderField("address")}

                {editableFields.includes("emergencyContact") && (
                  <>
                    <div style={{ marginTop: "var(--spacing-6)", marginBottom: "var(--spacing-4)", borderTop: `var(--border-1) solid var(--color-border-primary)`, paddingTop: "var(--spacing-4)" }}>
                      <h3 style={{ fontSize: "var(--font-size-md)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-secondary)", marginBottom: "var(--spacing-3)" }}>Emergency Contact Information</h3>
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
