import React, { useState, useEffect } from "react"
import { FaEdit, FaTrash, FaSearch, FaFilter, FaFileUpload } from "react-icons/fa"
import Button from "../../../common/Button"
import Input from "../../../common/ui/Input"
import Select from "../../../common/ui/Select"
import EditRoomModal from "./EditRoomModal"
import BulkUpdateRoomsModal from "./BulkUpdateRoomsModal"
import { adminApi } from "../../../../services/apiService"
import { hostelApi } from "../../../../services/hostelApi"

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 'var(--spacing-3)', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 'var(--spacing-3)', flex: 1 }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <Input type="text" placeholder={`Search ${isUnitBased ? "units/rooms" : "rooms"}...`} icon={<FaSearch />} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          <div style={{ minWidth: '150px' }}>
            <Select icon={<FaFilter />} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={[{ value: "all", label: "All Status" }, { value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }, { value: "Maintenance", label: "Maintenance" }]} />
          </div>
        </div>

        <Button variant="secondary" size="small" onClick={() => setShowBulkUpdateModal(true)} icon={<FaFileUpload />}>
          Bulk Update via CSV
        </Button>
      </div>

      {filteredRooms.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-8)', backgroundColor: 'var(--color-bg-hover)', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ color: 'var(--color-text-muted)' }}>No rooms found. Add rooms or adjust your filters.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: 'var(--table-header-bg)' }}>
              <tr>
                {isUnitBased && <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wider)' }}>Unit</th>}
                <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wider)' }}>Room</th>
                <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wider)' }}>Capacity</th>
                <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wider)' }}>Status</th>
                <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wider)' }}>Actions</th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: 'var(--color-bg-primary)' }}>
              {filteredRooms.map((room) => (
                <tr key={room.id} style={{ borderTop: 'var(--border-1) solid var(--color-border-primary)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-primary)'}>
                  {isUnitBased && <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>{room.unitNumber}</td>}
                  <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>{room.roomNumber}</td>
                  <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>{room.capacity}</td>
                  <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: 'var(--spacing-0-5) var(--spacing-2-5)', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', backgroundColor: room.status === "Active" ? 'var(--color-success-bg)' : room.status === "Inactive" ? 'var(--color-bg-hover)' : 'var(--color-warning-bg)', color: room.status === "Active" ? 'var(--color-success-text)' : room.status === "Inactive" ? 'var(--color-text-secondary)' : 'var(--color-warning-text)' }}>{room.status}</span>
                  </td>
                  <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                    <Button
                      onClick={() => handleEditRoom(room)}
                      variant="ghost"
                      size="small"
                      icon={<FaEdit />}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showEditModal && <EditRoomModal room={selectedRoom} isUnitBased={isUnitBased} onSave={handleRoomUpdated} onDelete={handleDeleteRoom} onClose={() => setShowEditModal(false)} />}

      {showBulkUpdateModal && <BulkUpdateRoomsModal show={showBulkUpdateModal} onClose={() => setShowBulkUpdateModal(false)} hostel={hostel} onRoomsUpdated={handleBulkUpdateComplete} setIsLoading={setIsLoading} />}
    </div>
  )
}

export default ExistingRoomsList
