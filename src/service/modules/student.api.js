/**
 * Student API Module
 * Handles all student-related API calls
 */

import apiClient from "../core/apiClient"

export const studentApi = {
  /**
   * Import students in bulk
   * @param {Array} students - Array of student data
   */
  importStudents: (students) => {
    return apiClient.post("/student/profiles", students)
  },

  /**
   * Get students list with filters
   * @param {Object} filters - Query filters (page, limit, search, etc.)
   */
  getStudents: (filters = {}) => {
    return apiClient.get("/student/profiles", { params: filters })
  },

  /**
   * Get detailed student information
   * @param {string} userId - User ID
   */
  getStudentDetails: (userId) => {
    return apiClient.get(`/student/profile/details/${userId}`)
  },

  /**
   * Submit room change request
   * @param {Object} requestData - Room change request data
   */
  submitRoomChangeRequest: (requestData) => {
    return apiClient.post("/student/room-change", requestData)
  },

  /**
   * Get current student profile
   */
  getStudent: () => {
    return apiClient.get("/student/profile")
  },

  /**
   * Update student profile
   * @param {string} userId - User ID
   * @param {Object} studentData - Updated student data
   */
  updateStudent: (userId, studentData) => {
    return apiClient.put(`/student/profile/${userId}`, studentData)
  },

  /**
   * Update multiple students
   * @param {Array} students - Array of student data to update
   */
  updateStudents: (students) => {
    return apiClient.put("/student/profiles", students)
  },

  /**
   * Get students by their IDs
   * @param {Array} userIds - Array of user IDs
   */
  getStudentsByIds: (userIds) => {
    return apiClient.post("/student/profiles/ids", { userIds })
  },

  /**
   * Get student dashboard data
   */
  getStudentDashboard: () => {
    return apiClient.get("/student/dashboard")
  },

  /**
   * Get student complaints
   * @param {string} userId - User ID
   * @param {Object} queries - Query parameters
   */
  getStudentComplaints: (userId, queries = {}) => {
    const queryString = new URLSearchParams(queries).toString()
    return apiClient.get(`/complaint/student/complaints/${userId}`, { queryString })
  },

  /**
   * Fetch student profile by userId (from studentService)
   * @param {string} userId - User ID
   */
  fetchStudentProfile: (userId) => {
    return apiClient.get(`/student/profile/${userId}`)
  },

  /**
   * Update profile (from studentService)
   * @param {string} userId - User ID
   * @param {Object} profileData - Profile data
   */
  updateProfile: (userId, profileData) => {
    return apiClient.put(`/student/profile/update/${userId}`, profileData)
  },

  /**
   * Get student ID
   * @param {string} userId - User ID
   */
  getStudentId: (userId) => {
    return apiClient.get(`/student/id/${userId}`)
  },

  /**
   * Get department list
   */
  getDepartmentList: () => {
    return apiClient.get("/student/departments/list")
  },

  /**
   * Get degrees list
   */
  getDegreesList: () => {
    return apiClient.get("/student/degrees/list")
  },
}

export default studentApi
