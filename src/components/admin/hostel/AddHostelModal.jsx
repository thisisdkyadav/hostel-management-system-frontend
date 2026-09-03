import React, { useState } from "react"
import UnitBasedForm from "../forms/UnitBasedForm"
import RoomOnlyForm from "../forms/RoomOnlyForm"
import { adminApi } from "../../../service"
import { Button, Field, Grid, Heading, HStack, Input, Label, Modal, Select, Surface, useToast, VStack } from "hzero"
const AddHostelModal = ({ show, onClose, onAdd }) => {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    gender: "Boys",
    type: "unit-based",
    email: "",
    phone: "",
    extensionNumber: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const email = formData.email.trim()
    const phone = formData.phone.trim()
    const extensionNumber = formData.extensionNumber.trim()

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address.")
      return
    }
    if (phone && !/^\d{10}$/.test(phone.replace(/\D/g, ""))) {
      toast.error("Phone number must be 10 digits.")
      return
    }
    if (extensionNumber && !/^\d{2,8}$/.test(extensionNumber)) {
      toast.error("Extension number must be 2 to 8 digits.")
      return
    }

    const response = await adminApi.addHostel({
      ...formData,
      email,
      phone: phone.replace(/\D/g, ""),
      extensionNumber,
    })
    if (!response?.success) {
      toast.error("Failed to add hostel. Please try again.")
      return
    }
    const hostel = response.data
    onAdd()
    toast.success(`Hostel ${hostel.name ? hostel.name : ""} added successfully!`)
    onClose()
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: "",
      gender: "Boys",
      type: "unit-based",
      email: "",
      phone: "",
      extensionNumber: "",
    })
  }

  if (!show) return null

  return (
    <Modal isOpen={show} onClose={onClose} title="Add New Hostel" width={800}>
      <form onSubmit={handleSubmit}>
        <VStack gap="large">
          <VStack gap="medium">
            <Surface bg="brand" padding="var(--spacing-3) var(--spacing-4)" radius="lg" style={{ marginBottom: 'var(--spacing-2)' }}>
              <Heading as="h4" size="sm" weight="medium" color="var(--color-primary-dark)">Basic Information</Heading>
            </Surface>

            <Field label="Hostel Name" htmlFor="name" required>
              <Input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter hostel name" required />
            </Field>

            <Grid cols={{ base: 1, sm: 2 }} gap={4}>
              <Field label="Gender" htmlFor="gender" required>
                <Select name="gender" value={formData.gender} onChange={handleChange} options={[{ value: "Boys", label: "Boys" }, { value: "Girls", label: "Girls" }, { value: "Co-ed", label: "Co-ed" }]} required />
              </Field>

              <Field label="Hostel Type" htmlFor="type" required>
                <Select name="type" value={formData.type} onChange={handleChange} options={[{ value: "unit-based", label: "Unit-based" }, { value: "room-only", label: "Room-only" }]} required />
              </Field>
            </Grid>

            <Grid cols={{ base: 1, sm: 2 }} gap={4}>
              <Field label="Email" htmlFor="email" help="Optional">
                <Input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="hostel@iiti.ac.in" />
              </Field>

              <Field label="Phone Number" htmlFor="phone" help="Optional">
                <Input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="10-digit phone number" />
              </Field>
            </Grid>

            <Field label="Extension Number" htmlFor="extensionNumber" help="Optional">
              <Input type="text" name="extensionNumber" value={formData.extensionNumber} onChange={handleChange} placeholder="e.g. 2345" />
            </Field>
          </VStack>

          <div style={{ paddingTop: 'var(--spacing-2)' }}>
            <Surface bg="brand" padding="var(--spacing-3) var(--spacing-4)" radius="lg" style={{ marginBottom: 'var(--spacing-4)' }}>
              <Heading as="h4" size="sm" weight="medium" color="var(--color-primary-dark)">Room Configuration</Heading>
            </Surface>

            <Surface bg="var(--color-bg-hover)" padding={4} radius="lg" border="var(--border-1) solid var(--color-border-light)">{formData.type === "unit-based" ? <UnitBasedForm formData={formData} setFormData={setFormData} /> : <RoomOnlyForm formData={formData} setFormData={setFormData} />}</Surface>
          </div>

          <HStack justify="end" gap="small" style={{ paddingTop: 'var(--spacing-5)', marginTop: 'var(--spacing-6)', borderTop: 'var(--border-1) solid var(--color-border-light)' }}>
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              size="md"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
            >
              Add Hostel
            </Button>
          </HStack>
        </VStack>
      </form>
    </Modal>
  )
}

export default AddHostelModal
