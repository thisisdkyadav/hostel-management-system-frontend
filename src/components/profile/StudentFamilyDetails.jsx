import React, { useState, useEffect } from "react"
import { FiPlus, FiEdit, FiTrash2, FiSave, FiX } from "react-icons/fi"
import { studentProfileApi } from "../../services/apiService"
import Button from "../common/Button"
import ConfirmationDialog from "../common/ConfirmationDialog"

const StudentFamilyDetails = ({ userId, editable = true }) => {
  const [loading, setLoading] = useState(true)
  const [familyMembers, setFamilyMembers] = useState([])
  const [editMode, setEditMode] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    relationship: "",
    phone: "",
    email: "",
    address: "",
  })
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    fetchFamilyMembers()
  }, [])

  const fetchFamilyMembers = async () => {
    try {
      setLoading(true)
      const response = await studentProfileApi.getFamilyMembers()
      setFamilyMembers(response.data || [])
      setError(null)
    } catch (err) {
      console.error("Error fetching family members:", err)
      setError("Could not load family members. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const resetForm = () => {
    setFormData({
      name: "",
      relationship: "",
      phone: "",
      email: "",
      address: "",
    })
  }

  const handleAdd = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)
      await studentProfileApi.addFamilyMember(formData)
      setSuccess("Family member added successfully")
      setShowAddForm(false)
      resetForm()
      fetchFamilyMembers()
    } catch (err) {
      console.error("Error adding family member:", err)
      setError("Failed to add family member. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (member) => {
    setEditMode(member.id)
    setFormData({
      name: member.name || "",
      relationship: member.relationship || "",
      phone: member.phone || "",
      email: member.email || "",
      address: member.address || "",
    })
  }

  const cancelEdit = () => {
    setEditMode(null)
    resetForm()
  }

  const handleUpdate = async (id) => {
    try {
      setLoading(true)
      await studentProfileApi.updateFamilyMember(id, formData)
      setSuccess("Family member updated successfully")
      setEditMode(null)
      resetForm()
      fetchFamilyMembers()
    } catch (err) {
      console.error("Error updating family member:", err)
      setError("Failed to update family member. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const confirmDelete = (member) => {
    setMemberToDelete(member)
    setShowDeleteDialog(true)
  }

  const handleDelete = async () => {
    if (!memberToDelete) return

    try {
      setLoading(true)
      await studentProfileApi.deleteFamilyMember(memberToDelete.id)
      setSuccess("Family member removed successfully")
      setShowDeleteDialog(false)
      fetchFamilyMembers()
    } catch (err) {
      console.error("Error deleting family member:", err)
      setError("Failed to delete family member. Please try again.")
    } finally {
      setLoading(false)
      setMemberToDelete(null)
    }
  }

  const renderMemberCard = (member) => {
    const isEditing = editMode === member.id

    if (isEditing) {
      return (
        <div key={member.id} style={{ backgroundColor: 'var(--color-primary-bg)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-4)', marginBottom: 'var(--spacing-4)', boxShadow: 'var(--shadow-sm)' }}>
          <form onSubmit={(e) => {
            e.preventDefault()
            handleUpdate(member.id)
          }}
          >
            <div style={{ marginBottom: 'var(--spacing-3)' }}>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-1)' }}>Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} style={{ width: '100%', padding: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)', border: `var(--border-1) solid var(--input-border)`, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--input-bg)', color: 'var(--color-text-body)' }} required />
            </div>

            <div style={{ marginBottom: 'var(--spacing-3)' }}>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-1)' }}>Relationship</label>
              <select name="relationship" value={formData.relationship} onChange={handleChange} style={{ width: '100%', padding: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)', border: `var(--border-1) solid var(--input-border)`, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--input-bg)', color: 'var(--color-text-body)' }} required>
                <option value="">Select Relationship</option>
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Brother">Brother</option>
                <option value="Sister">Sister</option>
                <option value="Guardian">Guardian</option>
                <option value="Spouse">Spouse</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div style={{ marginBottom: 'var(--spacing-3)' }}>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-1)' }}>Phone</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} style={{ width: '100%', padding: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)', border: `var(--border-1) solid var(--input-border)`, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--input-bg)', color: 'var(--color-text-body)' }} />
            </div>

            <div style={{ marginBottom: 'var(--spacing-3)' }}>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-1)' }}>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} style={{ width: '100%', padding: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)', border: `var(--border-1) solid var(--input-border)`, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--input-bg)', color: 'var(--color-text-body)' }} />
            </div>

            <div style={{ marginBottom: 'var(--spacing-3)' }}>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-1)' }}>Address</label>
              <textarea name="address" value={formData.address} onChange={handleChange} rows="2" style={{ width: '100%', padding: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)', border: `var(--border-1) solid var(--input-border)`, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--input-bg)', color: 'var(--color-text-body)' }}></textarea>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-2)' }}>
              <Button type="button" onClick={cancelEdit} variant="secondary" size="small" icon={<FiX />}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="small" icon={<FiSave />}>
                Save
              </Button>
            </div>
          </form>
        </div>
      )
    }

    return (
      <div key={member.id} style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-4)', marginBottom: 'var(--spacing-4)', border: `var(--border-1) solid var(--color-border-primary)`, boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-2)' }}>
          <h3 style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>{member.name}</h3>
          {editable && (
            <div style={{ display: 'flex', gap: 'var(--spacing-1)' }}>
              <Button onClick={() => startEdit(member)} variant="ghost" size="small" icon={<FiEdit />} aria-label="Edit" />
              <Button onClick={() => confirmDelete(member)} variant="danger" size="small" icon={<FiTrash2 />} aria-label="Delete" />
            </div>
          )}
        </div>

        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-1)' }}>
          Relationship: <span style={{ color: 'var(--color-text-secondary)' }}>{member.relationship || "Not specified"}</span>
        </div>

        {member.phone && (
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-1)' }}>
            Phone: <span style={{ color: 'var(--color-text-secondary)' }}>{member.phone}</span>
          </div>
        )}

        {member.email && (
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-1)' }}>
            Email: <span style={{ color: 'var(--color-text-secondary)' }}>{member.email}</span>
          </div>
        )}

        {member.address && (
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            Address: <span style={{ color: 'var(--color-text-secondary)' }}>{member.address}</span>
          </div>
        )}
      </div>
    )
  }

  const renderAddForm = () => {
    return (
      <div style={{ backgroundColor: 'var(--color-primary-bg)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-4)', marginBottom: 'var(--spacing-4)', boxShadow: 'var(--shadow-sm)' }}>
        <form onSubmit={handleAdd}>
          <h3 style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-3)' }}>Add New Family Member</h3>

          <div style={{ marginBottom: 'var(--spacing-3)' }}>
            <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-1)' }}>Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} style={{ width: '100%', padding: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)', border: `var(--border-1) solid var(--input-border)`, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--input-bg)', color: 'var(--color-text-body)' }} required />
          </div>

          <div style={{ marginBottom: 'var(--spacing-3)' }}>
            <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-1)' }}>Relationship</label>
            <select name="relationship" value={formData.relationship} onChange={handleChange} style={{ width: '100%', padding: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)', border: `var(--border-1) solid var(--input-border)`, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--input-bg)', color: 'var(--color-text-body)' }} required>
              <option value="">Select Relationship</option>
              <option value="Father">Father</option>
              <option value="Mother">Mother</option>
              <option value="Brother">Brother</option>
              <option value="Sister">Sister</option>
              <option value="Guardian">Guardian</option>
              <option value="Spouse">Spouse</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div style={{ marginBottom: 'var(--spacing-3)' }}>
            <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-1)' }}>Phone</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} style={{ width: '100%', padding: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)', border: `var(--border-1) solid var(--input-border)`, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--input-bg)', color: 'var(--color-text-body)' }} />
          </div>

          <div style={{ marginBottom: 'var(--spacing-3)' }}>
            <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-1)' }}>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} style={{ width: '100%', padding: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)', border: `var(--border-1) solid var(--input-border)`, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--input-bg)', color: 'var(--color-text-body)' }} />
          </div>

          <div style={{ marginBottom: 'var(--spacing-3)' }}>
            <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-1)' }}>Address</label>
            <textarea name="address" value={formData.address} onChange={handleChange} rows="2" style={{ width: '100%', padding: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)', border: `var(--border-1) solid var(--input-border)`, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--input-bg)', color: 'var(--color-text-body)' }}></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-2)' }}>
            <Button type="button" onClick={() => {
              setShowAddForm(false)
              resetForm()
            }} variant="secondary" size="small" icon={<FiX />}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="small" icon={<FiSave />}>
              Add Member
            </Button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div style={{ padding: 'var(--spacing-2) var(--spacing-1)' }}>
      {error && (
        <div style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger-text)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-4)' }}>
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success-text)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-4)' }}>
          <p>{success}</p>
        </div>
      )}

      <div style={{ marginBottom: 'var(--spacing-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>Family Members</h2>
        {editable && !showAddForm && (
          <Button onClick={() => setShowAddForm(true)} variant="primary" size="small" icon={<FiPlus />}>
            Add Family Member
          </Button>
        )}
      </div>

      {loading && familyMembers.length === 0 && !showAddForm ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--spacing-8) 0' }}>
          <div style={{ animation: 'spin 1s linear infinite', borderRadius: 'var(--radius-full)', height: 'var(--spacing-8)', width: 'var(--spacing-8)', border: `var(--border-4) solid var(--color-primary-pale)`, borderTopColor: 'var(--color-primary)' }}></div>
        </div>
      ) : (
        <>
          {showAddForm && renderAddForm()}

          {familyMembers.length === 0 && !showAddForm ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-6) 0', backgroundColor: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
              <p style={{ color: 'var(--color-text-muted)' }}>No family members added yet.</p>
              {editable && (
                <Button onClick={() => setShowAddForm(true)} variant="outline" size="small" icon={<FiPlus />}>
                  Add Family Member
                </Button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>{familyMembers.map((member) => renderMemberCard(member))}</div>
          )}
        </>
      )}

      {showDeleteDialog && (
        <ConfirmationDialog isOpen={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDelete}
          title="Delete Family Member"
          message={`Are you sure you want to remove ${memberToDelete?.name || "this family member"}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          isDestructive={true}
        />
      )}
    </div>
  )
}

export default StudentFamilyDetails
