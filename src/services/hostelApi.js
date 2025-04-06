import { baseUrl, fetchOptions } from "../constants/appConstants"

export const hostelApi = {
  getUnits: async (hostelId) => {
    const response = await fetch(`${baseUrl}/hostel/units/${hostelId}`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch units")
    }

    return response.json()
  },

  getRoomsByUnit: async (unitId) => {
    const response = await fetch(`${baseUrl}/hostel/rooms/${unitId}`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch rooms")
    }

    return response.json()
  },

  allocateRoom: async (allocationData) => {
    const response = await fetch(`${baseUrl}/hostel/allocate`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify(allocationData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.log("Error allocating room:", errorData)

      throw new Error(errorData.message || "Failed to allocate room")
    }

    return response.json()
  },

  updateRoomStatus: async (roomId, status) => {
    const response = await fetch(`${baseUrl}/hostel/rooms/${roomId}/status`, {
      method: "PUT",
      ...fetchOptions,
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to update room status")
    }

    return response.json()
  },

  deallocateRoom: async (allocationId) => {
    const response = await fetch(`${baseUrl}/hostel/deallocate/${allocationId}`, {
      method: "DELETE",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to deallocate room")
    }

    return response.json()
  },

  getRoomChangeRequests: async (hostelId, filters = {}) => {
    console.log("Fetching room change requests for hostel:", hostelId, "with filters:", filters)

    const queryParams = new URLSearchParams(filters).toString()
    const url = `${baseUrl}/hostel/room-change-requests/${hostelId}${queryParams ? `?${queryParams}` : ""}`

    const response = await fetch(url, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch room change requests")
    }

    return response.json()
  },

  getRoomChangeRequestById: async (requestId) => {
    const response = await fetch(`${baseUrl}/hostel/room-change-request/${requestId}`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch room change request")
    }

    return response.json()
  },

  approveRoomChangeRequest: async (requestId, bedNumber) => {
    const response = await fetch(`${baseUrl}/hostel/room-change-request/approve/${requestId}`, {
      method: "PUT",
      ...fetchOptions,
      body: JSON.stringify({ bedNumber }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to approve room change request")
    }

    return response.json()
  },

  rejectRoomChangeRequest: async (requestId, reason) => {
    const response = await fetch(`${baseUrl}/hostel/room-change-request/reject/${requestId}`, {
      method: "PUT",
      ...fetchOptions,
      body: JSON.stringify({ reason }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to reject room change request")
    }

    return response.json()
  },

  getRooms: async (query) => {
    const queryParams = new URLSearchParams(query).toString()
    const response = await fetch(`${baseUrl}/hostel/rooms-room-only${queryParams ? `?${queryParams}` : ""}`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch rooms")
    }

    return response.json()
  },

  updateRoomAllocations: async (allocationData, hostelId) => {
    const response = await fetch(`${baseUrl}/hostel/update-allocations/${hostelId}`, {
      method: "PUT",
      ...fetchOptions,
      body: JSON.stringify(allocationData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to update room allocations")
    }

    return response.json()
  },

  getRoomsForEdit: async (hostelId) => {
    const response = await fetch(`${baseUrl}/hostel/rooms/${hostelId}/edit`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch rooms")
    }

    return response.json()
  },

  updateRoom: async (hostelId, roomId, roomData) => {
    const response = await fetch(`${baseUrl}/hostel/rooms/${hostelId}/${roomId}`, {
      method: "PUT",
      ...fetchOptions,
      body: JSON.stringify(roomData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to update room")
    }

    return response.json()
  },

  addRooms: async (hostelId, data) => {
    const response = await fetch(`${baseUrl}/hostel/rooms/${hostelId}/add`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to add rooms")
    }

    return response.json()
  },

  bulkUpdateRooms: async (hostelId, rooms) => {
    const response = await fetch(`${baseUrl}/hostel/rooms/${hostelId}/bulk-update`, {
      method: "PUT",
      ...fetchOptions,
      body: JSON.stringify({ rooms }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to bulk update rooms")
    }

    return response.json()
  },
}
