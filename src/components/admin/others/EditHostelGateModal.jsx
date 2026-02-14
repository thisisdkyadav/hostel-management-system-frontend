import { useState } from "react"
import { FaBuilding, FaEnvelope, FaKey, FaTrash, FaSave } from "react-icons/fa"
import { VStack, HStack, Label, Alert } from "@/components/ui"
import { Button, Modal, Input } from "czero/react"
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
    <Modal isOpen={show} title="Edit Hostel Gate Login" onClose={onClose} width={500}>
      <VStack gap="large">
        {error && <Alert type="error">{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <VStack gap="large">
            <div>
              <Label>Hostel</Label>
              <Input type="text" value={gate.userId?.name || "Unknown Hostel"} icon={<FaBuilding />} disabled />
            </div>

            <div>
              <Label>Email</Label>
              <Input type="email" value={gate.userId?.email} icon={<FaEnvelope />} disabled />
            </div>

            <div>
              <Label htmlFor="password" required>New Password</Label>
              <Input type="password" id="password" name="password" value={formData.password} onChange={handleChange} icon={<FaKey />} placeholder="Enter new password" required />
            </div>

            <div>
              <Label htmlFor="confirmPassword" required>Confirm Password</Label>
              <Input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} icon={<FaKey />} placeholder="Confirm new password" required />
            </div>

            <HStack gap="small" justify="between" style={{ paddingTop: 'var(--spacing-4)', marginTop: 'var(--spacing-2)', borderTop: 'var(--border-1) solid var(--color-border-light)' }}>
              <Button type="button" onClick={handleDelete} variant="danger" size="md" loading={loading} disabled={loading}>
                <FaTrash />
                Delete Gate Login
              </Button>

              <HStack gap="small">
                <Button type="button" onClick={onClose} variant="secondary" size="md">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="md" loading={loading} disabled={loading || !formData.password || !formData.confirmPassword}>
                  <FaSave />
                  Update Password
                </Button>
              </HStack>
            </HStack>
          </VStack>
        </form>
      </VStack>
    </Modal>
  )
}

export default EditHostelGateModal
