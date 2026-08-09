import React, { useState, useEffect } from "react"
import CsvUploader from "../../common/CsvUploader"
import RoomStatsSummary from "./RoomStatsSummary"
import { Button, Grid, Heading, HStack, Input, Label, Surface, Text, VStack } from "hzero"
import { MAX_BULK_RECORDS } from "@/constants/systemLimits"
import { Pencil, Table2 } from "lucide-react"

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
      <Text weight="medium" style={{ marginBottom: "var(--spacing-1)" }}>Field Input Types:</Text>
      <Grid as="ul" cols={2} gap="0" style={{ columnGap: "var(--spacing-4)", rowGap: "var(--spacing-1)" }}>
        <li>
          <Text as="span" weight="medium">unitNumber:</Text> String (e.g., 101)
        </li>
        <li>
          <Text as="span" weight="medium">roomNumber:</Text> String (e.g., A)
        </li>
        <li>
          <Text as="span" weight="medium">capacity:</Text> Number
        </li>
      </Grid>
    </div>
  )

  return (
    <div>
      <HStack gap="none" justify="center" style={{ marginBottom: "var(--spacing-6)" }}>
        <div style={{ display: "inline-flex", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-sm)" }} role="group">
          <Button
            type="button"
            variant={inputMethod === "form" ? "primary" : "white"}
            size="md"
            onClick={() => setInputMethod("form")}
            style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
          >
            <Pencil size="1em" />
            Form Input
          </Button>
          <Button
            type="button"
            variant={inputMethod === "csv" ? "primary" : "white"}
            size="md"
            onClick={() => setInputMethod("csv")}
            style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
          >
            <Table2 size="1em" />
            CSV Import
          </Button>
        </div>
      </HStack>

      {inputMethod === "form" ? (
        <>
          <Grid cols={{ base: 1, md: 2 }} gap={4}>
            <VStack gap="xsmall" style={{ marginBottom: "var(--spacing-4)" }}>
              <Label htmlFor="floors">Number of Floors</Label>
              <Input id="floors" type="number" name="floors" value={unitConfig.floors} onChange={handleChange} min="1" />
            </VStack>

            <VStack gap="xsmall" style={{ marginBottom: "var(--spacing-4)" }}>
              <Label htmlFor="defaultRoomsPerUnit">Default Rooms per Unit</Label>
              <Input id="defaultRoomsPerUnit" type="number" name="defaultRoomsPerUnit" value={unitConfig.defaultRoomsPerUnit} onChange={handleChange} min="1" />
            </VStack>
          </Grid>

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
            <Surface bg="brand" padding={3} radius="lg" style={{ marginBottom: "var(--spacing-2)" }}>
              <Heading as="h5" size="sm" weight="medium" color="brand">Unit Room Exceptions</Heading>
              <Text size="xs" color="muted">Override default rooms per unit for a specific unit</Text>
            </Surface>
            {unitConfig.exceptions.map((ex, index) => (
              <Grid cols={2} gap={4} style={{ marginBottom: "var(--spacing-2)" }} key={index}>
                <Input type="text" placeholder="Unit Number (e.g., 101)" value={ex.unitNumber} onChange={(e) => handleExceptionChange(index, "unitNumber", e.target.value)} />
                <Input type="number" placeholder="Rooms in Unit" value={ex.roomsOverride} onChange={(e) => handleExceptionChange(index, "roomsOverride", e.target.value)} min="1" />
                <Button
                  type="button"
                  onClick={() => removeException(index)}
                  variant="danger"
                  size="sm"
                  className="col-span-2"
                >
                  Remove Exception
                </Button>
              </Grid>
            ))}
            <Button
              type="button"
              onClick={addException}
              variant="success"
              size="sm"
            >
              Add Exception
            </Button>
          </div>

          <Surface bg="brand" padding={3} radius="lg" style={{ marginTop: "var(--spacing-4)" }}>
            <Text size="sm" color="body">
              This will create {unitConfig.floors} floors with custom units per floor and {unitConfig.defaultRoomsPerUnit} rooms per unit by default.
            </Text>
            <Text size="sm" color="body" style={{ marginTop: "var(--spacing-2)" }}>
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
            </Text>
          </Surface>
        </>
      ) : (
        <VStack gap={6}>
          <CsvUploader onDataParsed={handleCsvDataParsed} requiredFields={requiredFields} templateFileName="unit_based_rooms_template.csv" templateHeaders={["unitNumber", "roomNumber", "capacity"]} instructionText={templateInstructions} maxRecords={MAX_BULK_RECORDS} />

          {parsedCsvData.length > 0 && (
            <div style={{ marginTop: "var(--spacing-4)" }}>
              <Surface bg="brand" padding={3} radius="lg" style={{ marginBottom: "var(--spacing-3)" }}>
                <Heading as="h5" size="sm" weight="medium" color="brand">Imported Room Data Summary</Heading>
              </Surface>
              <RoomStatsSummary data={parsedCsvData} isUnitBased={true} />
            </div>
          )}
        </VStack>
      )}
    </div>
  )
}

export default UnitBasedForm
