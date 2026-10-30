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
 * Dining tags: yes/no student attributes (e.g. "Jain food"). Admin and the Dining Office manage
 * standalone tags here and set any student's answer; period (allocation) tags are defined in the
 * dining period form but their answers are managed through these same endpoints.
 */
export const diningTagsApi = {
  /** `{ kind?, periodId?, archived? }` → Tag[] with yes/no counts. */
  getTags: (params = {}) => {
    return apiClient.get("/dining-tags", { params }).then(unwrapStandardResponse)
  },

  /** Create a standalone tag. */
  createTag: (payload) => {
    return apiClient.post("/dining-tags", payload).then(unwrapStandardResponse)
  },

  /** Update a standalone tag. */
  updateTag: (tagId, payload) => {
    return apiClient.put(`/dining-tags/${tagId}`, payload).then(unwrapStandardResponse)
  },

  setTagArchived: (tagId, isArchived) => {
    return apiClient.put(`/dining-tags/${tagId}/archive`, { isArchived }).then(unwrapStandardResponse)
  },

  /** `{ search?, value?: "yes"|"no"|"unanswered", page?, limit? }` → { items, total, page, limit, counts }. */
  getTagStudents: (tagId, params = {}) => {
    return apiClient.get(`/dining-tags/${tagId}/students`, { params }).then(unwrapStandardResponse)
  },

  /** `value` true | false | null (null clears the answer, falling back to the default). */
  setStudentValue: (tagId, studentUserId, value) => {
    return apiClient.put(`/dining-tags/${tagId}/students/${studentUserId}`, { value }).then(unwrapStandardResponse)
  },

  /** `entries: [{ rollNumber, value }]` → { updated, skipped: [{ rollNumber, reason }] }. */
  bulkSetValues: (tagId, entries) => {
    return apiClient.post(`/dining-tags/${tagId}/students/bulk`, { entries }).then(unwrapStandardResponse)
  },
}

export default diningTagsApi
