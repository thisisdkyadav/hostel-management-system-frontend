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
          <button
            type="button"
            style={{
              padding: "var(--spacing-2) var(--spacing-4)",
              fontSize: "var(--font-size-sm)",
              fontWeight: "var(--font-weight-medium)",
              borderTopLeftRadius: "var(--radius-lg)",
              borderBottomLeftRadius: "var(--radius-lg)",
              backgroundColor: inputMethod === "form" ? "var(--color-primary)" : "var(--color-bg-primary)",
              color: inputMethod === "form" ? "var(--color-white)" : "var(--color-text-body)",
              border: `var(--border-1) solid var(--color-border-input)`,
              cursor: "pointer",
              transition: "var(--transition-colors)",
            }}
            onMouseEnter={(e) => {
              if (inputMethod !== "form") {
                e.currentTarget.style.backgroundColor = "var(--color-bg-hover)"
              }
            }}
            onMouseLeave={(e) => {
              if (inputMethod !== "form") {
                e.currentTarget.style.backgroundColor = "var(--color-bg-primary)"
              }
            }}
            onClick={() => setInputMethod("form")}
          >
            <FaEdit style={{ display: "inline", marginRight: "var(--spacing-2)" }} />
            Form Input
          </button>
          <button
            type="button"
            style={{
              padding: "var(--spacing-2) var(--spacing-4)",
              fontSize: "var(--font-size-sm)",
              fontWeight: "var(--font-weight-medium)",
              borderTopRightRadius: "var(--radius-lg)",
              borderBottomRightRadius: "var(--radius-lg)",
              backgroundColor: inputMethod === "csv" ? "var(--color-primary)" : "var(--color-bg-primary)",
              color: inputMethod === "csv" ? "var(--color-white)" : "var(--color-text-body)",
              border: `var(--border-1) solid var(--color-border-input)`,
              cursor: "pointer",
              transition: "var(--transition-colors)",
            }}
            onMouseEnter={(e) => {
              if (inputMethod !== "csv") {
                e.currentTarget.style.backgroundColor = "var(--color-bg-hover)"
              }
            }}
            onMouseLeave={(e) => {
              if (inputMethod !== "csv") {
                e.currentTarget.style.backgroundColor = "var(--color-bg-primary)"
              }
            }}
            onClick={() => setInputMethod("csv")}
          >
            <FaTable style={{ display: "inline", marginRight: "var(--spacing-2)" }} />
            CSV Import
          </button>
        </div>
      </div>

      {inputMethod === "form" ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(1, 1fr)", gap: "var(--spacing-4)" }} className="md:grid-cols-2">
            <div style={{ marginBottom: "var(--spacing-4)" }}>
              <label style={{ display: "block", color: "var(--color-text-body)", marginBottom: "var(--spacing-2)", fontSize: "var(--font-size-base)", fontWeight: "var(--font-weight-medium)" }}>Number of Floors</label>
              <input
                type="number"
                name="floors"
                value={unitConfig.floors}
                onChange={handleChange}
                min="1"
                style={{
                  width: "100%",
                  padding: "var(--input-padding)",
                  border: `var(--border-1) solid var(--input-border)`,
                  borderRadius: "var(--input-radius)",
                  fontSize: "var(--font-size-base)",
                  color: "var(--color-text-primary)",
                  backgroundColor: "var(--input-bg)",
                  outline: "none",
                  transition: "var(--transition-colors)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--input-border-focus)"
                  e.currentTarget.style.boxShadow = "var(--input-focus-ring)"
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--input-border)"
                  e.currentTarget.style.boxShadow = "none"
                }}
              />
            </div>

            <div style={{ marginBottom: "var(--spacing-4)" }}>
              <label style={{ display: "block", color: "var(--color-text-body)", marginBottom: "var(--spacing-2)", fontSize: "var(--font-size-base)", fontWeight: "var(--font-weight-medium)" }}>Default Rooms per Unit</label>
              <input
                type="number"
                name="defaultRoomsPerUnit"
                value={unitConfig.defaultRoomsPerUnit}
                onChange={handleChange}
                min="1"
                style={{
                  width: "100%",
                  padding: "var(--input-padding)",
                  border: `var(--border-1) solid var(--input-border)`,
                  borderRadius: "var(--input-radius)",
                  fontSize: "var(--font-size-base)",
                  color: "var(--color-text-primary)",
                  backgroundColor: "var(--input-bg)",
                  outline: "none",
                  transition: "var(--transition-colors)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--input-border-focus)"
                  e.currentTarget.style.boxShadow = "var(--input-focus-ring)"
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--input-border)"
                  e.currentTarget.style.boxShadow = "none"
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "var(--spacing-4)" }}>
            <h5 style={{ color: "var(--color-text-body)", marginBottom: "var(--spacing-2)", fontSize: "var(--font-size-base)", fontWeight: "var(--font-weight-medium)" }}>Floor wise Units:</h5>
            {Array.from({ length: unitConfig.floors }, (_, i) => {
              const floor = i + 1
              return (
                <div key={floor} style={{ marginBottom: "var(--spacing-2)" }}>
                  <label style={{ display: "block", color: "var(--color-text-body)", fontSize: "var(--font-size-sm)", marginBottom: "var(--spacing-1)", fontWeight: "var(--font-weight-medium)" }}>{`Floor ${floor}`}</label>
                  <input
                    type="number"
                    name={`floor-${floor}`}
                    value={unitConfig.unitsPerFloor[floor] || ""}
                    onChange={handleChange}
                    min="1"
                    style={{
                      width: "100%",
                      padding: "var(--input-padding)",
                      border: `var(--border-1) solid var(--input-border)`,
                      borderRadius: "var(--input-radius)",
                      fontSize: "var(--font-size-base)",
                      color: "var(--color-text-primary)",
                      backgroundColor: "var(--input-bg)",
                      outline: "none",
                      transition: "var(--transition-colors)",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "var(--input-border-focus)"
                      e.currentTarget.style.boxShadow = "var(--input-focus-ring)"
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "var(--input-border)"
                      e.currentTarget.style.boxShadow = "none"
                    }}
                  />
                </div>
              )
            })}
          </div>

          <div style={{ marginBottom: "var(--spacing-4)" }}>
            <label style={{ display: "block", color: "var(--color-text-body)", marginBottom: "var(--spacing-2)", fontSize: "var(--font-size-base)", fontWeight: "var(--font-weight-medium)" }}>Standard Room Capacity</label>
            <input
              type="number"
              name="standardCapacity"
              value={unitConfig.standardCapacity}
              onChange={handleChange}
              min="1"
              style={{
                width: "100%",
                padding: "var(--input-padding)",
                border: `var(--border-1) solid var(--input-border)`,
                borderRadius: "var(--input-radius)",
                fontSize: "var(--font-size-base)",
                color: "var(--color-text-primary)",
                backgroundColor: "var(--input-bg)",
                outline: "none",
                transition: "var(--transition-colors)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--input-border-focus)"
                e.currentTarget.style.boxShadow = "var(--input-focus-ring)"
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--input-border)"
                e.currentTarget.style.boxShadow = "none"
              }}
            />
          </div>

          <div style={{ marginTop: "var(--spacing-4)" }}>
            <div style={{ backgroundColor: "var(--color-primary-bg)", padding: "var(--spacing-3)", borderRadius: "var(--radius-lg)", marginBottom: "var(--spacing-2)" }}>
              <h5 style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-primary)" }}>Unit Room Exceptions</h5>
              <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>Override default rooms per unit for a specific unit</p>
            </div>
            {unitConfig.exceptions.map((ex, index) => (
              <div key={index} style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "var(--spacing-4)", marginBottom: "var(--spacing-2)" }}>
                <input
                  type="text"
                  placeholder="Unit Number (e.g., 101)"
                  value={ex.unitNumber}
                  onChange={(e) => handleExceptionChange(index, "unitNumber", e.target.value)}
                  style={{
                    padding: "var(--input-padding)",
                    border: `var(--border-1) solid var(--input-border)`,
                    borderRadius: "var(--input-radius)",
                    fontSize: "var(--font-size-base)",
                    color: "var(--color-text-primary)",
                    backgroundColor: "var(--input-bg)",
                    outline: "none",
                    transition: "var(--transition-colors)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--input-border-focus)"
                    e.currentTarget.style.boxShadow = "var(--input-focus-ring)"
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "var(--input-border)"
                    e.currentTarget.style.boxShadow = "none"
                  }}
                />
                <input
                  type="number"
                  placeholder="Rooms in Unit"
                  value={ex.roomsOverride}
                  onChange={(e) => handleExceptionChange(index, "roomsOverride", e.target.value)}
                  min="1"
                  style={{
                    padding: "var(--input-padding)",
                    border: `var(--border-1) solid var(--input-border)`,
                    borderRadius: "var(--input-radius)",
                    fontSize: "var(--font-size-base)",
                    color: "var(--color-text-primary)",
                    backgroundColor: "var(--input-bg)",
                    outline: "none",
                    transition: "var(--transition-colors)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--input-border-focus)"
                    e.currentTarget.style.boxShadow = "var(--input-focus-ring)"
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "var(--input-border)"
                    e.currentTarget.style.boxShadow = "none"
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeException(index)}
                  style={{
                    gridColumn: "span 2",
                    color: "var(--color-danger)",
                    fontSize: "var(--font-size-sm)",
                    fontWeight: "var(--font-weight-medium)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "var(--spacing-1)",
                    transition: "var(--transition-colors)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--color-danger-hover)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--color-danger)"
                  }}
                >
                  Remove Exception
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addException}
              style={{
                marginTop: "var(--spacing-2)",
                padding: "var(--spacing-1) var(--spacing-3)",
                backgroundColor: "var(--color-success-bg)",
                color: "var(--color-success-text)",
                borderRadius: "var(--radius-lg)",
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--font-weight-medium)",
                border: "none",
                cursor: "pointer",
                transition: "var(--transition-colors)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-success-bg-light)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-success-bg)"
              }}
            >
              Add Exception
            </button>
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
