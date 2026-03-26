/**
 * Upload API Module
 * Handles file upload operations
 */

import apiClient from "../core/apiClient"

export const resolveUploadedFileRef = (uploadResponse) => {
  if (typeof uploadResponse === "string") return uploadResponse
  return (
    uploadResponse?.fileRef ||
    uploadResponse?.file_ref ||
    uploadResponse?.data?.fileRef ||
    uploadResponse?.data?.file_ref ||
    uploadResponse?.url ||
    uploadResponse?.data?.url ||
    ""
  )
}

export const resolveUploadedFileUrl = (uploadResponse) => {
  if (typeof uploadResponse === "string") return uploadResponse
  return (
    uploadResponse?.url ||
    uploadResponse?.data?.url ||
    uploadResponse?.fileRef ||
    uploadResponse?.file_ref ||
    uploadResponse?.data?.fileRef ||
    uploadResponse?.data?.file_ref ||
    ""
  )
}

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
   * Upload event proposal PDF
   * @param {FormData} fileData - Form data
   */
  uploadEventProposalPDF: (fileData) => {
    return apiClient.upload("/upload/event-proposal-pdf", fileData)
  },

  /**
   * Upload event chief guest PDF
   * @param {FormData} fileData - Form data
   */
  uploadEventChiefGuestPDF: (fileData) => {
    return apiClient.upload("/upload/event-chief-guest-pdf", fileData)
  },

  /**
   * Upload event bill PDF
   * @param {FormData} fileData - Form data
   */
  uploadEventBillPDF: (fileData) => {
    return apiClient.upload("/upload/event-bill-pdf", fileData)
  },

  /**
   * Upload event report PDF
   * @param {FormData} fileData - Form data
   */
  uploadEventReportPDF: (fileData) => {
    return apiClient.upload("/upload/event-report-pdf", fileData)
  },

  /**
   * Upload disciplinary process PDF
   * @param {FormData} fileData - Form data
   */
  uploadDiscoProcessPDF: (fileData) => {
    return apiClient.upload("/upload/disco-process-pdf", fileData)
  },

  /**
   * Upload payment screenshot
   * @param {FormData} imageData - Image form data
   */
  uploadPaymentScreenshot: (imageData) => {
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

  /**
   * Upload election nomination document
   * @param {FormData} fileData - File form data
   */
  uploadElectionNominationDocument: (fileData) => {
    return apiClient.upload("/upload/election-nomination-document", fileData)
  },

  /**
   * Upload Overall Best Performer proof PDF
   * @param {FormData} fileData - File form data
   */
  uploadOverallBestPerformerProofPDF: (fileData) => {
    return apiClient.upload("/upload/overall-best-performer-proof-pdf", fileData)
  },
}

export default uploadApi
