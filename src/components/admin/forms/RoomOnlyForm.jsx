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
      <p style={{ fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-1)" }}>Field Input Types:</p>
      <ul style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", columnGap: "var(--spacing-4)", rowGap: "var(--spacing-1)" }}>
        <li>
          <span style={{ fontWeight: "var(--font-weight-medium)" }}>roomNumber:</span> String (e.g., 101)
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
          <button type="button" style={{ padding: "var(--spacing-2) var(--spacing-4)", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", borderTopLeftRadius: "var(--radius-lg)", borderBottomLeftRadius: "var(--radius-lg)", backgroundColor: inputMethod === "form" ? "var(--color-primary)" : "var(--color-bg-primary)", color: inputMethod === "form" ? "var(--color-white)" : "var(--color-text-body)", border: `var(--border-1) solid var(--color-border-input)`, cursor: "pointer", transition: "var(--transition-colors)", }} onMouseEnter={(e) => {
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
          <button type="button" style={{ padding: "var(--spacing-2) var(--spacing-4)", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", borderTopRightRadius: "var(--radius-lg)", borderBottomRightRadius: "var(--radius-lg)", backgroundColor: inputMethod === "csv" ? "var(--color-primary)" : "var(--color-bg-primary)", color: inputMethod === "csv" ? "var(--color-white)" : "var(--color-text-body)", border: `var(--border-1) solid var(--color-border-input)`, cursor: "pointer", transition: "var(--transition-colors)", }} onMouseEnter={(e) => {
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
              <input type="number" name="floors" value={roomConfig.floors} onChange={handleChange} min="1" style={{ width: "100%", padding: "var(--input-padding)", border: `var(--border-1) solid var(--input-border)`, borderRadius: "var(--input-radius)", fontSize: "var(--font-size-base)", color: "var(--color-text-primary)", backgroundColor: "var(--input-bg)", outline: "none", transition: "var(--transition-colors)", }} onFocus={(e) => {
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
              <label style={{ display: "block", color: "var(--color-text-body)", marginBottom: "var(--spacing-2)", fontSize: "var(--font-size-base)", fontWeight: "var(--font-weight-medium)" }}>Default Rooms per Floor</label>
              <input type="number" name="defaultRoomsPerFloor" value={roomConfig.defaultRoomsPerFloor} onChange={handleChange} min="1" style={{ width: "100%", padding: "var(--input-padding)", border: `var(--border-1) solid var(--input-border)`, borderRadius: "var(--input-radius)", fontSize: "var(--font-size-base)", color: "var(--color-text-primary)", backgroundColor: "var(--input-bg)", outline: "none", transition: "var(--transition-colors)", }} onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--input-border-focus)"
                  e.currentTarget.style.boxShadow = "var(--input-focus-ring)"
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--input-border)"
                  e.currentTarget.style.boxShadow = "none"
                }}
              />
              <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-placeholder)", marginTop: "var(--spacing-1)" }}>Room numbers will be generated as 101, 102... (Ground floor), 201, 202... (First floor)</p>
            </div>
          </div>

          <div style={{ marginBottom: "var(--spacing-4)" }}>
            <label style={{ display: "block", color: "var(--color-text-body)", marginBottom: "var(--spacing-2)", fontSize: "var(--font-size-base)", fontWeight: "var(--font-weight-medium)" }}>Standard Room Capacity</label>
            <input type="number" name="standardCapacity" value={roomConfig.standardCapacity} onChange={handleChange} min="1" style={{ width: "100%", padding: "var(--input-padding)", border: `var(--border-1) solid var(--input-border)`, borderRadius: "var(--input-radius)", fontSize: "var(--font-size-base)", color: "var(--color-text-primary)", backgroundColor: "var(--input-bg)", outline: "none", transition: "var(--transition-colors)", }} onFocus={(e) => {
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
              <h5 style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-primary)" }}>Floor Room Exceptions</h5>
              <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>Override default rooms per floor for a specific floor</p>
            </div>
            {roomConfig.exceptions.map((ex, index) => (
              <div key={index} style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "var(--spacing-4)", marginBottom: "var(--spacing-2)" }}>
                <input type="number" placeholder="Floor Number" value={ex.floor} onChange={(e) => handleExceptionChange(index, "floor", e.target.value)}
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
                <input type="number" placeholder="Rooms on Floor" value={ex.roomsOverride} onChange={(e) => handleExceptionChange(index, "roomsOverride", e.target.value)}
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
                <button type="button" onClick={() => removeException(index)}
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
            <button type="button" onClick={addException} style={{ marginTop: "var(--spacing-2)", padding: "var(--spacing-1) var(--spacing-3)", backgroundColor: "var(--color-success-bg)", color: "var(--color-success-text)", borderRadius: "var(--radius-lg)", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", border: "none", cursor: "pointer", transition: "var(--transition-colors)", }} onMouseEnter={(e) => {
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
              This will create {roomConfig.floors} floors with {roomConfig.defaultRoomsPerFloor} rooms per floor by default.
            </p>
            <p style={{ fontSize: "var(--font-size-sm)", marginTop: "var(--spacing-2)", color: "var(--color-text-body)" }}>Total capacity: {roomConfig.floors * roomConfig.defaultRoomsPerFloor * roomConfig.standardCapacity} students (exceptions may override room counts)</p>
          </div>
        </>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-6)" }}>
          <CsvUploader onDataParsed={handleCsvDataParsed} requiredFields={requiredFields} templateFileName="room_only_template.csv" templateHeaders={["roomNumber", "capacity"]} instructionText={templateInstructions} />

          {parsedCsvData.length > 0 && (
            <div style={{ marginTop: "var(--spacing-4)" }}>
              <div style={{ backgroundColor: "var(--color-primary-bg)", padding: "var(--spacing-3)", borderRadius: "var(--radius-lg)", marginBottom: "var(--spacing-3)" }}>
                <h5 style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-primary)" }}>Imported Room Data Summary</h5>
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
