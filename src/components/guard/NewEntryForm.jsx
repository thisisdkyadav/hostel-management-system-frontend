import React, { useState } from "react"
import { FaPlus, FaSignInAlt, FaSignOutAlt } from "react-icons/fa"
import { useAuth } from "../../contexts/AuthProvider"
import { Button, Input } from "czero/react"
import ToggleButtonGroup from "../common/ToggleButtonGroup"
import { HStack, Surface, Text } from "@/components/ui"

const NewEntryForm = ({ onAddEntry }) => {
  const { user } = useAuth()

  const hostelType = user?.hostel?.type

  const [formData, setFormData] = useState({
    unit: "",
    room: "",
    bed: "",
    time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    date: new Date().toISOString().split("T")[0],
    status: "Checked In",
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

    const isUnitBased = hostelType === "unit-based"
    const isFormValid = isUnitBased ? formData.unit && formData.room && formData.bed : formData.room && formData.bed

    if (isFormValid) {
      const success = await onAddEntry(formData)

      if (success) {
        setFormData({
          ...formData,
          unit: "",
          room: "",
          bed: "",
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          date: new Date().toISOString().split("T")[0],
        })
      }
    }
  }

  const inputStyle = {
    width: '100%',
    padding: 'var(--spacing-1) var(--spacing-2)',
    fontSize: 'var(--font-size-sm)',
    backgroundColor: 'var(--color-bg-tertiary)',
    border: `var(--border-1) solid var(--color-border-primary)`,
    borderRadius: 'var(--radius-lg)',
    outline: 'none',
    transition: 'var(--transition-colors)'
  }

  return (
    <Surface bg="primary" padding={4} radius="xl" shadow="sm" style={{ marginBottom: 'var(--spacing-4)' }}>
      <HStack gap="none" align="center" justify="between" style={{ marginBottom: 'var(--spacing-3)' }}>
        <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-primary)' }}>New Check In/Out Entry</h2>

        <ToggleButtonGroup
          options={[
            { value: "Checked In", label: "In", icon: <FaSignInAlt /> },
            { value: "Checked Out", label: "Out", icon: <FaSignOutAlt /> },
          ]}
          value={formData.status}
          onChange={handleStatusChange}
          shape="rounded"
          size="sm"
          variant="primary"
          hideLabelsOnMobile={false}
        />
      </HStack>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 'var(--spacing-2)' }}>
        {hostelType === "unit-based" ? (
          <>
            <div style={{ gridColumn: 'span 2' }}>
              <Text as="label" size="xs" weight="medium" color="body">Unit</Text>
              <Input type="text" name="unit" value={formData.unit} onChange={handleChange} placeholder="Unit" required />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <Text as="label" size="xs" weight="medium" color="body">Room</Text>
              <Input type="text" name="room" value={formData.room} onChange={handleChange} placeholder="Room" required />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <Text as="label" size="xs" weight="medium" color="body">Bed #</Text>
              <Input type="text" name="bed" value={formData.bed} onChange={handleChange} placeholder="Bed Number" required />
            </div>
          </>
        ) : (
          <>
            <div style={{ gridColumn: 'span 4' }}>
              <Text as="label" size="xs" weight="medium" color="body">Room Number</Text>
              <Input type="text" name="room" value={formData.room} onChange={handleChange} placeholder="Room Number" required />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <Text as="label" size="xs" weight="medium" color="body">Bed #</Text>
              <Input type="text" name="bed" value={formData.bed} onChange={handleChange} placeholder="Bed Number" required />
            </div>
          </>
        )}

        <div style={{ gridColumn: 'span 2' }}>
          <Text as="label" size="xs" weight="medium" color="body">Date</Text>
          <Input type="date" name="date" value={formData.date} onChange={handleChange} />
        </div>

        <div style={{ gridColumn: 'span 2' }}>
          <Text as="label" size="xs" weight="medium" color="body">Time</Text>
          <Input type="time" name="time" value={formData.time} onChange={handleChange} />
        </div>

        <div style={{ gridColumn: 'span 2' }}>
          <Text as="label" size="xs" weight="medium" color="body">&nbsp;</Text>
          <Button type="submit" variant="primary" size="sm" fullWidth>
            <FaPlus /> Add
          </Button>
        </div>
      </form>
    </Surface>
  )
}

export default NewEntryForm
