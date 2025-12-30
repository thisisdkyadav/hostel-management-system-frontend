/**
 * Warden API Module
 * Handles warden, associate warden, and hostel supervisor profiles
 */

import apiClient from "../core/apiClient"

export const wardenApi = {
  /**
   * Get warden profile
   */
  getProfile: () => {
    return apiClient.get("/warden/profile")
  },

  /**
   * Update warden profile
   * @param {Object} profileData - Profile data to update
   */
  updateProfile: (profileData) => {
    return apiClient.post("/warden/profile/update", profileData)
  },

  /**
   * Set active hostel for warden
   * @param {string} hostelId - Hostel ID
   */
  setActiveHostel: (hostelId) => {
    return apiClient.put("/warden/active-hostel", { hostelId })
  },
}

export const associateWardenApi = {
  /**
   * Get associate warden profile
   */
  getProfile: () => {
    return apiClient.get("/warden/associate-warden/profile")
  },

  /**
   * Set active hostel for associate warden
   * @param {string} hostelId - Hostel ID
   */
  setActiveHostel: (hostelId) => {
    return apiClient.put("/warden/associate-warden/active-hostel", { hostelId })
  },
}

export const hostelSupervisorApi = {
  /**
   * Get hostel supervisor profile
   */
  getProfile: () => {
    return apiClient.get("/warden/hostel-supervisor/profile")
  },

  /**
   * Set active hostel for hostel supervisor
   * @param {string} hostelId - Hostel ID
   */
  setActiveHostel: (hostelId) => {
    return apiClient.put("/warden/hostel-supervisor/active-hostel", { hostelId })
  },
}

export default {
  warden: wardenApi,
  associateWarden: associateWardenApi,
  hostelSupervisor: hostelSupervisorApi,
}
