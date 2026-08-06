import React, { useState } from "react"
import CsvUploader from "../../../common/CsvUploader"
import RoomStatsSummary from "../../forms/RoomStatsSummary"
import { Alert, Grid, Heading, HStack, Surface, Text, VStack } from "@/components/ui"
import { Button } from "czero/react"
import { Upload } from "lucide-react"
import { hostelApi } from "../../../../service"
import { MANUAL_ROOM_STATUSES } from "@/constants/roomStatus"

const AddRoomsCsv = ({ hostel, onRoomsUpdated, setIsLoading }) => {
  const [parsedCsvData, setParsedCsvData] = useState([])
  const [successMessage, setSuccessMessage] = useState("")
  const [error, setError] = useState("")

  const isUnitBased = hostel.type === "unit-based"

  const handleCsvDataParsed = (data) => {
    const processedData = data.map((room) => ({
      unitNumber: isUnitBased ? room.unitNumber || "" : undefined,
      roomNumber: (room.roomNumber || "").toString(),
      capacity: parseInt(room.capacity) || 1,
      status: MANUAL_ROOM_STATUSES.includes(room.status) ? room.status : "Active",
    }))

    setParsedCsvData(processedData)
    setSuccessMessage("")
    setError("")
  }

  const handleAddRooms = async () => {
    if (parsedCsvData.length === 0) {
      setError("No rooms to add. Please upload a CSV file first.")
      return
    }

    setIsLoading(true)

    try {
      // Unit-based hostels need the set of units the rooms belong to; the backend
      // reuses existing units and creates any that are missing.
      const units = isUnitBased
        ? [...new Set(parsedCsvData.map((room) => room.unitNumber).filter(Boolean))].map((unitNumber) => ({ unitNumber }))
        : undefined

      const response = await hostelApi.addRooms(hostel.id, {
        rooms: parsedCsvData,
        units,
      })

      if (response?.success) {
        setSuccessMessage(`Successfully added ${parsedCsvData.length} room(s)`)
        onRoomsUpdated()
        setParsedCsvData([])
      } else {
        setError("Failed to add rooms. Please try again.")
      }
    } catch (error) {
      setError(error.message || "Failed to add rooms. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const requiredFields = isUnitBased ? ["unitNumber", "roomNumber", "capacity", "status"] : ["roomNumber", "capacity", "status"]

  const templateInstructions = (
    <div>
      <Text weight="medium" style={{ marginBottom: 'var(--spacing-1)' }}>Field Input Types:</Text>
      <Grid as="ul" cols={2} gap="0" style={{ columnGap: 'var(--spacing-4)', rowGap: 'var(--spacing-1)' }}>
        {isUnitBased && (
          <li>
            <Text as="span" weight="medium">unitNumber:</Text> String (e.g., 101)
          </li>
        )}
        <li>
          <Text as="span" weight="medium">roomNumber:</Text> {isUnitBased ? "String (e.g., A)" : "String (e.g., 101)"}
        </li>
        <li>
          <Text as="span" weight="medium">capacity:</Text> Number
        </li>
        <li>
          <Text as="span" weight="medium">status:</Text> One of: {MANUAL_ROOM_STATUSES.join(", ")}
        </li>
      </Grid>
    </div>
  )

  return (
    <VStack gap="large">
      {successMessage && (
        <Alert type="success" icon>
          {successMessage}
        </Alert>
      )}

      {error && (
        <Alert type="error" icon>
          {error}
        </Alert>
      )}

      <CsvUploader onDataParsed={handleCsvDataParsed} requiredFields={requiredFields} templateFileName={isUnitBased ? "unit_based_rooms_template.csv" : "room_only_template.csv"} templateHeaders={requiredFields} instructionText={templateInstructions} maxRecords={1000} />

      {parsedCsvData.length > 0 && (
        <VStack gap="medium">
          <Surface bg="brand" padding="var(--spacing-3) var(--spacing-3)" radius="lg">
            <Heading as="h5" size="sm" weight="medium" color="var(--color-primary-dark)">CSV Data Preview</Heading>
            <Text size="xs" color="tertiary" style={{ marginTop: 'var(--spacing-1)' }}>Review the rooms that will be added to {hostel.name}</Text>
          </Surface>

          <RoomStatsSummary data={parsedCsvData} isUnitBased={isUnitBased} />

          <HStack justify="end" style={{ paddingTop: 'var(--spacing-2)' }}>
            <Button onClick={handleAddRooms} variant="primary" size="md">
              <Upload size={16} />
              Add {parsedCsvData.length} Room(s)
            </Button>
          </HStack>
        </VStack>
      )}
    </VStack>
  )
}

export default AddRoomsCsv
