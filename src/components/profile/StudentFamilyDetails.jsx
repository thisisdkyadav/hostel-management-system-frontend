import React, { useState, useEffect } from "react"
import { FiPlus, FiEdit, FiTrash2, FiSave, FiX } from "react-icons/fi"
import { studentProfileApi } from "../../service"
import { ConfirmDialog, Heading, HStack, Label, Select, Spinner, Surface, Text, Textarea, VStack } from "@/components/ui"
import { Button, Input } from "czero/react"

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
        <Surface bg="brand" padding={4} radius="lg" shadow="sm" style={{ marginBottom: "var(--spacing-4)" }} key={member.id}>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleUpdate(member.id)
            }}
          >
            <div style={{ marginBottom: "var(--spacing-3)" }}>
              <Label size="sm" color="secondary">Name</Label>
              <Input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div style={{ marginBottom: "var(--spacing-3)" }}>
              <Label size="sm" color="secondary">Relationship</Label>
              <Select
                name="relationship"
                value={formData.relationship}
                onChange={handleChange}
                options={[
                  { value: "", label: "Select Relationship" },
                  { value: "Father", label: "Father" },
                  { value: "Mother", label: "Mother" },
                  { value: "Brother", label: "Brother" },
                  { value: "Sister", label: "Sister" },
                  { value: "Guardian", label: "Guardian" },
                  { value: "Spouse", label: "Spouse" },
                  { value: "Other", label: "Other" },
                ]}
              />
            </div>

            <div style={{ marginBottom: "var(--spacing-3)" }}>
              <Label size="sm" color="secondary">Phone</Label>
              <Input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
            </div>

            <div style={{ marginBottom: "var(--spacing-3)" }}>
              <Label size="sm" color="secondary">Email</Label>
              <Input type="email" name="email" value={formData.email} onChange={handleChange} />
            </div>

            <div style={{ marginBottom: "var(--spacing-3)" }}>
              <Label size="sm" color="secondary">Address</Label>
              <Textarea name="address" value={formData.address} onChange={handleChange} rows={2} />
            </div>

            <HStack gap={2} justify="end">
              <Button type="button" onClick={cancelEdit} variant="secondary" size="sm">
                <FiX /> Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                <FiSave /> Save
              </Button>
            </HStack>
          </form>
        </Surface>
      )
    }

    return (
      <Surface bg="primary" padding={4} radius="lg" shadow="sm" border="var(--border-1) solid var(--color-border-primary)" style={{ marginBottom: "var(--spacing-4)" }} key={member.id}>
        <HStack gap="none" align="start" justify="between" style={{ marginBottom: "var(--spacing-2)" }}>
          <Heading as="h3" weight="medium" color="primary">{member.name}</Heading>
          {editable && (
            <HStack gap={1}>
              <Button onClick={() => startEdit(member)} variant="ghost" size="sm" aria-label="Edit">
                <FiEdit />
              </Button>
              <Button onClick={() => confirmDelete(member)} variant="danger" size="sm" aria-label="Delete">
                <FiTrash2 />
              </Button>
            </HStack>
          )}
        </HStack>

        <Text as="div" size="xs" color="muted" style={{ marginBottom: "var(--spacing-1)" }}>
          Relationship: <Text as="span" color="secondary">{member.relationship || "Not specified"}</Text>
        </Text>

        {member.phone && (
          <Text as="div" size="xs" color="muted" style={{ marginBottom: "var(--spacing-1)" }}>
            Phone: <Text as="span" color="secondary">{member.phone}</Text>
          </Text>
        )}

        {member.email && (
          <Text as="div" size="xs" color="muted" style={{ marginBottom: "var(--spacing-1)" }}>
            Email: <Text as="span" color="secondary">{member.email}</Text>
          </Text>
        )}

        {member.address && (
          <Text as="div" size="xs" color="muted">
            Address: <Text as="span" color="secondary">{member.address}</Text>
          </Text>
        )}
      </Surface>
    )
  }

  const renderAddForm = () => {
    return (
      <Surface bg="brand" padding={4} radius="lg" shadow="sm" style={{ marginBottom: "var(--spacing-4)" }}>
        <form onSubmit={handleAdd}>
          <Heading as="h3" weight="medium" color="primary" style={{ marginBottom: "var(--spacing-3)" }}>Add New Family Member</Heading>

          <div style={{ marginBottom: "var(--spacing-3)" }}>
            <Label size="sm" color="secondary">Name</Label>
            <Input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div style={{ marginBottom: "var(--spacing-3)" }}>
            <Label size="sm" color="secondary">Relationship</Label>
            <Select
              name="relationship"
              value={formData.relationship}
              onChange={handleChange}
              options={[
                { value: "", label: "Select Relationship" },
                { value: "Father", label: "Father" },
                { value: "Mother", label: "Mother" },
                { value: "Brother", label: "Brother" },
                { value: "Sister", label: "Sister" },
                { value: "Guardian", label: "Guardian" },
                { value: "Spouse", label: "Spouse" },
                { value: "Other", label: "Other" },
              ]}
            />
          </div>

          <div style={{ marginBottom: "var(--spacing-3)" }}>
            <Label size="sm" color="secondary">Phone</Label>
            <Input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
          </div>

          <div style={{ marginBottom: "var(--spacing-3)" }}>
            <Label size="sm" color="secondary">Email</Label>
            <Input type="email" name="email" value={formData.email} onChange={handleChange} />
          </div>

          <div style={{ marginBottom: "var(--spacing-3)" }}>
            <Label size="sm" color="secondary">Address</Label>
            <Textarea name="address" value={formData.address} onChange={handleChange} rows={2} />
          </div>

          <HStack gap={2} justify="end">
            <Button
              type="button"
              onClick={() => {
                setShowAddForm(false)
                resetForm()
              }}
              variant="secondary"
              size="sm"
            >
              <FiX /> Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              <FiSave /> Add Member
            </Button>
          </HStack>
        </form>
      </Surface>
    )
  }

  return (
    <Surface padding="var(--spacing-2) var(--spacing-1)">
      {error && (
        <Text as="div" color="danger-text" style={{ backgroundColor: "var(--color-danger-bg)", padding: "var(--spacing-4)", borderRadius: "var(--radius-md)", marginBottom: "var(--spacing-4)" }}>
          <p>{error}</p>
        </Text>
      )}

      {success && (
        <Text as="div" color="success-text" style={{ backgroundColor: "var(--color-success-bg)", padding: "var(--spacing-4)", borderRadius: "var(--radius-md)", marginBottom: "var(--spacing-4)" }}>
          <p>{success}</p>
        </Text>
      )}

      <HStack gap="none" align="center" justify="between" style={{ marginBottom: "var(--spacing-4)" }}>
        <Heading as="h2" size="lg" weight="medium" color="primary">Family Members</Heading>
        {editable && !showAddForm && (
          <Button onClick={() => setShowAddForm(true)} variant="primary" size="sm">
            <FiPlus />
            Add Family Member
          </Button>
        )}
      </HStack>

      {loading && familyMembers.length === 0 && !showAddForm ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "var(--spacing-8) 0" }}>
          <Spinner size="var(--spacing-8)" thickness="thick" />
        </div>
      ) : (
        <>
          {showAddForm && renderAddForm()}

          {familyMembers.length === 0 && !showAddForm ? (
            <Surface bg="tertiary" padding="var(--spacing-6) 0" radius="lg" align="center">
              <Text color="muted">No family members added yet.</Text>
              {editable && (
                <Button onClick={() => setShowAddForm(true)} variant="outline" size="sm">
                  <FiPlus /> Add Family Member
                </Button>
              )}
            </Surface>
          ) : (
            <VStack gap={2}>{familyMembers.map((member) => renderMemberCard(member))}</VStack>
          )}
        </>
      )}

      {showDeleteDialog && (
        <ConfirmDialog
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
    </Surface>
  )
}

export default StudentFamilyDetails
