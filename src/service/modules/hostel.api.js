/**
 * Hostel API Module
 * Handles hostel units, rooms, allocations, and room change requests
 */

import apiClient from "../core/apiClient"

export const hostelApi = {
  /**
   * Get units for a hostel
   * @param {string} hostelId - Hostel ID
   */
  getUnits: (hostelId) => {
    return apiClient.get(`/hostel/units/${hostelId}`)
  },

  /**
   * Get rooms by unit
   * @param {string} unitId - Unit ID
   */
  getRoomsByUnit: (unitId) => {
    return apiClient.get(`/hostel/rooms/${unitId}`)
  },

  /**
   * Get rooms by unit for allocation UI
   * @param {string} unitId - Unit ID
   */
  getAllocationRoomsByUnit: (unitId) => {
    return apiClient.get(`/hostel/rooms/${unitId}`).then((response) => response?.data || [])
  },

  /**
   * Allocate room to student
   * @param {Object} allocationData - Room allocation data
   */
  allocateRoom: (allocationData) => {
    return apiClient.post("/hostel/allocate", allocationData)
  },

  /**
   * Update room status
   * @param {string} roomId - Room ID
   * @param {string} status - New status
   */
  updateRoomStatus: (roomId, status) => {
    return apiClient.put(`/hostel/rooms/status/${roomId}`, { status })
  },

  /**
   * Deallocate room
   * @param {string} allocationId - Allocation ID
   */
  deallocateRoom: (allocationId) => {
    return apiClient.delete(`/hostel/deallocate/${allocationId}`)
  },

  /**
   * Get rooms with query
   * @param {Object} query - Query parameters
   */
  getRooms: (query = {}) => {
    return apiClient.get("/hostel/rooms-room-only", { params: query })
  },

  /**
   * Get room-only hostel rooms for allocation UI
   * @param {string} hostelId - Hostel ID
   */
  getAllocationRooms: (hostelId) => {
    return apiClient.get("/hostel/rooms-room-only", { params: { hostelId } }).then((response) => response?.data || [])
  },

  /**
   * Update room allocations for a hostel.
   * @param {Array|Object} allocationData - Allocation rows
   * @param {string} hostelId - Hostel ID
   * @param {Object} [options]
   * @param {"update"|"replace"} [options.mode="update"]
   *   - update: only change students in the provided list
   *   - replace: clear every allocation in the hostel, then apply the list
   */
  updateRoomAllocations: (allocationData, hostelId, options = {}) => {
    const mode = options.mode === "replace" ? "replace" : "update"
    const payload = {
      allocations: Array.isArray(allocationData) ? allocationData : [allocationData],
      mode,
    }

    return apiClient.put(`/hostel/update-allocations/${hostelId}`, payload).then((response) => ({
      success: response?.success === true,
      data: response?.data?.allocations || [],
      errors: response?.data?.errors || [],
      clearedCount: response?.data?.clearedCount || 0,
      mode: response?.data?.mode || mode,
      message: response?.message || null,
    }))
  },

  /**
   * Get rooms for editing
   * @param {string} hostelId - Hostel ID
   */
  getRoomsForEdit: (hostelId) => {
    return apiClient.get(`/hostel/rooms/${hostelId}/edit`)
  },

  /**
   * Update room
   * @param {string} hostelId - Hostel ID
   * @param {string} roomId - Room ID
   * @param {Object} roomData - Room data
   */
  updateRoom: (hostelId, roomId, roomData) => {
    return apiClient.put(`/hostel/rooms/${hostelId}/${roomId}`, roomData)
  },

  /**
   * Add rooms to hostel
   * @param {string} hostelId - Hostel ID
   * @param {Object} data - Rooms data
   */
  addRooms: (hostelId, data) => {
    return apiClient.post(`/hostel/rooms/${hostelId}/add`, data)
  },

  /**
   * Bulk update rooms
   * @param {string} hostelId - Hostel ID
   * @param {Array} rooms - Rooms data
   */
  bulkUpdateRooms: (hostelId, rooms) => {
    return apiClient.put(`/hostel/rooms/${hostelId}/bulk-update`, { rooms })
  },

  /**
   * Change hostel archive status
   * @param {string} hostelId - Hostel ID
   * @param {boolean} status - Archive status
   */
  changeArchiveStatus: (hostelId, status) => {
    return apiClient.put(`/hostel/archive/${hostelId}`, { status })
  },

  /**
   * Delete all allocations for a hostel
   * @param {string} hostelId - Hostel ID
   */
  deleteAllAllocations: (hostelId) => {
    return apiClient.delete(`/hostel/delete-all-allocations/${hostelId}`)
  },
}

export default hostelApi
