import React, { useState } from "react"
import Modal from "../../../common/Modal"
import Button from "../../../common/Button"
import { FaDoorOpen, FaUsers, FaTrash } from "react-icons/fa"

const EditRoomModal = ({ room, isUnitBased, onSave, onDelete, onClose }) => {
  const [formData, setFormData] = useState({
    id: room.id,
    unitNumber: room.unitNumber || "",
    roomNumber: room.roomNumber || "",
    capacity: room.capacity || 1,
    status: room.status || "Active",
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: name === "capacity" ? parseInt(value) : value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.capacity || formData.capacity < 1) {
      newErrors.capacity = "Capacity must be at least 1"
    }

    if (!formData.status) {
      newErrors.status = "Status is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      setErrors({ form: "Failed to update room. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteConfirm = () => {
    setConfirmDelete(true)
  }

  const handleDeleteRoom = async () => {
    try {
      await onDelete(room.id)
    } catch (error) {
      setErrors({ form: "Failed to delete room. Please try again." })
      setConfirmDelete(false)
    }
  }

  return (
    <Modal title="Edit Room Details" onClose={onClose} width={500}>
      {confirmDelete ? (
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
          <p className="text-gray-600 mb-6">Are you sure you want to delete this room? This action cannot be undone.</p>
          <div className="flex justify-end space-x-3">
            <Button onClick={() => setConfirmDelete(false)} variant="outline" size="small">
              Cancel
            </Button>
            <Button onClick={handleDeleteRoom} variant="danger" size="small" animation="shake">
              Delete Room
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.form && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.form}
            </div>
          )}

          {isUnitBased && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unit Number</label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <FaDoorOpen className="h-5 w-5" />
                </div>
                <input type="text" value={formData.unitNumber} className="w-full p-3 pl-10 border border-gray-300 rounded-lg bg-gray-50 text-gray-500" disabled />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Room {isUnitBased ? "Letter" : "Number"}</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <FaDoorOpen className="h-5 w-5" />
              </div>
              <input type="text" value={formData.roomNumber} className="w-full p-3 pl-10 border border-gray-300 rounded-lg bg-gray-50 text-gray-500" disabled />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <FaUsers className="h-5 w-5" />
              </div>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                min="1"
                className={`w-full p-3 pl-10 border ${errors.capacity ? "border-red-500 bg-red-50 focus:ring-red-200" : "border-gray-300 focus:ring-blue-100"} rounded-lg focus:outline-none focus:ring-2 focus:border-[#1360AB]`}
                placeholder="Room capacity"
              />
            </div>
            {errors.capacity && <p className="mt-1.5 text-sm text-red-600">{errors.capacity}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <div className="relative">
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={`w-full p-3 border ${errors.status ? "border-red-500 bg-red-50 focus:ring-red-200" : "border-gray-300 focus:ring-blue-100"} rounded-lg focus:outline-none focus:ring-2 focus:border-[#1360AB] bg-white appearance-none`}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Maintenance">Maintenance</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            {errors.status && <p className="mt-1.5 text-sm text-red-600">{errors.status}</p>}
          </div>

          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:justify-between items-center gap-3">
            {/* <Button onClick={handleDeleteConfirm} type="button" variant="danger" size="medium" className="flex items-center gap-2">
              <FaTrash /> Delete Room
            </Button> */}

            {/* <div className="flex flex-col-reverse sm:flex-row gap-3"> */}
            <Button onClick={onClose} type="button" variant="outline" size="medium">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="medium" isLoading={isSubmitting} animation="ripple">
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
            {/* </div> */}
          </div>
        </form>
      )}
    </Modal>
  )
}

export default EditRoomModal
