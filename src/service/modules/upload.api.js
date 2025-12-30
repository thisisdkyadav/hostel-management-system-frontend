/**
 * Upload API Module
 * Handles file upload operations
 */

import apiClient from "../core/apiClient"

export const uploadApi = {
  /**
   * Upload profile image
   * @param {FormData} imageData - Image form data
   * @param {string} userId - User ID
   */
  uploadProfileImage: (imageData, userId) => {
    return apiClient.upload(`/upload/profile/${userId}`, imageData)
  },

  /**
   * Upload ID card image
   * @param {FormData} imageData - Image form data
   * @param {string} side - 'front' or 'back'
   */
  uploadIDcard: (imageData, side) => {
    return apiClient.upload(`/upload/student-id/${side}`, imageData)
  },

  /**
   * Upload H2 form
   * @param {FormData} imageData - Form data
   */
  uploadH2Form: (imageData) => {
    return apiClient.upload("/upload/h2-form", imageData)
  },

  /**
   * Upload payment screenshot
   * @param {FormData} imageData - Image form data
   * @param {string} userId - User ID (optional, not used in endpoint)
   */
  uploadPaymentScreenshot: (imageData, userId) => {
    return apiClient.upload("/upload/payment-screenshot", imageData)
  },

  /**
   * Upload lost and found image
   * @param {FormData} imageData - Image form data
   */
  uploadLostAndFoundImage: (imageData) => {
    return apiClient.upload("/upload/lost-and-found-image", imageData)
  },

  /**
   * Upload certificate
   * @param {FormData} fileData - File form data
   */
  uploadCertificate: (fileData) => {
    return apiClient.upload("/upload/certificate", fileData)
  },
}

export default uploadApi
