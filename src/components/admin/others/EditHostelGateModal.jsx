import { useState } from "react"
import { Alert, Button, Field, HStack, Input, Label, Modal, useConfirm, useToast, VStack } from "hzero"
import { hostelGateApi } from "../../../service"
import { Building2, Key, Mail, Save, Trash2 } from "lucide-react"

const EditHostelGateModal = ({ show, gate, onClose, onUpdate }) => {
  const { toast } = useToast()
  const confirm = useConfirm()
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
      toast.success("Hostel gate login password updated successfully!")

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
    if (await confirm({ message: "Are you sure you want to delete this hostel gate login?", isDestructive: true })) {
      try {
        setLoading(true)

        await hostelGateApi.deleteHostelGate(gate.hostelId._id)
        toast.success("Hostel gate login deleted successfully!")
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
            <Field label="Hostel">
              <Input type="text" value={gate.userId?.name || "Unknown Hostel"} icon={<Building2 size="1em" />} disabled />
            </Field>

            <Field label="Email">
              <Input type="email" value={gate.userId?.email} icon={<Mail size="1em" />} disabled />
            </Field>

            <Field label="New Password" htmlFor="password" required>
              <Input type="password" id="password" name="password" value={formData.password} onChange={handleChange} icon={<Key size="1em" />} placeholder="Enter new password" required />
            </Field>

            <Field label="Confirm Password" htmlFor="confirmPassword" required>
              <Input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} icon={<Key size="1em" />} placeholder="Confirm new password" required />
            </Field>

            <HStack gap="small" justify="between" style={{ paddingTop: 'var(--spacing-4)', marginTop: 'var(--spacing-2)', borderTop: 'var(--border-1) solid var(--color-border-light)' }}>
              <Button type="button" onClick={handleDelete} variant="danger" size="md" loading={loading} disabled={loading}>
                <Trash2 size="1em" />
                Delete Gate Login
              </Button>

              <HStack gap="small">
                <Button type="button" onClick={onClose} variant="secondary" size="md">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="md" loading={loading} disabled={loading || !formData.password || !formData.confirmPassword}>
                  <Save size="1em" />
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
