/**
 * Sheet API Module
 * Handles hostel sheet data operations
 */

import apiClient from "../core/apiClient"

export const sheetApi = {
  /**
   * Get hostel sheet data
   * @param {string} hostelId - Hostel ID
   */
  getHostelSheetData: (hostelId) => {
    return apiClient.get(`/sheet/hostel/${hostelId}`)
  },

  /**
   * Get hostel sheet summary
   */
  getHostelSheetSummary: () => {
    return apiClient.get("/sheet/summary")
  },
}

export default sheetApi
