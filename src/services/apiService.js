import { baseUrl, fetchOptions } from "../constants/appConstants"
// import { adminApi } from "./adminApi"
// import { taskApi } from "./taskApi"
// import { userApi } from "./userApi"
import { studentProfileApi } from "./studentProfileApi"
import { liveCheckInOutApi } from "./liveCheckInOutApi"

export const authApi = {
  verify: async () => {
    const response = await fetch(`${baseUrl}/auth/user`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      throw new Error("Authentication verification failed")
    }

    return response.json()
  },

  login: async (credentials) => {
    const response = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Login failed")
    }

    return response.json()
  },

  loginWithGoogle: async (token) => {
    const response = await fetch(`${baseUrl}/auth/google`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify({ token }),
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Google login failed")
    }

    return response.json()
  },

  verifySSOToken: async (token) => {
    const response = await fetch(`${baseUrl}/auth/verify-sso-token`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify({ token }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "SSO verification failed")
    }

    return response.json()
  },

  logout: async () => {
    const response = await fetch(`${baseUrl}/auth/logout`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      throw new Error("Logout failed on server")
    }

    return response.json()
  },

  changePassword: async (oldPassword, newPassword) => {
    const response = await fetch(`${baseUrl}/auth/update-password`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify({ oldPassword, newPassword }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to update password")
    }

    return response.json()
  },

  getUserDevices: async () => {
    const response = await fetch(`${baseUrl}/auth/user/devices`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch user devices")
    }

    return response.json()
  },

  logoutFromDevice: async (sessionId) => {
    const response = await fetch(`${baseUrl}/auth/user/devices/logout/${sessionId}`, {
      method: "POST",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to logout from device")
    }

    return response.json()
  },

  redirectToWellness: async () => {
    const response = await fetch(`${baseUrl}/sso/redirect?redirectTo=https://wellness.iitb.ac.in`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to redirect to wellness")
    }

    return response.json()
  },

  // Password Reset
  forgotPassword: async (email) => {
    const response = await fetch(`${baseUrl}/auth/forgot-password`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify({ email }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to request password reset")
    }

    return response.json()
  },

  verifyResetToken: async (token) => {
    const response = await fetch(`${baseUrl}/auth/reset-password/${token}`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Invalid or expired reset token")
    }

    return response.json()
  },

  resetPassword: async (token, password) => {
    const response = await fetch(`${baseUrl}/auth/reset-password`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify({ token, password }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to reset password")
    }

    return response.json()
  },
}

export const studentApi = {
  importStudents: async (students) => {
    const response = await fetch(`${baseUrl}/student/profiles`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify(students),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to import students")
    }

    return response.json()
  },

  getStudents: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString()
    const url = `${baseUrl}/student/profiles${queryParams ? `?${queryParams}` : ""}`

    const response = await fetch(url, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch students")
    }

    return response.json()
  },

  getStudentDetails: async (userID) => {
    const response = await fetch(`${baseUrl}/student/profile/details/${userID}`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch student details")
    }

    return response.json()
  },

  submitRoomChangeRequest: async (requestData) => {
    const response = await fetch(`${baseUrl}/student/room-change`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify(requestData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to submit room change request")
    }

    return response.json()
  },

  getStudent: async () => {
    const response = await fetch(`${baseUrl}/student/profile`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch student profile")
    }

    return response.json()
  },

  updateStudent: async (userId, studentData) => {
    const response = await fetch(`${baseUrl}/student/profile/${userId}`, {
      method: "PUT",
      ...fetchOptions,
      body: JSON.stringify(studentData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to update student profile")
    }

    return response.json()
  },

  updateStudents: async (students) => {
    const response = await fetch(`${baseUrl}/student/profiles`, {
      method: "PUT",
      ...fetchOptions,
      body: JSON.stringify(students),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to update students")
    }

    return response.json()
  },

  getStudentsByIds: async (userIds) => {
    const response = await fetch(`${baseUrl}/student/profiles/ids`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify({ userIds }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch students by IDs")
    }

    return response.json()
  },

  getStudentDashboard: async () => {
    const response = await fetch(`${baseUrl}/student/dashboard`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch student dashboard data")
    }

    return response.json()
  },

  getStudentComplaints: async (userId, queries) => {
    const queryParams = new URLSearchParams(queries).toString()
    const response = await fetch(`${baseUrl}/complaint/student/complaints/${userId}?${queryParams}`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch student complaints")
    }

    return response.json()
  },
}

export const wardenApi = {
  getProfile: async () => {
    const response = await fetch(`${baseUrl}/warden/profile`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch warden profile")
    }

    return response.json()
  },

  updateProfile: async (profileData) => {
    const response = await fetch(`${baseUrl}/warden/profile/update`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify(profileData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to update warden profile")
    }

    return response.json()
  },

  setActiveHostel: async (hostelId) => {
    const response = await fetch(`${baseUrl}/warden/active-hostel`, {
      method: "PUT",
      ...fetchOptions,
      body: JSON.stringify({ hostelId }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to update active hostel")
    }

    return response.json()
  },
}

export const associateWardenApi = {
  getProfile: async () => {
    try {
      const response = await fetch(`${baseUrl}/warden/associate-warden/profile`, {
        method: "GET",
        ...fetchOptions,
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch associate warden profile")
      }
      return response.json()
    } catch (error) {
      console.error("Error fetching associate warden profile:", error)
      throw error
    }
  },

  setActiveHostel: async (hostelId) => {
    const response = await fetch(`${baseUrl}/warden/associate-warden/active-hostel`, {
      method: "PUT",
      ...fetchOptions,
      body: JSON.stringify({ hostelId }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to update active hostel for associate warden")
    }

    return response.json()
  },
}

export const hostelSupervisorApi = {
  getProfile: async () => {
    try {
      const response = await fetch(`${baseUrl}/warden/hostel-supervisor/profile`, {
        method: "GET",
        ...fetchOptions,
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch hostel supervisor profile")
      }
      return response.json()
    } catch (error) {
      console.error("Error fetching hostel supervisor profile:", error)
      throw error
    }
  },

  setActiveHostel: async (hostelId) => {
    const response = await fetch(`${baseUrl}/warden/hostel-supervisor/active-hostel`, {
      method: "PUT",
      ...fetchOptions,
      body: JSON.stringify({ hostelId }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to update active hostel for hostel supervisor")
    }

    return response.json()
  },
}

export const securityApi = {
  getSecurityInfo: async () => {
    const response = await fetch(`${baseUrl}/security`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch security info")
    }

    return response.json()
  },

  addStudentEntry: async (entryData) => {
    const response = await fetch(`${baseUrl}/security/entries`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify(entryData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to add student entry")
    }

    return response.json()
  },

  getRecentStudentEntries: async () => {
    const response = await fetch(`${baseUrl}/security/entries/recent`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch recent student entries")
    }

    return response.json()
  },

  updateStudentEntry: async (entryData) => {
    const response = await fetch(`${baseUrl}/security/entries/${entryData._id}`, {
      method: "PUT",
      ...fetchOptions,
      body: JSON.stringify(entryData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to update student entry")
    }

    return response.json()
  },

  getStudentEntries: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString()
    const url = `${baseUrl}/security/entries${queryParams ? `?${queryParams}` : ""}`

    const response = await fetch(url, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch student entries")
    }

    return response.json()
  },

  deleteStudentEntry: async (entryId) => {
    const response = await fetch(`${baseUrl}/security/entries/${entryId}`, {
      method: "DELETE",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to delete student entry")
    }

    return response.json()
  },

  verifyQRCode: async (qrData) => {
    const response = await fetch(`${baseUrl}/staff/verify-qr`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify(qrData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to verify QR code")
    }

    return response.json()
  },

  recordStaffAttendance: async (attendanceData) => {
    const response = await fetch(`${baseUrl}/staff/attendance/record`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify(attendanceData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to record staff attendance")
    }

    return response.json()
  },

  getStaffAttendanceRecords: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString()
    const url = `${baseUrl}/staff/attendance/records${queryParams ? `?${queryParams}` : ""}`

    const response = await fetch(url, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch staff attendance records")
    }

    return response.json()
  },

  getAllHostelSupervisors: async () => {
    try {
      const response = await fetch(`${baseUrl}/admin/hostel-supervisors`, {
        method: "GET",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch hostel supervisors")
      }

      return response.json()
    } catch (error) {
      console.error("Error fetching hostel supervisors:", error)
      throw error
    }
  },

  addHostelSupervisor: async (data) => {
    try {
      const response = await fetch(`${baseUrl}/admin/hostel-supervisor`, {
        method: "POST",
        ...fetchOptions,
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to add hostel supervisor")
      }

      return response.json()
    } catch (error) {
      console.error("Error adding hostel supervisor:", error)
      throw error
    }
  },

  updateHostelSupervisor: async (id, data) => {
    try {
      const response = await fetch(`${baseUrl}/admin/hostel-supervisor/${id}`, {
        method: "PUT",
        ...fetchOptions,
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update hostel supervisor")
      }

      return response.json()
    } catch (error) {
      console.error("Error updating hostel supervisor:", error)
      throw error
    }
  },

  deleteHostelSupervisor: async (id) => {
    try {
      const response = await fetch(`${baseUrl}/admin/hostel-supervisor/${id}`, {
        method: "DELETE",
        ...fetchOptions,
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete hostel supervisor")
      }
      return response.json()
    } catch (error) {
      console.error("Error deleting hostel supervisor:", error)
      throw error
    }
  },
}

export const maintenanceApi = {
  // Complaints
  getComplaints: async (queries) => {
    const response = await fetch(`${baseUrl}/complaint/all?${queries}`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch complaints")
    }

    return response.json()
  },

  updateComplaintStatus: async (id, status) => {
    try {
      const response = await fetch(`${baseUrl}/complaint/update-status/${id}`, {
        method: "PUT",
        ...fetchOptions,
        body: JSON.stringify({ status }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update complaint status")
      }
      return await response.json()
    } catch (error) {
      console.error("Error updating complaint status:", error)
      throw error
    }
  },

  // Statistics
  getStats: async () => {
    try {
      const response = await fetch(`${baseUrl}/complaint/stats`, {
        method: "GET",
        ...fetchOptions,
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch stats")
      }
      return await response.json()
    } catch (error) {
      console.error("Error fetching maintenance stats:", error)
      // Return fallback stats in case of failure
      return {
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0,
      }
    }
  },
}

export const adminApi = {
  getAllHostels: async (queries) => {
    const response = await fetch(`${baseUrl}/admin/hostels?${queries}`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch hostels")
    }

    const data = await response.json()

    return data
  },

  addHostel: async (hostelData) => {
    const response = await fetch(`${baseUrl}/admin/hostel`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify(hostelData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to add hostel")
    }

    return response.json()
  },

  updateHostel: async (hostelId, hostelData) => {
    const response = await fetch(`${baseUrl}/admin/hostel/${hostelId}`, {
      method: "PUT",
      ...fetchOptions,
      body: JSON.stringify(hostelData),
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to update hostel")
    }
    return response.json()
  },

  getHostelList: async () => {
    const response = await fetch(`${baseUrl}/admin/hostel/list`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch hostels")
    }

    return response.json()
  },

  addWarden: async (wardenData) => {
    const response = await fetch(`${baseUrl}/admin/warden`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify(wardenData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to add warden")
    }

    return response.json()
  },

  getAllWardens: async () => {
    const response = await fetch(`${baseUrl}/admin/wardens`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch wardens")
    }

    const data = await response.json()
    console.log("Fetched wardens:", data)

    return data
  },
  updateWarden: async (wardenId, wardenData) => {
    const response = await fetch(`${baseUrl}/admin/warden/${wardenId}`, {
      method: "PUT",
      ...fetchOptions,
      body: JSON.stringify(wardenData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to update warden")
    }

    const data = await response.json()
    console.log("Added warden:", data)
    return data

    return response.json()
  },
  deleteWarden: async (wardenId) => {
    const response = await fetch(`${baseUrl}/admin/warden/${wardenId}`, {
      method: "DELETE",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to delete warden")
    }

    return response.json()
  },

  getAllComplaints: async (queries) => {
    const response = await fetch(`${baseUrl}/complaint/all?${queries}`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch complaints")
    }

    return response.json()
  },

  addSecurity: async (securityData) => {
    const response = await fetch(`${baseUrl}/admin/security`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify(securityData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to add security")
    }

    return response.json()
  },

  getAllSecurityLogins: async () => {
    const response = await fetch(`${baseUrl}/admin/security`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch security staff")
    }

    return response.json()
  },

  updateSecurity: async (securityId, securityData) => {
    const response = await fetch(`${baseUrl}/admin/security/${securityId}`, {
      method: "PUT",
      ...fetchOptions,
      body: JSON.stringify(securityData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to update security staff")
    }

    return response.json()
  },

  deleteSecurity: async (securityId) => {
    const response = await fetch(`${baseUrl}/admin/security/${securityId}`, {
      method: "DELETE",
      ...fetchOptions,
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to delete security staff")
    }
    return response.json()
  },

  updateUserPassword: async (email, newPassword) => {
    const response = await fetch(`${baseUrl}/admin/user/update-password`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify({ email, newPassword }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to update password")
    }

    return response.json()
  },

  bulkUpdatePasswords: async (passwordUpdates) => {
    const response = await fetch(`${baseUrl}/users/bulk-password-update`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify({ passwordUpdates }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to update passwords")
    }

    return response.json()
  },

  removePasswordsByRole: async (role) => {
    const response = await fetch(`${baseUrl}/users/remove-passwords-by-role`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify({ role }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to remove passwords")
    }

    return response.json()
  },

  getAllMaintenanceStaff: async () => {
    const response = await fetch(`${baseUrl}/admin/maintenance`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch maintenance staff")
    }

    return response.json()
  },
  addMaintenanceStaff: async (maintenanceData) => {
    const response = await fetch(`${baseUrl}/admin/maintenance`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify(maintenanceData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to add maintenance staff")
    }

    return response.json()
  },
  updateMaintenanceStaff: async (maintenanceId, maintenanceData) => {
    const response = await fetch(`${baseUrl}/admin/maintenance/${maintenanceId}`, {
      method: "PUT",
      ...fetchOptions,
      body: JSON.stringify(maintenanceData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to update maintenance staff")
    }

    return response.json()
  },
  deleteMaintenanceStaff: async (maintenanceId) => {
    const response = await fetch(`${baseUrl}/admin/maintenance/${maintenanceId}`, {
      method: "DELETE",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to delete maintenance staff")
    }

    return response.json()
  },

  getAllAssociateWardens: async () => {
    try {
      const response = await fetch(`${baseUrl}/admin/associate-wardens`, {
        method: "GET",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch associate wardens")
      }

      return response.json()
    } catch (error) {
      console.error("Error fetching associate wardens:", error)
      throw error
    }
  },

  addAssociateWarden: async (data) => {
    try {
      const response = await fetch(`${baseUrl}/admin/associate-warden`, {
        method: "POST",
        ...fetchOptions,
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to add associate warden")
      }

      return response.json()
    } catch (error) {
      console.error("Error adding associate warden:", error)
      throw error
    }
  },

  updateAssociateWarden: async (id, data) => {
    try {
      const response = await fetch(`${baseUrl}/admin/associate-warden/${id}`, {
        method: "PUT",
        ...fetchOptions,
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update associate warden")
      }

      return response.json()
    } catch (error) {
      console.error("Error updating associate warden:", error)
      throw error
    }
  },

  deleteAssociateWarden: async (id) => {
    try {
      const response = await fetch(`${baseUrl}/admin/associate-warden/${id}`, {
        method: "DELETE",
        ...fetchOptions,
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete associate warden")
      }
      return response.json()
    } catch (error) {
      console.error("Error deleting associate warden:", error)
      throw error
    }
  },

  getAllHostelSupervisors: async () => {
    try {
      const response = await fetch(`${baseUrl}/admin/hostel-supervisors`, {
        method: "GET",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch hostel supervisors")
      }

      return response.json()
    } catch (error) {
      console.error("Error fetching hostel supervisors:", error)
      throw error
    }
  },

  addHostelSupervisor: async (data) => {
    try {
      const response = await fetch(`${baseUrl}/admin/hostel-supervisor`, {
        method: "POST",
        ...fetchOptions,
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to add hostel supervisor")
      }

      return response.json()
    } catch (error) {
      console.error("Error adding hostel supervisor:", error)
      throw error
    }
  },

  updateHostelSupervisor: async (id, data) => {
    try {
      const response = await fetch(`${baseUrl}/admin/hostel-supervisor/${id}`, {
        method: "PUT",
        ...fetchOptions,
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update hostel supervisor")
      }

      return response.json()
    } catch (error) {
      console.error("Error updating hostel supervisor:", error)
      throw error
    }
  },

  deleteHostelSupervisor: async (id) => {
    try {
      const response = await fetch(`${baseUrl}/admin/hostel-supervisor/${id}`, {
        method: "DELETE",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete hostel supervisor")
      }

      return response.json()
    } catch (error) {
      console.error("Error deleting hostel supervisor:", error)
      throw error
    }
  },
}

export const lostAndFoundApi = {
  addLostItem: async (itemData) => {
    const response = await fetch(`${baseUrl}/lost-and-found`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify(itemData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to add lost item")
    }

    return response.json()
  },
  getAllLostItems: async () => {
    const response = await fetch(`${baseUrl}/lost-and-found`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch lost items")
    }

    return response.json()
  },

  updateLostItem: async (itemId, itemData) => {
    const response = await fetch(`${baseUrl}/lost-and-found/${itemId}`, {
      method: "PUT",
      ...fetchOptions,
      body: JSON.stringify(itemData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to update lost item")
    }

    return response.json()
  },

  deleteLostItem: async (itemId) => {
    const response = await fetch(`${baseUrl}/lost-and-found/${itemId}`, {
      method: "DELETE",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to delete lost item")
    }

    return response.json()
  },
}

export const eventsApi = {
  getAllEvents: async () => {
    const response = await fetch(`${baseUrl}/event`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch events")
    }

    return response.json()
  },

  addEvent: async (eventData) => {
    const response = await fetch(`${baseUrl}/event`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify(eventData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to add event")
    }

    return response.json()
  },

  updateEvent: async (eventId, eventData) => {
    const response = await fetch(`${baseUrl}/event/${eventId}`, {
      method: "PUT",
      ...fetchOptions,
      body: JSON.stringify(eventData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to update event")
    }

    return response.json()
  },
  deleteEvent: async (eventId) => {
    const response = await fetch(`${baseUrl}/event/${eventId}`, {
      method: "DELETE",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to delete event")
    }

    return response.json()
  },
}

export const hostelApi = {
  getUnits: async (hostelId) => {
    const response = await fetch(`${baseUrl}/hostel/units/${hostelId}`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch units")
    }

    return response.json()
  },

  getRoomsByUnit: async (unitId) => {
    const response = await fetch(`${baseUrl}/hostel/rooms/${unitId}`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch rooms")
    }

    return response.json()
  },

  allocateRoom: async (allocationData) => {
    const response = await fetch(`${baseUrl}/hostel/allocate`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify(allocationData),
    })

    if (!response.ok) {
      const errorData = await response.json()

      throw new Error(errorData.message || "Failed to allocate room")
    }

    return response.json()
  },

  updateRoomStatus: async (roomId, status) => {
    const response = await fetch(`${baseUrl}/hostel/rooms/${roomId}/status`, {
      method: "PUT",
      ...fetchOptions,
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to update room status")
    }

    return response.json()
  },

  deallocateRoom: async (allocationId) => {
    const response = await fetch(`${baseUrl}/hostel/deallocate/${allocationId}`, {
      method: "DELETE",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to deallocate room")
    }

    return response.json()
  },

  getRoomChangeRequests: async (hostelId, filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString()
    const url = `${baseUrl}/hostel/room-change-requests/${hostelId}${queryParams ? `?${queryParams}` : ""}`

    const response = await fetch(url, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch room change requests")
    }

    return response.json()
  },

  getRoomChangeRequestById: async (requestId) => {
    const response = await fetch(`${baseUrl}/hostel/room-change-request/${requestId}`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch room change request")
    }

    return response.json()
  },

  approveRoomChangeRequest: async (requestId, bedNumber) => {
    const response = await fetch(`${baseUrl}/hostel/room-change-request/approve/${requestId}`, {
      method: "PUT",
      ...fetchOptions,
      body: JSON.stringify({ bedNumber }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to approve room change request")
    }

    return response.json()
  },

  rejectRoomChangeRequest: async (requestId, reason) => {
    const response = await fetch(`${baseUrl}/hostel/room-change-request/reject/${requestId}`, {
      method: "PUT",
      ...fetchOptions,
      body: JSON.stringify({ reason }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to reject room change request")
    }

    return response.json()
  },

  getRooms: async (query) => {
    const queryParams = new URLSearchParams(query).toString()
    const response = await fetch(`${baseUrl}/hostel/rooms-room-only${queryParams ? `?${queryParams}` : ""}`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch rooms")
    }

    return response.json()
  },

  updateRoomAllocations: async (allocationData, hostelId) => {
    const response = await fetch(`${baseUrl}/hostel/update-allocations/${hostelId}`, {
      method: "PUT",
      ...fetchOptions,
      body: JSON.stringify(allocationData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to update room allocations")
    }

    return response.json()
  },
}

export const statsApi = {
  getHostelStats: async () => {
    const response = await fetch(`${baseUrl}/stats/hostel`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch hostel stats")
    }

    return response.json()
  },

  getSecurityStats: async () => {
    const response = await fetch(`${baseUrl}/stats/security`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch security stats")
    }

    return response.json()
  },

  getMaintenanceStaffStats: async () => {
    const response = await fetch(`${baseUrl}/stats/maintenancestaff`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch maintenance stats")
    }

    return response.json()
  },

  getVisitorStats: async (hostelId) => {
    const response = await fetch(`${baseUrl}/stats/visitor/${hostelId}`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch visitor stats")
    }

    return response.json()
  },

  getEventStats: async (hostelId) => {
    const response = await fetch(`${baseUrl}/stats/event/${hostelId}`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch event stats")
    }

    return response.json()
  },

  getLostAndFoundStats: async () => {
    const response = await fetch(`${baseUrl}/stats/lostandfound`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch lost and found stats")
    }

    return response.json()
  },

  getRoomChangeRequestsStats: async (hostelId) => {
    const response = await fetch(`${baseUrl}/stats/room-change-requests/${hostelId}`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch room change requests stats")
    }

    const data = await response.json()
    console.log("Room change requests stats:", data)

    return data
  },

  getWardenStats: async () => {
    const response = await fetch(`${baseUrl}/stats/wardens`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch warden stats")
    }

    return response.json()
  },

  getComplaintsStats: async () => {
    const response = await fetch(`${baseUrl}/stats/complaints`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch complaints stats")
    }

    return response.json()
  },
}

export const alertApi = {
  sendAlert: async (alertType, triggeredBy) => {
    const response = await fetch(`${baseUrl}/alerts/create`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify({ alertType, triggeredBy }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to send alert")
    }

    return response.json()
  },

  getAlerts: async (userId) => {
    const response = await fetch(`${baseUrl}/alerts/${userId}`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch alerts")
    }

    return response.json()
  },
}

export const uploadApi = {
  uploadProfileImage: async (imageData, userId) => {
    const response = await fetch(`${baseUrl}/upload/profile/${userId}`, {
      method: "POST",
      credentials: "include",
      body: imageData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to upload profile image")
    }

    return response.json()
  },
}

export default {
  auth: authApi,
  student: studentApi,
  warden: wardenApi,
  security: securityApi,
  maintenance: maintenanceApi,
  admin: adminApi,
  alert: alertApi,
  associateWarden: associateWardenApi,
  hostelSupervisor: hostelSupervisorApi,
}

export const addDisCoAction = async (data) => {
  const response = await fetch(`${baseUrl}/disco/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  })

  const resData = await response.json()
  console.log("Raw response:", resData)

  if (!response.ok) {
    throw new Error(resData.message || "Failed to add DisCo action")
  }

  return resData
}
export const getDisCoActionsByStudent = async (studentId) => {
  const response = await fetch(`${baseUrl}/disco/${studentId}`, {
    method: "GET",
    credentials: "include",
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch DisCo actions")
  }

  return data // contains `actions` array
}

export const updateDisCoAction = async (disCoId, data) => {
  const response = await fetch(`${baseUrl}/disco/update/${disCoId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  })

  const resData = await response.json()

  if (!response.ok) {
    throw new Error(resData.message || "Failed to update DisCo action")
  }

  return resData
}

// delete DisCo action
export const deleteDisCoAction = async (disCoId) => {
  const response = await fetch(`${baseUrl}/disco/${disCoId}`, {
    method: "DELETE",
    credentials: "include",
  })

  const resData = await response.json()

  if (!response.ok) {
    throw new Error(resData.message || "Failed to delete DisCo action")
  }

  return resData
}

// export { adminApi, taskApi }

// export { adminApi, taskApi, userApi }

export { studentProfileApi, liveCheckInOutApi }
