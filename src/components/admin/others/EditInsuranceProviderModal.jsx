import { useState } from "react"
import { FaBuilding, FaEnvelope, FaPhone, FaMapMarkerAlt, FaTrash, FaSave, FaCalendarAlt } from "react-icons/fa"
import { Alert, Field, Grid, HStack, Label, Textarea, useConfirm, VStack } from "@/components/ui"
import { Button, Input } from "hzero"
import { Modal } from "@/components/ui"
import { insuranceProviderApi } from "../../../service"

const EditInsuranceProviderModal = ({ show, provider, onClose, onUpdate }) => {
  const confirm = useConfirm()
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
    if (await confirm({ message: "Are you sure you want to delete this insurance provider?", isDestructive: true })) {
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
            <Field label="Provider Name" htmlFor="name" required>
              <Input type="text" id="name" name="name" value={formData.name} onChange={handleChange} icon={<FaBuilding />} placeholder="Provider Name" required />
            </Field>

            <Field label="Email Address" htmlFor="email" required>
              <Input type="email" id="email" name="email" value={formData.email} onChange={handleChange} icon={<FaEnvelope />} placeholder="example@provider.com" required />
            </Field>

            <Field label="Phone Number" htmlFor="phone" required>
              <Input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} icon={<FaPhone />} placeholder="+91 9876543210" required />
            </Field>

            <Grid cols={{ base: 1, md: 2 }} gap={4}>
              <Field label="Start Date" htmlFor="startDate" required>
                <Input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} icon={<FaCalendarAlt />} required />
              </Field>
              <Field label="End Date" htmlFor="endDate" required>
                <Input type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleChange} icon={<FaCalendarAlt />} required />
              </Field>
            </Grid>

            <Field label="Address" htmlFor="address" required>
              <Textarea id="address" name="address" value={formData.address} onChange={handleChange} icon={<FaMapMarkerAlt />} rows={3} placeholder="Provider address" required />
            </Field>

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
