import React, { useState } from "react"
import CsvUploader from "../../../common/CsvUploader"
import RoomStatsSummary from "../../forms/RoomStatsSummary"
import Button from "../../../common/Button"
import { FaUpload } from "react-icons/fa"
import { adminApi } from "../../../../services/apiService"

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
      {successMessage && (
        <div style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success-text)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'flex-start' }}>
          <svg xmlns="http://www.w3.org/2000/svg" style={{ height: 'var(--icon-lg)', width: 'var(--icon-lg)', marginRight: 'var(--spacing-2)', marginTop: 'var(--spacing-0-5)', flexShrink: 0 }} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {successMessage}
        </div>
      )}

      {error && (
        <div style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger-text)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'flex-start' }}>
          <svg xmlns="http://www.w3.org/2000/svg" style={{ height: 'var(--icon-lg)', width: 'var(--icon-lg)', marginRight: 'var(--spacing-2)', marginTop: 'var(--spacing-0-5)', flexShrink: 0 }} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <CsvUploader onDataParsed={handleCsvDataParsed} requiredFields={requiredFields} templateFileName={isUnitBased ? "unit_based_rooms_template.csv" : "room_only_template.csv"} templateHeaders={requiredFields} instructionText={templateInstructions} maxRecords={1000} />

      {parsedCsvData.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          <div style={{ backgroundColor: 'var(--color-primary-bg)', padding: 'var(--spacing-3) var(--spacing-3)', borderRadius: 'var(--radius-lg)' }}>
            <h5 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-primary-dark)' }}>CSV Data Preview</h5>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginTop: 'var(--spacing-1)' }}>Review the rooms that will be added to {hostel.name}</p>
          </div>

          <RoomStatsSummary data={parsedCsvData} isUnitBased={isUnitBased} />

          <div style={{ paddingTop: 'var(--spacing-2)', display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={handleAddRooms} variant="primary" size="medium" icon={<FaUpload />} animation="ripple">
              Add {parsedCsvData.length} Room(s)
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AddRoomsCsv
