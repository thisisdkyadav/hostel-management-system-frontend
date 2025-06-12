import { baseUrl, fetchOptions } from "../constants/appConstants"

export const inventoryApi = {
  // Item Type APIs
  createItemType: async (itemTypeData) => {
    try {
      const response = await fetch(`${baseUrl}/inventory/types`, {
        method: "POST",
        ...fetchOptions,
        body: JSON.stringify(itemTypeData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create inventory item type")
      }

      return response.json()
    } catch (error) {
      console.error("Error creating inventory item type:", error)
      throw error
    }
  },

  getAllItemTypes: async (queryParams = {}) => {
    const { page = 1, limit = 10, search = "" } = queryParams
    try {
      const url = new URL(`${baseUrl}/inventory/types`)
      url.searchParams.append("page", page)
      url.searchParams.append("limit", limit)
      if (search) url.searchParams.append("search", search)

      const response = await fetch(url, {
        method: "GET",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch inventory item types")
      }

      return response.json()
    } catch (error) {
      console.error("Error fetching inventory item types:", error)
      throw error
    }
  },

  getItemTypeById: async (id) => {
    try {
      const response = await fetch(`${baseUrl}/inventory/types/${id}`, {
        method: "GET",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch inventory item type")
      }

      return response.json()
    } catch (error) {
      console.error("Error fetching inventory item type:", error)
      throw error
    }
  },

  updateItemType: async (id, itemTypeData) => {
    try {
      const response = await fetch(`${baseUrl}/inventory/types/${id}`, {
        method: "PUT",
        ...fetchOptions,
        body: JSON.stringify(itemTypeData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update inventory item type")
      }

      return response.json()
    } catch (error) {
      console.error("Error updating inventory item type:", error)
      throw error
    }
  },

  updateItemTypeCount: async (id, totalCount) => {
    try {
      const response = await fetch(`${baseUrl}/inventory/types/${id}/count`, {
        method: "PATCH",
        ...fetchOptions,
        body: JSON.stringify({ totalCount }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update inventory item count")
      }

      return response.json()
    } catch (error) {
      console.error("Error updating inventory item count:", error)
      throw error
    }
  },

  deleteItemType: async (id) => {
    try {
      const response = await fetch(`${baseUrl}/inventory/types/${id}`, {
        method: "DELETE",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete inventory item type")
      }

      return response.json()
    } catch (error) {
      console.error("Error deleting inventory item type:", error)
      throw error
    }
  },

  // Hostel Inventory APIs
  assignInventoryToHostel: async (hostelInventoryData) => {
    try {
      const response = await fetch(`${baseUrl}/inventory/hostel`, {
        method: "POST",
        ...fetchOptions,
        body: JSON.stringify(hostelInventoryData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to assign inventory to hostel")
      }

      return response.json()
    } catch (error) {
      console.error("Error assigning inventory to hostel:", error)
      throw error
    }
  },

  getAllHostelInventory: async (queryParams = {}) => {
    const { page = 1, limit = 10, hostelId, itemTypeId } = queryParams
    try {
      const url = new URL(`${baseUrl}/inventory/hostel`)
      url.searchParams.append("page", page)
      url.searchParams.append("limit", limit)
      if (hostelId) url.searchParams.append("hostelId", hostelId)
      if (itemTypeId) url.searchParams.append("itemTypeId", itemTypeId)

      const response = await fetch(url, {
        method: "GET",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch hostel inventory")
      }

      return response.json()
    } catch (error) {
      console.error("Error fetching hostel inventory:", error)
      throw error
    }
  },

  updateHostelInventory: async (id, hostelInventoryData) => {
    try {
      const response = await fetch(`${baseUrl}/inventory/hostel/item/${id}`, {
        method: "PUT",
        ...fetchOptions,
        body: JSON.stringify(hostelInventoryData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update hostel inventory")
      }

      return response.json()
    } catch (error) {
      console.error("Error updating hostel inventory:", error)
      throw error
    }
  },

  deleteHostelInventory: async (id) => {
    try {
      const response = await fetch(`${baseUrl}/inventory/hostel/item/${id}`, {
        method: "DELETE",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete hostel inventory")
      }

      return response.json()
    } catch (error) {
      console.error("Error deleting hostel inventory:", error)
      throw error
    }
  },

  getInventorySummaryByHostel: async () => {
    try {
      const response = await fetch(`${baseUrl}/inventory/hostel/summary`, {
        method: "GET",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch inventory summary by hostel")
      }

      return response.json()
    } catch (error) {
      console.error("Error fetching inventory summary by hostel:", error)
      throw error
    }
  },

  // Student Inventory APIs
  assignInventoryToStudent: async (studentInventoryData) => {
    try {
      const response = await fetch(`${baseUrl}/inventory/student`, {
        method: "POST",
        ...fetchOptions,
        body: JSON.stringify(studentInventoryData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to assign inventory to student")
      }

      return response.json()
    } catch (error) {
      console.error("Error assigning inventory to student:", error)
      throw error
    }
  },

  getAllStudentInventory: async (queryParams = {}) => {
    const { page = 1, limit = 10, studentProfileId, itemTypeId, hostelId, status, rollNumber, sortBy, sortOrder } = queryParams

    try {
      const url = new URL(`${baseUrl}/inventory/student`)
      url.searchParams.append("page", page)
      url.searchParams.append("limit", limit)

      if (studentProfileId) url.searchParams.append("studentProfileId", studentProfileId)
      if (itemTypeId) url.searchParams.append("itemTypeId", itemTypeId)
      if (hostelId) url.searchParams.append("hostelId", hostelId)
      if (status) url.searchParams.append("status", status)
      if (rollNumber) url.searchParams.append("rollNumber", rollNumber)
      if (sortBy) url.searchParams.append("sortBy", sortBy)
      if (sortOrder) url.searchParams.append("sortOrder", sortOrder)

      const response = await fetch(url, {
        method: "GET",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch student inventory")
      }

      return response.json()
    } catch (error) {
      console.error("Error fetching student inventory:", error)
      throw error
    }
  },

  getStudentInventoryByStudentId: async (studentProfileId) => {
    try {
      const response = await fetch(`${baseUrl}/inventory/student/${studentProfileId}`, {
        method: "GET",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch student inventory")
      }

      return response.json()
    } catch (error) {
      console.error("Error fetching student inventory:", error)
      throw error
    }
  },

  returnStudentInventory: async (id, returnData) => {
    try {
      const response = await fetch(`${baseUrl}/inventory/student/${id}/return`, {
        method: "PUT",
        ...fetchOptions,
        body: JSON.stringify(returnData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to return student inventory")
      }

      return response.json()
    } catch (error) {
      console.error("Error returning student inventory:", error)
      throw error
    }
  },

  updateStudentInventoryStatus: async (id, statusData) => {
    try {
      const response = await fetch(`${baseUrl}/inventory/student/${id}/status`, {
        method: "PUT",
        ...fetchOptions,
        body: JSON.stringify(statusData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update student inventory status")
      }

      return response.json()
    } catch (error) {
      console.error("Error updating student inventory status:", error)
      throw error
    }
  },

  getInventorySummaryByStudent: async (queryParams = {}) => {
    const { hostelId } = queryParams
    try {
      const url = new URL(`${baseUrl}/inventory/student/summary/student`)
      if (hostelId) url.searchParams.append("hostelId", hostelId)

      const response = await fetch(url, {
        method: "GET",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch inventory summary by student")
      }

      return response.json()
    } catch (error) {
      console.error("Error fetching inventory summary by student:", error)
      throw error
    }
  },

  getInventorySummaryByItemType: async (queryParams = {}) => {
    const { hostelId } = queryParams
    try {
      const url = new URL(`${baseUrl}/inventory/student/summary/item`)
      if (hostelId) url.searchParams.append("hostelId", hostelId)

      const response = await fetch(url, {
        method: "GET",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch inventory summary by item type")
      }

      return response.json()
    } catch (error) {
      console.error("Error fetching inventory summary by item type:", error)
      throw error
    }
  },
}

export default inventoryApi
