import { useState } from "react"
import { FaFileSignature, FaCalendarAlt, FaInfoCircle } from "react-icons/fa"
import Modal from "../../common/Modal"
import Button from "../../common/Button"
import Input from "../../common/ui/Input"
import { adminApi } from "../../../service"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { format, parseISO } from "date-fns"

const AddUndertakingModal = ({ show, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: null, // Use Date object for deadline
    content: "", // The actual undertaking text that students will read and accept
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

  // For react-datepicker
  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      deadline: date,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)

      // Format deadline as mm-dd-yyyy string before sending
      const payload = {
        ...formData,
        deadline: formData.deadline ? format(formData.deadline, "MM-dd-yyyy") : "",
      }

      await adminApi.createUndertaking(payload)
      alert("Undertaking created successfully!")

      // Reset form
      setFormData({
        title: "",
        description: "",
        deadline: null,
        content: "",
      })

      if (onSuccess) onSuccess()
      onClose()
    } catch (error) {
      console.error("Failed to create undertaking:", error)
      setError("Failed to create undertaking. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  return (
    <Modal title="Create New Undertaking" onClose={onClose} width={500}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-5)' }}>
        {error && <div style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--font-size-sm)' }}>{error}</div>}

        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Title</label>
          <Input type="text" name="title" value={formData.title} onChange={handleChange} icon={<FaFileSignature />} placeholder="Undertaking Title" required />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Description</label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 'var(--spacing-3)', top: 'var(--spacing-3)', color: 'var(--color-text-muted)' }}>
              <FaInfoCircle />
            </div>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={2} style={{ width: '100%', padding: 'var(--spacing-3)', paddingLeft: 'var(--spacing-10)', border: 'var(--border-1) solid var(--color-border-input)', borderRadius: 'var(--radius-lg)', outline: 'none', transition: 'var(--transition-all)', resize: 'vertical' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--color-primary)'; }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--color-border-input)'; }} placeholder="Brief description of this undertaking" required />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Deadline</label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 'var(--spacing-3)', top: 'var(--spacing-3)', color: 'var(--color-text-muted)', zIndex: 1 }}>
              <FaCalendarAlt />
            </div>
            <DatePicker selected={formData.deadline} onChange={handleDateChange} dateFormat="MM-dd-yyyy" style={{ width: '100%', padding: 'var(--spacing-3)', paddingLeft: 'var(--spacing-10)', border: 'var(--border-1) solid var(--color-border-input)', borderRadius: 'var(--radius-lg)' }} placeholderText="mm-dd-yyyy" required popperPlacement="bottom" showMonthDropdown showYearDropdown dropdownMode="select" autoComplete="off" wrapperClassName="w-full" className="w-full p-3 pl-10 border rounded-lg" />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Undertaking Content</label>
          <div style={{ position: 'relative' }}>
            <textarea name="content" value={formData.content} onChange={handleChange} rows={6} style={{ width: '100%', padding: 'var(--spacing-3)', border: 'var(--border-1) solid var(--color-border-input)', borderRadius: 'var(--radius-lg)', outline: 'none', transition: 'var(--transition-all)', resize: 'vertical' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--color-primary)'; }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--color-border-input)'; }} placeholder="Full text of the undertaking that students will need to read and accept" required />
          </div>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>This is the full text that students will be required to read and accept.</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--spacing-4)', marginTop: 'var(--spacing-6)', borderTop: 'var(--border-1) solid var(--color-border-light)', gap: 'var(--spacing-2)' }}>
          <Button type="button" onClick={onClose} variant="secondary" size="medium">
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="medium" isLoading={loading} disabled={loading}>
            Create Undertaking
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default AddUndertakingModal
