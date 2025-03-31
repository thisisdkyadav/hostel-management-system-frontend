const API_BASE_URL = "http://localhost:5000/api"

export const visitorApi = {
  submitVisitorRequest: async (visitorData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/visitor/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(visitorData),
      })

      if (!response.ok) {
        throw new Error("Failed to submit visitor request")
      }

      return await response.json()
    } catch (error) {
      console.error("Error submitting visitor request:", error)
      throw error
    }
  },

  // Get All Visitor Requests
  getVisitorRequests: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/visitor/requests`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch visitor requests")
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching visitor requests:", error)
      throw error
    }
  },

  // Get All Visitor Profiles
  getVisitorProfiles: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/visitor/profiles`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch visitor profiles")
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching visitor profiles:", error)
      throw error
    }
  },

  // Add Visitor Profile
  addVisitorProfile: async (profileData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/visitor/profiles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(profileData),
      })

      if (!response.ok) {
        throw new Error("Failed to add visitor profile")
      }

      return await response.json()
    } catch (error) {
      console.error("Error adding visitor profile:", error)
      throw error
    }
  },

  // Add Visitor Request
  addVisitorRequest: async (requestData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/visitor/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        throw new Error("Failed to submit visitor request")
      }

      return await response.json()
    } catch (error) {
      console.error("Error submitting visitor request:", error)
      throw error
    }
  },

  // Update Visitor Request
  updateVisitorRequest: async (requestId, requestData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/visitor/requests/${requestId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        throw new Error("Failed to update visitor request")
      }

      return await response.json()
    } catch (error) {
      console.error("Error updating visitor request:", error)
      throw error
    }
  },

  // Cancel Visitor Request
  cancelVisitorRequest: async (requestId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/visitor/requests/${requestId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to cancel visitor request")
      }

      return await response.json()
    } catch (error) {
      console.error("Error canceling visitor request:", error)
      throw error
    }
  },

  // Update Visitor Profile
  updateVisitorProfile: async (profileId, profileData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/visitor/profiles/${profileId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(profileData),
      })

      if (!response.ok) {
        throw new Error("Failed to update visitor profile")
      }

      return await response.json()
    } catch (error) {
      console.error("Error updating visitor profile:", error)
      throw error
    }
  },

  // Delete Visitor Profile
  deleteVisitorProfile: async (profileId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/visitor/profiles/${profileId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to delete visitor profile")
      }

      return await response.json()
    } catch (error) {
      console.error("Error deleting visitor profile:", error)
      throw error
    }
  },

  // Approve Visitor Request
  approveVisitorRequest: async (requestId, hostelId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/visitor/requests/${requestId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ hostelId }),
      })

      if (!response.ok) {
        throw new Error("Failed to approve visitor request")
      }

      return await response.json()
    } catch (error) {
      console.error("Error approving visitor request:", error)
      throw error
    }
  },
  // Reject Visitor Request
  rejectVisitorRequest: async (requestId, reason) => {
    try {
      const response = await fetch(`${API_BASE_URL}/visitor/requests/${requestId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ reason }),
      })

      if (!response.ok) {
        throw new Error("Failed to reject visitor request")
      }

      return await response.json()
    } catch (error) {
      console.error("Error rejecting visitor request:", error)
      throw error
    }
  },
}
