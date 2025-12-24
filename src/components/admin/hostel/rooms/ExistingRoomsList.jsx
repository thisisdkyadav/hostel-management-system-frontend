import React, { useState, useEffect } from "react"
import { FaEdit, FaTrash, FaSearch, FaFilter, FaFileUpload } from "react-icons/fa"
import Button from "../../../common/Button"
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
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 'var(--spacing-3)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
              <FaSearch style={{ color: 'var(--color-text-muted)' }} />
            </div>
            <input type="text" placeholder={`Search ${isUnitBased ? "units/rooms" : "rooms"}...`} style={{ paddingLeft: 'var(--spacing-10)', paddingRight: 'var(--spacing-3)', paddingTop: 'var(--spacing-2)', paddingBottom: 'var(--spacing-2)', width: '100%', border: 'var(--border-1) solid var(--color-border-input)', borderRadius: 'var(--radius-lg)', outline: 'none', transition: 'var(--transition-all)' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--color-primary)'; }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--color-border-input)'; }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ position: 'relative', minWidth: '150px' }}>
            <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 'var(--spacing-3)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
              <FaFilter style={{ color: 'var(--color-text-muted)' }} />
            </div>
            <select style={{ paddingLeft: 'var(--spacing-10)', paddingRight: 'var(--spacing-8)', paddingTop: 'var(--spacing-2)', paddingBottom: 'var(--spacing-2)', width: '100%', border: 'var(--border-1) solid var(--color-border-input)', borderRadius: 'var(--radius-lg)', outline: 'none', appearance: 'none', backgroundColor: 'var(--color-bg-primary)', transition: 'var(--transition-all)' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--color-primary)'; }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--color-border-input)'; }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Maintenance">Maintenance</option>
            </select>
            <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: 'var(--spacing-2)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
              <svg style={{ width: 'var(--icon-md)', height: 'var(--icon-md)', color: 'var(--color-text-muted)' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <Button variant="secondary" size="small" onClick={() => setShowBulkUpdateModal(true)} icon={<FaFileUpload />} style={{ whiteSpace: 'nowrap' }}>
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
