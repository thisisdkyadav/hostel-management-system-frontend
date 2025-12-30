import { useState } from "react"
import { FaBuilding, FaEnvelope, FaKey, FaTrash, FaSave } from "react-icons/fa"
import Modal from "../../common/Modal"
import Button from "../../common/Button"
import Input from "../../common/ui/Input"
import { hostelGateApi } from "../../../service"

const EditHostelGateModal = ({ show, gate, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
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

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      setLoading(true)
      setError(null)

      await hostelGateApi.updateHostelGate(gate.hostelId._id, { password: formData.password })
      alert("Hostel gate login password updated successfully!")

      // Reset form
      setFormData({
        password: "",
        confirmPassword: "",
      })

      if (onUpdate) onUpdate()
      onClose()
    } catch (error) {
      console.error("Failed to update hostel gate login:", error)
      setError("Failed to update hostel gate login. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this hostel gate login?")) {
      try {
        setLoading(true)

        await hostelGateApi.deleteHostelGate(gate.hostelId._id)
        alert("Hostel gate login deleted successfully!")
        if (onUpdate) onUpdate()
        onClose()
      } catch (error) {
        console.error("Error deleting hostel gate login:", error)
        setError("Failed to delete hostel gate login. Please try again.")
      } finally {
        setLoading(false)
      }
    }
  }

  if (!show) return null

  return (
    <Modal title="Edit Hostel Gate Login" onClose={onClose} width={500}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-5)' }}>
        {error && <div style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--font-size-sm)' }}>{error}</div>}

        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Hostel</label>
          <Input type="text" value={gate.userId?.name || "Unknown Hostel"} icon={<FaBuilding />} disabled />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Email</label>
          <Input type="email" value={gate.userId?.email} icon={<FaEnvelope />} disabled />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>New Password</label>
          <Input type="password" name="password" value={formData.password} onChange={handleChange} icon={<FaKey />} placeholder="Enter new password" required />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Confirm Password</label>
          <Input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} icon={<FaKey />} placeholder="Confirm new password" required />
        </div>

        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', paddingTop: 'var(--spacing-4)', marginTop: 'var(--spacing-6)', borderTop: 'var(--border-1) solid var(--color-border-light)' }}>
          <Button type="button" onClick={handleDelete} variant="danger" size="medium" icon={<FaTrash />} isLoading={loading} disabled={loading}>
            Delete Gate Login
          </Button>

          <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
            <Button type="button" onClick={onClose} variant="secondary" size="medium">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="medium" icon={<FaSave />} isLoading={loading} disabled={loading || !formData.password || !formData.confirmPassword}>
              Update Password
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}

export default EditHostelGateModal
