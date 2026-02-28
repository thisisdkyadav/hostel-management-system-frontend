/**
 * Student API Module
 * Handles all student-related API calls
 */

import apiClient from "../core/apiClient"

const unwrapStandardResponse = (response) => {
  if (
    response &&
    typeof response === "object" &&
    typeof response.success === "boolean" &&
    Object.prototype.hasOwnProperty.call(response, "data")
  ) {
    return response.data
  }

  return response
}

const unwrapStudentsListResponse = (response) => {
  const data = unwrapStandardResponse(response)
  return {
    data: data?.students || [],
    pagination: data?.pagination || { total: 0, page: 1, limit: 10, pages: 0 },
    meta: data?.meta || {},
  }
}

const unwrapStudentsByIdsResponse = (response) => {
  const data = unwrapStandardResponse(response)
  return {
    data: data?.students || [],
    errors: data?.errors || [],
  }
}

const unwrapStudentDetailsResponse = (response) => {
  const data = unwrapStandardResponse(response)
  return {
    data: data?.student || data || null,
  }
}

const unwrapListFromKey = (key) => (response) => {
  const data = unwrapStandardResponse(response)
  return Array.isArray(data?.[key]) ? data[key] : []
}

export const studentApi = {
  /**
   * Import students in bulk
   * @param {Array} students - Array of student data
   */
  importStudents: (students, options = {}) => {
    const headers = options.importJobId
      ? { "x-import-job-id": options.importJobId }
      : undefined

    return apiClient
      .post("/students/profiles-admin/profiles", students, { headers })
      .then(unwrapStandardResponse)
  },

  /**
   * Get students list with filters
   * @param {Object} filters - Query filters (page, limit, search, etc.)
   */
  getStudents: (filters = {}) => {
    return apiClient.get("/students/profiles-admin/profiles", { params: filters }).then(unwrapStudentsListResponse)
  },

  /**
   * Get detailed student information
   * @param {string} userId - User ID
   */
  getStudentDetails: (userId) => {
    return apiClient.get(`/students/profiles-admin/profile/details/${userId}`).then(unwrapStudentDetailsResponse)
  },

  /**
   * Get current student profile
   */
  getStudent: () => {
    return apiClient.get("/students/profiles-self/profile").then(unwrapStandardResponse)
  },

  /**
   * Update student profile
   * @param {string} userId - User ID
   * @param {Object} studentData - Updated student data
   */
  updateStudent: (userId, studentData) => {
    return apiClient.put(`/students/profiles-admin/profile/${userId}`, studentData).then(unwrapStandardResponse)
  },

  /**
   * Update multiple students
   * @param {Array} students - Array of student data to update
   */
  updateStudents: (students) => {
    return apiClient.put("/students/profiles-admin/profiles", students).then(unwrapStandardResponse)
  },

  /**
   * Get students by their IDs
   * @param {Array} userIds - Array of user IDs
   */
  getStudentsByIds: (userIds) => {
    return apiClient.post("/students/profiles-admin/profiles/ids", { userIds }).then(unwrapStudentsByIdsResponse)
  },

  /**
   * Get student dashboard data
   */
  getStudentDashboard: () => {
    return apiClient.get("/students/profiles-self/dashboard").then(unwrapStandardResponse)
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
    return apiClient
      .get(`/students/profiles-admin/id/${userId}`)
      .then(unwrapStandardResponse)
      .then((data) => data?.studentId || null)
  },

  /**
   * Get department list
   */
  getDepartmentList: () => {
    return apiClient.get("/students/profiles-admin/departments/list").then(unwrapListFromKey("departments"))
  },

  /**
   * Get degrees list
   */
  getDegreesList: () => {
    return apiClient.get("/students/profiles-admin/degrees/list").then(unwrapListFromKey("degrees"))
  },
}

export default studentApi
