import React, { useState } from "react"

const RoomOnlyForm = ({ formData, setFormData }) => {
  const [roomConfig, setRoomConfig] = useState({
    floors: 1,
    roomsPerFloor: 10,
    standardCapacity: 2,
    exceptions: [],
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setRoomConfig((prev) => {
      const updated = { ...prev, [name]: parseInt(value) || value }
      updateFormDataWithConfig(updated)
      return updated
    })
  }

  const updateFormDataWithConfig = (config) => {
    const { floors, roomsPerFloor, standardCapacity } = config

    const rooms = []

    for (let floor = 0; floor < floors; floor++) {
      const floorNumber = floor + 1
      const floorPrefix = floorNumber * 100

      for (let room = 1; room <= roomsPerFloor; room++) {
        const roomNumber = `${floorPrefix + room}`

        rooms.push({
          roomNumber,
          capacity: standardCapacity,
          status: "Active",
        })
      }
    }

    setFormData((prev) => ({
      ...prev,
      rooms,
    }))
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Number of Floors</label>
          <input type="number" name="floors" value={roomConfig.floors} onChange={handleChange} min="1" className="w-full p-2 border border-gray-300 rounded-lg" />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Rooms per Floor</label>
          <input type="number" name="roomsPerFloor" value={roomConfig.roomsPerFloor} onChange={handleChange} min="1" className="w-full p-2 border border-gray-300 rounded-lg" />
          <p className="text-xs text-gray-500 mt-1">Room numbers: 101, 102... (Ground floor), 201, 202... (First floor)</p>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Standard Room Capacity</label>
        <input type="number" name="standardCapacity" value={roomConfig.standardCapacity} onChange={handleChange} min="1" className="w-full p-2 border border-gray-300 rounded-lg" />
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm">
          This will create {roomConfig.floors} floors with {roomConfig.roomsPerFloor} rooms per floor, each with a capacity of {roomConfig.standardCapacity} students.
        </p>
        <p className="text-sm mt-2">Total capacity: {roomConfig.floors * roomConfig.roomsPerFloor * roomConfig.standardCapacity} students</p>
      </div>
    </div>
  )
}

export default RoomOnlyForm
