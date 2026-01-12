/**
 * Security API Module
 * Handles security operations, student entries, QR verification
 */

import apiClient from "../core/apiClient"

export const securityApi = {
  /**
   * Get security info
   */
  getSecurityInfo: () => {
    return apiClient.get("/security")
  },

  /**
   * Add student entry
   * @param {Object} entryData - Entry data
   */
  addStudentEntry: (entryData) => {
    return apiClient.post("/security/entries", entryData)
  },

  /**
   * Get recent student entries
   */
  getRecentStudentEntries: () => {
    return apiClient.get("/security/entries/recent")
  },

  /**
   * Update student entry
   * @param {Object} entryData - Entry data with _id
   */
  updateStudentEntry: (entryData) => {
    return apiClient.put(`/security/entries/${entryData._id}`, entryData)
  },

  /**
   * Get student entries with filters
   * @param {Object} filters - Query filters
   */
  getStudentEntries: (filters = {}) => {
    return apiClient.get("/security/entries", { params: filters })
  },

  /**
   * Delete student entry
   * @param {string} entryId - Entry ID
   */
  deleteStudentEntry: (entryId) => {
    return apiClient.delete(`/security/entries/${entryId}`)
  },

  /**
   * Verify QR code
   * @param {string} email - Student email
   * @param {string} encryptedData - Encrypted QR data
   */
  verifyQRCode: (email, encryptedData) => {
    return apiClient.post("/security/verify-qr", { email, encryptedData })
  },

  /**
   * Add student entry with email
   * @param {Object} entryData - Entry data
   */
  addStudentEntryWithEmail: (entryData) => {
    return apiClient.post("/security/entries/email", entryData)
  },

  /**
   * Update cross hostel reason
   * @param {string} entryId - Entry ID
   * @param {string} reason - Cross hostel reason
   */
  updateCrossHostelReason: (entryId, reason) => {
    return apiClient.patch(`/security/entries/${entryId}/cross-hostel-reason`, { reason })
  },

  /**
   * Get face scanner entries for hostel gate
   * @param {Object} filters - Query filters (page, limit, status)
   */
  getFaceScannerEntries: (filters = {}) => {
    return apiClient.get("/security/entries/face-scanner", { params: filters })
  },

  // Staff operations
  /**
   * Verify staff QR code
   * @param {Object} qrData - QR code data
   */
  verifyStaffQRCode: (qrData) => {
    return apiClient.post("/staff/verify-qr", qrData)
  },

  /**
   * Record staff attendance
   * @param {Object} attendanceData - Attendance data
   */
  recordStaffAttendance: (attendanceData) => {
    return apiClient.post("/staff/attendance/record", attendanceData)
  },

  /**
   * Get staff attendance records
   * @param {Object} filters - Query filters
   */
  getStaffAttendanceRecords: (filters = {}) => {
    return apiClient.get("/staff/attendance/records", { params: filters })
  },
}

export default securityApi
