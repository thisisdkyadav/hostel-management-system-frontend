/**
 * JR Appointments API Module
 * Public submission + Joint Registrar admin review + Hostel Gate entry APIs.
 */

import apiClient from "../core/apiClient"

export const jrAppointmentsApi = {
  // Public (no login required)
  submitPublicAppointment: (data) => {
    return apiClient.post("/jr-appointments", data)
  },

  // Admin (Joint Registrar SA)
  getAdminAppointments: (params = {}) => {
    return apiClient.get("/jr-appointments/admin", { params })
  },

  getAdminAppointmentById: (appointmentId) => {
    return apiClient.get(`/jr-appointments/admin/${appointmentId}`)
  },

  reviewAppointment: (appointmentId, data) => {
    return apiClient.patch(`/jr-appointments/admin/${appointmentId}/review`, data)
  },

  // Hostel Gate
  getGateAppointments: (params = {}) => {
    return apiClient.get("/jr-appointments/gate", { params })
  },

  markGateEntry: (appointmentId, data = {}) => {
    return apiClient.patch(`/jr-appointments/gate/${appointmentId}/entry`, data)
  },
}

export default jrAppointmentsApi
