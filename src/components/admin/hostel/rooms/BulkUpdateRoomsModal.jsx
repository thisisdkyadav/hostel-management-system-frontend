import React, { useState } from "react"
import Modal from "../../../common/Modal"
import CsvUploader from "../../../common/CsvUploader"
import Button from "../../../common/Button"
import Checkbox from "../../../common/ui/Checkbox"
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
      <p style={{ fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-1)' }}>Field Input Types:</p>
      <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', columnGap: 'var(--spacing-4)', rowGap: 'var(--spacing-1)' }}>
        {isUnitBased && (
          <li>
            <span style={{ fontWeight: 'var(--font-weight-medium)' }}>unitNumber:</span> String (e.g., 101) <span style={{ color: 'var(--color-danger)' }}>*</span>
          </li>
        )}
        <li>
          <span style={{ fontWeight: 'var(--font-weight-medium)' }}>roomNumber:</span> {isUnitBased ? "String (e.g., A)" : "String (e.g., 101)"} <span style={{ color: 'var(--color-danger)' }}>*</span>
        </li>
        <li>
          <span style={{ fontWeight: 'var(--font-weight-medium)' }}>capacity:</span> Number (optional)
        </li>
        <li>
          <span style={{ fontWeight: 'var(--font-weight-medium)' }}>status:</span> "Active" or "Inactive" (optional)
        </li>
      </ul>
      <p style={{ fontSize: 'var(--font-size-xs)', marginTop: 'var(--spacing-2)' }}>
        <span style={{ color: 'var(--color-danger)' }}>*</span> Required fields
      </p>
    </div>
  )

  if (!show) return null

  return (
    <Modal title="Bulk Update Rooms" onClose={onClose} width={800}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
        <div style={{ backgroundColor: 'var(--color-warning-bg-light)', borderLeft: 'var(--border-4) solid var(--color-warning)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={{ flexShrink: 0 }}>
              <FaExclamationTriangle style={{ height: 'var(--icon-lg)', width: 'var(--icon-lg)', color: 'var(--color-warning-hover)' }} />
            </div>
            <div style={{ marginLeft: 'var(--spacing-3)' }}>
              <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-warning-text)' }}>Important Warnings</h3>
              <div style={{ marginTop: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)', color: 'var(--color-warning-text)' }}>
                <p>
                  <strong>1. Allocation Loss:</strong> Updating rooms will <strong>delete all allocations</strong> associated with these rooms. This action cannot be undone.
                </p>
                <p style={{ marginTop: 'var(--spacing-1)' }}>
                  <strong>2. Update Limitations:</strong> Only one attribute can be updated for a room at a time. If data is provided for multiple attributes, priority will be given to status changes.
                </p>
                <p style={{ marginTop: 'var(--spacing-1)' }}>
                  <strong>3. Capacity Restrictions:</strong> The capacity of a room cannot be changed if the room is inactive.
                </p>
                <p style={{ marginTop: 'var(--spacing-1)' }}>Please ensure you have backed up any necessary allocation data before proceeding.</p>
              </div>
            </div>
          </div>
        </div>

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

        <CsvUploader onDataParsed={handleCsvDataParsed} requiredFields={requiredFields} templateFileName={isUnitBased ? "update_unit_rooms_template.csv" : "update_rooms_template.csv"} templateHeaders={requiredFields} instructionText={templateInstructions} maxRecords={1000} />

        {parsedCsvData.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
            <div style={{ backgroundColor: 'var(--color-primary-bg)', padding: 'var(--spacing-4) var(--spacing-4)', borderRadius: 'var(--radius-lg)' }}>
              <h5 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-primary-dark)' }}>CSV Data Preview</h5>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginTop: 'var(--spacing-1)' }}>
                Ready to update {parsedCsvData.length} room(s) in {hostel.name}
              </p>
            </div>

            <div style={{ overflowX: 'auto', backgroundColor: 'var(--color-bg-primary)', border: 'var(--border-1) solid var(--color-border-primary)', borderRadius: 'var(--radius-lg)' }}>
              <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: 'var(--table-header-bg)' }}>
                  <tr>
                    <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wider)' }}>ID</th>
                    {isUnitBased && <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wider)' }}>Unit</th>}
                    <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wider)' }}>Room</th>
                    <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wider)' }}>Capacity</th>
                    <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wider)' }}>Status</th>
                  </tr>
                </thead>
                <tbody style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                  {parsedCsvData.slice(0, 5).map((room, index) => (
                    <tr key={index} style={{ borderTop: 'var(--border-1) solid var(--color-border-primary)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-primary)'}>
                      <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>{room.id}</td>
                      {isUnitBased && <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>{room.unitNumber}</td>}
                      <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>{room.roomNumber}</td>
                      <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>{room.capacity}</td>
                      <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', padding: 'var(--spacing-0-5) var(--spacing-2-5)', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', backgroundColor: room.status === "Active" ? 'var(--color-success-bg)' : room.status === "Inactive" ? 'var(--color-bg-hover)' : 'var(--color-warning-bg)', color: room.status === "Active" ? 'var(--color-success-text)' : room.status === "Inactive" ? 'var(--color-text-secondary)' : 'var(--color-warning-text)' }}>{room.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedCsvData.length > 5 && <div style={{ padding: 'var(--spacing-3) var(--spacing-6)', backgroundColor: 'var(--table-header-bg)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Showing 5 of {parsedCsvData.length} rooms</div>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              <Checkbox
                id="confirm-delete"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                label="I understand that updating these rooms will delete all associated allocations"
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-3)' }}>
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
