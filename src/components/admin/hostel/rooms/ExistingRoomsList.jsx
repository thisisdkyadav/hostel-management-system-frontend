import React, { useState, useEffect } from "react"
import { Pencil, Trash2, Search, Filter, FileUp } from "lucide-react"
import { Input, Select, IconButton, VStack, HStack, StatusBadge } from "@/components/ui"
import { Button, Table } from "czero/react"
import EditRoomModal from "./EditRoomModal"
import BulkUpdateRoomsModal from "./BulkUpdateRoomsModal"
import { adminApi } from "../../../../service"
import { hostelApi } from "../../../../service"

const ExistingRoomsList = ({ hostel, onRoomsUpdated, setIsLoading }) => {
  const [rooms, setRooms] = useState([])
  const [filteredRooms, setFilteredRooms] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const isUnitBased = hostel.type === "unit-based"

  useEffect(() => {
    fetchRooms()
  }, [hostel])

  useEffect(() => {
    applyFilters()
  }, [rooms, searchTerm, statusFilter])

  const fetchRooms = async () => {
    try {
      setIsLoading(true)

      const response = await hostelApi.getRoomsForEdit(hostel.id)
      if (response?.success) {
        setRooms(response.data)
        setFilteredRooms(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch rooms:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...rooms]

    if (searchTerm) {
      filtered = filtered.filter((room) => {
        const roomIdentifier = isUnitBased ? `${room.unitNumber}-${room.roomNumber}` : room.roomNumber
        return roomIdentifier.toLowerCase().includes(searchTerm.toLowerCase())
      })
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((room) => room.status === statusFilter)
    }

    setFilteredRooms(filtered)
  }

  const handleEditRoom = (room) => {
    setSelectedRoom(room)
    setShowEditModal(true)
  }

  const handleRoomUpdated = async (updatedRoom) => {
    try {
      setIsLoading(true)
      const response = await hostelApi.updateRoom(hostel.id, updatedRoom.id, updatedRoom)
      if (response?.success) {
        setRooms((prev) => prev.map((room) => (room.id === updatedRoom.id ? updatedRoom : room)))
        onRoomsUpdated()
      }
    } catch (error) {
      console.error("Failed to update room:", error)
    } finally {
      setIsLoading(false)
      setShowEditModal(false)
    }
  }

  const handleDeleteRoom = async () => {
    if (!confirmDelete) return

    try {
      setIsLoading(true)
      const response = await adminApi.deleteRoom(hostel.id, confirmDelete)
      if (response?.success) {
        setRooms((prev) => prev.filter((room) => room.id !== confirmDelete))
        onRoomsUpdated()
      }
    } catch (error) {
      console.error("Failed to delete room:", error)
    } finally {
      setIsLoading(false)
      setConfirmDelete(null)
    }
  }

  const handleBulkUpdateComplete = () => {
    fetchRooms()
    onRoomsUpdated()
  }

  return (
    <VStack gap="medium">
      <HStack gap="small" justify="between" align="center" wrap>
        <HStack gap="small" style={{ flex: 1 }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <Input type="text" placeholder={`Search ${isUnitBased ? "units/rooms" : "rooms"}...`} icon={<Search size={16} />} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          <div style={{ minWidth: '150px' }}>
            <Select icon={<Filter size={16} />} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={[{ value: "all", label: "All Status" }, { value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }, { value: "Maintenance", label: "Maintenance" }]} />
          </div>
        </HStack>

        <Button variant="secondary" size="sm" onClick={() => setShowBulkUpdateModal(true)}>
          <FileUp size={16} />
          Bulk Update via CSV
        </Button>
      </HStack>

      {filteredRooms.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-8)', backgroundColor: 'var(--color-bg-hover)', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ color: 'var(--color-text-muted)' }}>No rooms found. Add rooms or adjust your filters.</p>
        </div>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              {isUnitBased && <Table.Head>Unit</Table.Head>}
              <Table.Head>Room</Table.Head>
              <Table.Head>Capacity</Table.Head>
              <Table.Head>Status</Table.Head>
              <Table.Head>Actions</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filteredRooms.map((room) => (
              <Table.Row key={room.id}>
                {isUnitBased && <Table.Cell>{room.unitNumber}</Table.Cell>}
                <Table.Cell>{room.roomNumber}</Table.Cell>
                <Table.Cell>{room.capacity}</Table.Cell>
                <Table.Cell>
                  <StatusBadge status={room.status} />
                </Table.Cell>
                <Table.Cell>
                  <IconButton
                    onClick={() => handleEditRoom(room)}
                    variant="ghost"
                    size="sm"
                    icon={<Pencil size={16} />}
                    ariaLabel="Edit room"
                  />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}

      {showEditModal && <EditRoomModal room={selectedRoom} isUnitBased={isUnitBased} onSave={handleRoomUpdated} onDelete={handleDeleteRoom} onClose={() => setShowEditModal(false)} />}

      {showBulkUpdateModal && <BulkUpdateRoomsModal show={showBulkUpdateModal} onClose={() => setShowBulkUpdateModal(false)} hostel={hostel} onRoomsUpdated={handleBulkUpdateComplete} setIsLoading={setIsLoading} />}
    </VStack>
  )
}

export default ExistingRoomsList
