/**
 * Events API Module
 * Handles event CRUD operations
 */

import apiClient from "../core/apiClient"

export const eventsApi = {
  /**
   * Get all events
   */
  getAllEvents: (params = {}) => {
    return apiClient.get("/event", { params })
  },

  /**
   * Add new event
   * @param {Object} eventData - Event data
   */
  addEvent: (eventData) => {
    return apiClient.post("/event", eventData)
  },

  /**
   * Update event
   * @param {string} eventId - Event ID
   * @param {Object} eventData - Updated event data
   */
  updateEvent: (eventId, eventData) => {
    return apiClient.put(`/event/${eventId}`, eventData)
  },

  /**
   * Delete event
   * @param {string} eventId - Event ID
   */
  deleteEvent: (eventId) => {
    return apiClient.delete(`/event/${eventId}`)
  },
}

export default eventsApi
