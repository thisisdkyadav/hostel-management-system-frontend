import { fetchOptions, baseUrl } from "../constants/appConstants"

export const notificationApi = {
  getNotifications: async (queryParams = "") => {
    try {
      const response = await fetch(`${baseUrl}/notification${queryParams ? `?${queryParams}` : ""}`, fetchOptions)
      if (!response.ok) throw new Error("Failed to fetch notifications")
      return await response.json()
    } catch (error) {
      console.error("Error fetching notifications:", error)
      throw error
    }
  },

  getNotificationStats: async () => {
    try {
      const response = await fetch(`${baseUrl}/notification/stats`, fetchOptions)
      if (!response.ok) throw new Error("Failed to fetch notification stats")
      return await response.json()
    } catch (error) {
      console.error("Error fetching notification stats:", error)
      throw error
    }
  },

  createNotification: async (data) => {
    try {
      const response = await fetch(`${baseUrl}/notification`, {
        method: "POST",
        ...fetchOptions,
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to create notification")
      return await response.json()
    } catch (error) {
      console.error("Error creating notification:", error)
      throw error
    }
  },

  //   deleteNotification: async (id) => {
  //     try {
  //       const response = await fetch(`${baseUrl}/admin/notifications/${id}`, {
  //         method: "DELETE",
  //         ...fetchOptions,
  //       })
  //       if (!response.ok) throw new Error("Failed to delete notification")
  //       return await response.json()
  //     } catch (error) {
  //       console.error("Error deleting notification:", error)
  //       throw error
  //     }
  //   },

  getActiveNotificationsCount: async () => {
    try {
      const response = await fetch(`${baseUrl}/notification/active-count`, fetchOptions)
      if (!response.ok) throw new Error("Failed to fetch notifications count")
      return await response.json()
    } catch (error) {
      console.error("Error fetching notifications count:", error)
      throw error
    }
  },
}
