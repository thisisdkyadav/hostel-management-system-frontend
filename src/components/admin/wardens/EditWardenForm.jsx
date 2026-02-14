import React, { useState, useEffect } from "react"
import { FaTrash, FaSave, FaBuilding, FaPhone, FaCalendarAlt, FaShieldAlt, FaRedo } from "react-icons/fa"
import { FiTag } from "react-icons/fi"
import { HiCamera } from "react-icons/hi"
import { adminApi, accessControlApi } from "../../../service"
import { useGlobal } from "../../../contexts/GlobalProvider"
import { Checkbox, VStack, HStack, Label, Spinner } from "@/components/ui"
import { Tabs, Button, Table, Modal, Input } from "czero/react"
import ImageUploadModal from "../../common/ImageUploadModal"
import { getMediaUrl } from "../../../utils/mediaUtils"
const EditWardenForm = ({ warden, staffType = "warden", onClose, onSave, onDelete }) => {
  const { hostelList } = useGlobal()
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
    <Modal isOpen={true} title={`Edit ${staffTitle}: ${warden.name}`} onClose={onClose} width={activeTab === "permissions" ? 800 : 500}>
      <div style={{ marginBottom: 'var(--spacing-4)', borderBottom: 'var(--border-1) solid var(--color-border-primary)' }}>
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Trigger value="basic">
              Basic Information
            </Tabs.Trigger>
            <Tabs.Trigger value="permissions">
              Permissions
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs>
      </div>

      <form onSubmit={handleSubmit}>
        <VStack gap="large">
          {activeTab === "basic" && (
            <>
              <div style={{ backgroundColor: 'var(--color-primary-bg)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-primary-dark)' }}>
                  <FaBuilding style={{ marginRight: 'var(--spacing-2)' }} />
                  <h4 style={{ fontWeight: 'var(--font-weight-medium)' }}>{staffTitle} Information</h4>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 'var(--spacing-6)' }}>
                <div style={{ position: 'relative', height: 'var(--spacing-24)', width: 'var(--spacing-24)', borderRadius: 'var(--radius-full)', marginBottom: 'var(--spacing-2)' }}>
                  {formData.profileImage ? (
                    <img src={getMediaUrl(formData.profileImage)} alt={warden.name} style={{ height: 'var(--spacing-24)', width: 'var(--spacing-24)', borderRadius: 'var(--radius-full)', objectFit: 'cover', border: 'var(--border-4) solid var(--color-primary)', boxShadow: 'var(--shadow-md)' }} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'var(--spacing-24)', width: 'var(--spacing-24)', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-primary-bg-hover)', border: 'var(--border-4) solid var(--color-primary)', boxShadow: 'var(--shadow-md)' }}>
                      <FaBuilding style={{ height: 'var(--icon-3xl)', width: 'var(--icon-3xl)', color: 'var(--color-primary)' }} />
                    </div>
                  )}
                  <div onClick={() => setIsImageModalOpen(true)} style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: 'var(--color-primary)', color: 'var(--color-white)', padding: 'var(--spacing-1-5)', borderRadius: 'var(--radius-full)', cursor: 'pointer', transition: 'var(--transition-colors)' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-primary-hover)'} onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-primary)'}>
                    <HiCamera style={{ width: 'var(--icon-md)', height: 'var(--icon-md)' }} />
                  </div>
                </div>
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Click the camera icon to change profile photo</span>
              </div>

              {isImageModalOpen && <ImageUploadModal userId={warden.id} isOpen={isImageModalOpen} onClose={() => setIsImageModalOpen(false)} onImageUpload={handleImageUpload} />}

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
                <div style={{ marginTop: 'var(--spacing-2)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)', maxHeight: '12rem', overflowY: 'auto', border: 'var(--border-1) solid var(--color-border-input)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-3)' }}>
                  {hostelList.length > 0 ? (
                    hostelList.map((hostel) => (
                      <div key={hostel._id} style={{ display: 'flex', alignItems: 'center' }}>
                        <Checkbox id={`hostel-${hostel._id}`} name="hostelIds" checked={formData.hostelIds.includes(hostel._id)} onChange={(e) => handleChange({ target: { name: 'hostelIds', type: 'checkbox', value: hostel._id, checked: e.target.checked } })} />
                        <label htmlFor={`hostel-${hostel._id}`} style={{ marginLeft: 'var(--spacing-3)', display: 'block', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-body)' }}>
                          {hostel.name}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>No hostels available.</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="joinDate">Join Date</Label>
                <Input type="date" name="joinDate" id="joinDate" value={formData.joinDate} onChange={handleChange} icon={<FaCalendarAlt />} />
              </div>
            </VStack>
          </>
        )}

        {activeTab === "permissions" && (
          <>
            <div style={{ backgroundColor: 'var(--color-primary-bg)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)' }}>
              <HStack gap="small" justify="between">
                <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-primary-dark)' }}>
                  <FaShieldAlt style={{ marginRight: 'var(--spacing-2)' }} />
                  <h4 style={{ fontWeight: 'var(--font-weight-medium)' }}>Manage Permissions</h4>
                </div>
                <Button type="button" onClick={handleResetPermissions} variant="ghost" size="sm">
                  <FaRedo />
                  Reset to Default
                </Button>
              </HStack>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)', marginTop: 'var(--spacing-1)' }}>Configure what {warden.name} can access and modify in the system.</p>
              <div style={{ marginTop: 'var(--spacing-3)', display: 'flex', alignItems: 'center', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', marginRight: 'var(--spacing-4)' }}>
                  <span style={{ width: 'var(--spacing-3)', height: 'var(--spacing-3)', backgroundColor: 'var(--color-bg-muted)', borderRadius: 'var(--radius-sm)', marginRight: 'var(--spacing-1)' }}></span>
                  Locked (system default)
                </span>
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: 'var(--spacing-3)', height: 'var(--spacing-3)', backgroundColor: 'var(--color-bg-primary)', border: 'var(--border-1) solid var(--color-border-input)', borderRadius: 'var(--radius-sm)', marginRight: 'var(--spacing-1)' }}></span>
                  Configurable
                </span>
              </div>
            </div>

            {isLoading && !permissions ? (
              <div style={{ textAlign: 'center', padding: 'var(--spacing-4)' }}>
                <Spinner size="medium" />
                <p>Loading permissions...</p>
              </div>
            ) : permissions ? (
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.Head>Resource</Table.Head>
                    {actions.map((action) => (
                      <Table.Head key={action.id} style={{ textAlign: 'center' }}>
                        {action.label}
                      </Table.Head>
                    ))}
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {resources.map((resource) => (
                    <Table.Row key={resource.id}>
                      <Table.Cell style={{ fontWeight: 'var(--font-weight-medium)' }}>{resource.label}</Table.Cell>
                      {actions.map((action) => (
                        <Table.Cell key={`${resource.id}-${action.id}`} style={{ textAlign: 'center' }}>
                          <Checkbox checked={permissions[resource.id]?.[action.id] || false} onChange={(e) => handlePermissionChange(resource.id, action.id, e.target.checked)}
                            disabled={!currentAllowedChanges[resource.id]?.includes(action.id)}
                          />
                        </Table.Cell>
                      ))}
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            ) : (
              <div style={{ textAlign: 'center', padding: 'var(--spacing-4)', color: 'var(--color-danger)' }}>Failed to load permissions. Please try again.</div>
            )}
          </>
        )}

        <HStack gap="small" justify="between" style={{ paddingTop: 'var(--spacing-5)', marginTop: 'var(--spacing-6)', borderTop: 'var(--border-1) solid var(--color-border-light)' }}>
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
