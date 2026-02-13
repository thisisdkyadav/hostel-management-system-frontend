import { useState } from "react"
import { FaBuilding, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa"
import { Input, Textarea, VStack, HStack, Label, Alert } from "@/components/ui"
import { Button, Modal } from "czero/react"
import { insuranceProviderApi } from "../../../service"

const AddInsuranceProviderModal = ({ show, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    startDate: "",
    endDate: "",
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

      await insuranceProviderApi.createInsuranceProvider(formData)
      alert("Insurance provider added successfully!")

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        startDate: "",
        endDate: "",
      })

      if (onSuccess) onSuccess()
      onClose()
    } catch (error) {
      console.error("Failed to add insurance provider:", error)
      setError("Failed to add insurance provider. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  return (
    <Modal isOpen={show} title="Add Insurance Provider" onClose={onClose} width={500}>
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

            <HStack gap="small" justify="end" style={{ paddingTop: 'var(--spacing-4)', marginTop: 'var(--spacing-2)', borderTop: 'var(--border-1) solid var(--color-border-light)' }}>
              <Button type="button" onClick={onClose} variant="secondary" size="md">
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md" loading={loading} disabled={loading}>
                Add Provider
              </Button>
            </HStack>
          </VStack>
        </form>
      </VStack>
    </Modal>
  )
}

export default AddInsuranceProviderModal
