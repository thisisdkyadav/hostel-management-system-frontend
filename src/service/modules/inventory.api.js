/**
 * Inventory API Module
 * Handles inventory types, hostel inventory, student inventory
 */

import apiClient from "../core/apiClient"

export const inventoryApi = {
  // ==================== Item Types ====================

  /**
   * Create inventory item type
   * @param {Object} itemTypeData - Item type data
   */
  createItemType: (itemTypeData) => {
    return apiClient.post("/inventory/types", itemTypeData)
  },

  /**
   * Get all item types
   * @param {Object} queryParams - { page, limit, search }
   */
  getAllItemTypes: (queryParams = {}) => {
    const { page = 1, limit = 10, search = "" } = queryParams
    const params = { page, limit }
    if (search) params.search = search
    return apiClient.get("/inventory/types", { params })
  },

  /**
   * Get item type by ID
   * @param {string} id - Item type ID
   */
  getItemTypeById: (id) => {
    return apiClient.get(`/inventory/types/${id}`)
  },

  /**
   * Update item type
   * @param {string} id - Item type ID
   * @param {Object} itemTypeData - Updated data
   */
  updateItemType: (id, itemTypeData) => {
    return apiClient.put(`/inventory/types/${id}`, itemTypeData)
  },

  /**
   * Update item type count
   * @param {string} id - Item type ID
   * @param {number} totalCount - New total count
   */
  updateItemTypeCount: (id, totalCount) => {
    return apiClient.patch(`/inventory/types/${id}/count`, { totalCount })
  },

  /**
   * Delete item type
   * @param {string} id - Item type ID
   */
  deleteItemType: (id) => {
    return apiClient.delete(`/inventory/types/${id}`)
  },

  // ==================== Hostel Inventory ====================

  /**
   * Assign inventory to hostel
   * @param {Object} hostelInventoryData - Inventory assignment data
   */
  assignInventoryToHostel: (hostelInventoryData) => {
    return apiClient.post("/inventory/hostel", hostelInventoryData)
  },

  /**
   * Get all hostel inventory
   * @param {Object} queryParams - { page, limit, hostelId, itemTypeId }
   */
  getAllHostelInventory: (queryParams = {}) => {
    const { page = 1, limit = 10, hostelId, itemTypeId } = queryParams
    const params = { page, limit }
    if (hostelId) params.hostelId = hostelId
    if (itemTypeId) params.itemTypeId = itemTypeId
    return apiClient.get("/inventory/hostel", { params })
  },

  /**
   * Update hostel inventory
   * @param {string} id - Hostel inventory ID
   * @param {Object} hostelInventoryData - Updated data
   */
  updateHostelInventory: (id, hostelInventoryData) => {
    return apiClient.put(`/inventory/hostel/item/${id}`, hostelInventoryData)
  },

  /**
   * Delete hostel inventory
   * @param {string} id - Hostel inventory ID
   */
  deleteHostelInventory: (id) => {
    return apiClient.delete(`/inventory/hostel/item/${id}`)
  },

  /**
   * Get inventory summary by hostel
   */
  getInventorySummaryByHostel: () => {
    return apiClient.get("/inventory/hostel/summary")
  },

  // ==================== Student Inventory ====================

  /**
   * Assign inventory to student
   * @param {Object} studentInventoryData - Inventory assignment data
   */
  assignInventoryToStudent: (studentInventoryData) => {
    return apiClient.post("/inventory/student", studentInventoryData)
  },

  /**
   * Get all student inventory
   * @param {Object} queryParams - { page, limit, studentProfileId, itemTypeId, hostelId, status, rollNumber, sortBy, sortOrder }
   */
  getAllStudentInventory: (queryParams = {}) => {
    const { 
      page = 1, 
      limit = 10, 
      studentProfileId, 
      itemTypeId, 
      hostelId, 
      status, 
      rollNumber, 
      sortBy, 
      sortOrder 
    } = queryParams

    const params = { page, limit }
    if (studentProfileId) params.studentProfileId = studentProfileId
    if (itemTypeId) params.itemTypeId = itemTypeId
    if (hostelId) params.hostelId = hostelId
    if (status) params.status = status
    if (rollNumber) params.rollNumber = rollNumber
    if (sortBy) params.sortBy = sortBy
    if (sortOrder) params.sortOrder = sortOrder

    return apiClient.get("/inventory/student", { params })
  },

  /**
   * Get student inventory by student ID
   * @param {string} studentProfileId - Student profile ID
   */
  getStudentInventoryByStudentId: (studentProfileId) => {
    return apiClient.get(`/inventory/student/${studentProfileId}`)
  },

  /**
   * Return student inventory
   * @param {string} id - Student inventory ID
   * @param {Object} returnData - Return data
   */
  returnStudentInventory: (id, returnData) => {
    return apiClient.put(`/inventory/student/${id}/return`, returnData)
  },

  /**
   * Update student inventory status
   * @param {string} id - Student inventory ID
   * @param {Object} statusData - Status data
   */
  updateStudentInventoryStatus: (id, statusData) => {
    return apiClient.put(`/inventory/student/${id}/status`, statusData)
  },

  /**
   * Get inventory summary by student
   * @param {Object} queryParams - { hostelId }
   */
  getInventorySummaryByStudent: (queryParams = {}) => {
    const { hostelId } = queryParams
    const params = {}
    if (hostelId) params.hostelId = hostelId
    return apiClient.get("/inventory/student/summary/student", { params })
  },

  /**
   * Get inventory summary by item type
   * @param {Object} queryParams - { hostelId }
   */
  getInventorySummaryByItemType: (queryParams = {}) => {
    const { hostelId } = queryParams
    const params = {}
    if (hostelId) params.hostelId = hostelId
    return apiClient.get("/inventory/student/summary/item", { params })
  },
}

export default inventoryApi
