/**
 * Certificate API Module
 * Handles student certificate operations
 */

import apiClient from "../core/apiClient"

export const certificateApi = {
  /**
   * Add certificate
   * @param {Object} certificateData - Certificate data
   */
  addCertificate: (certificateData) => {
    return apiClient.post("/certificate/add", certificateData)
  },

  /**
   * Get certificates by student
   * @param {string} studentId - Student ID
   */
  getCertificatesByStudent: (studentId) => {
    return apiClient.get(`/certificate/${studentId}`)
  },

  /**
   * Update certificate
   * @param {string} certificateId - Certificate ID
   * @param {Object} certificateData - Updated certificate data
   */
  updateCertificate: (certificateId, certificateData) => {
    return apiClient.put(`/certificate/update/${certificateId}`, certificateData)
  },

  /**
   * Delete certificate
   * @param {string} certificateId - Certificate ID
   */
  deleteCertificate: (certificateId) => {
    return apiClient.delete(`/certificate/${certificateId}`)
  },
}

export default certificateApi
