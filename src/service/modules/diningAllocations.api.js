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

/**
 * Who is allocated to which caterer, period by period. Admin and the Dining Office read every
 * caterer (pass `catererId` to narrow); a caterer login reads only its own kitchen. Writes
 * (assign / move / remove) live on adminApi.
 */
export const diningAllocationsApi = {
  /** Every period with seat counts per caterer, plus the period to open by default. */
  getPeriods: (params = {}) => {
    return apiClient.get("/dining-allocations/periods", { params }).then(unwrapStandardResponse)
  },

  /** The student roster of one period (`periodId` required) with meals, rebates and billing figures. */
  getRoster: (params = {}) => {
    return apiClient.get("/dining-allocations/roster", { params }).then(unwrapStandardResponse)
  },

  /**
   * Clear the "Unregistered" mark of an auto-allocated student so they may request rebates for the period again.
   * Admin and the Dining Office only. Returns { allocation } (the roster row).
   */
  markRegistered: (periodId, studentUserId) => {
    return apiClient.put(`/dining-allocations/${periodId}/students/${studentUserId}/registered`).then(unwrapStandardResponse)
  },

  /** Every period one student was allocated in, newest first. */
  getStudentHistory: (studentUserId) => {
    return apiClient.get("/dining-allocations/student-history", { params: { studentUserId } }).then(unwrapStandardResponse)
  },
}

export default diningAllocationsApi
