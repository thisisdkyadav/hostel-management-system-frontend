import React, { useState, useEffect } from "react"
import Modal from "../../common/Modal"
import { FaBuilding, FaUser, FaDoorOpen, FaArchive } from "react-icons/fa"
import Button from "../../common/Button"
import RoomManagementModal from "./RoomManagementModal"
import { hostelApi } from "../../../services/hostelApi"

const EditHostelModal = ({ hostel, onClose, onSave, refreshHostels }) => {
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
  })

  const [isArchived, setIsArchived] = useState(hostel.isArchived)

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showRoomManagementModal, setShowRoomManagementModal] = useState(false)

  useEffect(() => {
    if (hostel) {
      setFormData({
        name: hostel.name || "",
        gender: hostel.gender || "",
      })
    }
  }, [hostel])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Hostel name is required"
    }

    if (!formData.gender) {
      newErrors.gender = "Gender is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      await onSave({
        ...hostel,
        name: formData.name,
        gender: formData.gender,
      })

      onClose()
    } catch (error) {
      setErrors({ form: "Failed to update hostel details. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRoomsUpdated = () => {
    // Notify parent that rooms were updated
    onSave({ ...hostel })
  }

  const handleArchiveToggle = async () => {
    const message = isArchived ? "Are you sure you want to unarchive this hostel?" : "Are you sure you want to archive this hostel?"
    // confirm the action
    const confirm = window.confirm(message)
    if (!confirm) return

    try {
      await hostelApi.changeArchiveStatus(hostel.id, !isArchived)
      setIsArchived(!isArchived)
      refreshHostels()
    } catch (error) {
      console.error("Error changing archive status:", error)
    }
  }

  return (
    <>
      <Modal title="Edit Hostel Details" onClose={onClose} width={500}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.form && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.form}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hostel Name</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <FaBuilding className="h-5 w-5" />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full p-3 pl-10 border ${errors.name ? "border-red-500 bg-red-50 focus:ring-red-200" : "border-[var(--color-border-input)] focus:ring-[var(--color-primary-bg-hover)]"} rounded-lg focus:outline-none focus:ring-2 focus:border-[var(--color-primary)]`}
                placeholder="Enter hostel name"
              />
            </div>
            {errors.name && <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <FaUser className="h-5 w-5" />
              </div>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={`w-full p-3 pl-10 border ${errors.gender ? "border-red-500 bg-red-50 focus:ring-red-200" : "border-[var(--color-border-input)] focus:ring-[var(--color-primary-bg-hover)]"} rounded-lg focus:outline-none focus:ring-2 focus:border-[var(--color-primary)] bg-[var(--color-bg-primary)] appearance-none`}
              >
                <option value="">Select Gender</option>
                <option value="Boys">Boys</option>
                <option value="Girls">Girls</option>
                <option value="Co-ed">Co-ed</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            {errors.gender && <p className="mt-1.5 text-sm text-red-600">{errors.gender}</p>}
          </div>

          <div className="flex justify-center">
            <Button type="button" onClick={handleArchiveToggle} variant="secondary" icon={<FaArchive />} animation="ripple" fullWidth>
              {isArchived ? "Unarchive Hostel" : "Archive Hostel"}
            </Button>
          </div>

          <div className="flex justify-center">
            <Button type="button" onClick={() => setShowRoomManagementModal(true)} variant="secondary" icon={<FaDoorOpen />} animation="ripple" fullWidth>
              Manage Hostel Rooms
            </Button>
          </div>

          <div className="pt-4 border-t border-gray-100 flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-3">
            <button type="button" onClick={onClose} className="w-full sm:w-auto px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
              Cancel
            </button>

            <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-4 py-2.5 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center">
              {isSubmitting ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  Saving Changes...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </Modal>

      {showRoomManagementModal && <RoomManagementModal hostel={hostel} onClose={() => setShowRoomManagementModal(false)} onRoomsUpdated={handleRoomsUpdated} />}
    </>
  )
}

export default EditHostelModal
