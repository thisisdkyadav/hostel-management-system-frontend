import apiClient from "../core/apiClient"
import { API_BACKENDS, getApiBaseUrl } from "@/config/apiConfig"

const path = "/intern-accommodation"
export const h4FileUrl = (id, suffix = "invoice", params = {}) =>
  `${getApiBaseUrl(API_BACKENDS.NODE)}${path}/requests/${id}/${suffix}?${new URLSearchParams(params)}`
export const h4AccessFileUrl = (token, suffix = "invoice") =>
  `${getApiBaseUrl(API_BACKENDS.NODE)}${path}/access/${encodeURIComponent(token)}/${suffix}`
export const h4Api = {
  options: () => apiClient.get(`${path}/options`),
  list: (params) => apiClient.get(`${path}/requests`, { params }),
  get: (id) => apiClient.get(`${path}/requests/${id}`),
  availability: (id) => apiClient.get(`${path}/requests/${id}/availability`),
  create: (body) => apiClient.post(`${path}/batches`, body),
  edit: (id, body) => apiClient.post(`${path}/requests/${id}/edit`, body),
  action: (id, action, body) => apiClient.post(`${path}/requests/${id}/${action}`, body),
  batchDecision: (body) => apiClient.post(`${path}/batch-decision`, body),
  upload: (id, form) => apiClient.upload(`${path}/requests/${id}/proof`, form),
  access: (token) => apiClient.get(`${path}/access/${encodeURIComponent(token)}`),
  accessAction: (token, action, body) => apiClient.post(`${path}/access/${encodeURIComponent(token)}/${action}`, body),
  accessUpload: (token, form) => apiClient.upload(`${path}/access/${encodeURIComponent(token)}/proof`, form),
  export: async (params) => {
    const response = await apiClient.download(`${path}/invoices/export?${new URLSearchParams(params)}`)
    return response.blob()
  },
}
