/**
 * Dining Office API Module
 * Endpoints for the Dining-role / Office sub-role portal (read-only oversight).
 */

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

export const diningOfficeApi = {
  /**
   * Aggregated dining-office dashboard snapshot.
   */
  getDashboard: () => apiClient.get("/dining-office/dashboard").then(unwrapStandardResponse),
}

export default diningOfficeApi
