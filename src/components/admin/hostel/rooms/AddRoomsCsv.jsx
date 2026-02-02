import React, { useState } from "react"
import CsvUploader from "../../../common/CsvUploader"
import RoomStatsSummary from "../../forms/RoomStatsSummary"
import { Alert, VStack, HStack } from "@/components/ui"
import { Button } from "czero/react"
import { Upload } from "lucide-react"
import { adminApi } from "../../../../service"

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
      status: ["Active", "Inactive", "Maintenance"].includes(room.status) ? room.status : "Active",
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
      const response = await adminApi.addRooms(hostel.id, parsedCsvData)

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
      <p style={{ fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-1)' }}>Field Input Types:</p>
      <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', columnGap: 'var(--spacing-4)', rowGap: 'var(--spacing-1)' }}>
        {isUnitBased && (
          <li>
            <span style={{ fontWeight: 'var(--font-weight-medium)' }}>unitNumber:</span> String (e.g., 101)
          </li>
        )}
        <li>
          <span style={{ fontWeight: 'var(--font-weight-medium)' }}>roomNumber:</span> {isUnitBased ? "String (e.g., A)" : "String (e.g., 101)"}
        </li>
        <li>
          <span style={{ fontWeight: 'var(--font-weight-medium)' }}>capacity:</span> Number
        </li>
        <li>
          <span style={{ fontWeight: 'var(--font-weight-medium)' }}>status:</span> "Active", "Inactive", or "Maintenance"
        </li>
      </ul>
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
          <div style={{ backgroundColor: 'var(--color-primary-bg)', padding: 'var(--spacing-3) var(--spacing-3)', borderRadius: 'var(--radius-lg)' }}>
            <h5 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-primary-dark)' }}>CSV Data Preview</h5>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginTop: 'var(--spacing-1)' }}>Review the rooms that will be added to {hostel.name}</p>
          </div>

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
