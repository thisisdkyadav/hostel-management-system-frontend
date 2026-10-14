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

/** The caterer meal-record views across every caterer, for Admin and the Dining Office. Pass `catererId` to narrow to one. */
export const diningOversightApi = {
  getMealRecordOptions: (params = {}) => {
    return apiClient.get("/dining-oversight/meal-records/options", { params }).then(unwrapStandardResponse)
  },

  getMealRecordOverview: (params = {}) => {
    return apiClient.get("/dining-oversight/meal-records/overview", { params }).then(unwrapStandardResponse)
  },

  getMealRecord: (params = {}) => {
    return apiClient.get("/dining-oversight/meal-records", { params }).then(unwrapStandardResponse)
  },

  /** Counts, per-caterer breakdown and arrival times for one meal, without the roster. */
  getMealPulse: (params = {}) => {
    return apiClient.get("/dining-oversight/meal-records/pulse", { params }).then(unwrapStandardResponse)
  },

  /** Latest scans of a day, newest first, with rooms and caterers. */
  getMealFeed: (params = {}) => {
    return apiClient.get("/dining-oversight/feed", { params }).then(unwrapStandardResponse)
  },
}

export default diningOversightApi
