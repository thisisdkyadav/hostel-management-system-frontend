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
    return apiClient.post("/students/profiles-admin/profiles", students)
  },

  /**
   * Get students list with filters
   * @param {Object} filters - Query filters (page, limit, search, etc.)
   */
  getStudents: (filters = {}) => {
    return apiClient.get("/students/profiles-admin/profiles", { params: filters })
  },

  /**
   * Get detailed student information
   * @param {string} userId - User ID
   */
  getStudentDetails: (userId) => {
    return apiClient.get(`/students/profiles-admin/profile/details/${userId}`)
  },

  /**
   * Get current student profile
   */
  getStudent: () => {
    return apiClient.get("/students/profiles-self/profile")
  },

  /**
   * Update student profile
   * @param {string} userId - User ID
   * @param {Object} studentData - Updated student data
   */
  updateStudent: (userId, studentData) => {
    return apiClient.put(`/students/profiles-admin/profile/${userId}`, studentData)
  },

  /**
   * Update multiple students
   * @param {Array} students - Array of student data to update
   */
  updateStudents: (students) => {
    return apiClient.put("/students/profiles-admin/profiles", students)
  },

  /**
   * Get students by their IDs
   * @param {Array} userIds - Array of user IDs
   */
  getStudentsByIds: (userIds) => {
    return apiClient.post("/students/profiles-admin/profiles/ids", { userIds })
  },

  /**
   * Get student dashboard data
   */
  getStudentDashboard: () => {
    return apiClient.get("/students/profiles-self/dashboard")
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
   * Get student ID
   * @param {string} userId - User ID
   */
  getStudentId: (userId) => {
    return apiClient.get(`/students/profiles-admin/id/${userId}`)
  },

  /**
   * Get department list
   */
  getDepartmentList: () => {
    return apiClient.get("/students/profiles-admin/departments/list")
  },

  /**
   * Get degrees list
   */
  getDegreesList: () => {
    return apiClient.get("/students/profiles-admin/degrees/list")
  },
}

export default studentApi
