import React, { useState } from "react"
import Modal from "../../../common/Modal"
import CsvUploader from "../../../common/CsvUploader"
import Button from "../../../common/Button"
import { FaExclamationTriangle, FaUpload } from "react-icons/fa"
import { hostelApi } from "../../../../services/hostelApi"

const BulkUpdateRoomsModal = ({ show, onClose, hostel, onRoomsUpdated, setIsLoading }) => {
  const [parsedCsvData, setParsedCsvData] = useState([])
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const isUnitBased = hostel.type === "unit-based"

  const handleCsvDataParsed = (data) => {
    const processedData = data.map((room) => ({
      unitNumber: isUnitBased ? room.unitNumber || "" : undefined,
      roomNumber: (room.roomNumber || "").toString(),
      capacity: room.capacity ? parseInt(room.capacity) : undefined,
      status: ["Active", "Inactive"].includes(room.status) ? room.status : undefined,
    }))

    setParsedCsvData(processedData)
    setError("")
    setSuccessMessage("")
  }

  const handleBulkUpdate = async () => {
    if (parsedCsvData.length === 0) {
      setError("No rooms to update. Please upload a CSV file first.")
      return
    }

    if (!confirmed) {
      setError("Please confirm that you understand allocations will be deleted.")
      return
    }

    setIsLoading(true)

    try {
      const response = await hostelApi.bulkUpdateRooms(hostel.id, parsedCsvData)

      if (response?.success) {
        setSuccessMessage(`Successfully updated ${parsedCsvData.length} room(s)`)
        onRoomsUpdated()
        setTimeout(() => {
          onClose()
        }, 2000)
      } else {
        setError(response?.message || "Failed to update rooms. Please try again.")
      }
    } catch (error) {
      setError(error.message || "Failed to update rooms. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const requiredFields = [...(isUnitBased ? ["unitNumber"] : []), "roomNumber"]

  const templateInstructions = (
    <div>
      <p className="font-medium mb-1">Field Input Types:</p>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
        {isUnitBased && (
          <li>
            <span className="font-medium">unitNumber:</span> String (e.g., 101) <span className="text-red-600">*</span>
          </li>
        )}
        <li>
          <span className="font-medium">roomNumber:</span> {isUnitBased ? "String (e.g., A)" : "String (e.g., 101)"} <span className="text-red-600">*</span>
        </li>
        <li>
          <span className="font-medium">capacity:</span> Number (optional)
        </li>
        <li>
          <span className="font-medium">status:</span> "Active" or "Inactive" (optional)
        </li>
      </ul>
      <p className="text-xs mt-2">
        <span className="text-red-600">*</span> Required fields
      </p>
    </div>
  )

  if (!show) return null

  return (
    <Modal title="Bulk Update Rooms" onClose={onClose} width={800}>
      <div className="space-y-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Important Warnings</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  <strong>1. Allocation Loss:</strong> Updating rooms will <strong>delete all allocations</strong> associated with these rooms. This action cannot be undone.
                </p>
                <p className="mt-1">
                  <strong>2. Update Limitations:</strong> Only one attribute can be updated for a room at a time. If data is provided for multiple attributes, priority will be given to status changes.
                </p>
                <p className="mt-1">
                  <strong>3. Capacity Restrictions:</strong> The capacity of a room cannot be changed if the room is inactive.
                </p>
                <p className="mt-1">Please ensure you have backed up any necessary allocation data before proceeding.</p>
              </div>
            </div>
          </div>
        </div>

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

        <CsvUploader onDataParsed={handleCsvDataParsed} requiredFields={requiredFields} templateFileName={isUnitBased ? "update_unit_rooms_template.csv" : "update_rooms_template.csv"} templateHeaders={requiredFields} instructionText={templateInstructions} maxRecords={1000} />

        {parsedCsvData.length > 0 && (
          <div className="space-y-4">
            <div className="bg-blue-50 px-4 py-3 rounded-lg">
              <h5 className="text-sm font-medium text-blue-800">CSV Data Preview</h5>
              <p className="text-xs text-gray-600 mt-1">
                Ready to update {parsedCsvData.length} room(s) in {hostel.name}
              </p>
            </div>

            <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    {isUnitBased && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {parsedCsvData.slice(0, 5).map((room, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{room.id}</td>
                      {isUnitBased && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{room.unitNumber}</td>}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{room.roomNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{room.capacity}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${room.status === "Active" ? "bg-green-100 text-green-800" : room.status === "Inactive" ? "bg-gray-100 text-gray-800" : "bg-yellow-100 text-yellow-800"}`}>{room.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedCsvData.length > 5 && <div className="px-6 py-3 bg-gray-50 text-xs text-gray-500">Showing 5 of {parsedCsvData.length} rooms</div>}
            </div>

            <div className="flex flex-col space-y-4">
              <div className="flex items-center">
                <input type="checkbox" id="confirm-delete" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                <label htmlFor="confirm-delete" className="ml-2 block text-sm text-red-700 font-medium">
                  I understand that updating these rooms will delete all associated allocations
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleBulkUpdate} icon={<FaUpload />} disabled={!confirmed || parsedCsvData.length === 0}>
                  Update {parsedCsvData.length} Room(s)
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default BulkUpdateRoomsModal
