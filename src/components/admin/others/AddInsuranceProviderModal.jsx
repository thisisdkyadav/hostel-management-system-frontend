import { useState } from "react"
import { FaBuilding, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa"
import Modal from "../../common/Modal"
import Button from "../../common/Button"
import Input from "../../common/ui/Input"
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
    <Modal title="Add Insurance Provider" onClose={onClose} width={500}>
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

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--spacing-4)', marginTop: 'var(--spacing-6)', borderTop: 'var(--border-1) solid var(--color-border-light)', gap: 'var(--spacing-2)' }}>
          <Button type="button" onClick={onClose} variant="secondary" size="medium">
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="medium" isLoading={loading} disabled={loading}>
            Add Provider
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default AddInsuranceProviderModal
