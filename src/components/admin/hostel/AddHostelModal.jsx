import React, { useState } from "react"
import UnitBasedForm from "../forms/UnitBasedForm"
import RoomOnlyForm from "../forms/RoomOnlyForm"
import { adminApi } from "../../../service"
import { Modal, Button, Input, Select, Label, VStack, HStack } from "@/components/ui"

const AddHostelModal = ({ show, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: "",
    gender: "Boys",
    type: "unit-based",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const response = await adminApi.addHostel(formData)
    if (!response?.success) {
      alert("Failed to add hostel. Please try again.")
      return
    }
    const hostel = response.data
    onAdd()
    alert(`Hostel ${hostel.name ? hostel.name : ""} added successfully!`)
    onClose()
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: "",
      gender: "Boys",
      type: "unit-based",
    })
  }

  if (!show) return null

  return (
    <Modal isOpen={show} onClose={onClose} title="Add New Hostel" width={800}>
      <form onSubmit={handleSubmit}>
        <VStack gap="large">
          <VStack gap="medium">
            <div style={{ backgroundColor: 'var(--color-primary-bg)', padding: 'var(--spacing-3) var(--spacing-4)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--spacing-2)' }}>
              <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-primary-dark)' }}>Basic Information</h4>
            </div>

            <div>
              <Label htmlFor="name" required>Hostel Name</Label>
              <Input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter hostel name" required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 'var(--spacing-4)' }} className="sm:grid-cols-2">
              <div>
                <Label htmlFor="gender" required>Gender</Label>
                <Select name="gender" value={formData.gender} onChange={handleChange} options={[{ value: "Boys", label: "Boys" }, { value: "Girls", label: "Girls" }, { value: "Co-ed", label: "Co-ed" }]} required />
              </div>

              <div>
                <Label htmlFor="type" required>Hostel Type</Label>
                <Select name="type" value={formData.type} onChange={handleChange} options={[{ value: "unit-based", label: "Unit-based" }, { value: "room-only", label: "Room-only" }]} required />
              </div>
            </div>
          </VStack>

          <div style={{ paddingTop: 'var(--spacing-2)' }}>
            <div style={{ backgroundColor: 'var(--color-primary-bg)', padding: 'var(--spacing-3) var(--spacing-4)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--spacing-4)' }}>
              <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-primary-dark)' }}>Room Configuration</h4>
            </div>

            <div style={{ backgroundColor: 'var(--color-bg-hover)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', border: 'var(--border-1) solid var(--color-border-light)' }}>{formData.type === "unit-based" ? <UnitBasedForm formData={formData} setFormData={setFormData} /> : <RoomOnlyForm formData={formData} setFormData={setFormData} />}</div>
          </div>

          <HStack justify="end" gap="small" style={{ paddingTop: 'var(--spacing-5)', marginTop: 'var(--spacing-6)', borderTop: 'var(--border-1) solid var(--color-border-light)' }}>
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              size="medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="medium"
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
