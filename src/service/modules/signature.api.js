/**
 * Signature API Module
 * Self-service management of the current user's certificate signature, plus the
 * admin-only directory of users who already have a usable signature.
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

export const signatureApi = {
  /** Get the current user's signature ({ signature } | { signature: null }). */
  getMine: () => {
    return apiClient.get("/signature").then(unwrapStandardResponse)
  },

  /** Create/update the current user's signature. */
  updateMine: (data) => {
    return apiClient.put("/signature", data).then(unwrapStandardResponse)
  },

  /** Remove the current user's signature. */
  deleteMine: () => {
    return apiClient.delete("/signature").then(unwrapStandardResponse)
  },

  /** Admin: list users with a usable signature (for the signatory picker). */
  listDirectory: (search = "") => {
    return apiClient.get("/signature/directory", { params: { search } }).then(unwrapStandardResponse)
  },
}

export default signatureApi
