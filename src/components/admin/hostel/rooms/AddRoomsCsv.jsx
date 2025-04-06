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
      <p className="font-medium mb-1">Field Input Types:</p>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
        {isUnitBased && (
          <li>
            <span className="font-medium">unitNumber:</span> String (e.g., 101)
          </li>
        )}
        <li>
          <span className="font-medium">roomNumber:</span> {isUnitBased ? "String (e.g., A)" : "String (e.g., 101)"}
        </li>
        <li>
          <span className="font-medium">capacity:</span> Number
        </li>
        <li>
          <span className="font-medium">status:</span> "Active", "Inactive", or "Maintenance"
        </li>
      </ul>
    </div>
  )

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg text-sm flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {successMessage}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <CsvUploader onDataParsed={handleCsvDataParsed} requiredFields={requiredFields} templateFileName={isUnitBased ? "unit_based_rooms_template.csv" : "room_only_template.csv"} templateHeaders={requiredFields} instructionText={templateInstructions} maxRecords={300} />

      {parsedCsvData.length > 0 && (
        <div className="space-y-4">
          <div className="bg-blue-50 px-3 py-2 rounded-lg">
            <h5 className="text-sm font-medium text-blue-800">CSV Data Preview</h5>
            <p className="text-xs text-gray-600 mt-1">Review the rooms that will be added to {hostel.name}</p>
          </div>

          <RoomStatsSummary data={parsedCsvData} isUnitBased={isUnitBased} />

          <div className="pt-2 flex justify-end">
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
