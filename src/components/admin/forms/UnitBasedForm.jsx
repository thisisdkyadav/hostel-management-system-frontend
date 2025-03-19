import React, { useState } from "react"

const UnitBasedForm = ({ formData, setFormData }) => {
  const [unitConfig, setUnitConfig] = useState({
    floors: 1,
    unitsPerFloor: 4,
    roomsPerUnit: 3,
    standardCapacity: 1,
    exceptions: [],
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setUnitConfig((prev) => {
      const updated = { ...prev, [name]: parseInt(value) || value }
      updateFormDataWithConfig(updated)
      return updated
    })
  }

  const updateFormDataWithConfig = (config) => {
    const { floors, unitsPerFloor, roomsPerUnit, standardCapacity } = config

    const units = []
    const rooms = []

    for (let floor = 0; floor < floors; floor++) {
      const floorNumber = floor + 1
      const floorPrefix = floorNumber * 100

      for (let unit = 1; unit <= unitsPerFloor; unit++) {
        const unitNumber = `${floorPrefix + unit}`

        // Add unit
        units.push({
          unitNumber,
          floor: floor,
          commonAreaDetails: "",
        })

        // Add rooms for this unit
        for (let room = 0; room < roomsPerUnit; room++) {
          const roomLetter = String.fromCharCode(65 + room) // A, B, C, etc.

          rooms.push({
            unitNumber,
            roomNumber: roomLetter,
            capacity: standardCapacity,
            status: "Available",
          })
        }
      }
    }

    setFormData((prev) => ({
      ...prev,
      units,
      rooms,
    }))
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Number of Floors</label>
          <input type="number" name="floors" value={unitConfig.floors} onChange={handleChange} min="1" className="w-full p-2 border border-gray-300 rounded-lg" />
          <p className="text-xs text-gray-500 mt-1">Floor numbering: Ground floor = 100s, First floor = 200s, etc.</p>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Units per Floor</label>
          <input type="number" name="unitsPerFloor" value={unitConfig.unitsPerFloor} onChange={handleChange} min="1" className="w-full p-2 border border-gray-300 rounded-lg" />
          <p className="text-xs text-gray-500 mt-1">Unit numbers: 101, 102... (Ground floor), 201, 202... (First floor)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Rooms per Unit</label>
          <input type="number" name="roomsPerUnit" value={unitConfig.roomsPerUnit} onChange={handleChange} min="1" className="w-full p-2 border border-gray-300 rounded-lg" />
          <p className="text-xs text-gray-500 mt-1">Room labels: A, B, C, etc.</p>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Standard Room Capacity</label>
          <input type="number" name="standardCapacity" value={unitConfig.standardCapacity} onChange={handleChange} min="1" className="w-full p-2 border border-gray-300 rounded-lg" />
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm">
          This will create {unitConfig.floors} floors with {unitConfig.unitsPerFloor} units per floor. Each unit will have {unitConfig.roomsPerUnit} rooms (A-{String.fromCharCode(64 + unitConfig.roomsPerUnit)}) with a capacity of {unitConfig.standardCapacity} students each.
        </p>
        <p className="text-sm mt-2">Total capacity: {unitConfig.floors * unitConfig.unitsPerFloor * unitConfig.roomsPerUnit * unitConfig.standardCapacity} students</p>
      </div>
    </div>
  )
}

export default UnitBasedForm
