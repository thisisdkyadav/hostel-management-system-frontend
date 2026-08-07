import React, { useState } from "react"
import { Alert, Checkbox, Grid, Heading, HStack, Surface, Text, VStack } from "@/components/ui"
import { StatusBadge, Table } from "czero/react"
import { Button } from "hzero"
import { Modal } from "@/components/ui"
import CsvUploader from "../../../common/CsvUploader"
import { TriangleAlert, Upload } from "lucide-react"
import { hostelApi } from "../../../../service"
import { MANUAL_ROOM_STATUSES } from "@/constants/roomStatus"

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
      status: MANUAL_ROOM_STATUSES.includes(room.status) ? room.status : undefined,
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
      <Text weight="medium" style={{ marginBottom: 'var(--spacing-1)' }}>Field Input Types:</Text>
      <Grid as="ul" cols={2} gap="0" style={{ columnGap: 'var(--spacing-4)', rowGap: 'var(--spacing-1)' }}>
        {isUnitBased && (
          <li>
            <Text as="span" weight="medium">unitNumber:</Text> String (e.g., 101) <Text as="span" color="danger">*</Text>
          </li>
        )}
        <li>
          <Text as="span" weight="medium">roomNumber:</Text> {isUnitBased ? "String (e.g., A)" : "String (e.g., 101)"} <Text as="span" color="danger">*</Text>
        </li>
        <li>
          <Text as="span" weight="medium">capacity:</Text> Number (optional)
        </li>
        <li>
          <Text as="span" weight="medium">status:</Text> One of: {MANUAL_ROOM_STATUSES.join(", ")} (optional)
        </li>
      </Grid>
      <Text size="xs" style={{ marginTop: 'var(--spacing-2)' }}>
        <Text as="span" color="danger">*</Text> Required fields
      </Text>
    </div>
  )

  if (!show) return null

  return (
    <Modal isOpen={show} onClose={onClose} title="Bulk Update Rooms" width={800}>
      <VStack gap="large">
        <Alert type="warning" icon={<TriangleAlert size={16} />}>
          <Heading as="h3" size="sm" weight="medium" style={{ marginBottom: 'var(--spacing-2)' }}>Important Warnings</Heading>
          <Text as="div" size="sm">
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
          </Text>
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
            <Surface bg="brand" padding="var(--spacing-4) var(--spacing-4)" radius="lg">
              <Heading as="h5" size="sm" weight="medium" color="var(--color-primary-dark)">CSV Data Preview</Heading>
              <Text size="xs" color="tertiary" style={{ marginTop: 'var(--spacing-1)' }}>
                Ready to update {parsedCsvData.length} room(s) in {hostel.name}
              </Text>
            </Surface>

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
            {parsedCsvData.length > 5 && <Surface bg="var(--table-header-bg)" padding="var(--spacing-3) var(--spacing-6)" color="muted" size="xs">Showing 5 of {parsedCsvData.length} rooms</Surface>}

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
