import { useState, useEffect } from "react"
import { FaBuilding, FaEnvelope, FaKey } from "react-icons/fa"
import { Select, VStack, HStack, Label, Alert } from "@/components/ui"
import { Button, Modal, Input } from "czero/react"
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
    <Modal isOpen={show} title="Add Hostel Gate Login" onClose={onClose} width={500}>
      <VStack gap="large">
        {error && <Alert type="error">{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <VStack gap="large">
            <div>
              <Label htmlFor="hostelId" required>Select Hostel</Label>
              <Select
                id="hostelId"
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
                <Label>Generated Email</Label>
                <Input type="text" value={generatedEmail} icon={<FaEnvelope />} disabled />
                <p style={{ marginTop: 'var(--spacing-1)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>This email will be automatically created for the hostel gate login.</p>
              </div>
            )}

            <div>
              <Label htmlFor="password" required>Password</Label>
              <Input type="password" id="password" name="password" value={formData.password} onChange={handleChange} icon={<FaKey />} placeholder="Enter password" required />
            </div>

            <div>
              <Label htmlFor="confirmPassword" required>Confirm Password</Label>
              <Input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} icon={<FaKey />} placeholder="Confirm password" required />
            </div>

            <HStack gap="small" justify="end" style={{ paddingTop: 'var(--spacing-4)', marginTop: 'var(--spacing-2)', borderTop: 'var(--border-1) solid var(--color-border-light)' }}>
              <Button type="button" onClick={onClose} variant="secondary" size="md">
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md" loading={loading} disabled={loading || !formData.hostelId || !formData.password || !formData.confirmPassword || availableHostels.length === 0}>
                Create Gate Login
              </Button>
            </HStack>
          </VStack>
        </form>
      </VStack>
    </Modal>
  )
}

export default AddHostelGateModal
