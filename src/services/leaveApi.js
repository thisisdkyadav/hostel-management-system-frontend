import { baseUrl, fetchOptions } from "../constants/appConstants"

export const leaveApi = {
  /**
   *
   * @param {reason, startDate, endDate} leaveData
   * @returns
   */
  createLeave: async (leaveData) => {
    const response = await fetch(`${baseUrl}/leave`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify(leaveData),
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to create leave")
    }
    return response.json()
  },

  getMyLeaves: async () => {
    const response = await fetch(`${baseUrl}/leave/my-leaves`, {
      method: "GET",
      ...fetchOptions,
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to get my leaves")
    }
    return response.json()
  },

  /**
   * get all leaves with pagination and filters query params
   * @param {userId, status, startDate, endDate, page = 1, limit = 10} queryParams
   * @returns
   */
  getLeaves: async (queryParams) => {
    const queryParamsString = new URLSearchParams(queryParams).toString()
    const response = await fetch(`${baseUrl}/leave/all?${queryParamsString}`, {
      method: "GET",
      ...fetchOptions,
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to get leaves")
    }
    return response.json()
  },

  /**
   * approve leave
   * @param {leaveId} leaveId
   * @param {approvalInfo} leaveData
   * @returns
   */
  approveLeave: async (leaveId, leaveData) => {
    const response = await fetch(`${baseUrl}/leave/${leaveId}/approve`, {
      method: "PUT",
      ...fetchOptions,
      body: JSON.stringify(leaveData),
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to approve leave")
    }
    return response.json()
  },

  /**
   * reject leave
   * @param {leaveId} leaveId
   * @param {reasonForRejection} leaveData
   * @returns
   */
  rejectLeave: async (leaveId, leaveData) => {
    const response = await fetch(`${baseUrl}/leave/${leaveId}/reject`, {
      method: "PUT",
      ...fetchOptions,
      body: JSON.stringify(leaveData),
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to reject leave")
    }
    return response.json()
  },
}

export default leaveApi
