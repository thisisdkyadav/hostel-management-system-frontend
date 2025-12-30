import { useState, useEffect } from "react"
import { FaBuilding, FaEnvelope, FaKey } from "react-icons/fa"
import Modal from "../../common/Modal"
import Button from "../../common/Button"
import Input from "../../common/ui/Input"
import Select from "../../common/ui/Select"
import { hostelGateApi } from "../../../service"

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
          <Select
            name="hostelId"
            value={formData.hostelId}
            onChange={handleChange}
            icon={<FaBuilding />}
            options={[{ value: "", label: "Select a hostel" }, ...availableHostels.map((hostel) => ({ value: hostel._id, label: hostel.name }))]}
            required
          />
          {availableHostels.length === 0 && <p style={{ marginTop: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)', color: 'var(--color-warning)' }}>All hostels already have gate logins created.</p>}
        </div>

        {generatedEmail && (
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Generated Email</label>
            <Input type="text" value={generatedEmail} icon={<FaEnvelope />} disabled />
            <p style={{ marginTop: 'var(--spacing-1)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>This email will be automatically created for the hostel gate login.</p>
          </div>
        )}

        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Password</label>
          <Input type="password" name="password" value={formData.password} onChange={handleChange} icon={<FaKey />} placeholder="Enter password" required />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Confirm Password</label>
          <Input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} icon={<FaKey />} placeholder="Confirm password" required />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--spacing-4)', marginTop: 'var(--spacing-6)', borderTop: 'var(--border-1) solid var(--color-border-light)', gap: 'var(--spacing-2)' }}>
          <Button type="button" onClick={onClose} variant="secondary" size="medium">
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="medium" isLoading={loading} disabled={loading || !formData.hostelId || !formData.password || !formData.confirmPassword || availableHostels.length === 0}>
            Create Gate Login
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default AddHostelGateModal
