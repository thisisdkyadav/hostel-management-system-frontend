import { baseUrl } from "../constants/appConstants"

export const visitorApi = {
  submitVisitorRequest: async (visitorData) => {
    try {
      const response = await fetch(`${baseUrl}/visitor/submit`, {
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

  // Get All Visitor Requests (Essential data only for table view)
  getVisitorRequestsSummary: async () => {
    try {
      const response = await fetch(`${baseUrl}/visitor/requests/summary`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch visitor requests summary")
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching visitor requests summary:", error)
      throw error
    }
  },

  // Get All Visitor Requests (Full data - legacy method)
  getVisitorRequests: async () => {
    try {
      const response = await fetch(`${baseUrl}/visitor/requests`, {
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

  // Get Single Visitor Request by ID (Full details)
  getVisitorRequestById: async (requestId) => {
    try {
      const response = await fetch(`${baseUrl}/visitor/requests/${requestId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch visitor request details")
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching visitor request details:", error)
      throw error
    }
  },

  // Get All Visitor Profiles
  getVisitorProfiles: async () => {
    try {
      const response = await fetch(`${baseUrl}/visitor/profiles`, {
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
      const response = await fetch(`${baseUrl}/visitor/profiles`, {
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
      const response = await fetch(`${baseUrl}/visitor/requests`, {
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
      const response = await fetch(`${baseUrl}/visitor/requests/${requestId}`, {
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
      const response = await fetch(`${baseUrl}/visitor/requests/${requestId}`, {
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
      const response = await fetch(`${baseUrl}/visitor/profiles/${profileId}`, {
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
      const response = await fetch(`${baseUrl}/visitor/profiles/${profileId}`, {
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
      const response = await fetch(`${baseUrl}/visitor/requests/${requestId}/approve`, {
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
      const response = await fetch(`${baseUrl}/visitor/requests/${requestId}/reject`, {
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

  // Allocate Room to Visitor Request
  allocateRooms: async (requestId, allocationData) => {
    try {
      const response = await fetch(`${baseUrl}/visitor/requests/${requestId}/allocate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ allocationData }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch students")
      }

      return await response.json()
    } catch (error) {
      console.error("Error allocating room to visitor request:", error)
      throw error
    }
  },

  // Security Check-in Visitor
  checkInVisitor: async (requestId, checkInData) => {
    try {
      const response = await fetch(`${baseUrl}/visitor/requests/${requestId}/checkin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(checkInData),
      })

      if (!response.ok) {
        throw new Error("Failed to check-in visitor")
      }

      return await response.json()
    } catch (error) {
      console.error("Error checking in visitor:", error)
      throw error
    }
  },

  // Security Check-out Visitor
  checkOutVisitor: async (requestId, checkOutData) => {
    try {
      const response = await fetch(`${baseUrl}/visitor/requests/${requestId}/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(checkOutData),
      })

      if (!response.ok) {
        throw new Error("Failed to check-out visitor")
      }

      return await response.json()
    } catch (error) {
      console.error("Error checking out visitor:", error)
      throw error
    }
  },

  // Update Check-in/Check-out Times
  updateCheckTimes: async (requestId, checkData) => {
    try {
      const response = await fetch(`${baseUrl}/visitor/requests/${requestId}/update-check-times`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(checkData),
      })

      if (!response.ok) {
        throw new Error("Failed to update check times")
      }

      return await response.json()
    } catch (error) {
      console.error("Error updating check times:", error)
      throw error
    }
  },

  //
}
