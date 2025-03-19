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

export const studentApi = {}

export const wardenApi = {}

export const guardApi = {}

export const maintenanceApi = {
  // Complaints
  getComplaints: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString()
      const url = `${baseUrl}/maintenance/complaints${queryParams ? `?${queryParams}` : ""}`

      const response = await fetch(url, {
        method: "GET",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch complaints")
      }

      const data = await response.json()

      // If no complaints are returned, provide sample data for development
      if (!data || data.length === 0) {
        return [
          {
            id: 1,
            title: "Broken Window",
            category: "Civil",
            description: "Broken Window due to storm. Glass shards need to be cleaned up and window frame needs repair. This is a safety hazard for students.",
            priority: "High",
            status: "In Progress",
            location: "Block E - Room 103",
            date: "Mar 18, 2025, 8:46 PM",
            assignedTo: "John Doe",
          },
          {
            id: 2,
            title: "Water Leakage",
            category: "Water",
            description: "Water leaking from ceiling in bathroom. The leak is causing mold growth and damage to the ceiling tiles. Floor is slippery and dangerous.",
            priority: "Medium",
            status: "Pending",
            location: "Block E - Room 105",
            date: "Mar 18, 2025, 6:46 PM",
            assignedTo: "Unassigned",
          },
          {
            id: 3,
            title: "Electrical Socket Not Working",
            category: "Electrical",
            description: "The wall socket near the desk is not working. Students cannot charge their devices or use desk lamps.",
            priority: "Low",
            status: "Pending",
            location: "Block D - Room 201",
            date: "Mar 17, 2025, 2:30 PM",
            assignedTo: "Unassigned",
          },
        ]
      }

      return data
    } catch (error) {
      console.error("Error fetching complaints:", error)

      // Return sample data for development/demo
      return [
        {
          id: 1,
          title: "Broken Window",
          category: "Civil",
          description: "Broken Window due to storm. Glass shards need to be cleaned up and window frame needs repair. This is a safety hazard for students.",
          priority: "High",
          status: "In Progress",
          location: "Block E - Room 103",
          date: "Mar 18, 2025, 8:46 PM",
          assignedTo: "John Doe",
        },
        {
          id: 2,
          title: "Water Leakage",
          category: "Water",
          description: "Water leaking from ceiling in bathroom. The leak is causing mold growth and damage to the ceiling tiles. Floor is slippery and dangerous.",
          priority: "Medium",
          status: "Pending",
          location: "Block E - Room 105",
          date: "Mar 18, 2025, 6:46 PM",
          assignedTo: "Unassigned",
        },
        {
          id: 3,
          title: "Electrical Socket Not Working",
          category: "Electrical",
          description: "The wall socket near the desk is not working. Students cannot charge their devices or use desk lamps.",
          priority: "Low",
          status: "Pending",
          location: "Block D - Room 201",
          date: "Mar 17, 2025, 2:30 PM",
          assignedTo: "Unassigned",
        },
      ]
    }
  },

  getComplaintById: async (id) => {
    try {
      const response = await fetch(`${baseUrl}/maintenance/complaints/${id}`, {
        method: "GET",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to fetch complaint with id ${id}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Error fetching complaint with id ${id}:`, error)
      throw error
    }
  },

  updateComplaintStatus: async (id, status) => {
    try {
      const response = await fetch(`${baseUrl}/maintenance/complaints/${id}/status`, {
        method: "PATCH",
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

  assignComplaint: async (id, assigneeId) => {
    try {
      const response = await fetch(`${baseUrl}/maintenance/complaints/${id}/assign`, {
        method: "PATCH",
        ...fetchOptions,
        body: JSON.stringify({ assigneeId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to assign complaint")
      }

      return await response.json()
    } catch (error) {
      console.error("Error assigning complaint:", error)
      throw error
    }
  },

  // Notifications
  getNotifications: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString()
      const url = `${baseUrl}/maintenance/notifications${queryParams ? `?${queryParams}` : ""}`

      const response = await fetch(url, {
        method: "GET",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch notifications")
      }

      const data = await response.json()

      // If no notifications are returned, provide sample data for development
      if (!data || data.length === 0) {
        return [
          {
            id: 1,
            type: "alert",
            message: "Urgent: Water leakage in Block E needs immediate attention",
            timestamp: "10 mins ago",
            read: false,
            priority: "high",
          },
          {
            id: 2,
            type: "task",
            message: "New maintenance task assigned: Electrical repair in Room 201",
            timestamp: "30 mins ago",
            read: false,
            priority: "medium",
          },
          {
            id: 3,
            type: "update",
            message: "2 complaints have been resolved today",
            timestamp: "2 hours ago",
            read: true,
            priority: "normal",
          },
          {
            id: 4,
            type: "reminder",
            message: "Weekly maintenance check for Block F due tomorrow",
            timestamp: "4 hours ago",
            read: true,
            priority: "normal",
          },
        ]
      }

      return data
    } catch (error) {
      console.error("Error fetching notifications:", error)

      // Return sample data for development/demo
      return [
        {
          id: 1,
          type: "alert",
          message: "Urgent: Water leakage in Block E needs immediate attention",
          timestamp: "10 mins ago",
          read: false,
          priority: "high",
        },
        {
          id: 2,
          type: "task",
          message: "New maintenance task assigned: Electrical repair in Room 201",
          timestamp: "30 mins ago",
          read: false,
          priority: "medium",
        },
        {
          id: 3,
          type: "update",
          message: "2 complaints have been resolved today",
          timestamp: "2 hours ago",
          read: true,
          priority: "normal",
        },
        {
          id: 4,
          type: "reminder",
          message: "Weekly maintenance check for Block F due tomorrow",
          timestamp: "4 hours ago",
          read: true,
          priority: "normal",
        },
      ]
    }
  },

  markNotificationAsRead: async (id) => {
    try {
      const response = await fetch(`${baseUrl}/maintenance/notifications/${id}/read`, {
        method: "PATCH",
        ...fetchOptions,
        body: JSON.stringify({ read: true }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to mark notification as read")
      }

      return response.json()
    } catch (error) {
      console.error("Error marking notification as read:", error)
      throw error
    }
  },

  markAllNotificationsAsRead: async () => {
    try {
      const response = await fetch(`${baseUrl}/maintenance/notifications/read-all`, {
        method: "PATCH",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to mark all notifications as read")
      }

      return response.json()
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      throw error
    }
  },

  clearNotification: async (id) => {
    try {
      const response = await fetch(`${baseUrl}/maintenance/notifications/${id}`, {
        method: "DELETE",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to clear notification")
      }

      return response.json()
    } catch (error) {
      console.error("Error clearing notification:", error)
      throw error
    }
  },

  clearAllNotifications: async () => {
    try {
      const response = await fetch(`${baseUrl}/maintenance/notifications/clear-all`, {
        method: "DELETE",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to clear all notifications")
      }

      return response.json()
    } catch (error) {
      console.error("Error clearing all notifications:", error)
      throw error
    }
  },

  // Schedule
  getSchedule: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString()
      const url = `${baseUrl}/maintenance/schedule${queryParams ? `?${queryParams}` : ""}`

      const response = await fetch(url, {
        method: "GET",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch schedule")
      }

      const scheduleData = await response.json()

      // Process API response to format needed by calendar component
      const formattedSchedule = {}

      // If empty response or error, use sample data
      if (!scheduleData || scheduleData.length === 0) {
        return {
          "2025-03-18": [
            { id: 1, time: "10:00 AM", task: "Maintenance Check - Block E, Room 103", status: "Completed" },
            { id: 2, time: "2:30 PM", task: "Plumbing Repair - Block E, Room 105", status: "Pending" },
          ],
          "2025-03-19": [
            { id: 3, time: "11:00 AM", task: "Electrical Inspection - Block D, Room 202", status: "In Progress" },
            { id: 4, time: "3:00 PM", task: "HVAC Maintenance - Block C, Room 301", status: "Pending" },
          ],
          "2025-03-20": [{ id: 5, time: "9:30 AM", task: "WiFi Router Replacement - Block F, Common Room", status: "Pending" }],
        }
      }

      // Transform API data format to calendar format
      scheduleData.forEach((task) => {
        const date = new Date(task.scheduledDate)
        const dateStr = date.toISOString().split("T")[0]

        if (!formattedSchedule[dateStr]) {
          formattedSchedule[dateStr] = []
        }

        formattedSchedule[dateStr].push({
          id: task.id,
          time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          task: task.description,
          status: task.status,
          location: task.location,
        })
      })

      return formattedSchedule
    } catch (error) {
      console.error("Error fetching schedule:", error)

      // Return sample data for development/demo
      return {
        "2025-03-18": [
          { id: 1, time: "10:00 AM", task: "Maintenance Check - Block E, Room 103", status: "Completed" },
          { id: 2, time: "2:30 PM", task: "Plumbing Repair - Block E, Room 105", status: "Pending" },
        ],
        "2025-03-19": [
          { id: 3, time: "11:00 AM", task: "Electrical Inspection - Block D, Room 202", status: "In Progress" },
          { id: 4, time: "3:00 PM", task: "HVAC Maintenance - Block C, Room 301", status: "Pending" },
        ],
        "2025-03-20": [{ id: 5, time: "9:30 AM", task: "WiFi Router Replacement - Block F, Common Room", status: "Pending" }],
      }
    }
  },

  updateTaskStatus: async (id, status) => {
    try {
      const response = await fetch(`${baseUrl}/maintenance/schedule/${id}/status`, {
        method: "PATCH",
        ...fetchOptions,
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update task status")
      }

      return response.json()
    } catch (error) {
      console.error("Error updating task status:", error)
      throw error
    }
  },

  // Statistics
  getStats: async () => {
    try {
      const response = await fetch(`${baseUrl}/maintenance/stats`, {
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

      // Return fallback stats
      return {
        total: 3,
        pending: 2,
        inProgress: 1,
        resolved: 0,
      }
    }
  },

  // WebSocket for real-time updates
  subscribeToUpdates: (onMessage, onError) => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
      const host = window.location.hostname === "localhost" ? "localhost:5000" : window.location.host
      const wsUrl = `${protocol}//${host}/api/ws/maintenance`

      const socket = new WebSocket(wsUrl)

      // Send authentication when connection opens
      socket.onopen = () => {
        // Get token from localStorage or cookie
        const token = localStorage.getItem("auth_token")
        if (token) {
          socket.send(JSON.stringify({ type: "auth", token }))
        }
      }

      // Handle incoming messages
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          onMessage(data)
        } catch (err) {
          console.error("Error parsing WebSocket message:", err)
        }
      }

      // Handle errors
      socket.onerror = (error) => {
        console.error("WebSocket error:", error)
        if (onError) {
          onError(error)
        }
      }

      return socket
    } catch (error) {
      console.error("Failed to establish WebSocket connection:", error)
      return null
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
}

export default {
  auth: authApi,
  student: studentApi,
  warden: wardenApi,
  guard: guardApi,
  maintenance: maintenanceApi,
  admin: adminApi,
}
