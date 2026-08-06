import React, { useState, useEffect } from "react"
import { FiSave, FiUser, FiCalendar, FiMap, FiPhone, FiUsers, FiCamera } from "react-icons/fi"
import { HiPhone, HiUser, HiHome, HiCalendar, HiCamera, HiUsers, HiMail } from "react-icons/hi"
import { FaUserShield } from "react-icons/fa"
import { GiDroplets } from "react-icons/gi"
import { Heading, HStack, Label, Select, Spinner, Surface, Text, Textarea, VStack } from "@/components/ui"
import { Button, Input } from "czero/react"
import { Modal } from "@/components/ui"
import { studentProfileApi } from "../../service"
import ImageUploadModal from "../common/ImageUploadModal"
import { getMediaUrl } from "../../utils/mediaUtils"
import StudentFamilyDetails from "./StudentFamilyDetails"

const StudentEditProfileModal = ({ onClose, onUpdate, userId }) => {
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

        const resolvedEditableFields = response.editableFields || []
        setEditableFields(resolvedEditableFields)
        setEditableData(response.data || {})

        // Check if family members management is allowed
        if (resolvedEditableFields.includes("familyMembers")) {
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
        icon: <HiCamera size={parseInt(getComputedStyle(document.documentElement).getPropertyValue("--icon-lg"))} color="var(--color-primary)" />,
      },
      name: {
        label: "Full Name",
        icon: <HiUser size={parseInt(getComputedStyle(document.documentElement).getPropertyValue("--icon-lg"))} color="var(--color-primary)" />,
      },
      dateOfBirth: {
        label: "Date of Birth",
        icon: <HiCalendar size={parseInt(getComputedStyle(document.documentElement).getPropertyValue("--icon-lg"))} color="var(--color-primary)" />,
      },
      admissionDate: {
        label: "Admission Date",
        icon: <HiCalendar size={parseInt(getComputedStyle(document.documentElement).getPropertyValue("--icon-lg"))} color="var(--color-primary)" />,
      },
      phone: {
        label: "Phone Number",
        icon: <HiPhone size={parseInt(getComputedStyle(document.documentElement).getPropertyValue("--icon-lg"))} color="var(--color-primary)" />,
      },
      address: {
        label: "Address",
        icon: <HiHome size={parseInt(getComputedStyle(document.documentElement).getPropertyValue("--icon-lg"))} color="var(--color-primary)" />,
      },
      gender: {
        label: "Gender",
        icon: <HiUser size={parseInt(getComputedStyle(document.documentElement).getPropertyValue("--icon-lg"))} color="var(--color-primary)" />,
      },
      bloodGroup: {
        label: "Blood Group",
        icon: <GiDroplets size={parseInt(getComputedStyle(document.documentElement).getPropertyValue("--icon-lg"))} color="var(--color-primary)" />,
      },
      guardian: {
        label: "Guardian Name",
        icon: <FaUserShield size={parseInt(getComputedStyle(document.documentElement).getPropertyValue("--icon-lg"))} color="var(--color-primary)" />,
      },
      guardianPhone: {
        label: "Guardian Phone",
        icon: <HiPhone size={parseInt(getComputedStyle(document.documentElement).getPropertyValue("--icon-lg"))} color="var(--color-primary)" />,
      },
      guardianEmail: {
        label: "Guardian Email",
        icon: <HiMail size={parseInt(getComputedStyle(document.documentElement).getPropertyValue("--icon-lg"))} color="var(--color-primary)" />,
      },
      secondaryEmail: {
        label: "Secondary Email",
        icon: <HiMail size={parseInt(getComputedStyle(document.documentElement).getPropertyValue("--icon-lg"))} color="var(--color-primary)" />,
      },
    }

    const config = fieldConfig[field] || {
      label: field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, " $1"),
      icon: <HiUser size={parseInt(getComputedStyle(document.documentElement).getPropertyValue("--icon-lg"))} color="var(--color-primary)" />,
    }

    if (field === "profileImage") {
      return (
        <div key={field} style={{ marginBottom: "var(--spacing-6)" }}>
          <Label color="secondary" spacing={2} className="flex items-center">
            {config.icon}
            <span style={{ marginLeft: "var(--spacing-2)" }}>{config.label}</span>
          </Label>
          <div className="flex items-center">
            <div style={{ position: "relative", height: "var(--avatar-2xl)", width: "var(--avatar-2xl)", borderRadius: "var(--radius-avatar)", overflow: "hidden", marginRight: "var(--spacing-4)" }}>
              <img src={editableData.profileImage ? getMediaUrl(editableData.profileImage) : "https://via.placeholder.com/100"} alt="Profile" style={{ height: "var(--avatar-2xl)", width: "var(--avatar-2xl)", objectFit: "cover" }} />
            </div>
            <div>
              <Button type="button" onClick={() => setIsImageModalOpen(true)} variant="outline" size="sm">
                <FiCamera /> Change Photo
              </Button>
              <Text size="xs" color="muted" style={{ marginTop: "var(--spacing-1)" }}>Maximum file size: 500KB</Text>
            </div>
          </div>
        </div>
      )
    }

    if (field === "gender") {
      return (
        <div key={field} style={{ marginBottom: "var(--spacing-6)" }}>
          <Label color="secondary" spacing={2} className="flex items-center">
            {config.icon}
            <span style={{ marginLeft: "var(--spacing-2)" }}>{config.label}</span>
          </Label>
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
          <Label color="secondary" spacing={2} className="flex items-center">
            {config.icon}
            <span style={{ marginLeft: "var(--spacing-2)" }}>{config.label}</span>
          </Label>
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
          <Label color="secondary" spacing={2} className="flex items-center">
            {config.icon}
            <span style={{ marginLeft: "var(--spacing-2)" }}>{config.label}</span>
          </Label>
          <Input type="date" value={editableData[field] || ""} onChange={(e) => handleChange(field, e.target.value)} />
        </div>
      )
    }

    if (field === "address") {
      return (
        <div key={field} style={{ marginBottom: "var(--spacing-6)" }}>
          <Label color="secondary" spacing={2} className="flex items-center">
            {config.icon}
            <span style={{ marginLeft: "var(--spacing-2)" }}>{config.label}</span>
          </Label>
          <Textarea value={editableData[field] || ""} onChange={(e) => handleChange(field, e.target.value)} rows={3} />
        </div>
      )
    }

    return (
      <div key={field} style={{ marginBottom: "var(--spacing-6)" }}>
        <Label color="secondary" spacing={2} className="flex items-center">
          {config.icon}
          <span style={{ marginLeft: "var(--spacing-2)" }}>{config.label}</span>
        </Label>
        <Input type={type} value={editableData[field] || ""} onChange={(e) => handleChange(field, e.target.value)} />
      </div>
    )
  }

  const renderFooter = () => {
    return (
      <HStack gap={3} justify="end">
        <Button type="button" onClick={onClose} variant="secondary" size="md" disabled={saving}>
          Cancel
        </Button>
        {activeTab === "profile" && (
          <Button type="submit" form="edit-profile-form" variant="primary" size="md" loading={saving} disabled={saving}>
            <FiSave /> {saving ? "Saving..." : "Save Changes"}
          </Button>
        )}
      </HStack>
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
          <Spinner size="var(--spacing-12)" thickness="thick" />
        </div>
      )
    }

    if (error) {
      return (
        <Text as="div" color="danger-text" style={{ backgroundColor: "var(--color-danger-bg)", padding: "var(--spacing-4)", borderRadius: "var(--radius-md)", marginBottom: "var(--spacing-4)" }}>
          <p>{error}</p>
        </Text>
      )
    }

    if (activeTab === "profile") {
      return (
        <form id="edit-profile-form" onSubmit={handleSubmit}>
          {editableFields.length === 0 ? (
            <Surface padding="var(--spacing-8) 0" align="center">
              <Text as="div" color="warning-text" style={{ backgroundColor: "var(--color-warning-bg)", padding: "var(--spacing-4)", borderRadius: "var(--radius-md)" }}>
                <p>You don't have permission to edit any profile fields. Contact an administrator for assistance.</p>
              </Text>
            </Surface>
          ) : (
            <>
              <Text as="div" color="info-text" style={{ backgroundColor: "var(--color-info-bg)", padding: "var(--spacing-4)", borderRadius: "var(--radius-md)", marginBottom: "var(--spacing-6)" }}>
                <Text size="sm">You can edit the following fields in your profile. Any changes will be saved once you submit the form.</Text>
              </Text>

              <VStack gap={2}>
                {editableFields.includes("profileImage") && renderField("profileImage")}
                {editableFields.includes("name") && renderField("name")}
                {editableFields.includes("gender") && renderField("gender")}
                {editableFields.includes("dateOfBirth") && renderField("dateOfBirth", "date")}
                {editableFields.includes("admissionDate") && renderField("admissionDate", "date")}
                {editableFields.includes("bloodGroup") && renderField("bloodGroup")}
                {editableFields.includes("phone") && renderField("phone", "tel")}
                {editableFields.includes("secondaryEmail") && renderField("secondaryEmail", "email")}
                {editableFields.includes("address") && renderField("address")}

                {editableFields.includes("emergencyContact") && (
                  <>
                    <div style={{ marginTop: "var(--spacing-6)", marginBottom: "var(--spacing-4)", borderTop: `var(--border-1) solid var(--color-border-primary)`, paddingTop: "var(--spacing-4)" }}>
                      <Heading as="h3" size="md" weight="medium" color="secondary" style={{ marginBottom: "var(--spacing-3)" }}>Emergency Contact Information</Heading>
                    </div>
                    {renderField("guardian")}
                    {renderField("guardianPhone", "tel")}
                    {renderField("guardianEmail", "email")}
                  </>
                )}
              </VStack>
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
