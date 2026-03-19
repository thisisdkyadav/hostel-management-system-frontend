import React, { useState, useEffect } from "react"
import { FaTrash, FaSave, FaBuilding, FaPhone, FaCalendarAlt } from "react-icons/fa"
import { FiTag } from "react-icons/fi"
import { HiCamera } from "react-icons/hi"
import { adminApi } from "../../../service"
import { useGlobal } from "../../../contexts/GlobalProvider"
import { Checkbox, VStack, HStack, Label } from "@/components/ui"
import { Button, Modal, Input } from "czero/react"
import ImageUploadModal from "../../common/ImageUploadModal"
import { getMediaUrl } from "../../../utils/mediaUtils"

const EditWardenForm = ({ warden, staffType = "warden", onClose, onSave, onDelete }) => {
  const { hostelList } = useGlobal()
  const staffTitle = staffType === "warden" ? "Warden" : staffType === "associateWarden" ? "Associate Warden" : "Hostel Supervisor"
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    phone: warden.phone || "",
    hostelIds: warden.hostelIds?.map((h) => h._id || h) || [],
    joinDate: warden.joinDate ? new Date(warden.joinDate).toISOString().split("T")[0] : "",
    profileImage: warden.profileImage || "",
    category: warden.category || "",
  })

  useEffect(() => {
    setFormData({
      phone: warden.phone || "",
      hostelIds: warden.hostelIds?.map((h) => h._id || h) || [],
      joinDate: warden.joinDate ? new Date(warden.joinDate).toISOString().split("T")[0] : "",
      profileImage: warden.profileImage || "",
      category: warden.category || "",
    })
  }, [warden])

  const handleChange = (e) => {
    const { name, value, checked } = e.target

    if (name === "hostelIds") {
      const hostelId = value
      setFormData((prev) => {
        const currentHostelIds = prev.hostelIds || []
        if (checked) {
          return { ...prev, hostelIds: [...new Set([...currentHostelIds, hostelId])] }
        }
        return { ...prev, hostelIds: currentHostelIds.filter((id) => id !== hostelId) }
      })
      return
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
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

      const message =
        staffType === "warden"
          ? await adminApi.updateWarden(warden.id, payload)
          : staffType === "associateWarden"
            ? await adminApi.updateAssociateWarden(warden.id, payload)
            : await adminApi.updateHostelSupervisor(warden.id, payload)

      if (!message) {
        alert(`Failed to update ${staffTitle.toLowerCase()}. Please try again.`)
        setIsLoading(false)
        return
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
    if (!confirmDelete) return

    setIsLoading(true)
    try {
      const message =
        staffType === "warden"
          ? await adminApi.deleteWarden(warden.id)
          : staffType === "associateWarden"
            ? await adminApi.deleteAssociateWarden(warden.id)
            : await adminApi.deleteHostelSupervisor(warden.id)

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

  return (
    <Modal isOpen={true} title={`Edit ${staffTitle}: ${warden.name}`} onClose={onClose} width={500}>
      <form onSubmit={handleSubmit}>
        <VStack gap="large">
          <div style={{ backgroundColor: "var(--color-primary-bg)", padding: "var(--spacing-4)", borderRadius: "var(--radius-lg)" }}>
            <div style={{ display: "flex", alignItems: "center", color: "var(--color-primary-dark)" }}>
              <FaBuilding style={{ marginRight: "var(--spacing-2)" }} />
              <h4 style={{ fontWeight: "var(--font-weight-medium)" }}>{staffTitle} Information</h4>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "var(--spacing-6)" }}>
            <div style={{ position: "relative", height: "var(--spacing-24)", width: "var(--spacing-24)", borderRadius: "var(--radius-full)", marginBottom: "var(--spacing-2)" }}>
              {formData.profileImage ? (
                <img
                  src={getMediaUrl(formData.profileImage)}
                  alt={warden.name}
                  style={{
                    height: "var(--spacing-24)",
                    width: "var(--spacing-24)",
                    borderRadius: "var(--radius-full)",
                    objectFit: "cover",
                    border: "var(--border-4) solid var(--color-primary)",
                    boxShadow: "var(--shadow-md)",
                  }}
                />
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "var(--spacing-24)",
                    width: "var(--spacing-24)",
                    borderRadius: "var(--radius-full)",
                    backgroundColor: "var(--color-primary-bg-hover)",
                    border: "var(--border-4) solid var(--color-primary)",
                    boxShadow: "var(--shadow-md)",
                  }}
                >
                  <FaBuilding style={{ height: "var(--icon-3xl)", width: "var(--icon-3xl)", color: "var(--color-primary)" }} />
                </div>
              )}
              <div
                onClick={() => setIsImageModalOpen(true)}
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-white)",
                  padding: "var(--spacing-1-5)",
                  borderRadius: "var(--radius-full)",
                  cursor: "pointer",
                  transition: "var(--transition-colors)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "var(--color-primary-hover)"
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "var(--color-primary)"
                }}
              >
                <HiCamera style={{ width: "var(--icon-md)", height: "var(--icon-md)" }} />
              </div>
            </div>
            <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>Click the camera icon to change profile photo</span>
          </div>

          {isImageModalOpen && (
            <ImageUploadModal
              userId={warden.id}
              isOpen={isImageModalOpen}
              onClose={() => setIsImageModalOpen(false)}
              onImageUpload={handleImageUpload}
            />
          )}

          <VStack gap="medium">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input type="text" name="phone" id="phone" value={formData.phone} onChange={handleChange} icon={<FaPhone />} placeholder="Enter phone number" />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Input type="text" name="category" id="category" value={formData.category} onChange={handleChange} icon={<FiTag />} placeholder="e.g., Senior, Junior" />
            </div>

            <div>
              <Label>Hostel Assignments</Label>
              <div
                style={{
                  marginTop: "var(--spacing-2)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--spacing-2)",
                  maxHeight: "12rem",
                  overflowY: "auto",
                  border: "var(--border-1) solid var(--color-border-input)",
                  borderRadius: "var(--radius-lg)",
                  padding: "var(--spacing-3)",
                }}
              >
                {hostelList.length > 0 ? (
                  hostelList.map((hostel) => (
                    <div key={hostel._id} style={{ display: "flex", alignItems: "center" }}>
                      <Checkbox
                        id={`hostel-${hostel._id}`}
                        name="hostelIds"
                        checked={formData.hostelIds.includes(hostel._id)}
                        onChange={(e) =>
                          handleChange({ target: { name: "hostelIds", type: "checkbox", value: hostel._id, checked: e.target.checked } })
                        }
                      />
                      <label
                        htmlFor={`hostel-${hostel._id}`}
                        style={{ marginLeft: "var(--spacing-3)", display: "block", fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}
                      >
                        {hostel.name}
                      </label>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>No hostels available.</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="joinDate">Join Date</Label>
              <Input type="date" name="joinDate" id="joinDate" value={formData.joinDate} onChange={handleChange} icon={<FaCalendarAlt />} />
            </div>
          </VStack>

          <HStack
            gap="small"
            justify="between"
            style={{ paddingTop: "var(--spacing-5)", marginTop: "var(--spacing-6)", borderTop: "var(--border-1) solid var(--color-border-light)" }}
          >
            <Button type="button" onClick={handleDelete} variant="danger" size="md" loading={isLoading} disabled={isLoading}>
              <FaTrash />
              Delete {staffTitle}
            </Button>

            <Button type="submit" variant="primary" size="md" loading={isLoading} disabled={isLoading}>
              <FaSave />
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </HStack>
        </VStack>
      </form>
    </Modal>
  )
}

export default EditWardenForm
