/**
 * Admin API Module
 * Handles admin operations: hostels, wardens, security, maintenance staff
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

export const adminApi = {
  // ==================== Profile ====================

  /**
   * Get current admin profile
   */
  getMyProfile: () => {
    return apiClient.get("/admin/profile")
  },

  // ==================== POR Certificate Template ====================

  /** Get the POR certificate template config (returns { key, value, ... }). */
  getPorCertificateTemplate: () => {
    return apiClient.get("/config/porCertificateTemplate").then(unwrapStandardResponse)
  },

  /** Update the POR certificate template config. */
  updatePorCertificateTemplate: (value) => {
    return apiClient.put("/config/porCertificateTemplate", { value }).then(unwrapStandardResponse)
  },

  // ==================== Hostels ====================
  
  /**
   * Get all hostels
   * @param {string} queries - Query string
   */
  getAllHostels: (queries = "") => {
    return apiClient.get("/admin/hostels", { queryString: queries })
  },

  /**
   * Add new hostel
   * @param {Object} hostelData - Hostel data
   */
  addHostel: (hostelData) => {
    return apiClient.post("/admin/hostel", hostelData)
  },

  /**
   * Update hostel
   * @param {string} hostelId - Hostel ID
   * @param {Object} hostelData - Updated hostel data
   */
  updateHostel: (hostelId, hostelData) => {
    return apiClient.put(`/admin/hostel/${hostelId}`, hostelData)
  },

  /**
   * Get hostel list (simplified)
   */
  getHostelList: () => {
    return apiClient.get("/admin/hostel/list")
  },

  // ==================== Dining Caterers ====================

  /**
   * Get all caterers
   * @param {string} queries - Query string
   */
  getAllCaterers: (queries = "") => {
    return apiClient.get("/admin/caterers", { queryString: queries })
  },

  /**
   * Add new caterer
   * @param {Object} catererData - Caterer data
   */
  addCaterer: (catererData) => {
    return apiClient.post("/admin/caterers", catererData).then(unwrapStandardResponse)
  },

  /**
   * Update caterer
   * @param {string} catererId - Caterer ID
   * @param {Object} catererData - Updated caterer data
   */
  updateCaterer: (catererId, catererData) => {
    return apiClient.put(`/admin/caterers/${catererId}`, catererData).then(unwrapStandardResponse)
  },

  /**
   * Archive or unarchive caterer
   * @param {string} catererId - Caterer ID
   * @param {boolean} status - Archive status
   */
  changeCatererArchiveStatus: (catererId, status) => {
    return apiClient.put(`/admin/caterers/${catererId}/archive`, { status }).then(unwrapStandardResponse)
  },

  /**
   * Get all dining periods
   * @param {string} queries - Query string
   */
  getAllDiningPeriods: (queries = "") => {
    return apiClient.get("/admin/dining-periods", { queryString: queries })
  },

  /**
   * Add new dining period
   * @param {Object} periodData - Dining period data
   */
  addDiningPeriod: (periodData) => {
    return apiClient.post("/admin/dining-periods", periodData).then(unwrapStandardResponse)
  },

  /**
   * Update dining period
   * @param {string} periodId - Dining period ID
   * @param {Object} periodData - Updated dining period data
   */
  updateDiningPeriod: (periodId, periodData) => {
    return apiClient.put(`/admin/dining-periods/${periodId}`, periodData).then(unwrapStandardResponse)
  },

  /**
   * Archive or unarchive dining period
   * @param {string} periodId - Dining period ID
   * @param {boolean} status - Archive status
   */
  changeDiningPeriodArchiveStatus: (periodId, status) => {
    return apiClient.put(`/admin/dining-periods/${periodId}/archive`, { status }).then(unwrapStandardResponse)
  },

  /**
   * Get dining rebate requests
   */
  getDiningRebates: (filters = {}) => {
    return apiClient.get("/admin/dining-rebates", { params: filters }).then(unwrapStandardResponse)
  },

  /**
   * Approve a long-term dining rebate request
   */
  approveDiningRebate: (rebateId) => {
    return apiClient.put(`/admin/dining-rebates/${rebateId}/approve`, {}).then(unwrapStandardResponse)
  },

  /**
   * Reject a long-term dining rebate request
   */
  rejectDiningRebate: (rebateId, comment = "") => {
    return apiClient.put(`/admin/dining-rebates/${rebateId}/reject`, { comment }).then(unwrapStandardResponse)
  },

  // ==================== Dining Billing ====================

  /**
   * Get all dining billing periods (with derived summary)
   * @param {string} queries - Query string (e.g. "archive=true")
   */
  getBillingPeriods: (queries = "") => {
    return apiClient.get("/admin/dining-billing-periods", { queryString: queries })
  },

  /**
   * Create a billing period
   * @param {Object} data - { name, diningPeriodIds, note }
   */
  addBillingPeriod: (data) => {
    return apiClient.post("/admin/dining-billing-periods", data).then(unwrapStandardResponse)
  },

  /**
   * Update a billing period
   * @param {string} billingPeriodId
   * @param {Object} data - { name, diningPeriodIds, note }
   */
  updateBillingPeriod: (billingPeriodId, data) => {
    return apiClient.put(`/admin/dining-billing-periods/${billingPeriodId}`, data).then(unwrapStandardResponse)
  },

  /**
   * Archive or unarchive a billing period
   * @param {string} billingPeriodId
   * @param {boolean} status - Archive status
   */
  changeBillingPeriodArchiveStatus: (billingPeriodId, status) => {
    return apiClient.put(`/admin/dining-billing-periods/${billingPeriodId}/archive`, { status }).then(unwrapStandardResponse)
  },

  /**
   * Get accounts (per-student derived charges/balance) for a billing period
   * @param {string} billingPeriodId
   */
  getBillingAccounts: (billingPeriodId) => {
    return apiClient.get(`/admin/dining-billing-periods/${billingPeriodId}/accounts`).then(unwrapStandardResponse)
  },

  /**
   * Bulk add/deduct/set student fund allocations
   * @param {string} billingPeriodId
   * @param {Object} payload - { mode: "add"|"deduct"|"set", entries: [{ rollNumber, amount }] }
   */
  bulkUpdateBillingAccounts: (billingPeriodId, payload) => {
    return apiClient.post(`/admin/dining-billing-periods/${billingPeriodId}/accounts/bulk`, payload).then(unwrapStandardResponse)
  },

  // ==================== Dining Office Logins ====================

  /**
   * Get all dining office logins
   */
  getAllDiningOfficeStaff: () => {
    return apiClient.get("/admin/dining-office")
  },

  /**
   * Create a dining office login
   * @param {Object} data - { name, email, password, category, phone? }
   */
  addDiningOfficeStaff: (data) => {
    return apiClient.post("/admin/dining-office", data)
  },

  /**
   * Update a dining office login
   * @param {string} id
   * @param {Object} data - { name?, phone?, category?, status? }
   */
  updateDiningOfficeStaff: (id, data) => {
    return apiClient.put(`/admin/dining-office/${id}`, data)
  },

  /**
   * Delete a dining office login
   * @param {string} id
   */
  deleteDiningOfficeStaff: (id) => {
    return apiClient.delete(`/admin/dining-office/${id}`)
  },

  // ==================== Wardens ====================
  
  /**
   * Add new warden
   * @param {Object} wardenData - Warden data
   */
  addWarden: (wardenData) => {
    return apiClient.post("/admin/warden", wardenData)
  },

  /**
   * Get all wardens
   */
  getAllWardens: () => {
    return apiClient.get("/admin/wardens")
  },

  /**
   * Update warden
   * @param {string} wardenId - Warden ID
   * @param {Object} wardenData - Updated warden data
   */
  updateWarden: (wardenId, wardenData) => {
    return apiClient.put(`/admin/warden/${wardenId}`, wardenData)
  },

  /**
   * Delete warden
   * @param {string} wardenId - Warden ID
   */
  deleteWarden: (wardenId) => {
    return apiClient.delete(`/admin/warden/${wardenId}`)
  },

  // ==================== Associate Wardens ====================
  
  /**
   * Get all associate wardens
   */
  getAllAssociateWardens: () => {
    return apiClient.get("/admin/associate-wardens")
  },

  /**
   * Add associate warden
   * @param {Object} data - Associate warden data
   */
  addAssociateWarden: (data) => {
    return apiClient.post("/admin/associate-warden", data)
  },

  /**
   * Update associate warden
   * @param {string} id - Associate warden ID
   * @param {Object} data - Updated data
   */
  updateAssociateWarden: (id, data) => {
    return apiClient.put(`/admin/associate-warden/${id}`, data)
  },

  /**
   * Delete associate warden
   * @param {string} id - Associate warden ID
   */
  deleteAssociateWarden: (id) => {
    return apiClient.delete(`/admin/associate-warden/${id}`)
  },

  // ==================== Hostel Supervisors ====================
  
  /**
   * Get all hostel supervisors
   */
  getAllHostelSupervisors: () => {
    return apiClient.get("/admin/hostel-supervisors")
  },

  /**
   * Add hostel supervisor
   * @param {Object} data - Hostel supervisor data
   */
  addHostelSupervisor: (data) => {
    return apiClient.post("/admin/hostel-supervisor", data)
  },

  /**
   * Update hostel supervisor
   * @param {string} id - Hostel supervisor ID
   * @param {Object} data - Updated data
   */
  updateHostelSupervisor: (id, data) => {
    return apiClient.put(`/admin/hostel-supervisor/${id}`, data)
  },

  /**
   * Delete hostel supervisor
   * @param {string} id - Hostel supervisor ID
   */
  deleteHostelSupervisor: (id) => {
    return apiClient.delete(`/admin/hostel-supervisor/${id}`)
  },

  // ==================== Gymkhana Users ====================

  /**
   * Get all Gymkhana users
   */
  getAllGymkhanaUsers: () => {
    return apiClient.get("/admin/gymkhana")
  },

  /**
   * Add Gymkhana user
   * @param {Object} data - Gymkhana user data
   */
  addGymkhana: (data) => {
    return apiClient.post("/admin/gymkhana", data)
  },

  /**
   * Update Gymkhana user
   * @param {string} id - Gymkhana user ID
   * @param {Object} data - Updated data
   */
  updateGymkhana: (id, data) => {
    return apiClient.put(`/admin/gymkhana/${id}`, data)
  },

  /**
   * Delete Gymkhana user
   * @param {string} id - Gymkhana user ID
   */
  deleteGymkhana: (id) => {
    return apiClient.delete(`/admin/gymkhana/${id}`)
  },

  // ==================== Academics Users ====================

  /**
   * Get all Academics users
   */
  getAllAcademicsUsers: () => {
    return apiClient.get("/admin/academics")
  },

  /**
   * Add Academics user
   * @param {Object} data - Academics user data
   */
  addAcademics: (data) => {
    return apiClient.post("/admin/academics", data)
  },

  /**
   * Update Academics user
   * @param {string} id - Academics user ID
   * @param {Object} data - Updated data
   */
  updateAcademics: (id, data) => {
    return apiClient.put(`/admin/academics/${id}`, data)
  },

  /**
   * Delete Academics user
   * @param {string} id - Academics user ID
   */
  deleteAcademics: (id) => {
    return apiClient.delete(`/admin/academics/${id}`)
  },

  // ==================== Security Staff ====================
  
  /**
   * Add security staff
   * @param {Object} securityData - Security staff data
   */
  addSecurity: (securityData) => {
    return apiClient.post("/admin/security", securityData)
  },

  /**
   * Get all security staff
   */
  getAllSecurityLogins: () => {
    return apiClient.get("/admin/security")
  },

  /**
   * Update security staff
   * @param {string} securityId - Security staff ID
   * @param {Object} securityData - Updated data
   */
  updateSecurity: (securityId, securityData) => {
    return apiClient.put(`/admin/security/${securityId}`, securityData)
  },

  /**
   * Delete security staff
   * @param {string} securityId - Security staff ID
   */
  deleteSecurity: (securityId) => {
    return apiClient.delete(`/admin/security/${securityId}`)
  },

  // ==================== Maintenance Staff ====================
  
  /**
   * Get all maintenance staff
   */
  getAllMaintenanceStaff: () => {
    return apiClient.get("/admin/maintenance")
  },

  /**
   * Add maintenance staff
   * @param {Object} maintenanceData - Maintenance staff data
   */
  addMaintenanceStaff: (maintenanceData) => {
    return apiClient.post("/admin/maintenance", maintenanceData)
  },

  /**
   * Update maintenance staff
   * @param {string} maintenanceId - Maintenance staff ID
   * @param {Object} maintenanceData - Updated data
   */
  updateMaintenanceStaff: (maintenanceId, maintenanceData) => {
    return apiClient.put(`/admin/maintenance/${maintenanceId}`, maintenanceData)
  },

  /**
   * Delete maintenance staff
   * @param {string} maintenanceId - Maintenance staff ID
   */
  deleteMaintenanceStaff: (maintenanceId) => {
    return apiClient.delete(`/admin/maintenance/${maintenanceId}`)
  },

  // ==================== Complaints ====================
  
  /**
   * Get all complaints
   * @param {string} queries - Query string
   */
  getAllComplaints: (queries = "") => {
    return apiClient.get("/complaint/all", { queryString: queries })
  },

  // ==================== User Management ====================
  
  /**
   * Update user password (admin action)
   * @param {string} email - User email
   * @param {string} newPassword - New password
   */
  updateUserPassword: (email, newPassword) => {
    return apiClient.post("/admin/user/update-password", { email, newPassword })
  },

  /**
   * Bulk update passwords
   * @param {Array} passwordUpdates - Array of { userId, newPassword }
   */
  bulkUpdatePasswords: (passwordUpdates) => {
    return apiClient.post("/users/bulk-password-update", { passwordUpdates })
  },

  /**
   * Remove passwords by role
   * @param {string} role - Role to remove passwords for
   */
  removePasswordsByRole: (role) => {
    return apiClient.post("/users/remove-passwords-by-role", { role })
  },

  // ==================== Config Management ====================

  /**
   * Get config by key
   * @param {string} key - Config key
   */
  getConfig: (key) => {
    return apiClient.get(`/config/${key}`)
  },

  /**
   * Update config by key
   * @param {string} key - Config key
   * @param {*} value - Config value
   */
  updateConfig: (key, value) => {
    return apiClient.put(`/config/${key}`, { value })
  },

  // ==================== Student Edit Permissions ====================

  /**
   * Get student edit permissions
   */
  getStudentEditPermissions: () => {
    return apiClient.get("/config/studentEditableFields")
  },

  /**
   * Update student edit permissions
   * @param {Array} permissions - Array of permission objects with field and allowed
   */
  updateStudentEditPermissions: (permissions) => {
    // Extract just the allowed fields to match the expected API format
    const allowedFields = permissions
      .filter((permission) => permission.allowed)
      .map((permission) => permission.field)
    return apiClient.put("/config/studentEditableFields", { value: allowedFields })
  },

  // ==================== Degrees Management ====================

  /**
   * Get degrees
   */
  getDegrees: () => {
    return apiClient.get("/config/degrees")
  },

  /**
   * Update degrees
   * @param {Array} degrees - Array of degrees
   */
  updateDegrees: (degrees) => {
    return apiClient.put("/config/degrees", { value: degrees })
  },

  /**
   * Rename a degree
   * @param {string} oldName - Old degree name
   * @param {string} newName - New degree name
   */
  renameDegree: (oldName, newName) => {
    return apiClient
      .put("/students/profiles-admin/degrees/rename", { oldName, newName })
      .then(unwrapStandardResponse)
  },

  // ==================== Departments Management ====================

  /**
   * Get departments
   */
  getDepartments: () => {
    return apiClient.get("/config/departments")
  },

  /**
   * Update departments
   * @param {Array} departments - Array of departments
   */
  updateDepartments: (departments) => {
    return apiClient.put("/config/departments", { value: departments })
  },

  /**
   * Rename a department
   * @param {string} oldName - Old department name
   * @param {string} newName - New department name
   */
  renameDepartment: (oldName, newName) => {
    return apiClient
      .put("/students/profiles-admin/departments/rename", { oldName, newName })
      .then(unwrapStandardResponse)
  },

  // ==================== Student Batches Management ====================

  /**
   * Get student batches configuration
   */
  getStudentBatches: () => {
    return apiClient.get("/config/studentBatches")
  },

  /**
   * Update student batches configuration
   * @param {Object} studentBatches - Nested degree -> department -> batches config
   */
  updateStudentBatches: (studentBatches) => {
    return apiClient.put("/config/studentBatches", { value: studentBatches })
  },

  /**
   * Rename a student batch within a degree/department combination
   */
  renameStudentBatch: ({ degree, department, oldName, newName }) => {
    return apiClient
      .put("/students/profiles-admin/batches/rename", { degree, department, oldName, newName })
      .then(unwrapStandardResponse)
  },

  // ==================== Student Groups Management ====================

  /**
   * Get student groups configuration
   */
  getStudentGroups: () => {
    return apiClient.get("/config/studentGroups")
  },

  /**
   * Update student groups configuration
   * @param {Array} studentGroups - Flat list of student groups
   */
  updateStudentGroups: (studentGroups) => {
    return apiClient.put("/config/studentGroups", { value: studentGroups })
  },

  /**
   * Rename a student group
   * @param {string} oldName - Old group name
   * @param {string} newName - New group name
   */
  renameStudentGroup: (oldName, newName) => {
    return apiClient
      .put("/students/profiles-admin/groups/rename", { oldName, newName })
      .then(unwrapStandardResponse)
  },

  // ==================== Academic Holidays Management ====================

  /**
   * Get academic holidays configuration
   * Value shape: { "2025": [{ title, date }], "2026": [...] }
   */
  getAcademicHolidays: () => {
    return apiClient.get("/config/academicHolidays")
  },

  /**
   * Update academic holidays configuration
   * @param {Object} academicHolidays - Year-wise holiday map
   */
  updateAcademicHolidays: (academicHolidays) => {
    return apiClient.put("/config/academicHolidays", { value: academicHolidays })
  },

  // ==================== Gymkhana Event Categories ====================

  getGymkhanaEventCategories: () => {
    return apiClient.get("/config/gymkhanaEventCategories")
  },

  updateGymkhanaEventCategories: (categories) => {
    return apiClient.put("/config/gymkhanaEventCategories", { value: categories })
  },

  // ==================== System Settings ====================

  /**
   * Get system settings
   */
  getSystemSettings: () => {
    return apiClient.get("/config/systemSettings")
  },

  /**
   * Update system settings
   * @param {Object} config - System settings config
   */
  updateSystemSettings: (config) => {
    return apiClient.put("/config/systemSettings", { value: config })
  },

  // ==================== Accommodation Settings ====================

  /**
   * Get visitor accommodation settings
   */
  getAccommodationSettings: () => {
    return apiClient.get("/config/accommodation")
  },

  /**
   * Update visitor accommodation settings
   * @param {Object} config - Accommodation settings config
   */
  updateAccommodationSettings: (config) => {
    return apiClient.put("/config/accommodation", { value: config })
  },

  // ==================== Maintenance Staff Stats ====================

  /**
   * Get maintenance staff stats
   * @param {string} staffId - Staff ID
   */
  getMaintenanceStaffStats: (staffId) => {
    return apiClient.get(`/admin/maintenance-staff-stats/${staffId}`)
  },

  // ==================== Family Members ====================

  /**
   * Get family details for a user
   * @param {string} userId - User ID
   */
  getFamilyDetails: (userId) => {
    return apiClient.get(`/family/${userId}`)
  },

  /**
   * Add family member
   * @param {string} userId - User ID
   * @param {Object} familyMemberData - Family member data
   */
  addFamilyMember: (userId, familyMemberData) => {
    return apiClient.post(`/family/${userId}`, familyMemberData)
  },

  /**
   * Update family member
   * @param {string} memberId - Family member ID
   * @param {Object} familyMemberData - Family member data
   */
  updateFamilyMember: (memberId, familyMemberData) => {
    return apiClient.put(`/family/${memberId}`, familyMemberData)
  },

  /**
   * Delete family member
   * @param {string} memberId - Family member ID
   */
  deleteFamilyMember: (memberId) => {
    return apiClient.delete(`/family/${memberId}`)
  },

  /**
   * Bulk update family members
   * @param {Object} familyMembersData - Bulk family members data
   */
  updateBulkFamilyMembers: (familyMembersData) => {
    return apiClient.post("/family/bulk-update", familyMembersData)
  },

  // ==================== Bulk Student Operations ====================

  /**
   * Bulk update students status
   * @param {Array} rollNumbers - Array of roll numbers
   * @param {string} status - Status to set
   */
  bulkUpdateStudentsStatus: (rollNumbers, status) => {
    return apiClient
      .post("/students/profiles-admin/profiles/status", { rollNumbers, status })
      .then((response) => response?.success === true)
  },

  /**
   * Bulk update day scholar details
   * @param {Object} dayScholarData - Day scholar data
   */
  bulkUpdateDayScholarDetails: (dayScholarData) => {
    return apiClient.put("/students/profiles-admin/profiles/day-scholar", { data: dayScholarData }).then((response) => ({
      success: response?.success === true,
      errors: response?.data?.errors || [],
      results: response?.data?.results || [],
      message: response?.message || null,
    }))
  },

  // ==================== Admin Undertakings ====================

  /**
   * Get all undertakings (admin)
   */
  getUndertakings: () => {
    return apiClient.get("/undertaking/admin/undertakings")
  },

  /**
   * Create undertaking
   * @param {Object} undertakingData - Undertaking data
   */
  createUndertaking: (undertakingData) => {
    return apiClient.post("/undertaking/admin/undertakings", undertakingData)
  },

  /**
   * Update undertaking
   * @param {string} undertakingId - Undertaking ID
   * @param {Object} undertakingData - Undertaking data
   */
  updateUndertaking: (undertakingId, undertakingData) => {
    return apiClient.put(`/undertaking/admin/undertakings/${undertakingId}`, undertakingData)
  },

  /**
   * Delete undertaking
   * @param {string} undertakingId - Undertaking ID
   */
  deleteUndertaking: (undertakingId) => {
    return apiClient.delete(`/undertaking/admin/undertakings/${undertakingId}`)
  },

  /**
   * Get students for undertaking
   * @param {string} undertakingId - Undertaking ID
   */
  getUndertakingStudents: (undertakingId) => {
    return apiClient.get(`/undertaking/admin/undertakings/${undertakingId}/students`)
  },

  /**
   * Add students to undertaking
   * @param {string} undertakingId - Undertaking ID
   * @param {Array} studentIds - Array of student IDs
   */
  addStudentsToUndertaking: (undertakingId, studentIds) => {
    return apiClient.post(`/undertaking/admin/undertakings/${undertakingId}/students`, { studentIds })
  },

  /**
   * Remove student from undertaking
   * @param {string} undertakingId - Undertaking ID
   * @param {string} studentId - Student ID
   */
  removeStudentFromUndertaking: (undertakingId, studentId) => {
    return apiClient.delete(`/undertaking/admin/undertakings/${undertakingId}/students/${studentId}`)
  },

  /**
   * Get undertaking students status
   * @param {string} undertakingId - Undertaking ID
   */
  getUndertakingStudentsStatus: (undertakingId) => {
    return apiClient.get(`/undertaking/admin/undertakings/${undertakingId}/status`)
  },

  /**
   * Add students to undertaking by roll numbers
   * @param {string} undertakingId - Undertaking ID
   * @param {Array} rollNumbers - Array of roll numbers
   */
  addStudentsToUndertakingByRollNumbers: (undertakingId, rollNumbers) => {
    return apiClient.post(`/undertaking/admin/undertakings/${undertakingId}/students/by-roll-numbers`, { rollNumbers })
  },
}

export default adminApi
