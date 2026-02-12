/**
 * Student Profile API Module
 * Handles student profile, family members, and health details
 */

import apiClient from "../core/apiClient"

export const studentProfileApi = {
  /**
   * Get editable profile fields
   */
  getEditableProfile: () => {
    return apiClient.get("/student-profile/editable")
  },

  /**
   * Update student profile
   * @param {Object} data - Profile data to update
   */
  updateProfile: (data) => {
    return apiClient.put("/student-profile/", data)
  },

  /**
   * Get family members
   */
  getFamilyMembers: () => {
    return apiClient.get("/student-profile/family-members")
  },

  /**
   * Add family member
   * @param {Object} data - Family member data
   */
  addFamilyMember: (data) => {
    return apiClient.post("/student-profile/family-members", data)
  },

  /**
   * Update family member
   * @param {string} id - Family member ID
   * @param {Object} data - Updated family member data
   */
  updateFamilyMember: (id, data) => {
    return apiClient.put(`/student-profile/family-members/${id}`, data)
  },

  /**
   * Delete family member
   * @param {string} id - Family member ID
   */
  deleteFamilyMember: (id) => {
    return apiClient.delete(`/student-profile/family-members/${id}`)
  },

  /**
   * Get health details
   */
  getHealthDetails: () => {
    return apiClient.get("/student-profile/health")
  },
}

export default studentProfileApi
