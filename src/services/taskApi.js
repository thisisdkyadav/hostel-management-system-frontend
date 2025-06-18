import { baseUrl, fetchOptions } from "../constants/appConstants"

export const taskApi = {
  // Admin endpoints
  createTask: async (taskData) => {
    try {
      const response = await fetch(`${baseUrl}/tasks`, {
        method: "POST",
        ...fetchOptions,
        body: JSON.stringify(taskData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create task")
      }

      return response.json()
    } catch (error) {
      console.error("Error creating task:", error)
      throw error
    }
  },

  getAllTasks: async (queryParams) => {
    try {
      const response = await fetch(`${baseUrl}/tasks/all${queryParams ? `?${queryParams}` : ""}`, {
        method: "GET",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch all tasks")
      }

      return response.json()
    } catch (error) {
      console.error("Error fetching all tasks:", error)
      throw error
    }
  },

  updateTask: async (taskId, taskData) => {
    try {
      const response = await fetch(`${baseUrl}/tasks/${taskId}`, {
        method: "PUT",
        ...fetchOptions,
        body: JSON.stringify(taskData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update task")
      }

      return response.json()
    } catch (error) {
      console.error("Error updating task:", error)
      throw error
    }
  },

  deleteTask: async (taskId) => {
    try {
      const response = await fetch(`${baseUrl}/tasks/${taskId}`, {
        method: "DELETE",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete task")
      }

      return response.json()
    } catch (error) {
      console.error("Error deleting task:", error)
      throw error
    }
  },

  getTaskStats: async () => {
    try {
      const response = await fetch(`${baseUrl}/admin/task-stats`, {
        method: "GET",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch task statistics")
      }

      return response.json()
    } catch (error) {
      console.error("Error fetching task statistics:", error)
      throw error
    }
  },

  // User endpoints
  getMyTasks: async (queryParams) => {
    try {
      const response = await fetch(`${baseUrl}/tasks/my-tasks${queryParams ? `?${queryParams}` : ""}`, {
        method: "GET",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch my tasks")
      }

      return response.json()
    } catch (error) {
      console.error("Error fetching my tasks:", error)
      throw error
    }
  },

  updateTaskStatus: async (taskId, status) => {
    try {
      const response = await fetch(`${baseUrl}/tasks/${taskId}/status`, {
        method: "PUT",
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
}

export default taskApi
