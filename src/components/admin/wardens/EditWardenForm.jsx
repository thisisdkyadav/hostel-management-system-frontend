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
      <div style={{ marginBottom: 'var(--spacing-4)', borderBottom: 'var(--border-1) solid var(--color-border-primary)' }}>
        <div style={{ display: 'flex' }}>
          <button style={{ padding: 'var(--spacing-4)', fontWeight: 'var(--font-weight-medium)', color: activeTab === "basic" ? 'var(--color-primary)' : 'var(--color-text-muted)', borderBottom: activeTab === "basic" ? 'var(--border-2) solid var(--color-primary)' : 'none' }} onClick={() => setActiveTab("basic")}>
            Basic Information
          </button>
          <button style={{ padding: 'var(--spacing-4)', fontWeight: 'var(--font-weight-medium)', color: activeTab === "permissions" ? 'var(--color-primary)' : 'var(--color-text-muted)', borderBottom: activeTab === "permissions" ? 'var(--border-2) solid var(--color-primary)' : 'none' }} onClick={() => setActiveTab("permissions")}>
            Permissions
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-5)' }}>
        {activeTab === "basic" && (
          <>
            <div style={{ backgroundColor: 'var(--color-primary-bg)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--spacing-4)' }}>
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--color-text-body)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 'var(--spacing-3)', top: 'var(--spacing-3)', color: 'var(--color-text-muted)' }}>
                    <FaPhone />
                  </div>
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange} style={{ width: '100%', padding: 'var(--spacing-3)', paddingLeft: 'var(--spacing-10)', border: 'var(--border-1) solid var(--color-border-input)', borderRadius: 'var(--radius-lg)', outline: 'none', transition: 'var(--transition-all)' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--color-primary)'; }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--color-border-input)'; }} placeholder="Enter phone number" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--color-text-body)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Category</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 'var(--spacing-3)', top: 'var(--spacing-3)', color: 'var(--color-text-muted)' }}>
                    <FiTag />
                  </div>
                  <input type="text" name="category" value={formData.category} onChange={handleChange} style={{ width: '100%', padding: 'var(--spacing-3)', paddingLeft: 'var(--spacing-10)', border: 'var(--border-1) solid var(--color-border-input)', borderRadius: 'var(--radius-lg)', outline: 'none', transition: 'var(--transition-all)' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--color-primary)'; }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--color-border-input)'; }} placeholder="e.g., Senior, Junior" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--color-text-body)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Hostel Assignments</label>
                <div style={{ marginTop: 'var(--spacing-2)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)', maxHeight: '12rem', overflowY: 'auto', border: 'var(--border-1) solid var(--color-border-input)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-3)' }}>
                  {hostelList.length > 0 ? (
                    hostelList.map((hostel) => (
                      <div key={hostel._id} style={{ display: 'flex', alignItems: 'center' }}>
                        <input id={`hostel-${hostel._id}`} name="hostelIds" type="checkbox" value={hostel._id} checked={formData.hostelIds.includes(hostel._id)} onChange={handleChange} style={{ height: 'var(--icon-md)', width: 'var(--icon-md)', accentColor: 'var(--color-primary)', borderRadius: 'var(--radius-sm)' }} />
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
                <label style={{ display: 'block', color: 'var(--color-text-body)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Join Date</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 'var(--spacing-3)', top: 'var(--spacing-3)', color: 'var(--color-text-muted)' }}>
                    <FaCalendarAlt />
                  </div>
                  <input type="date" name="joinDate" value={formData.joinDate} onChange={handleChange} style={{ width: '100%', padding: 'var(--spacing-3)', paddingLeft: 'var(--spacing-10)', border: 'var(--border-1) solid var(--color-border-input)', borderRadius: 'var(--radius-lg)', outline: 'none', transition: 'var(--transition-all)' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--color-primary)'; }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--color-border-input)'; }} />
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "permissions" && (
          <>
            <div style={{ backgroundColor: 'var(--color-primary-bg)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--spacing-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-primary-dark)' }}>
                  <FaShieldAlt style={{ marginRight: 'var(--spacing-2)' }} />
                  <h4 style={{ fontWeight: 'var(--font-weight-medium)' }}>Manage Permissions</h4>
                </div>
                <button type="button" onClick={handleResetPermissions} style={{ display: 'flex', alignItems: 'center', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)', transition: 'var(--transition-colors)' }} onMouseEnter={(e) => e.target.style.color = 'var(--color-text-secondary)'} onMouseLeave={(e) => e.target.style.color = 'var(--color-text-tertiary)'}>
                  <FaRedo style={{ marginRight: 'var(--spacing-1)' }} /> Reset to Default
                </button>
              </div>
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
              <div style={{ textAlign: 'center', padding: 'var(--spacing-4)' }}>Loading permissions...</div>
            ) : permissions ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ minWidth: '100%', backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                  <thead style={{ backgroundColor: 'var(--table-header-bg)' }}>
                    <tr>
                      <th style={{ textAlign: 'left', padding: 'var(--spacing-3)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-tertiary)' }}>Resource</th>
                      {actions.map((action) => (
                        <th key={action.id} style={{ textAlign: 'center', padding: 'var(--spacing-3)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-tertiary)' }}>
                          {action.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody style={{ borderTop: 'var(--border-1) solid var(--color-border-primary)' }}>
                    {resources.map((resource) => (
                      <tr key={resource.id} style={{ borderBottom: 'var(--border-1) solid var(--color-border-primary)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <td style={{ padding: 'var(--spacing-3)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-body)', fontWeight: 'var(--font-weight-medium)' }}>{resource.label}</td>
                        {actions.map((action) => (
                          <td key={`${resource.id}-${action.id}`} style={{ padding: 'var(--spacing-3)', textAlign: 'center' }}>
                            <input type="checkbox" checked={permissions[resource.id]?.[action.id] || false} onChange={(e) => handlePermissionChange(resource.id, action.id, e.target.checked)}
                              style={{ height: 'var(--icon-md)', width: 'var(--icon-md)', accentColor: 'var(--color-primary)', borderRadius: 'var(--radius-sm)', opacity: !currentAllowedChanges[resource.id]?.includes(action.id) ? 'var(--opacity-60)' : 'var(--opacity-100)', backgroundColor: !currentAllowedChanges[resource.id]?.includes(action.id) ? 'var(--color-bg-hover)' : 'transparent' }}
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
              <div style={{ textAlign: 'center', padding: 'var(--spacing-4)', color: 'var(--color-danger)' }}>Failed to load permissions. Please try again.</div>
            )}
          </>
        )}

        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', paddingTop: 'var(--spacing-5)', marginTop: 'var(--spacing-6)', borderTop: 'var(--border-1) solid var(--color-border-light)' }}>
          <button type="button" onClick={handleDelete} disabled={isLoading} style={{ padding: 'var(--spacing-2) var(--spacing-4)', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: 'var(--radius-lg)', transition: 'var(--transition-all)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isLoading ? 'var(--opacity-disabled)' : 'var(--opacity-100)' }} onMouseEnter={(e) => { if (!isLoading) e.target.style.backgroundColor = 'var(--color-danger-bg-light)'; }} onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-danger-bg)'}>
            <FaTrash style={{ marginRight: 'var(--spacing-2)' }} /> Delete {staffTitle}
          </button>

          <button type="submit" disabled={isLoading} style={{ padding: 'var(--spacing-2) var(--spacing-4)', backgroundColor: 'var(--color-primary)', color: 'var(--color-white)', borderRadius: 'var(--radius-lg)', transition: 'var(--transition-all)', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isLoading ? 'var(--opacity-disabled)' : 'var(--opacity-100)' }} onMouseEnter={(e) => { if (!isLoading) { e.target.style.backgroundColor = 'var(--color-primary-hover)'; e.target.style.boxShadow = 'var(--shadow-md)'; } }} onMouseLeave={(e) => { e.target.style.backgroundColor = 'var(--color-primary)'; e.target.style.boxShadow = 'var(--shadow-sm)'; }}>
            <FaSave style={{ marginRight: 'var(--spacing-2)' }} /> {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default EditWardenForm
