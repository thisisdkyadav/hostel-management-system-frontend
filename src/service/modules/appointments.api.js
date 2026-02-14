/**
 * Appointments API Module
 * Public submission, admin review, and Hostel Gate entry APIs.
 */

import apiClient from "../core/apiClient"

export const appointmentsApi = {
  // Public (no login required)
  getPublicTargets: () => {
    return apiClient.get("/appointments/public/targets")
  },

  submitPublicAppointment: (data) => {
    return apiClient.post("/appointments", data)
  },

  // Admin (appointment-enabled admin subroles)
  getMyAvailability: () => {
    return apiClient.get("/appointments/admin/me/availability")
  },

  updateMyAvailability: (acceptingAppointments) => {
    return apiClient.patch("/appointments/admin/me/availability", { acceptingAppointments })
  },

  getAdminAppointments: (params = {}) => {
    return apiClient.get("/appointments/admin", { params })
  },

  getAdminAppointmentById: (appointmentId) => {
    return apiClient.get(`/appointments/admin/${appointmentId}`)
  },

  reviewAppointment: (appointmentId, data) => {
    return apiClient.patch(`/appointments/admin/${appointmentId}/review`, data)
  },

  // Hostel Gate
  getGateAppointments: (params = {}) => {
    return apiClient.get("/appointments/gate", { params })
  },

  markGateEntry: (appointmentId, data = {}) => {
    return apiClient.patch(`/appointments/gate/${appointmentId}/entry`, data)
  },
}

export default appointmentsApi
