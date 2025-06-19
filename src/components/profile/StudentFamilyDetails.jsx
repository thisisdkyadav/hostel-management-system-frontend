import React, { useState, useEffect } from "react"
import { FiPlus, FiEdit, FiTrash2, FiSave, FiX } from "react-icons/fi"
import { studentProfileApi } from "../../services/apiService"
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
        <div key={member.id} className="bg-blue-50 rounded-lg p-4 mb-4 shadow-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleUpdate(member.id)
            }}
          >
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 text-sm border border-gray-300 rounded" required />
            </div>

            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">Relationship</label>
              <select name="relationship" value={formData.relationship} onChange={handleChange} className="w-full p-2 text-sm border border-gray-300 rounded" required>
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

            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-2 text-sm border border-gray-300 rounded" />
            </div>

            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2 text-sm border border-gray-300 rounded" />
            </div>

            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
              <textarea name="address" value={formData.address} onChange={handleChange} rows="2" className="w-full p-2 text-sm border border-gray-300 rounded"></textarea>
            </div>

            <div className="flex justify-end space-x-2">
              <button type="button" onClick={cancelEdit} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-xs font-medium flex items-center">
                <FiX className="mr-1" size={14} /> Cancel
              </button>
              <button type="submit" className="px-3 py-1.5 bg-[#1360AB] text-white rounded text-xs font-medium flex items-center">
                <FiSave className="mr-1" size={14} /> Save
              </button>
            </div>
          </form>
        </div>
      )
    }

    return (
      <div key={member.id} className="bg-white rounded-lg p-4 mb-4 border border-gray-200 shadow-sm">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-gray-900">{member.name}</h3>
          {editable && (
            <div className="flex space-x-1">
              <button onClick={() => startEdit(member)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                <FiEdit size={16} />
              </button>
              <button onClick={() => confirmDelete(member)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Delete">
                <FiTrash2 size={16} />
              </button>
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500 mb-1">
          Relationship: <span className="text-gray-700">{member.relationship || "Not specified"}</span>
        </div>

        {member.phone && (
          <div className="text-xs text-gray-500 mb-1">
            Phone: <span className="text-gray-700">{member.phone}</span>
          </div>
        )}

        {member.email && (
          <div className="text-xs text-gray-500 mb-1">
            Email: <span className="text-gray-700">{member.email}</span>
          </div>
        )}

        {member.address && (
          <div className="text-xs text-gray-500">
            Address: <span className="text-gray-700">{member.address}</span>
          </div>
        )}
      </div>
    )
  }

  const renderAddForm = () => {
    return (
      <div className="bg-blue-50 rounded-lg p-4 mb-4 shadow-sm">
        <form onSubmit={handleAdd}>
          <h3 className="font-medium text-gray-900 mb-3">Add New Family Member</h3>

          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 text-sm border border-gray-300 rounded" required />
          </div>

          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">Relationship</label>
            <select name="relationship" value={formData.relationship} onChange={handleChange} className="w-full p-2 text-sm border border-gray-300 rounded" required>
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

          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-2 text-sm border border-gray-300 rounded" />
          </div>

          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2 text-sm border border-gray-300 rounded" />
          </div>

          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
            <textarea name="address" value={formData.address} onChange={handleChange} rows="2" className="w-full p-2 text-sm border border-gray-300 rounded"></textarea>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false)
                resetForm()
              }}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-xs font-medium flex items-center"
            >
              <FiX className="mr-1" size={14} /> Cancel
            </button>
            <button type="submit" className="px-3 py-1.5 bg-[#1360AB] text-white rounded text-xs font-medium flex items-center">
              <FiSave className="mr-1" size={14} /> Add Member
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="py-2 px-1">
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-md mb-4">
          <p>{success}</p>
        </div>
      )}

      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Family Members</h2>
        {editable && !showAddForm && (
          <button onClick={() => setShowAddForm(true)} className="px-3 py-1.5 bg-[#1360AB] text-white rounded text-sm font-medium flex items-center">
            <FiPlus className="mr-1" size={16} /> Add Family Member
          </button>
        )}
      </div>

      {loading && familyMembers.length === 0 && !showAddForm ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-[#1360AB]"></div>
        </div>
      ) : (
        <>
          {showAddForm && renderAddForm()}

          {familyMembers.length === 0 && !showAddForm ? (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No family members added yet.</p>
              {editable && (
                <button onClick={() => setShowAddForm(true)} className="mt-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded text-sm font-medium flex items-center mx-auto">
                  <FiPlus className="mr-1" size={16} /> Add Family Member
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">{familyMembers.map((member) => renderMemberCard(member))}</div>
          )}
        </>
      )}

      {showDeleteDialog && (
        <ConfirmationDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
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
