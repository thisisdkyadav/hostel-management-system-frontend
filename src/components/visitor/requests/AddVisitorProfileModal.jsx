import React, { useState } from "react"
import { Modal, Input, Select, VStack, HStack, Label, Alert } from "@/components/ui"
import { Button } from "czero/react"

const AddVisitorProfileModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    relation: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const success = await onSubmit(formData)
      if (success) {
        setFormData({
          name: "",
          phone: "",
          email: "",
          relation: "",
        })
        onClose()
      } else {
        setError("Failed to add visitor profile. Please try again.")
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} title="Add Visitor Profile" onClose={onClose} width={500}>
      <VStack as="form" gap="large" onSubmit={handleSubmit}>
        {error && <Alert type="error">{error}</Alert>}

        <VStack gap="medium">
          <VStack gap="xsmall">
            <Label htmlFor="visitorName" required>Visitor Name</Label>
            <Input id="visitorName" type="text" name="name" value={formData.name} onChange={handleChange} required />
          </VStack>

          <VStack gap="xsmall">
            <Label htmlFor="visitorPhone" required>Phone Number</Label>
            <Input id="visitorPhone" type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
          </VStack>

          <VStack gap="xsmall">
            <Label htmlFor="visitorEmail" required>Email Address</Label>
            <Input id="visitorEmail" type="email" name="email" value={formData.email} onChange={handleChange} required />
          </VStack>

          <VStack gap="xsmall">
            <Label htmlFor="visitorRelation">Relation with Student</Label>
            <Select id="visitorRelation" name="relation" value={formData.relation} onChange={handleChange} placeholder="Select relation" options={[
              { value: "Parent", label: "Parent" },
              { value: "Sibling", label: "Sibling" },
              { value: "Guardian", label: "Guardian" },
              { value: "Relative", label: "Relative" },
              { value: "Friend", label: "Friend" },
              { value: "Other", label: "Other" }
            ]} />
          </VStack>
        </VStack>

        <HStack gap="small" justify="end" style={{ paddingTop: 'var(--spacing-4)', borderTop: 'var(--border-1) solid var(--color-border-light)' }}>
          <Button type="button" onClick={onClose} variant="secondary" size="md">
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} variant="primary" size="md" disabled={loading} loading={loading}>
            {loading ? "Saving..." : "Save Profile"}
          </Button>
        </HStack>
      </VStack>
    </Modal>
  )
}

export default AddVisitorProfileModal
