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
    <Modal title="Add Hostel Gate Login" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Hostel</label>
          <div className="relative">
            <div className="absolute left-3 top-3 text-gray-400">
              <FaBuilding />
            </div>
            <select name="hostelId" value={formData.hostelId} onChange={handleChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB]" required>
              <option value="">Select a hostel</option>
              {availableHostels.map((hostel) => (
                <option key={hostel._id} value={hostel._id}>
                  {hostel.name}
                </option>
              ))}
            </select>
          </div>
          {availableHostels.length === 0 && <p className="mt-2 text-sm text-amber-600">All hostels already have gate logins created.</p>}
        </div>

        {generatedEmail && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Generated Email</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <FaEnvelope />
              </div>
              <input type="text" value={generatedEmail} className="w-full p-3 pl-10 border border-gray-300 rounded-lg bg-gray-50" readOnly />
              <p className="mt-1 text-xs text-gray-500">This email will be automatically created for the hostel gate login.</p>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <div className="relative">
            <div className="absolute left-3 top-3 text-gray-400">
              <FaKey />
            </div>
            <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB]" placeholder="Enter password" required />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
          <div className="relative">
            <div className="absolute left-3 top-3 text-gray-400">
              <FaKey />
            </div>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB]" placeholder="Confirm password" required />
          </div>
        </div>

        <div className="flex justify-end pt-4 mt-6 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 mr-2">
            Cancel
          </button>
          <button type="submit" disabled={loading || !formData.hostelId || !formData.password || !formData.confirmPassword || availableHostels.length === 0} className={`px-4 py-2 bg-[#1360AB] text-white rounded-lg transition-colors flex items-center ${!formData.hostelId || !formData.password || !formData.confirmPassword || availableHostels.length === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-[#0F4C81]"}`} >
            {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span> : null}
            Create Gate Login
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default AddHostelGateModal
