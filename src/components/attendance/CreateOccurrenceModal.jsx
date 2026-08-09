import { useEffect, useState } from "react"
import { Alert, Button, Field, Input, Label, Modal, Textarea, useToast, VStack } from "hzero"
import UserSelector from "../common/UserSelector"
import { attendanceApi } from "../../service"

const ASSIGNABLE_ROLES = ["All Roles", "Admin", "Super Admin", "Gymkhana"]

const toInputValue = (iso) => {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

const CreateOccurrenceModal = ({ isOpen, onClose, onSaved, occurrence = null }) => {
  const { toast } = useToast()
  const isEdit = Boolean(occurrence)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [startAt, setStartAt] = useState("")
  const [assignedUsers, setAssignedUsers] = useState([])
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setError("")
    setTitle(occurrence?.title || "")
    setDescription(occurrence?.description || "")
    setLocation(occurrence?.location || "")
    setStartAt(toInputValue(occurrence?.startAt))
    setAssignedUsers(Array.isArray(occurrence?.assignedUsers) ? occurrence.assignedUsers : [])
  }, [isOpen, occurrence])

  const addUser = (user) => {
    setAssignedUsers((prev) => (prev.some((u) => u._id === user._id) ? prev : [...prev, user]))
  }

  const removeUser = (userId) => {
    setAssignedUsers((prev) => prev.filter((u) => u._id !== userId))
  }

  const handleSubmit = async () => {
    if (!title.trim() || title.trim().length < 2) {
      setError("Title is required (at least 2 characters).")
      return
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      startAt: startAt ? new Date(startAt).toISOString() : isEdit ? null : undefined,
      assignedUsers: assignedUsers.map((u) => u._id),
    }

    try {
      setSubmitting(true)
      setError("")
      const result = isEdit
        ? await attendanceApi.update(occurrence._id, payload)
        : await attendanceApi.create(payload)
      toast.success(isEdit ? "Occurrence updated" : "Occurrence created")
      onSaved?.(result?.occurrence)
      onClose?.()
    } catch (submitError) {
      setError(submitError?.message || "Unable to save occurrence. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Attendance Occurrence" : "New Attendance Occurrence"}
      width={560}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={submitting} disabled={submitting}>
            {isEdit ? "Save Changes" : "Create"}
          </Button>
        </>
      }
    >
      <VStack gap={4}>
        {error && <Alert type="error" icon>{error}</Alert>}

        <Field label="Title" htmlFor="occ-title" required>
          <Input
            id="occ-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. General Body Meeting"
          />
        </Field>

        <Field label="Location" htmlFor="occ-location">
          <Input
            id="occ-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Main Auditorium"
          />
        </Field>

        <Field label="Date & Time" htmlFor="occ-start">
          <Input
            id="occ-start"
            type="datetime-local"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
          />
        </Field>

        <Field label="Description" htmlFor="occ-desc">
          <Textarea
            id="occ-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional notes about this occurrence"
            rows={3}
          />
        </Field>

        <UserSelector
          selectedUsers={assignedUsers}
          onAddUser={addUser}
          onRemoveUser={removeUser}
          title="Assign scanners (Admin / Gymkhana)"
          selectedUsersTitle="Assigned scanners"
          searchPlaceholder="Search admins or gymkhana members..."
          availableRoles={ASSIGNABLE_ROLES}
        />
      </VStack>
    </Modal>
  )
}

export default CreateOccurrenceModal
