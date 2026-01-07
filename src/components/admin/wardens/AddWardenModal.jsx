import React, { useState } from "react"
import { FiUser, FiMail, FiPhone, FiLock, FiCalendar, FiTag } from "react-icons/fi"
import { adminApi } from "../../../service"
import { Modal, Button, Input, VStack, HStack, Label } from "@/components/ui"

const AddWardenModal = ({ show, staffType = "warden", onClose, onAdd }) => {
  const staffTitle = staffType === "warden" ? "Warden" : staffType === "associateWarden" ? "Associate Warden" : "Hostel Supervisor"

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    joinDate: "",
    category: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = staffType === "warden" ? await adminApi.addWarden(formData) : staffType === "associateWarden" ? await adminApi.addAssociateWarden(formData) : await adminApi.addHostelSupervisor(formData)

      if (!response) {
        alert(`Failed to add ${staffTitle.toLowerCase()}. Please try again.`)
        return
      }
      onAdd()
      alert(`${staffTitle} added successfully!`)

      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        joinDate: "",
        category: "",
      })

      onClose()
    } catch (error) {
      console.error(`Error adding ${staffTitle.toLowerCase()}:`, error)
      alert(`Failed to add ${staffTitle.toLowerCase()}. Please try again.`)
    }
  }

  if (!show) return null

  return (
    <Modal isOpen={show} title={`Add New ${staffTitle}`} onClose={onClose} width={500}>
      <form onSubmit={handleSubmit}>
        <VStack gap="large">
          <div style={{ backgroundColor: 'var(--color-primary-bg)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-primary-dark)' }}>
              <FiUser style={{ marginRight: 'var(--spacing-2)' }} />
              <h4 style={{ fontWeight: 'var(--font-weight-medium)' }}>Basic Information</h4>
            </div>
          </div>

          <div>
            <Label htmlFor="name" required>Name</Label>
            <Input type="text" name="name" id="name" value={formData.name} onChange={handleChange} icon={<FiUser />} placeholder="Dr. Full Name" required />
          </div>

          <div>
            <Label htmlFor="email" required>Email</Label>
            <Input type="email" name="email" id="email" value={formData.email} onChange={handleChange} icon={<FiMail />} placeholder="email@iiti.ac.in" required />
          </div>

          <div>
            <Label htmlFor="password" required>Password</Label>
            <Input type="password" name="password" id="password" value={formData.password} onChange={handleChange} icon={<FiLock />} placeholder="Enter password" required />
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input type="text" name="phone" id="phone" value={formData.phone} onChange={handleChange} icon={<FiPhone />} placeholder="+91 9876543210" />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Input type="text" name="category" id="category" value={formData.category} onChange={handleChange} icon={<FiTag />} placeholder="e.g., Senior, Junior" />
          </div>

          <div>
            <Label htmlFor="joinDate">Join Date</Label>
            <Input type="date" name="joinDate" id="joinDate" value={formData.joinDate} onChange={handleChange} icon={<FiCalendar />} />
          </div>

          <HStack gap="small" justify="end" style={{ paddingTop: 'var(--spacing-5)', marginTop: 'var(--spacing-6)', borderTop: 'var(--border-1) solid var(--color-border-light)' }}>
            <Button type="button" onClick={onClose} variant="secondary" size="medium">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="medium">
              Add {staffTitle}
            </Button>
          </HStack>
        </VStack>
      </form>
    </Modal>
  )
}

export default AddWardenModal
