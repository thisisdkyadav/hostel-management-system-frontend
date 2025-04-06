import React, { useState, useEffect } from "react"
import CsvUploader from "../../common/CsvUploader"
import RoomStatsSummary from "./RoomStatsSummary"
import { FaTable, FaEdit } from "react-icons/fa"

const UnitBasedForm = ({ formData, setFormData }) => {
  const [inputMethod, setInputMethod] = useState("form")
  const [unitConfig, setUnitConfig] = useState({
    floors: 1,
    defaultUnitsPerFloor: 4,
    defaultRoomsPerUnit: 3,
    standardCapacity: 1,
    unitsPerFloor: { 1: 4 },
    exceptions: [],
  })
  const [parsedCsvData, setParsedCsvData] = useState([])

  useEffect(() => {
    setUnitConfig((prev) => {
      const newUnits = { ...prev.unitsPerFloor }
      for (let f = 1; f <= prev.floors; f++) {
        if (!newUnits[f]) {
          newUnits[f] = prev.defaultUnitsPerFloor
        }
      }
      return { ...prev, unitsPerFloor: newUnits }
    })
  }, [unitConfig.floors, unitConfig.defaultUnitsPerFloor])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (["floors", "defaultUnitsPerFloor", "defaultRoomsPerUnit", "standardCapacity"].includes(name)) {
      setUnitConfig((prev) => {
        const updated = { ...prev, [name]: parseInt(value) }
        updateFormDataWithConfig(updated)
        return updated
      })
    } else {
      if (name.startsWith("floor-")) {
        const floor = name.split("-")[1]
        setUnitConfig((prev) => {
          const updated = {
            ...prev,
            unitsPerFloor: { ...prev.unitsPerFloor, [floor]: parseInt(value) },
          }
          updateFormDataWithConfig(updated)
          return updated
        })
      }
    }
  }

  const handleExceptionChange = (index, field, value) => {
    setUnitConfig((prev) => {
      const exceptions = [...prev.exceptions]
      exceptions[index] = { ...exceptions[index], [field]: value }
      updateFormDataWithConfig({ ...prev, exceptions })
      return { ...prev, exceptions }
    })
  }

  const addException = () => {
    setUnitConfig((prev) => {
      const exceptions = [...prev.exceptions, { unitNumber: "", roomsOverride: "" }]
      updateFormDataWithConfig({ ...prev, exceptions })
      return { ...prev, exceptions }
    })
  }

  const removeException = (index) => {
    setUnitConfig((prev) => {
      const exceptions = prev.exceptions.filter((_, i) => i !== index)
      updateFormDataWithConfig({ ...prev, exceptions })
      return { ...prev, exceptions }
    })
  }

  const updateFormDataWithConfig = (config) => {
    const { floors, unitsPerFloor, defaultRoomsPerUnit, exceptions, standardCapacity } = config

    const units = []
    const rooms = []

    for (let floor = 0; floor < floors; floor++) {
      const floorNumber = floor + 1
      const floorPrefix = floorNumber * 100
      const unitsCount = unitsPerFloor[floorNumber] || unitConfig.defaultUnitsPerFloor
      for (let unit = 1; unit <= unitsCount; unit++) {
        const unitNumber = `${floorPrefix + unit}`

        const exception = exceptions.find((ex) => ex.unitNumber === unitNumber)
        const roomsCount = exception && exception.roomsOverride ? parseInt(exception.roomsOverride) || defaultRoomsPerUnit : defaultRoomsPerUnit

        units.push({
          unitNumber,
          floor: floorNumber,
          commonAreaDetails: "",
        })

        for (let room = 0; room < roomsCount; room++) {
          const roomLetter = String.fromCharCode(65 + room)
          rooms.push({
            unitNumber,
            roomNumber: roomLetter,
            capacity: standardCapacity,
            status: "Active",
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

  const handleCsvDataParsed = (data) => {
    const processedData = data.map((room) => {
      return {
        unitNumber: room.unitNumber || "",
        roomNumber: (room.roomNumber || "").toUpperCase(),
        capacity: parseInt(room.capacity) || 1,
        status: ["Active", "Inactive"].includes(room.status) ? room.status : "Active",
      }
    })

    const uniqueUnits = [...new Set(processedData.map((room) => room.unitNumber))].filter(Boolean)

    const units = uniqueUnits.map((unitNumber) => ({
      unitNumber,
      commonAreaDetails: "",
    }))

    setParsedCsvData(processedData)

    setFormData((prev) => ({
      ...prev,
      units,
      rooms: processedData,
    }))
  }

  const requiredFields = ["unitNumber", "roomNumber", "capacity", "status"]
  const templateInstructions = (
    <div>
      <p className="font-medium mb-1">Field Input Types:</p>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
        <li>
          <span className="font-medium">unitNumber:</span> String (e.g., 101)
        </li>
        <li>
          <span className="font-medium">roomNumber:</span> String (e.g., A)
        </li>
        <li>
          <span className="font-medium">capacity:</span> Number
        </li>
        <li>
          <span className="font-medium">status:</span> "Active" or "Inactive"
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
              <input type="number" name="floors" value={unitConfig.floors} onChange={handleChange} min="1" className="w-full p-2 border border-gray-300 rounded-lg" />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Default Rooms per Unit</label>
              <input type="number" name="defaultRoomsPerUnit" value={unitConfig.defaultRoomsPerUnit} onChange={handleChange} min="1" className="w-full p-2 border border-gray-300 rounded-lg" />
            </div>
          </div>

          <div className="mb-4">
            <h5 className="text-gray-700 mb-2">Floor wise Units:</h5>
            {Array.from({ length: unitConfig.floors }, (_, i) => {
              const floor = i + 1
              return (
                <div key={floor} className="mb-2">
                  <label className="block text-gray-700 text-sm mb-1">{`Floor ${floor}`}</label>
                  <input type="number" name={`floor-${floor}`} value={unitConfig.unitsPerFloor[floor] || ""} onChange={handleChange} min="1" className="w-full p-2 border border-gray-300 rounded-lg" />
                </div>
              )
            })}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Standard Room Capacity</label>
            <input type="number" name="standardCapacity" value={unitConfig.standardCapacity} onChange={handleChange} min="1" className="w-full p-2 border border-gray-300 rounded-lg" />
          </div>

          <div className="mt-4">
            <div className="bg-blue-50 px-3 py-2 rounded-lg mb-2">
              <h5 className="text-sm font-medium text-blue-800">Unit Room Exceptions</h5>
              <p className="text-xs text-gray-600">Override default rooms per unit for a specific unit</p>
            </div>
            {unitConfig.exceptions.map((ex, index) => (
              <div key={index} className="grid grid-cols-2 gap-4 mb-2">
                <input type="text" placeholder="Unit Number (e.g., 101)" value={ex.unitNumber} onChange={(e) => handleExceptionChange(index, "unitNumber", e.target.value)} className="p-2 border border-gray-300 rounded-lg" />
                <input type="number" placeholder="Rooms in Unit" value={ex.roomsOverride} onChange={(e) => handleExceptionChange(index, "roomsOverride", e.target.value)} min="1" className="p-2 border border-gray-300 rounded-lg" />
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
              This will create {unitConfig.floors} floors with custom units per floor and {unitConfig.defaultRoomsPerUnit} rooms per unit by default.
            </p>
            <p className="text-sm mt-2">
              Total capacity:{" "}
              {(() => {
                let total = 0
                for (let floor = 0; floor < unitConfig.floors; floor++) {
                  const floorNumber = floor + 1
                  const unitsCount = unitConfig.unitsPerFloor[floorNumber] || unitConfig.defaultUnitsPerFloor
                  for (let unit = 1; unit <= unitsCount; unit++) {
                    // determine room count from exception if exists
                    const unitNumber = String(floorNumber * 100 + unit)
                    const exception = unitConfig.exceptions.find((ex) => ex.unitNumber === unitNumber)
                    const roomCount = exception && exception.roomsOverride ? parseInt(exception.roomsOverride) : unitConfig.defaultRoomsPerUnit
                    total += roomCount * unitConfig.standardCapacity
                  }
                }
                return total
              })()}{" "}
              students
            </p>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <CsvUploader onDataParsed={handleCsvDataParsed} requiredFields={requiredFields} templateFileName="unit_based_rooms_template.csv" templateHeaders={["unitNumber", "roomNumber", "capacity", "status"]} instructionText={templateInstructions} maxRecords={900} />

          {parsedCsvData.length > 0 && (
            <div className="mt-4">
              <div className="bg-blue-50 px-3 py-2 rounded-lg mb-3">
                <h5 className="text-sm font-medium text-blue-800">Imported Room Data Summary</h5>
              </div>
              <RoomStatsSummary data={parsedCsvData} isUnitBased={true} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default UnitBasedForm
