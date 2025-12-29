import { useState } from "react"
import { FaBuilding, FaEnvelope, FaPhone, FaMapMarkerAlt, FaTrash, FaSave, FaCalendarAlt } from "react-icons/fa"
import Modal from "../../common/Modal"
import Button from "../../common/Button"
import Input from "../../common/ui/Input"
import { insuranceProviderApi } from "../../../services/insuranceProviderApi"

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
    <Modal title="Edit Insurance Provider" onClose={onClose} width={500}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-5)' }}>
        {error && <div style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--font-size-sm)' }}>{error}</div>}

        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Provider Name</label>
          <Input type="text" name="name" value={formData.name} onChange={handleChange} icon={<FaBuilding />} placeholder="Provider Name" required />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Email Address</label>
          <Input type="email" name="email" value={formData.email} onChange={handleChange} icon={<FaEnvelope />} placeholder="example@provider.com" required />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Phone Number</label>
          <Input type="tel" name="phone" value={formData.phone} onChange={handleChange} icon={<FaPhone />} placeholder="+91 9876543210" required />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 'var(--spacing-4)' }} className="md:grid-cols-2">
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Start Date</label>
            <Input type="date" name="startDate" value={formData.startDate} onChange={handleChange} icon={<FaCalendarAlt />} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>End Date</label>
            <Input type="date" name="endDate" value={formData.endDate} onChange={handleChange} icon={<FaCalendarAlt />} required />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Address</label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 'var(--spacing-3)', top: 'var(--spacing-3)', color: 'var(--color-text-muted)' }}>
              <FaMapMarkerAlt />
            </div>
            <textarea name="address" value={formData.address} onChange={handleChange} rows={3} style={{ width: '100%', padding: 'var(--spacing-3)', paddingLeft: 'var(--spacing-10)', border: 'var(--border-1) solid var(--color-border-input)', borderRadius: 'var(--radius-lg)', outline: 'none', transition: 'var(--transition-all)', resize: 'vertical' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--color-primary)'; }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--color-border-input)'; }} placeholder="Provider address" required />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', paddingTop: 'var(--spacing-4)', marginTop: 'var(--spacing-6)', borderTop: 'var(--border-1) solid var(--color-border-light)' }}>
          <Button type="button" onClick={handleDelete} variant="danger" size="medium" icon={<FaTrash />} isLoading={loading} disabled={loading}>
            Delete Provider
          </Button>

          <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
            <Button type="button" onClick={onClose} variant="secondary" size="medium">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="medium" icon={<FaSave />} isLoading={loading} disabled={loading}>
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}

export default EditInsuranceProviderModal
