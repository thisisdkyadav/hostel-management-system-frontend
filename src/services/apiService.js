const fetchOptions = {
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
}

// const baseUrl = "https://hostel-management-system-backend-and4hrevaag3f5gs.centralindia-01.azurewebsites.net/api"
const baseUrl = "http://localhost:5000/api"
// const baseUrl = "https://9m64jhxk-5000.inc1.devtunnels.ms/api"

export const authApi = {
  verify: async () => {
    const response = await fetch(`${baseUrl}/auth/user`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      throw new Error("Authentication verification failed")
    }

    return response.json()
  },

  login: async (credentials) => {
    const response = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Login failed")
    }

    return response.json()
  },

  loginWithGoogle: async (token) => {
    console.log("Google token:", token)

    const response = await fetch(`${baseUrl}/auth/google`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify({ token }),
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Google login failed")
    }

    return response.json()
  },

  logout: async () => {
    const response = await fetch(`${baseUrl}/auth/logout`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      throw new Error("Logout failed on server")
    }

    return response.json()
  },

  changePassword: async (oldPassword, newPassword) => {
    const response = await fetch(`${baseUrl}/auth/update-password`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify({ oldPassword, newPassword }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to update password")
    }

    return response.json()
  },
}

export const studentApi = {
  importStudents: async (students) => {
    const response = await fetch(`${baseUrl}/student/profiles`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify(students),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.log("Error importing students:", errorData)

      throw new Error(errorData.message || "Failed to import students")
    }

    return response.json()
  },

  getStudents: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString()
    const url = `${baseUrl}/student/profiles${queryParams ? `?${queryParams}` : ""}`

    const response = await fetch(url, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch students")
    }

    return response.json()
  },

  getStudentDetails: async (userID) => {
    const response = await fetch(`${baseUrl}/student/profile/details/${userID}`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch student details")
    }

    return response.json()
  },

  submitRoomChangeRequest: async (requestData) => {
    const response = await fetch(`${baseUrl}/student/room-change`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify(requestData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to submit room change request")
    }

    return response.json()
  },

  getStudent: async () => {
    const response = await fetch(`${baseUrl}/student/profile`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch student profile")
    }

    return response.json()
  },

  updateStudent: async (userId, studentData) => {
    const response = await fetch(`${baseUrl}/student/profile/${userId}`, {
      method: "PUT",
      ...fetchOptions,
      body: JSON.stringify(studentData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to update student profile")
    }

    return response.json()
  },

  updateStudents: async (students) => {
    const response = await fetch(`${baseUrl}/student/profiles`, {
      method: "PUT",
      ...fetchOptions,
      body: JSON.stringify(students),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to update students")
    }

    return response.json()
  },

  getStudentsByIds: async (userIds) => {
    const response = await fetch(`${baseUrl}/student/profiles/ids`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify({ userIds }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch students by IDs")
    }

    return response.json()
  },

  getStudentDashboard: async () => {
    const response = await fetch(`${baseUrl}/student/dashboard`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch student dashboard data")
    }

    return response.json()
  },

  submitFeedback: async (title, description) => {
    const response = await fetch(`${baseUrl}/feedback/add`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify({ title, description }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to submit feedback")
    }

    return response.json()
  },
}

export const wardenApi = {
  getProfile: async () => {
    const response = await fetch(`${baseUrl}/warden/profile`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch warden profile")
    }

    return response.json()
  },

  updateProfile: async (profileData) => {
    const response = await fetch(`${baseUrl}/warden/profile/update`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify(profileData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to update warden profile")
    }

    return response.json()
  },

  getFeedbacks: async (hostelId) => {
    const response = await fetch(`${baseUrl}/feedback/all/${hostelId}`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch feedbacks")
    }

    return response.json()
  },

  updateFeedbackStatus: async (feedbackId, status) => {
    const response = await fetch(`${baseUrl}/feedback/update-status/${feedbackId}`, {
      method: "PUT",
      ...fetchOptions,
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to update feedback status")
    }

    return response.json()
  },
}

export const securityApi = {
  getSecurityInfo: async () => {
    const response = await fetch(`${baseUrl}/security`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch security info")
    }

    return response.json()
  },

  getVisitors: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString()
    const url = `${baseUrl}/security/visitors${queryParams ? `?${queryParams}` : ""}`

    const response = await fetch(url, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch visitors")
    }

    return response.json()
  },

  addVisitor: async (visitorData) => {
    const response = await fetch(`${baseUrl}/security/visitors`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify(visitorData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to add visitor")
    }

    return response.json()
  },

  updateVisitor: async (visitorId, visitorData) => {
    const response = await fetch(`${baseUrl}/security/visitors/${visitorId}`, {
      method: "PUT",
      ...fetchOptions,
      body: JSON.stringify(visitorData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to update visitor")
    }

    return response.json()
  },

  addStudentEntry: async (entryData) => {
    const response = await fetch(`${baseUrl}/security/entries`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify(entryData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to add student entry")
    }

    return response.json()
  },

  getRecentStudentEntries: async () => {
    const response = await fetch(`${baseUrl}/security/entries/recent`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch recent student entries")
    }

    return response.json()
  },

  updateStudentEntry: async (entryData) => {
    const response = await fetch(`${baseUrl}/security/entries/${entryData._id}`, {
      method: "PUT",
      ...fetchOptions,
      body: JSON.stringify(entryData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to update student entry")
    }

    return response.json()
  },

  getStudentEntries: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString()
    const url = `${baseUrl}/security/entries${queryParams ? `?${queryParams}` : ""}`

    const response = await fetch(url, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch student entries")
    }

    return response.json()
  },
}

export const maintenanceApi = {
  // Complaints
  getComplaints: async (queries) => {
    const response = await fetch(`${baseUrl}/complaint/all?${queries}`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch complaints")
    }

    return response.json()
  },

  updateComplaintStatus: async (id, status) => {
    try {
      const response = await fetch(`${baseUrl}/complaint/update-status/${id}`, {
        method: "PUT",
        ...fetchOptions,
        body: JSON.stringify({ status }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update complaint status")
      }
      return await response.json()
    } catch (error) {
      console.error("Error updating complaint status:", error)
      throw error
    }
  },

  // Statistics
  getStats: async () => {
    try {
      const response = await fetch(`${baseUrl}/complaint/stats`, {
        method: "GET",
        ...fetchOptions,
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch stats")
      }
      return await response.json()
    } catch (error) {
      console.error("Error fetching maintenance stats:", error)
      // Return fallback stats in case of failure
      return {
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0,
      }
    }
  },
}

export const adminApi = {
  getAllHostels: async () => {
    const response = await fetch(`${baseUrl}/admin/hostels`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch hostels")
    }

    const data = await response.json()

    return data
  },

  addHostel: async (hostelData) => {
    const response = await fetch(`${baseUrl}/admin/hostel`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify(hostelData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to add hostel")
    }

    return response.json()
  },

  updateHostel: async (hostelId, hostelData) => {
    const response = await fetch(`${baseUrl}/admin/hostel/${hostelId}`, {
      method: "PUT",
      ...fetchOptions,
      body: JSON.stringify(hostelData),
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to update hostel")
    }
    return response.json()
  },

  getHostelList: async () => {
    const response = await fetch(`${baseUrl}/admin/hostel/list`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch hostels")
    }

    return response.json()
  },

  addWarden: async (wardenData) => {
    const response = await fetch(`${baseUrl}/admin/warden`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify(wardenData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to add warden")
    }

    return response.json()
  },

  getAllWardens: async () => {
    const response = await fetch(`${baseUrl}/admin/wardens`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch wardens")
    }

    const data = await response.json()
    console.log("Fetched wardens:", data)

    return data
  },
  updateWarden: async (wardenId, wardenData) => {
    const response = await fetch(`${baseUrl}/admin/warden/${wardenId}`, {
      method: "PUT",
      ...fetchOptions,
      body: JSON.stringify(wardenData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to update warden")
    }

    return response.json()
  },
  deleteWarden: async (wardenId) => {
    const response = await fetch(`${baseUrl}/admin/warden/${wardenId}`, {
      method: "DELETE",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to delete warden")
    }

    return response.json()
  },

  getAllComplaints: async (queries) => {
    const response = await fetch(`${baseUrl}/complaint/all?${queries}`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch complaints")
    }

    return response.json()
  },

  addSecurity: async (securityData) => {
    const response = await fetch(`${baseUrl}/admin/security`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify(securityData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to add security")
    }

    return response.json()
  },

  getAllSecurityLogins: async () => {
    const response = await fetch(`${baseUrl}/admin/security`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch security staff")
    }

    return response.json()
  },

  updateSecurity: async (securityId, securityData) => {
    const response = await fetch(`${baseUrl}/admin/security/${securityId}`, {
      method: "PUT",
      ...fetchOptions,
      body: JSON.stringify(securityData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to update security staff")
    }

    return response.json()
  },

  deleteSecurity: async (securityId) => {
    const response = await fetch(`${baseUrl}/admin/security/${securityId}`, {
      method: "DELETE",
      ...fetchOptions,
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to delete security staff")
    }
    return response.json()
  },

  updateUserPassword: async (email, newPassword) => {
    const response = await fetch(`${baseUrl}/admin/user/update-password`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify({ email, newPassword }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to update password")
    }

    return response.json()
  },

  getAllMaintenanceStaff: async () => {
    const response = await fetch(`${baseUrl}/admin/maintenance`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch maintenance staff")
    }

    return response.json()
  },
  addMaintenanceStaff: async (maintenanceData) => {
    const response = await fetch(`${baseUrl}/admin/maintenance`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify(maintenanceData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to add maintenance staff")
    }

    return response.json()
  },
  updateMaintenanceStaff: async (maintenanceId, maintenanceData) => {
    const response = await fetch(`${baseUrl}/admin/maintenance/${maintenanceId}`, {
      method: "PUT",
      ...fetchOptions,
      body: JSON.stringify(maintenanceData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to update maintenance staff")
    }

    return response.json()
  },
  deleteMaintenanceStaff: async (maintenanceId) => {
    const response = await fetch(`${baseUrl}/admin/maintenance/${maintenanceId}`, {
      method: "DELETE",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to delete maintenance staff")
    }

    return response.json()
  },
}

export const lostAndFoundApi = {
  addLostItem: async (itemData) => {
    const response = await fetch(`${baseUrl}/lost-and-found`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify(itemData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to add lost item")
    }

    return response.json()
  },
  getAllLostItems: async () => {
    const response = await fetch(`${baseUrl}/lost-and-found`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch lost items")
    }

    return response.json()
  },

  updateLostItem: async (itemId, itemData) => {
    const response = await fetch(`${baseUrl}/lost-and-found/${itemId}`, {
      method: "PUT",
      ...fetchOptions,
      body: JSON.stringify(itemData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to update lost item")
    }

    return response.json()
  },

  deleteLostItem: async (itemId) => {
    const response = await fetch(`${baseUrl}/lost-and-found/${itemId}`, {
      method: "DELETE",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to delete lost item")
    }

    return response.json()
  },
}

export const eventsApi = {
  getAllEvents: async () => {
    const response = await fetch(`${baseUrl}/event`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch events")
    }

    return response.json()
  },

  addEvent: async (eventData) => {
    const response = await fetch(`${baseUrl}/event`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify(eventData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to add event")
    }

    return response.json()
  },

  updateEvent: async (eventId, eventData) => {
    const response = await fetch(`${baseUrl}/event/${eventId}`, {
      method: "PUT",
      ...fetchOptions,
      body: JSON.stringify(eventData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to update event")
    }

    return response.json()
  },
  deleteEvent: async (eventId) => {
    const response = await fetch(`${baseUrl}/event/${eventId}`, {
      method: "DELETE",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to delete event")
    }

    return response.json()
  },
}

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
}

export const statsApi = {
  getHostelStats: async () => {
    const response = await fetch(`${baseUrl}/stats/hostel`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch hostel stats")
    }

    return response.json()
  },

  getSecurityStats: async () => {
    const response = await fetch(`${baseUrl}/stats/security`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch security stats")
    }

    return response.json()
  },

  getMaintenanceStaffStats: async () => {
    const response = await fetch(`${baseUrl}/stats/maintenancestaff`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch maintenance stats")
    }

    return response.json()
  },

  getVisitorStats: async (hostelId) => {
    const response = await fetch(`${baseUrl}/stats/visitor/${hostelId}`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch visitor stats")
    }

    return response.json()
  },

  getEventStats: async (hostelId) => {
    const response = await fetch(`${baseUrl}/stats/event/${hostelId}`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch event stats")
    }

    return response.json()
  },

  getLostAndFoundStats: async () => {
    const response = await fetch(`${baseUrl}/stats/lostandfound`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch lost and found stats")
    }

    return response.json()
  },

  getRoomChangeRequestsStats: async (hostelId) => {
    const response = await fetch(`${baseUrl}/stats/room-change-requests/${hostelId}`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch room change requests stats")
    }

    const data = await response.json()
    console.log("Room change requests stats:", data)

    return data
  },

  getWardenStats: async () => {
    const response = await fetch(`${baseUrl}/stats/wardens`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch warden stats")
    }

    return response.json()
  },

  getComplaintsStats: async () => {
    const response = await fetch(`${baseUrl}/stats/complaints`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch complaints stats")
    }

    return response.json()
  },
}

export const alertApi = {
  sendAlert: async (alertType, triggeredBy) => {
    const response = await fetch(`${baseUrl}/alerts/create`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify({ alertType, triggeredBy }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to send alert");
    }

    return response.json();
  },

  getAlerts: async (userId) => {
    const response = await fetch(`${baseUrl}/alerts/${userId}`, {
      method: "GET",
      ...fetchOptions,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch alerts");
    }

    return response.json();
  },
};

export default {
  auth: authApi,
  student: studentApi,
  warden: wardenApi,
  security: securityApi,
  maintenance: maintenanceApi,
  admin: adminApi,
  alert: alertApi,
}
