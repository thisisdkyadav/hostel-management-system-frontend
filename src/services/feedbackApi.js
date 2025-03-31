import { baseUrl, fetchOptions } from "../constants/appConstants"

export const feedbackApi = {
  getFeedbacks: async () => {
    const response = await fetch(`${baseUrl}/feedback/`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch feedbacks")
    }

    return response.json()
  },

  updateFeedbackStatus: async (feedbackId, status) => {
    const response = await fetch(`${baseUrl}/feedback/update-status/${feedbackId}`, {
      method: "PUT",
      ...fetchOptions,
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to update feedback status")
    }

    return response.json()
  },

  replyToFeedback: async (feedbackId, reply) => {
    const response = await fetch(`${baseUrl}/feedback/reply/${feedbackId}`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify({ reply }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to submit reply")
    }

    return response.json()
  },

  submitFeedback: async (feedback) => {
    const response = await fetch(`${baseUrl}/feedback/add`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify(feedback),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to submit feedback")
    }

    return response.json()
  },

  updateFeedback: async (feedbackId, updatedFeedback) => {
    const response = await fetch(`${baseUrl}/feedback/${feedbackId}`, {
      method: "PUT",
      ...fetchOptions,
      body: JSON.stringify(updatedFeedback),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to update feedback")
    }

    return response.json()
  },

  deleteFeedback: async (feedbackId) => {
    const response = await fetch(`${baseUrl}/feedback/${feedbackId}`, {
      method: "DELETE",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to delete feedback")
    }

    return response.json()
  },
}
