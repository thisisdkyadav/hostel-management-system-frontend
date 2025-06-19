import { baseUrl, fetchOptions } from "../constants/appConstants"

export const adminApi = {
  getFamilyDetails: async (userId) => {
    try {
      const response = await fetch(`${baseUrl}/family/${userId}`, {
        method: "GET",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch family details")
      }

      return response.json()
    } catch (error) {
      console.error("Error fetching family details:", error)
      throw error
    }
  },

  addFamilyMember: async (userId, familyMemberData) => {
    try {
      const response = await fetch(`${baseUrl}/family/${userId}`, {
        method: "POST",
        ...fetchOptions,
        body: JSON.stringify(familyMemberData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to add family member")
      }

      return response.json()
    } catch (error) {
      console.error("Error adding family member:", error)
      throw error
    }
  },

  updateFamilyMember: async (memberId, familyMemberData) => {
    try {
      const response = await fetch(`${baseUrl}/family/${memberId}`, {
        method: "PUT",
        ...fetchOptions,
        body: JSON.stringify(familyMemberData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update family member")
      }

      return response.json()
    } catch (error) {
      console.error("Error updating family member:", error)
      throw error
    }
  },

  deleteFamilyMember: async (memberId) => {
    try {
      const response = await fetch(`${baseUrl}/family/${memberId}`, {
        method: "DELETE",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete family member")
      }

      return response.json()
    } catch (error) {
      console.error("Error deleting family member:", error)
      throw error
    }
  },

  updateBulkFamilyMembers: async (familyMembersData) => {
    try {
      const response = await fetch(`${baseUrl}/family/bulk-update`, {
        method: "POST",
        ...fetchOptions,
        body: JSON.stringify(familyMembersData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update bulk family members")
      }

      return response.json()
    } catch (error) {
      console.error("Error updating bulk family members:", error)
      throw error
    }
  },

  addHostelGate: async (hostelGateData) => {
    try {
      const response = await fetch(`${baseUrl}/admin/hostel-gate`, {
        method: "POST",
        ...fetchOptions,
        body: JSON.stringify(hostelGateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to add hostel gate")
      }

      return response.json()
    } catch (error) {
      console.error("Error adding hostel gate:", error)
      throw error
    }
  },

  getAllHostelGates: async () => {
    try {
      const response = await fetch(`${baseUrl}/admin/hostel-gate/all`, {
        method: "GET",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch all hostel gates")
      }

      return response.json()
    } catch (error) {
      console.error("Error fetching all hostel gates:", error)
      throw error
    }
  },

  updateHostelGate: async (hostelGateId, hostelGateData) => {
    try {
      const response = await fetch(`${baseUrl}/admin/hostel-gate/${hostelGateId}`, {
        method: "PUT",
        ...fetchOptions,
        body: JSON.stringify(hostelGateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update hostel gate")
      }

      return response.json()
    } catch (error) {
      console.error("Error updating hostel gate:", error)
      throw error
    }
  },

  deleteHostelGate: async (hostelGateId) => {
    try {
      const response = await fetch(`${baseUrl}/admin/hostel-gate/${hostelGateId}`, {
        method: "DELETE",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete hostel gate")
      }

      return response.json()
    } catch (error) {
      console.error("Error deleting hostel gate:", error)
      throw error
    }
  },

  // // Task Management API methods
  // createTask: async (taskData) => {
  //   try {
  //     const response = await fetch(`${baseUrl}/api/tasks`, {
  //       method: "POST",
  //       ...fetchOptions,
  //       body: JSON.stringify(taskData),
  //     })

  //     if (!response.ok) {
  //       const errorData = await response.json()
  //       throw new Error(errorData.message || "Failed to create task")
  //     }

  //     return response.json()
  //   } catch (error) {
  //     console.error("Error creating task:", error)
  //     throw error
  //   }
  // },

  // getAllTasks: async (queryParams) => {
  //   try {
  //     const response = await fetch(`${baseUrl}/api/tasks/all${queryParams ? `?${queryParams}` : ""}`, {
  //       method: "GET",
  //       ...fetchOptions,
  //     })

  //     if (!response.ok) {
  //       const errorData = await response.json()
  //       throw new Error(errorData.message || "Failed to fetch all tasks")
  //     }

  //     return response.json()
  //   } catch (error) {
  //     console.error("Error fetching all tasks:", error)
  //     throw error
  //   }
  // },

  // getTaskStats: async () => {
  //   try {
  //     const response = await fetch(`${baseUrl}/api/admin/task-stats`, {
  //       method: "GET",
  //       ...fetchOptions,
  //     })

  //     if (!response.ok) {
  //       const errorData = await response.json()
  //       throw new Error(errorData.message || "Failed to fetch task statistics")
  //     }

  //     return response.json()
  //   } catch (error) {
  //     console.error("Error fetching task statistics:", error)
  //     throw error
  //   }
  // },

  // updateTask: async (taskId, taskData) => {
  //   try {
  //     const response = await fetch(`${baseUrl}/api/tasks/${taskId}`, {
  //       method: "PUT",
  //       ...fetchOptions,
  //       body: JSON.stringify(taskData),
  //     })

  //     if (!response.ok) {
  //       const errorData = await response.json()
  //       throw new Error(errorData.message || "Failed to update task")
  //     }

  //     return response.json()
  //   } catch (error) {
  //     console.error("Error updating task:", error)
  //     throw error
  //   }
  // },

  // deleteTask: async (taskId) => {
  //   try {
  //     const response = await fetch(`${baseUrl}/api/tasks/${taskId}`, {
  //       method: "DELETE",
  //       ...fetchOptions,
  //     })

  //     if (!response.ok) {
  //       const errorData = await response.json()
  //       throw new Error(errorData.message || "Failed to delete task")
  //     }

  //     return response.json()
  //   } catch (error) {
  //     console.error("Error deleting task:", error)
  //     throw error
  //   }
  // },

  // getMyTasks: async (queryParams) => {
  //   try {
  //     const response = await fetch(`${baseUrl}/api/tasks/my-tasks${queryParams ? `?${queryParams}` : ""}`, {
  //       method: "GET",
  //       ...fetchOptions,
  //     })

  //     if (!response.ok) {
  //       const errorData = await response.json()
  //       throw new Error(errorData.message || "Failed to fetch my tasks")
  //     }

  //     return response.json()
  //   } catch (error) {
  //     console.error("Error fetching my tasks:", error)
  //     throw error
  //   }
  // },

  // updateTaskStatus: async (taskId, status) => {
  //   try {
  //     const response = await fetch(`${baseUrl}/api/tasks/${taskId}/status`, {
  //       method: "PUT",
  //       ...fetchOptions,
  //       body: JSON.stringify({ status }),
  //     })

  //     if (!response.ok) {
  //       const errorData = await response.json()
  //       throw new Error(errorData.message || "Failed to update task status")
  //     }

  //     return response.json()
  //   } catch (error) {
  //     console.error("Error updating task status:", error)
  //     throw error
  //   }
  // },

  // // Add other API methods as needed
}

export default adminApi
