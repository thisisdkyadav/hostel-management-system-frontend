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

export const catererApi = {
  getMealVerificationContext: () => {
    return apiClient.get("/dining-meal-verification/context").then(unwrapStandardResponse)
  },

  getMealVerificationFeed: (filters = {}) => {
    return apiClient.get("/dining-meal-verification/feed", { params: filters }).then(unwrapStandardResponse)
  },

  getCurrentMealStudents: () => {
    return apiClient.get("/dining-meal-verification/available-students").then(unwrapStandardResponse)
  },

  getRebateSummary: () => {
    return apiClient.get("/dining-meal-verification/rebate-summary").then(unwrapStandardResponse)
  },

  manualMealVerification: (payload) => {
    return apiClient.post("/dining-meal-verification/manual", payload).then(unwrapStandardResponse)
  },

  getMealRecordOptions: () => {
    return apiClient.get("/dining-caterer/meal-records/options").then(unwrapStandardResponse)
  },

  getMealRecordOverview: (params = {}) => {
    return apiClient.get("/dining-caterer/meal-records/overview", { params }).then(unwrapStandardResponse)
  },

  getMealRecord: (params = {}) => {
    return apiClient.get("/dining-caterer/meal-records", { params }).then(unwrapStandardResponse)
  },

  getRebateOverview: (params = {}) => {
    return apiClient.get("/dining-caterer/rebates/overview", { params }).then(unwrapStandardResponse)
  },

  getRebateDay: (date) => {
    return apiClient.get("/dining-caterer/rebates/day", { params: { date } }).then(unwrapStandardResponse)
  },

  getRebates: (params = {}) => {
    return apiClient.get("/dining-caterer/rebates", { params }).then(unwrapStandardResponse)
  },
}

export default catererApi
