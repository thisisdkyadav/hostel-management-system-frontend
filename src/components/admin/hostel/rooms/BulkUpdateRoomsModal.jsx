import React, { useState } from "react"
import { Modal, Checkbox, Alert, VStack, HStack } from "@/components/ui"
import { Button, StatusBadge, Table } from "czero/react"
import CsvUploader from "../../../common/CsvUploader"
import { TriangleAlert, Upload } from "lucide-react"
import { hostelApi } from "../../../../service"

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
    <Modal isOpen={show} onClose={onClose} title="Bulk Update Rooms" width={800}>
      <VStack gap="large">
        <Alert type="warning" icon={<TriangleAlert size={16} />}>
          <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Important Warnings</h3>
          <div style={{ fontSize: 'var(--font-size-sm)' }}>
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
        </Alert>

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

        <CsvUploader onDataParsed={handleCsvDataParsed} requiredFields={requiredFields} templateFileName={isUnitBased ? "update_unit_rooms_template.csv" : "update_rooms_template.csv"} templateHeaders={requiredFields} instructionText={templateInstructions} maxRecords={1000} />

        {parsedCsvData.length > 0 && (
          <VStack gap="medium">
            <div style={{ backgroundColor: 'var(--color-primary-bg)', padding: 'var(--spacing-4) var(--spacing-4)', borderRadius: 'var(--radius-lg)' }}>
              <h5 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-primary-dark)' }}>CSV Data Preview</h5>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginTop: 'var(--spacing-1)' }}>
                Ready to update {parsedCsvData.length} room(s) in {hostel.name}
              </p>
            </div>

            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>ID</Table.Head>
                  {isUnitBased && <Table.Head>Unit</Table.Head>}
                  <Table.Head>Room</Table.Head>
                  <Table.Head>Capacity</Table.Head>
                  <Table.Head>Status</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {parsedCsvData.slice(0, 5).map((room, index) => (
                  <Table.Row key={index}>
                    <Table.Cell>{room.id}</Table.Cell>
                    {isUnitBased && <Table.Cell>{room.unitNumber}</Table.Cell>}
                    <Table.Cell>{room.roomNumber}</Table.Cell>
                    <Table.Cell>{room.capacity}</Table.Cell>
                    <Table.Cell>
                      <StatusBadge status={room.status} />
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
            {parsedCsvData.length > 5 && <div style={{ padding: 'var(--spacing-3) var(--spacing-6)', backgroundColor: 'var(--table-header-bg)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Showing 5 of {parsedCsvData.length} rooms</div>}

            <VStack gap="medium">
              <Checkbox
                id="confirm-delete"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                label="I understand that updating these rooms will delete all associated allocations"
              />

              <HStack justify="end" gap="small">
                <Button variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleBulkUpdate} disabled={!confirmed || parsedCsvData.length === 0}>
                  <Upload size={16} />
                  Update {parsedCsvData.length} Room(s)
                </Button>
              </HStack>
            </VStack>
          </VStack>
        )}
      </VStack>
    </Modal>
  )
}

export default BulkUpdateRoomsModal
