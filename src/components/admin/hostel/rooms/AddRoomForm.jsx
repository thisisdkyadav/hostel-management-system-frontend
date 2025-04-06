import React, { useState } from "react"
import Button from "../../../common/Button"
import { FaDoorOpen, FaUsers, FaPlusCircle } from "react-icons/fa"
import { hostelApi } from "../../../../services/hostelApi"

const AddRoomForm = ({ hostel, onRoomsUpdated, setIsLoading }) => {
  const isUnitBased = hostel.type === "unit-based"

  const [formData, setFormData] = useState({
    unitNumber: "",
    roomNumbers: "",
    capacity: 1,
    status: "Active",
    commonAreaDetails: "",
  })

  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState("")

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "capacity" ? parseInt(value) : value,
    }))

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }

    if (successMessage) {
      setSuccessMessage("")
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (isUnitBased && !formData.unitNumber.trim()) {
      newErrors.unitNumber = "Unit number is required"
    }

    if (!formData.roomNumbers.trim()) {
      newErrors.roomNumbers = `Room ${isUnitBased ? "letter(s)" : "number(s)"} required`
    }

    if (!formData.capacity || formData.capacity < 1) {
      newErrors.capacity = "Capacity must be at least 1"
    }

    if (!formData.status) {
      newErrors.status = "Status is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const parseRoomNumbers = () => {
    // Handle comma-separated values, ranges with hyphens, and combinations
    const roomsString = formData.roomNumbers.trim()
    let roomNumbers = []

    // Split by commas first
    const segments = roomsString
      .split(",")
      .map((segment) => segment.trim())
      .filter(Boolean)

    for (const segment of segments) {
      if (segment.includes("-")) {
        // Handle ranges like 101-105 or A-E
        const [start, end] = segment.split("-").map((part) => part.trim())

        if (isUnitBased) {
          // For unit-based, handle letter ranges like A-E
          const startCode = start.charCodeAt(0)
          const endCode = end.charCodeAt(0)

          if (startCode <= endCode && /^[A-Za-z]$/.test(start) && /^[A-Za-z]$/.test(end)) {
            for (let code = startCode; code <= endCode; code++) {
              roomNumbers.push(String.fromCharCode(code))
            }
          } else {
            roomNumbers.push(start, end)
          }
        } else {
          // For room-only, handle numeric ranges like 101-105
          const startNum = parseInt(start)
          const endNum = parseInt(end)

          if (!isNaN(startNum) && !isNaN(endNum) && startNum <= endNum) {
            for (let num = startNum; num <= endNum; num++) {
              roomNumbers.push(num.toString())
            }
          } else {
            roomNumbers.push(start, end)
          }
        }
      } else {
        roomNumbers.push(segment)
      }
    }

    return roomNumbers
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    const roomNumbers = parseRoomNumbers()

    const roomsToAdd = roomNumbers.map((roomNumber) => ({
      unitNumber: isUnitBased ? formData.unitNumber : undefined,
      roomNumber: roomNumber,
      capacity: formData.capacity,
      status: formData.status,
    }))

    // Generate units data for unit-based hostels
    let unitsToAdd = []
    if (isUnitBased) {
      // Check if we need to add a new unit
      unitsToAdd = [
        {
          unitNumber: formData.unitNumber,
          floor: parseInt(formData.unitNumber.substring(0, 1)) - 1,
          commonAreaDetails: formData.commonAreaDetails || "",
        },
      ]
    }

    setIsLoading(true)

    try {
      // Replace with actual API call including units data
      console.log("Adding rooms:", roomsToAdd)
      if (isUnitBased) console.log("Adding units:", unitsToAdd)

      const response = await hostelApi.addRooms(hostel.id, {
        rooms: roomsToAdd,
        units: isUnitBased ? unitsToAdd : undefined,
      })

      if (response?.success) {
        setSuccessMessage(`Successfully added ${roomsToAdd.length} room(s)`)
        onRoomsUpdated()

        // Reset form
        setFormData({
          unitNumber: "",
          roomNumbers: "",
          capacity: 1,
          status: "Active",
          commonAreaDetails: "",
        })
      } else {
        setErrors({ form: "Failed to add rooms. Please try again." })
      }
    } catch (error) {
      setErrors({ form: error.message || "Failed to add rooms. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg mb-4">
        <h4 className="text-sm font-medium text-blue-800">Add New {isUnitBased ? "Unit Rooms" : "Rooms"}</h4>
        <p className="text-xs text-gray-600 mt-1">{isUnitBased ? "Enter a unit number and specify room letters to add multiple rooms to a unit" : "Add one or multiple rooms at once"}</p>
      </div>

      {successMessage && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg text-sm flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {successMessage}
        </div>
      )}

      {errors.form && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {errors.form}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {isUnitBased && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Unit Number</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <FaDoorOpen className="h-5 w-5" />
              </div>
              <input
                type="text"
                name="unitNumber"
                value={formData.unitNumber}
                onChange={handleChange}
                className={`w-full p-3 pl-10 border ${errors.unitNumber ? "border-red-500 bg-red-50 focus:ring-red-200" : "border-gray-300 focus:ring-blue-100"} rounded-lg focus:outline-none focus:ring-2 focus:border-[#1360AB]`}
                placeholder="e.g., 101"
              />
            </div>
            {errors.unitNumber && <p className="mt-1.5 text-sm text-red-600">{errors.unitNumber}</p>}
          </div>
        )}

        {isUnitBased && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Common Area Details (Optional)</label>
            <textarea name="commonAreaDetails" value={formData.commonAreaDetails} onChange={handleChange} rows="2" className="w-full p-3 border border-gray-300 focus:ring-blue-100 rounded-lg focus:outline-none focus:ring-2 focus:border-[#1360AB]" placeholder="e.g., Common kitchen, TV area" />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Room {isUnitBased ? "Letter(s)" : "Number(s)"}</label>
          <div className="relative">
            <div className="absolute left-3 top-3 text-gray-400">
              <FaDoorOpen className="h-5 w-5" />
            </div>
            <input
              type="text"
              name="roomNumbers"
              value={formData.roomNumbers}
              onChange={handleChange}
              className={`w-full p-3 pl-10 border ${errors.roomNumbers ? "border-red-500 bg-red-50 focus:ring-red-200" : "border-gray-300 focus:ring-blue-100"} rounded-lg focus:outline-none focus:ring-2 focus:border-[#1360AB]`}
              placeholder={isUnitBased ? "e.g., A, B, C or A-E" : "e.g., 101, 102 or 201-205"}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">You can use commas for lists and hyphens for ranges (e.g., A-D, F, H or 101-105, 201)</p>
          {errors.roomNumbers && <p className="mt-1 text-sm text-red-600">{errors.roomNumbers}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

        <div className="pt-4">
          <Button type="submit" variant="primary" size="medium" icon={<FaPlusCircle />} animation="ripple">
            Add Room(s)
          </Button>
        </div>
      </form>
    </div>
  )
}

export default AddRoomForm
