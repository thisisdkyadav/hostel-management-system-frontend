import React, { useState } from "react"

import { Button, Input } from "czero/react"
import ToggleButtonGroup from "../common/ToggleButtonGroup"
import { useAuth } from "../../contexts/AuthProvider"
import { FaSignInAlt, FaSignOutAlt } from "react-icons/fa"
import { Field, Grid, Heading, HStack, Label, Surface } from "@/components/ui"

const StudentEntryForm = ({ onAddEntry }) => {
  const { user } = useAuth()
  const hostelType = user?.hostel?.type

  const [entryData, setEntryData] = useState({
    unit: "",
    room: "",
    bed: "",
    studentName: "",
    studentId: "",
    date: new Date().toISOString().split("T")[0],
    time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    status: "Checked In",
    notes: "",
  })

  const handleReset = () => {
    setEntryData({
      unit: "",
      room: "",
      bed: "",
      studentName: "",
      studentId: "",
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      status: "Checked In",
      notes: "",
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setEntryData((prev) => ({ ...prev, [name]: value }))
  }

  const handleStatusChange = (status) => {
    setEntryData({ ...entryData, status })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const isSuccess = await onAddEntry(entryData)
    if (isSuccess) {
      alert("Student entry added successfully!")
      handleReset()
    } else {
      alert("Failed to add student entry.")
    }
  }

  const inputStyle = {
    width: '100%',
    backgroundColor: 'var(--color-bg-muted)',
    color: 'var(--color-text-secondary)',
    padding: 'var(--spacing-4)',
    borderRadius: 'var(--radius-input)',
    border: `var(--border-1) solid var(--color-border-input)`,
    fontSize: 'var(--font-size-base)',
    fontFamily: 'var(--font-family-primary)'
  }

  return (
    <Surface bg="primary" padding={6} radius="card" shadow="var(--shadow-card)">
      <HStack gap="none" align="center" justify="between" style={{ marginBottom: 'var(--spacing-6)' }}>
        <Heading as="h2" size="xl" weight="bold" color="primary">Add New Student Entry</Heading>
        <HStack gap={4} align="center">
          <ToggleButtonGroup
            options={[
              { value: "Checked In", label: "Checked In", icon: <FaSignInAlt /> },
              { value: "Checked Out", label: "Checked Out", icon: <FaSignOutAlt /> },
            ]}
            value={entryData.status}
            onChange={handleStatusChange}
            shape="rounded"
            size="sm"
            variant="primary"
            hideLabelsOnMobile={false}
          />
          <Button type="button" variant="primary" onClick={handleReset} className="flex items-center">
            Reset
          </Button>
        </HStack>
      </HStack>

      <form id="studentEntryForm" onSubmit={handleSubmit}>
        <Grid min={250} gap={6}>
          <Field label="Student ID" color="body" spacing={1}>
            <Input type="text" name="studentId" value={entryData.studentId} onChange={handleChange} required />
          </Field>

          <Field label="Student Name" color="body" spacing={1}>
            <Input type="text" name="studentName" value={entryData.studentName} onChange={handleChange} required />
          </Field>

          {hostelType === "unit-based" && (
            <Field label="Unit" color="body" spacing={1}>
              <Input type="text" name="unit" value={entryData.unit} onChange={handleChange} required />
            </Field>
          )}

          <Field label="Room" color="body" spacing={1}>
            <Input type="text" name="room" value={entryData.room} onChange={handleChange} required />
          </Field>

          <Field label="Bed" color="body" spacing={1}>
            <Input type="text" name="bed" value={entryData.bed} onChange={handleChange} required />
          </Field>

          <Field label="Date" color="body" spacing={1}>
            <Input type="date" name="date" value={entryData.date} onChange={handleChange} required />
          </Field>

          <Field label="Time" color="body" spacing={1}>
            <Input type="time" name="time" value={entryData.time} onChange={handleChange} required />
          </Field>

          <div style={{ gridColumn: '1 / -1' }}>
            <Label color="body" spacing={1}>Notes (Optional)</Label>
            <textarea name="notes" value={entryData.notes} onChange={handleChange} style={{ width: '100%', backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-text-secondary)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-input)', border: 'var(--border-1) solid var(--color-border-input)', fontSize: 'var(--font-size-base)', fontFamily: 'var(--font-family-primary)', resize: 'vertical', minHeight: '80px', outline: 'none', transition: 'var(--transition-all)' }} rows="2" />
          </div>
        </Grid>

        <HStack gap="none" justify="end" style={{ marginTop: 'var(--spacing-6)' }}>
          <Button type="submit" variant="primary">
            Register Entry
          </Button>
        </HStack>
      </form>
    </Surface>
  )
}

export default StudentEntryForm
