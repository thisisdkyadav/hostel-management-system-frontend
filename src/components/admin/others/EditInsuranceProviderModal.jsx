import { useState } from "react"
import { FaBuilding, FaEnvelope, FaPhone, FaMapMarkerAlt, FaTrash, FaSave, FaCalendarAlt } from "react-icons/fa"
import { Modal, Input, Textarea, VStack, HStack, Label, Alert } from "@/components/ui"
import { Button } from "czero/react"
import { insuranceProviderApi } from "../../../service"

const EditInsuranceProviderModal = ({ show, provider, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: provider?.name || "",
    email: provider?.email || "",
    phone: provider?.phone || "",
    address: provider?.address || "",
    startDate: provider?.startDate || "",
    endDate: provider?.endDate || "",
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
    try {
      setLoading(true)
      setError(null)

      await insuranceProviderApi.updateInsuranceProvider(provider.id, formData)
      alert("Insurance provider updated successfully!")
      if (onUpdate) onUpdate()
      onClose()
    } catch (error) {
      console.error("Failed to update insurance provider:", error)
      setError("Failed to update insurance provider. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this insurance provider?")) {
      try {
        setLoading(true)
        await insuranceProviderApi.deleteInsuranceProvider(provider.id)
        alert("Insurance provider deleted successfully!")
        if (onUpdate) onUpdate()
        onClose()
      } catch (error) {
        console.error("Error deleting insurance provider:", error)
        setError("Failed to delete insurance provider. Please try again.")
      } finally {
        setLoading(false)
      }
    }
  }

  if (!show) return null

  return (
    <Modal isOpen={show} title="Edit Insurance Provider" onClose={onClose} width={500}>
      <VStack gap="large">
        {error && <Alert type="error">{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <VStack gap="large">
            <div>
              <Label htmlFor="name" required>Provider Name</Label>
              <Input type="text" id="name" name="name" value={formData.name} onChange={handleChange} icon={<FaBuilding />} placeholder="Provider Name" required />
            </div>

            <div>
              <Label htmlFor="email" required>Email Address</Label>
              <Input type="email" id="email" name="email" value={formData.email} onChange={handleChange} icon={<FaEnvelope />} placeholder="example@provider.com" required />
            </div>

            <div>
              <Label htmlFor="phone" required>Phone Number</Label>
              <Input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} icon={<FaPhone />} placeholder="+91 9876543210" required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 'var(--spacing-4)' }} className="md:grid-cols-2">
              <div>
                <Label htmlFor="startDate" required>Start Date</Label>
                <Input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} icon={<FaCalendarAlt />} required />
              </div>
              <div>
                <Label htmlFor="endDate" required>End Date</Label>
                <Input type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleChange} icon={<FaCalendarAlt />} required />
              </div>
            </div>

            <div>
              <Label htmlFor="address" required>Address</Label>
              <Textarea id="address" name="address" value={formData.address} onChange={handleChange} icon={<FaMapMarkerAlt />} rows={3} placeholder="Provider address" required />
            </div>

            <HStack gap="small" justify="between" style={{ paddingTop: 'var(--spacing-4)', marginTop: 'var(--spacing-2)', borderTop: 'var(--border-1) solid var(--color-border-light)' }}>
              <Button type="button" onClick={handleDelete} variant="danger" size="md" loading={loading} disabled={loading}>
                <FaTrash /> Delete Provider
              </Button>

              <HStack gap="small">
                <Button type="button" onClick={onClose} variant="secondary" size="md">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="md" loading={loading} disabled={loading}>
                  <FaSave /> Save Changes
                </Button>
              </HStack>
            </HStack>
          </VStack>
        </form>
      </VStack>
    </Modal>
  )
}

export default EditInsuranceProviderModal
