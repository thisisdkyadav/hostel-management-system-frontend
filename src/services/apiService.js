const fetchOptions = {
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
}

const baseUrl = "http://localhost:5000/api"

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
      method: "POST",
      ...fetchOptions,
    })

    if (!response.ok) {
      throw new Error("Logout failed on server")
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

  getStudentDetails: async (studentId) => {
    const response = await fetch(`${baseUrl}/student/profile/details/${studentId}`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch student details")
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
}

export const securityApi = {
  getSecurityInfo: async () => {
    const response = await fetch(`${baseUrl}/security/info`, {
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
}

export const maintenanceApi = {
  // Complaints
  getComplaints: async () => {
    const response = await fetch(`${baseUrl}/complaint/all`, {
      method: "GET",
      ...fetchOptions,
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch complaints")
    }
    const data = await response.json()
    console.log("Fetched complaints:", data)
    return data
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
    const response = await fetch(`${baseUrl}/admin/hostel/add`, {
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
    const response = await fetch(`${baseUrl}/admin/warden/add`, {
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
    const response = await fetch(`${baseUrl}/admin/warden/update/${wardenId}`, {
      method: "POST",
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
    const response = await fetch(`${baseUrl}/admin/warden/delete/${wardenId}`, {
      method: "DELETE",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to delete warden")
    }

    return response.json()
  },

  getAllComplaints: async () => {
    const response = await fetch(`${baseUrl}/complaint/all`, {
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
    const response = await fetch(`${baseUrl}/admin/security/add`, {
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
    const response = await fetch(`${baseUrl}/admin/security/update/${securityId}`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify(securityData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to update security staff")
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

export default {
  auth: authApi,
  student: studentApi,
  warden: wardenApi,
  security: securityApi,
  maintenance: maintenanceApi,
  admin: adminApi,
}
