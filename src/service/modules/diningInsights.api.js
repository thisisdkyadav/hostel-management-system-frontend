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

export const diningInsightsApi = {
  /** Admin dining observatory: arrivals, rhythm, caterer league, forecast. `params.days` is 7..90. */
  getDiningInsights: (params = {}) => {
    return apiClient.get("/dining-insights/overview", { params }).then(unwrapStandardResponse)
  },
}

export default diningInsightsApi
