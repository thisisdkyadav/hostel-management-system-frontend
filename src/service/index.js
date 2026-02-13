/**
 * API Service - Central Export
 * 
 * This file provides a unified interface for all API modules.
 * Import from this file for consistent API access throughout the application.
 * 
 * @example
 * // Named imports (recommended)
 * import { authApi, studentApi, hostelApi } from '@/service'
 * 
 * // Or import the entire api object
 * import api from '@/service'
 * api.auth.login(credentials)
 */

// Core utilities
export { apiClient, buildUrl, buildUrlWithQueryString } from "./core/apiClient"
export { 
  ApiError, 
  NetworkError, 
  ValidationError, 
  AuthError, 
  ForbiddenError, 
  NotFoundError,
  handleError 
} from "./core/errors"

// API Modules
export { authApi } from "./modules/auth.api"
export { studentApi } from "./modules/student.api"
export { studentProfileApi } from "./modules/studentProfile.api"
export { hostelApi } from "./modules/hostel.api"
export { adminApi } from "./modules/admin.api"
export { wardenApi, associateWardenApi, hostelSupervisorApi } from "./modules/warden.api"
export { visitorApi } from "./modules/visitor.api"
export { leaveApi } from "./modules/leave.api"
export { complaintApi } from "./modules/complaint.api"
export { securityApi } from "./modules/security.api"
export { maintenanceApi } from "./modules/maintenance.api"
export { eventsApi } from "./modules/events.api"
export { lostAndFoundApi } from "./modules/lostAndFound.api"
export { inventoryApi } from "./modules/inventory.api"
export { healthApi } from "./modules/health.api"
export { feedbackApi } from "./modules/feedback.api"
export { taskApi } from "./modules/task.api"
export { statsApi } from "./modules/stats.api"
export { dashboardApi } from "./modules/dashboard.api"
export { uploadApi } from "./modules/upload.api"
export { notificationApi } from "./modules/notification.api"
export { userApi } from "./modules/user.api"
export { accessControlApi } from "./modules/accessControl.api"
export { certificateApi } from "./modules/certificate.api"
export { idCardApi } from "./modules/idCard.api"
export { hostelGateApi } from "./modules/hostelGate.api"
export { insuranceProviderApi } from "./modules/insuranceProvider.api"
export { liveCheckInOutApi } from "./modules/liveCheckInOut.api"
export { onlineUsersApi } from "./modules/onlineUsers.api"
export { sheetApi } from "./modules/sheet.api"
export { superAdminApi } from "./modules/superAdmin.api"
export { undertakingApi } from "./modules/undertaking.api"
export { discoApi } from "./modules/disco.api"
export { faceScannerApi } from "./modules/faceScanner.api"
export { jrAppointmentsApi } from "./modules/jrAppointments.api"

// Default export with all APIs grouped
import { authApi } from "./modules/auth.api"
import { studentApi } from "./modules/student.api"
import { studentProfileApi } from "./modules/studentProfile.api"
import { hostelApi } from "./modules/hostel.api"
import { adminApi } from "./modules/admin.api"
import { wardenApi, associateWardenApi, hostelSupervisorApi } from "./modules/warden.api"
import { visitorApi } from "./modules/visitor.api"
import { leaveApi } from "./modules/leave.api"
import { complaintApi } from "./modules/complaint.api"
import { securityApi } from "./modules/security.api"
import { maintenanceApi } from "./modules/maintenance.api"
import { eventsApi } from "./modules/events.api"
import { lostAndFoundApi } from "./modules/lostAndFound.api"
import { inventoryApi } from "./modules/inventory.api"
import { healthApi } from "./modules/health.api"
import { feedbackApi } from "./modules/feedback.api"
import { taskApi } from "./modules/task.api"
import { statsApi } from "./modules/stats.api"
import { dashboardApi } from "./modules/dashboard.api"
import { uploadApi } from "./modules/upload.api"
import { notificationApi } from "./modules/notification.api"
import { userApi } from "./modules/user.api"
import { accessControlApi } from "./modules/accessControl.api"
import { certificateApi } from "./modules/certificate.api"
import { idCardApi } from "./modules/idCard.api"
import { hostelGateApi } from "./modules/hostelGate.api"
import { insuranceProviderApi } from "./modules/insuranceProvider.api"
import { liveCheckInOutApi } from "./modules/liveCheckInOut.api"
import { onlineUsersApi } from "./modules/onlineUsers.api"
import { sheetApi } from "./modules/sheet.api"
import { superAdminApi } from "./modules/superAdmin.api"
import { undertakingApi } from "./modules/undertaking.api"
import { discoApi } from "./modules/disco.api"
import { faceScannerApi } from "./modules/faceScanner.api"
import { jrAppointmentsApi } from "./modules/jrAppointments.api"

const api = {
  auth: authApi,
  student: studentApi,
  studentProfile: studentProfileApi,
  hostel: hostelApi,
  admin: adminApi,
  warden: wardenApi,
  associateWarden: associateWardenApi,
  hostelSupervisor: hostelSupervisorApi,
  visitor: visitorApi,
  leave: leaveApi,
  complaint: complaintApi,
  security: securityApi,
  maintenance: maintenanceApi,
  events: eventsApi,
  lostAndFound: lostAndFoundApi,
  inventory: inventoryApi,
  health: healthApi,
  feedback: feedbackApi,
  task: taskApi,
  stats: statsApi,
  dashboard: dashboardApi,
  upload: uploadApi,
  notification: notificationApi,
  user: userApi,
  accessControl: accessControlApi,
  certificate: certificateApi,
  idCard: idCardApi,
  hostelGate: hostelGateApi,
  insuranceProvider: insuranceProviderApi,
  liveCheckInOut: liveCheckInOutApi,
  onlineUsers: onlineUsersApi,
  sheet: sheetApi,
  superAdmin: superAdminApi,
  undertaking: undertakingApi,
  disco: discoApi,
  faceScanner: faceScannerApi,
  jrAppointments: jrAppointmentsApi,
}

export default api
