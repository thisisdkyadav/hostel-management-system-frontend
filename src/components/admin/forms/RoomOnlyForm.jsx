import React, { useState } from "react"
import CsvUploader from "../../common/CsvUploader"
import RoomStatsSummary from "./RoomStatsSummary"
import { FaTable, FaEdit } from "react-icons/fa"

const RoomOnlyForm = ({ formData, setFormData }) => {
  const [inputMethod, setInputMethod] = useState("form")
  const [roomConfig, setRoomConfig] = useState({
    floors: 1,
    defaultRoomsPerFloor: 10,
    standardCapacity: 2,
    exceptions: [],
  })
  const [parsedCsvData, setParsedCsvData] = useState([])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (["floors", "defaultRoomsPerFloor", "standardCapacity"].includes(name)) {
      setRoomConfig((prev) => {
        const updated = { ...prev, [name]: parseInt(value) }
        updateFormDataWithConfig(updated)
        return updated
      })
    }
  }

  const handleExceptionChange = (index, field, value) => {
    setRoomConfig((prev) => {
      const exceptions = [...prev.exceptions]
      exceptions[index] = { ...exceptions[index], [field]: value }
      updateFormDataWithConfig({ ...prev, exceptions })
      return { ...prev, exceptions }
    })
  }

  const addException = () => {
    setRoomConfig((prev) => {
      const exceptions = [...prev.exceptions, { floor: "", roomsOverride: "" }]
      updateFormDataWithConfig({ ...prev, exceptions })
      return { ...prev, exceptions }
    })
  }

  const removeException = (index) => {
    setRoomConfig((prev) => {
      const exceptions = prev.exceptions.filter((_, i) => i !== index)
      updateFormDataWithConfig({ ...prev, exceptions })
      return { ...prev, exceptions }
    })
  }

  const updateFormDataWithConfig = (config) => {
    const { floors, defaultRoomsPerFloor, exceptions, standardCapacity } = config

    const rooms = []

    for (let floor = 0; floor < floors; floor++) {
      const floorNumber = floor + 1

      const ex = exceptions.find((e) => parseInt(e.floor) === floorNumber)
      const roomsForFloor = ex && ex.roomsOverride ? parseInt(ex.roomsOverride) || defaultRoomsPerFloor : defaultRoomsPerFloor
      const floorPrefix = floorNumber * 100

      for (let room = 1; room <= roomsForFloor; room++) {
        const roomNumber = `${floorPrefix + room}`
        rooms.push({
          roomNumber,
          capacity: standardCapacity,
        })
      }
    }
    setFormData((prev) => ({
      ...prev,
      rooms,
    }))
  }

  const handleCsvDataParsed = (data) => {
    const processedData = data.map((room) => {
      return {
        roomNumber: room.roomNumber || "",
        capacity: parseInt(room.capacity) || 1,
      }
    })

    setParsedCsvData(processedData)

    setFormData((prev) => ({
      ...prev,
      rooms: processedData,
    }))
  }

  const requiredFields = ["roomNumber", "capacity"]
  const templateInstructions = (
    <div>
      <p className="font-medium mb-1">Field Input Types:</p>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
        <li>
          <span className="font-medium">roomNumber:</span> String (e.g., 101)
        </li>
        <li>
          <span className="font-medium">capacity:</span> Number
        </li>
      </ul>
    </div>
  )

  return (
    <div>
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button type="button" className={`px-4 py-2 text-sm font-medium rounded-l-lg ${inputMethod === "form" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"} border border-gray-300`} onClick={() => setInputMethod("form")}>
            <FaEdit className="inline mr-2" />
            Form Input
          </button>
          <button type="button" className={`px-4 py-2 text-sm font-medium rounded-r-lg ${inputMethod === "csv" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"} border border-gray-300`} onClick={() => setInputMethod("csv")}>
            <FaTable className="inline mr-2" />
            CSV Import
          </button>
        </div>
      </div>

      {inputMethod === "form" ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Number of Floors</label>
              <input type="number" name="floors" value={roomConfig.floors} onChange={handleChange} min="1" className="w-full p-2 border border-gray-300 rounded-lg" />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Default Rooms per Floor</label>
              <input type="number" name="defaultRoomsPerFloor" value={roomConfig.defaultRoomsPerFloor} onChange={handleChange} min="1" className="w-full p-2 border border-gray-300 rounded-lg" />
              <p className="text-xs text-gray-500 mt-1">Room numbers will be generated as 101, 102... (Ground floor), 201, 202... (First floor)</p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Standard Room Capacity</label>
            <input type="number" name="standardCapacity" value={roomConfig.standardCapacity} onChange={handleChange} min="1" className="w-full p-2 border border-gray-300 rounded-lg" />
          </div>

          <div className="mt-4">
            <div className="bg-blue-50 px-3 py-2 rounded-lg mb-2">
              <h5 className="text-sm font-medium text-blue-800">Floor Room Exceptions</h5>
              <p className="text-xs text-gray-600">Override default rooms per floor for a specific floor</p>
            </div>
            {roomConfig.exceptions.map((ex, index) => (
              <div key={index} className="grid grid-cols-2 gap-4 mb-2">
                <input type="number" placeholder="Floor Number" value={ex.floor} onChange={(e) => handleExceptionChange(index, "floor", e.target.value)} min="1" className="p-2 border border-gray-300 rounded-lg" />
                <input type="number" placeholder="Rooms on Floor" value={ex.roomsOverride} onChange={(e) => handleExceptionChange(index, "roomsOverride", e.target.value)} min="1" className="p-2 border border-gray-300 rounded-lg" />
                <button type="button" onClick={() => removeException(index)} className="col-span-2 text-red-600 text-sm">
                  Remove Exception
                </button>
              </div>
            ))}
            <button type="button" onClick={addException} className="mt-2 px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm">
              Add Exception
            </button>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm">
              This will create {roomConfig.floors} floors with {roomConfig.defaultRoomsPerFloor} rooms per floor by default.
            </p>
            <p className="text-sm mt-2">Total capacity: {roomConfig.floors * roomConfig.defaultRoomsPerFloor * roomConfig.standardCapacity} students (exceptions may override room counts)</p>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <CsvUploader onDataParsed={handleCsvDataParsed} requiredFields={requiredFields} templateFileName="room_only_template.csv" templateHeaders={["roomNumber", "capacity"]} instructionText={templateInstructions} />

          {parsedCsvData.length > 0 && (
            <div className="mt-4">
              <div className="bg-blue-50 px-3 py-2 rounded-lg mb-3">
                <h5 className="text-sm font-medium text-blue-800">Imported Room Data Summary</h5>
              </div>
              <RoomStatsSummary data={parsedCsvData} isUnitBased={false} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default RoomOnlyForm
