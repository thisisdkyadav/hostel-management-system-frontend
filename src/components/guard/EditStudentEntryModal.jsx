import React, { useState } from "react"
import { FaSignInAlt, FaSignOutAlt } from "react-icons/fa"
import { Button, Input } from "hzero"
import { Field, Grid, HStack, Label, Modal, useConfirm } from "@/components/ui"
import ToggleButtonGroup from "../common/ToggleButtonGroup"
import { useAuth } from "../../contexts/AuthProvider"

const EditStudentEntryModal = ({ entry, onClose, onSave, onDelete }) => {
  const confirm = useConfirm()
  const { user } = useAuth()
  const hostelType = user?.hostel?.type

  const [formData, setFormData] = useState({
    ...entry,
    date: new Date(entry.dateAndTime).toISOString().split("T")[0],
    time: new Date(entry.dateAndTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleStatusChange = (status) => {
    setFormData({ ...formData, status })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const dateTime = new Date(`${formData.date}T${formData.time}`).toISOString()

    const updatedEntry = {
      ...formData,
      dateTime,
    }

    await onSave(updatedEntry)
    onClose()
  }

  const handleDelete = async () => {
    if (!(await confirm({ message: "Are you sure you want to delete this entry?", isDestructive: true }))) {
      return
    }
    await onDelete(entry._id)
    onClose()
  }

  return (
    <Modal title="Edit Student Entry" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 'var(--spacing-4)' }}>
          <ToggleButtonGroup
            options={[
              { value: "Checked In", label: "Checked In", icon: <FaSignInAlt /> },
              { value: "Checked Out", label: "Checked Out", icon: <FaSignOutAlt /> },
            ]}
            value={formData.status}
            onChange={handleStatusChange}
            shape="rounded"
            size="md"
            variant="primary"
            hideLabelsOnMobile={false}
          />
        </div>

        <Grid min={250} gap={4} style={{ marginBottom: 'var(--spacing-4)' }}>
          <Field label="Student Email" color="body" spacing={1}>
            <Input type="text" name="studentId" value={formData.userId.email} onChange={handleChange} readOnly />
          </Field>

          <Field label="Student Name" color="body" spacing={1}>
            <Input type="text" name="studentName" value={formData.userId.name} onChange={handleChange} readOnly />
          </Field>

          {hostelType === "unit-based" && (
            <Field label="Unit" color="body" spacing={1}>
              <Input type="text" name="unit" value={formData.unit || ""} onChange={handleChange} readOnly />
            </Field>
          )}

          <Field label="Room" color="body" spacing={1}>
            <Input type="text" name="room" value={formData.room} onChange={handleChange} readOnly required />
          </Field>

          <Field label="Bed" color="body" spacing={1}>
            <Input type="text" name="bed" value={formData.bed} onChange={handleChange} readOnly required />
          </Field>

          <Field label="Date" color="body" spacing={1}>
            <Input type="date" name="date" value={formData.date} onChange={handleChange} required />
          </Field>

          <Field label="Time" color="body" spacing={1}>
            <Input type="time" name="time" value={formData.time} onChange={handleChange} required />
          </Field>
        </Grid>

        <HStack gap={2} justify="between">
          <Button type="button" variant="danger" onClick={handleDelete}>
            Delete Entry
          </Button>
          <HStack gap={2}>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </HStack>
        </HStack>
      </form>
    </Modal>
  )
}

export default EditStudentEntryModal
