/**
 * API Service - Central Export
 * 
 * This file provides a unified interface for all API modules.
 * Import from this file for consistent API access throughout the application.
 * 
 * @example
 * import { authApi, studentApi, hostelApi } from '@/service'
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
export { uploadApi, resolveUploadedFileRef, resolveUploadedFileUrl } from "./modules/upload.api"
export { notificationApi } from "./modules/notification.api"
export { authzApi } from "./modules/authz.api"
export { userApi } from "./modules/user.api"
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
export { appointmentsApi } from "./modules/appointments.api"
export { overallBestPerformerApi } from "./modules/overallBestPerformer.api"
export { electionsApi } from "./modules/elections.api"

// NOTE:
// Keep this module as named re-exports only.
// Avoid importing every API module here for a default aggregate object,
// because it inflates shared/startup bundles.
