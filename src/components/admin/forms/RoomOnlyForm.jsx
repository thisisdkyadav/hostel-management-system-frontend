import React, { useState } from "react"
import CsvUploader from "../../common/CsvUploader"
import RoomStatsSummary from "./RoomStatsSummary"
import { Grid, Heading, HStack, Label, Surface, Text, VStack } from "@/components/ui"
import { Button, Input } from "hzero"
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
      <Text weight="medium" style={{ marginBottom: "var(--spacing-1)" }}>Field Input Types:</Text>
      <Grid as="ul" cols={2} gap="0" style={{ columnGap: "var(--spacing-4)", rowGap: "var(--spacing-1)" }}>
        <li>
          <Text as="span" weight="medium">roomNumber:</Text> String (e.g., 101)
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
            <FaEdit />
            Form Input
          </Button>
          <Button
            type="button"
            variant={inputMethod === "csv" ? "primary" : "white"}
            size="md"
            onClick={() => setInputMethod("csv")}
            style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
          >
            <FaTable />
            CSV Import
          </Button>
        </div>
      </HStack>

      {inputMethod === "form" ? (
        <>
          <Grid cols={{ base: 1, md: 2 }} gap={4}>
            <VStack gap="xsmall" style={{ marginBottom: "var(--spacing-4)" }}>
              <Label htmlFor="floors">Number of Floors</Label>
              <Input id="floors" type="number" name="floors" value={roomConfig.floors} onChange={handleChange} min="1" />
            </VStack>

            <VStack gap="xsmall" style={{ marginBottom: "var(--spacing-4)" }}>
              <Label htmlFor="defaultRoomsPerFloor">Default Rooms per Floor</Label>
              <Input id="defaultRoomsPerFloor" type="number" name="defaultRoomsPerFloor" value={roomConfig.defaultRoomsPerFloor} onChange={handleChange} min="1" />
              <Text size="xs" color="placeholder" style={{ marginTop: "var(--spacing-1)" }}>Room numbers will be generated as 101, 102... (Ground floor), 201, 202... (First floor)</Text>
            </VStack>
          </Grid>

          <VStack gap="xsmall" style={{ marginBottom: "var(--spacing-4)" }}>
            <Label htmlFor="standardCapacity">Standard Room Capacity</Label>
            <Input id="standardCapacity" type="number" name="standardCapacity" value={roomConfig.standardCapacity} onChange={handleChange} min="1" />
          </VStack>

          <div style={{ marginTop: "var(--spacing-4)" }}>
            <Surface bg="brand" padding={3} radius="lg" style={{ marginBottom: "var(--spacing-2)" }}>
              <Heading as="h5" size="sm" weight="medium" color="brand">Floor Room Exceptions</Heading>
              <Text size="xs" color="muted">Override default rooms per floor for a specific floor</Text>
            </Surface>
            {roomConfig.exceptions.map((ex, index) => (
              <Grid cols={2} gap={4} style={{ marginBottom: "var(--spacing-2)" }} key={index}>
                <Input type="number" placeholder="Floor Number" value={ex.floor} onChange={(e) => handleExceptionChange(index, "floor", e.target.value)} min="1" />
                <Input type="number" placeholder="Rooms on Floor" value={ex.roomsOverride} onChange={(e) => handleExceptionChange(index, "roomsOverride", e.target.value)} min="1" />
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
              This will create {roomConfig.floors} floors with {roomConfig.defaultRoomsPerFloor} rooms per floor by default.
            </Text>
            <Text size="sm" color="body" style={{ marginTop: "var(--spacing-2)" }}>Total capacity: {roomConfig.floors * roomConfig.defaultRoomsPerFloor * roomConfig.standardCapacity} students (exceptions may override room counts)</Text>
          </Surface>
        </>
      ) : (
        <VStack gap={6}>
          <CsvUploader onDataParsed={handleCsvDataParsed} requiredFields={requiredFields} templateFileName="room_only_template.csv" templateHeaders={["roomNumber", "capacity"]} instructionText={templateInstructions} />

          {parsedCsvData.length > 0 && (
            <div style={{ marginTop: "var(--spacing-4)" }}>
              <Surface bg="brand" padding={3} radius="lg" style={{ marginBottom: "var(--spacing-3)" }}>
                <Heading as="h5" size="sm" weight="medium" color="brand">Imported Room Data Summary</Heading>
              </Surface>
              <RoomStatsSummary data={parsedCsvData} isUnitBased={false} />
            </div>
          )}
        </VStack>
      )}
    </div>
  )
}

export default RoomOnlyForm
