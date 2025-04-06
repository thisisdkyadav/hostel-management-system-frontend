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
      console.log("Fetching rooms for hostel:", hostel.id)

      const response = await hostelApi.getRoomsForEdit(hostel.id)
      console.log("Fetched rooms:", response)

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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-end">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={`Search ${isUnitBased ? "units/rooms" : "rooms"}...`}
              className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaFilter className="text-gray-400" />
            </div>
            <select className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none appearance-none bg-white" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Maintenance">Maintenance</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <Button variant="secondary" size="small" onClick={() => setShowBulkUpdateModal(true)} icon={<FaFileUpload />} className="whitespace-nowrap">
          Bulk Update via CSV
        </Button>
      </div>

      {filteredRooms.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No rooms found. Add rooms or adjust your filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {isUnitBased && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRooms.map((room) => (
                <tr key={room.id} className="hover:bg-gray-50">
                  {isUnitBased && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{room.unitNumber}</td>}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{room.roomNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{room.capacity}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${room.status === "Active" ? "bg-green-100 text-green-800" : room.status === "Inactive" ? "bg-gray-100 text-gray-800" : "bg-yellow-100 text-yellow-800"}`}>{room.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button onClick={() => handleEditRoom(room)} className="text-blue-600 hover:text-blue-800">
                      <FaEdit />
                    </button>
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
