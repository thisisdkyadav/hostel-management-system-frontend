/**
 * Lost and Found API Module
 * Handles lost and found items
 */

import apiClient from "../core/apiClient"

export const lostAndFoundApi = {
  /**
   * Add lost item
   * @param {Object} itemData - Lost item data
   */
  addLostItem: (itemData) => {
    return apiClient.post("/lost-and-found", itemData)
  },

  /**
   * Get all lost items
   */
  getAllLostItems: () => {
    return apiClient.get("/lost-and-found")
  },

  /**
   * Update lost item
   * @param {string} itemId - Item ID
   * @param {Object} itemData - Updated item data
   */
  updateLostItem: (itemId, itemData) => {
    return apiClient.put(`/lost-and-found/${itemId}`, itemData)
  },

  /**
   * Delete lost item
   * @param {string} itemId - Item ID
   */
  deleteLostItem: (itemId) => {
    return apiClient.delete(`/lost-and-found/${itemId}`)
  },
}

export default lostAndFoundApi
