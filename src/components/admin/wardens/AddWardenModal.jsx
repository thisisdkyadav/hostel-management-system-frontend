import React, { useState } from "react"
import { FiUser, FiMail, FiPhone, FiLock, FiCalendar, FiTag } from "react-icons/fi"
import { adminApi } from "../../../services/apiService"
import Modal from "../../common/Modal"
import Button from "../../common/Button"
import Input from "../../common/ui/Input"

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
    <Modal title={`Add New ${staffTitle}`} onClose={onClose} width={500}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-5)' }}>
        <div style={{ backgroundColor: 'var(--color-primary-bg)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--spacing-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-primary-dark)' }}>
            <FiUser style={{ marginRight: 'var(--spacing-2)' }} />
            <h4 style={{ fontWeight: 'var(--font-weight-medium)' }}>Basic Information</h4>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          <div>
            <label style={{ display: 'block', color: 'var(--color-text-body)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Name</label>
            <Input type="text" name="name" value={formData.name} onChange={handleChange} icon={<FiUser />} placeholder="Dr. Full Name" required />
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--color-text-body)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Email</label>
            <Input type="email" name="email" value={formData.email} onChange={handleChange} icon={<FiMail />} placeholder="email@iiti.ac.in" required />
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--color-text-body)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Password</label>
            <Input type="password" name="password" value={formData.password} onChange={handleChange} icon={<FiLock />} placeholder="Enter password" required />
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--color-text-body)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Phone</label>
            <Input type="text" name="phone" value={formData.phone} onChange={handleChange} icon={<FiPhone />} placeholder="+91 9876543210" />
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--color-text-body)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Category</label>
            <Input type="text" name="category" value={formData.category} onChange={handleChange} icon={<FiTag />} placeholder="e.g., Senior, Junior" />
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--color-text-body)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Join Date</label>
            <Input type="date" name="joinDate" value={formData.joinDate} onChange={handleChange} icon={<FiCalendar />} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', paddingTop: 'var(--spacing-5)', marginTop: 'var(--spacing-6)', borderTop: 'var(--border-1) solid var(--color-border-light)', gap: 'var(--spacing-3)' }}>
          <Button type="button" onClick={onClose} variant="secondary" size="medium">
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="medium">
            Add {staffTitle}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default AddWardenModal
