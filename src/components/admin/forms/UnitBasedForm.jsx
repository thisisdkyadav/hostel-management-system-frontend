import React, { useState, useEffect } from "react"
import CsvUploader from "../../common/CsvUploader"
import RoomStatsSummary from "./RoomStatsSummary"
import { Button, Input, VStack, HStack, Label } from "@/components/ui"
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

  const requiredFields = ["unitNumber", "roomNumber", "capacity"]
  const templateInstructions = (
    <div>
      <p style={{ fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-1)" }}>Field Input Types:</p>
      <ul style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", columnGap: "var(--spacing-4)", rowGap: "var(--spacing-1)" }}>
        <li>
          <span style={{ fontWeight: "var(--font-weight-medium)" }}>unitNumber:</span> String (e.g., 101)
        </li>
        <li>
          <span style={{ fontWeight: "var(--font-weight-medium)" }}>roomNumber:</span> String (e.g., A)
        </li>
        <li>
          <span style={{ fontWeight: "var(--font-weight-medium)" }}>capacity:</span> Number
        </li>
      </ul>
    </div>
  )

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "var(--spacing-6)" }}>
        <div style={{ display: "inline-flex", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-sm)" }} role="group">
          <Button
            type="button"
            variant={inputMethod === "form" ? "primary" : "white"}
            size="medium"
            icon={<FaEdit />}
            onClick={() => setInputMethod("form")}
            style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
          >
            Form Input
          </Button>
          <Button
            type="button"
            variant={inputMethod === "csv" ? "primary" : "white"}
            size="medium"
            icon={<FaTable />}
            onClick={() => setInputMethod("csv")}
            style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
          >
            CSV Import
          </Button>
        </div>
      </div>

      {inputMethod === "form" ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(1, 1fr)", gap: "var(--spacing-4)" }} className="md:grid-cols-2">
            <VStack gap="xsmall" style={{ marginBottom: "var(--spacing-4)" }}>
              <Label htmlFor="floors">Number of Floors</Label>
              <Input id="floors" type="number" name="floors" value={unitConfig.floors} onChange={handleChange} min="1" />
            </VStack>

            <VStack gap="xsmall" style={{ marginBottom: "var(--spacing-4)" }}>
              <Label htmlFor="defaultRoomsPerUnit">Default Rooms per Unit</Label>
              <Input id="defaultRoomsPerUnit" type="number" name="defaultRoomsPerUnit" value={unitConfig.defaultRoomsPerUnit} onChange={handleChange} min="1" />
            </VStack>
          </div>

          <VStack gap="small" style={{ marginBottom: "var(--spacing-4)" }}>
            <Label>Floor wise Units:</Label>
            {Array.from({ length: unitConfig.floors }, (_, i) => {
              const floor = i + 1
              return (
                <VStack gap="xsmall" key={floor}>
                  <Label htmlFor={`floor-${floor}`}>{`Floor ${floor}`}</Label>
                  <Input id={`floor-${floor}`} type="number" name={`floor-${floor}`} value={unitConfig.unitsPerFloor[floor] || ""} onChange={handleChange} min="1" />
                </VStack>
              )
            })}
          </VStack>

          <VStack gap="xsmall" style={{ marginBottom: "var(--spacing-4)" }}>
            <Label htmlFor="standardCapacity">Standard Room Capacity</Label>
            <Input id="standardCapacity" type="number" name="standardCapacity" value={unitConfig.standardCapacity} onChange={handleChange} min="1" />
          </VStack>

          <div style={{ marginTop: "var(--spacing-4)" }}>
            <div style={{ backgroundColor: "var(--color-primary-bg)", padding: "var(--spacing-3)", borderRadius: "var(--radius-lg)", marginBottom: "var(--spacing-2)" }}>
              <h5 style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-primary)" }}>Unit Room Exceptions</h5>
              <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>Override default rooms per unit for a specific unit</p>
            </div>
            {unitConfig.exceptions.map((ex, index) => (
              <div key={index} style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "var(--spacing-4)", marginBottom: "var(--spacing-2)" }}>
                <Input type="text" placeholder="Unit Number (e.g., 101)" value={ex.unitNumber} onChange={(e) => handleExceptionChange(index, "unitNumber", e.target.value)} />
                <Input type="number" placeholder="Rooms in Unit" value={ex.roomsOverride} onChange={(e) => handleExceptionChange(index, "roomsOverride", e.target.value)} min="1" />
                <Button
                  type="button"
                  onClick={() => removeException(index)}
                  variant="danger"
                  size="small"
                  className="col-span-2"
                >
                  Remove Exception
                </Button>
              </div>
            ))}
            <Button
              type="button"
              onClick={addException}
              variant="success"
              size="small"
            >
              Add Exception
            </Button>
          </div>

          <div style={{ marginTop: "var(--spacing-4)", padding: "var(--spacing-3)", backgroundColor: "var(--color-primary-bg)", borderRadius: "var(--radius-lg)" }}>
            <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>
              This will create {unitConfig.floors} floors with custom units per floor and {unitConfig.defaultRoomsPerUnit} rooms per unit by default.
            </p>
            <p style={{ fontSize: "var(--font-size-sm)", marginTop: "var(--spacing-2)", color: "var(--color-text-body)" }}>
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
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-6)" }}>
          <CsvUploader onDataParsed={handleCsvDataParsed} requiredFields={requiredFields} templateFileName="unit_based_rooms_template.csv" templateHeaders={["unitNumber", "roomNumber", "capacity"]} instructionText={templateInstructions} maxRecords={900} />

          {parsedCsvData.length > 0 && (
            <div style={{ marginTop: "var(--spacing-4)" }}>
              <div style={{ backgroundColor: "var(--color-primary-bg)", padding: "var(--spacing-3)", borderRadius: "var(--radius-lg)", marginBottom: "var(--spacing-3)" }}>
                <h5 style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-primary)" }}>Imported Room Data Summary</h5>
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
