import { useState, useEffect } from "react"
import { FaBuilding, FaEnvelope, FaKey } from "react-icons/fa"
import Modal from "../../common/Modal"
import { hostelGateApi } from "../../../services/hostelGateApi"

const AddHostelGateModal = ({ show, onClose, onSuccess, hostels }) => {
  const [formData, setFormData] = useState({
    hostelId: "",
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [availableHostels, setAvailableHostels] = useState([])
  const [generatedEmail, setGeneratedEmail] = useState("")

  // Filter out hostels that already have gate logins
  useEffect(() => {
    const fetchExistingGates = async () => {
      try {
        const response = await hostelGateApi.getAllHostelGates()
        const existingHostelIds = (response.hostelGates || []).map((gate) => gate.hostelId._id)

        // Filter hostels that don't have gate logins yet
        const available = (hostels || []).filter((hostel) => !existingHostelIds.includes(hostel._id))
        setAvailableHostels(available)
      } catch (error) {
        console.error("Error fetching existing hostel gates:", error)
      }
    }

    if (show) {
      fetchExistingGates()
      setFormData({ hostelId: "", password: "", confirmPassword: "" })
      setGeneratedEmail("")
    }
  }, [show, hostels])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Generate email preview when hostel is selected
    if (name === "hostelId" && value) {
      const selectedHostel = availableHostels.find((h) => h._id === value)
      if (selectedHostel) {
        setGeneratedEmail(`${selectedHostel.name}.gate.login@iiti.ac.in`.toLowerCase())
      } else {
        setGeneratedEmail("")
      }
    }
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

      // Send both hostelId and password in the request
      await hostelGateApi.createHostelGate({
        hostelId: formData.hostelId,
        password: formData.password,
      })

      alert("Hostel gate login created successfully!")

      // Reset form
      setFormData({
        hostelId: "",
        password: "",
        confirmPassword: "",
      })
      setGeneratedEmail("")

      if (onSuccess) onSuccess()
      onClose()
    } catch (error) {
      console.error("Failed to add hostel gate login:", error)
      setError("Failed to add hostel gate login. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  return (
    <Modal title="Add Hostel Gate Login" onClose={onClose} width={500}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-5)' }}>
        {error && <div style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--font-size-sm)' }}>{error}</div>}

        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Select Hostel</label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 'var(--spacing-3)', top: 'var(--spacing-3)', color: 'var(--color-text-muted)' }}>
              <FaBuilding />
            </div>
            <select name="hostelId" value={formData.hostelId} onChange={handleChange} style={{ width: '100%', padding: 'var(--spacing-3)', paddingLeft: 'var(--spacing-10)', border: 'var(--border-1) solid var(--color-border-input)', borderRadius: 'var(--radius-lg)', outline: 'none', transition: 'var(--transition-all)' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--color-primary)'; }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--color-border-input)'; }} required>
              <option value="">Select a hostel</option>
              {availableHostels.map((hostel) => (
                <option key={hostel._id} value={hostel._id}>
                  {hostel.name}
                </option>
              ))}
            </select>
          </div>
          {availableHostels.length === 0 && <p style={{ marginTop: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)', color: 'var(--color-warning)' }}>All hostels already have gate logins created.</p>}
        </div>

        {generatedEmail && (
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Generated Email</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 'var(--spacing-3)', top: 'var(--spacing-3)', color: 'var(--color-text-muted)' }}>
                <FaEnvelope />
              </div>
              <input type="text" value={generatedEmail} style={{ width: '100%', padding: 'var(--spacing-3)', paddingLeft: 'var(--spacing-10)', border: 'var(--border-1) solid var(--color-border-input)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-hover)' }} readOnly />
              <p style={{ marginTop: 'var(--spacing-1)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>This email will be automatically created for the hostel gate login.</p>
            </div>
          </div>
        )}

        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Password</label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 'var(--spacing-3)', top: 'var(--spacing-3)', color: 'var(--color-text-muted)' }}>
              <FaKey />
            </div>
            <input type="password" name="password" value={formData.password} onChange={handleChange} style={{ width: '100%', padding: 'var(--spacing-3)', paddingLeft: 'var(--spacing-10)', border: 'var(--border-1) solid var(--color-border-input)', borderRadius: 'var(--radius-lg)', outline: 'none', transition: 'var(--transition-all)' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--color-primary)'; }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--color-border-input)'; }} placeholder="Enter password" required />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Confirm Password</label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 'var(--spacing-3)', top: 'var(--spacing-3)', color: 'var(--color-text-muted)' }}>
              <FaKey />
            </div>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} style={{ width: '100%', padding: 'var(--spacing-3)', paddingLeft: 'var(--spacing-10)', border: 'var(--border-1) solid var(--color-border-input)', borderRadius: 'var(--radius-lg)', outline: 'none', transition: 'var(--transition-all)' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--color-primary)'; }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--color-border-input)'; }} placeholder="Confirm password" required />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--spacing-4)', marginTop: 'var(--spacing-6)', borderTop: 'var(--border-1) solid var(--color-border-light)' }}>
          <button type="button" onClick={onClose} style={{ padding: 'var(--spacing-2) var(--spacing-4)', color: 'var(--color-text-body)', backgroundColor: 'var(--color-bg-hover)', borderRadius: 'var(--radius-lg)', marginRight: 'var(--spacing-2)', transition: 'var(--transition-colors)' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-muted)'} onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-bg-hover)'}>
            Cancel
          </button>
          <button type="submit" disabled={loading || !formData.hostelId || !formData.password || !formData.confirmPassword || availableHostels.length === 0} style={{ padding: 'var(--spacing-2) var(--spacing-4)', backgroundColor: 'var(--color-primary)', color: 'var(--color-white)', borderRadius: 'var(--radius-lg)', transition: 'var(--transition-colors)', display: 'flex', alignItems: 'center', opacity: (!formData.hostelId || !formData.password || !formData.confirmPassword || availableHostels.length === 0) ? 'var(--opacity-disabled)' : 'var(--opacity-100)', cursor: (!formData.hostelId || !formData.password || !formData.confirmPassword || availableHostels.length === 0) ? 'not-allowed' : 'pointer' }} onMouseEnter={(e) => { if (formData.hostelId && formData.password && formData.confirmPassword && availableHostels.length > 0) e.target.style.backgroundColor = 'var(--color-primary-hover)'; }} onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-primary)'}>
            {loading ? <span style={{ width: 'var(--icon-lg)', height: 'var(--icon-lg)', border: 'var(--border-2) solid var(--color-white)', borderTopColor: 'transparent', borderRadius: 'var(--radius-full)', animation: 'spin 1s linear infinite', marginRight: 'var(--spacing-2)' }}></span> : null}
            Create Gate Login
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default AddHostelGateModal
