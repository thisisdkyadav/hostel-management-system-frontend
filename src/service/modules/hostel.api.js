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
   * Get room change requests for a hostel
   * @param {string} hostelId - Hostel ID
   * @param {Object} filters - Query filters
   */
  getRoomChangeRequests: (hostelId, filters = {}) => {
    return apiClient.get(`/hostel/room-change-requests/${hostelId}`, { params: filters })
  },

  /**
   * Get room change request by ID
   * @param {string} requestId - Request ID
   */
  getRoomChangeRequestById: (requestId) => {
    return apiClient.get(`/hostel/room-change-request/${requestId}`)
  },

  /**
   * Approve room change request
   * @param {string} requestId - Request ID
   * @param {string} bedNumber - Assigned bed number
   */
  approveRoomChangeRequest: (requestId, bedNumber) => {
    return apiClient.put(`/hostel/room-change-request/approve/${requestId}`, { bedNumber })
  },

  /**
   * Reject room change request
   * @param {string} requestId - Request ID
   * @param {string} reason - Rejection reason
   */
  rejectRoomChangeRequest: (requestId, reason) => {
    return apiClient.put(`/hostel/room-change-request/reject/${requestId}`, { reason })
  },

  /**
   * Get rooms with query
   * @param {Object} query - Query parameters
   */
  getRooms: (query = {}) => {
    return apiClient.get("/hostel/rooms-room-only", { params: query })
  },

  /**
   * Update room allocations
   * @param {Object} allocationData - Allocation data
   * @param {string} hostelId - Hostel ID
   */
  updateRoomAllocations: (allocationData, hostelId) => {
    return apiClient.put(`/hostel/update-allocations/${hostelId}`, allocationData)
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
