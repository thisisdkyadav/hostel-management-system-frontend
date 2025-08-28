import { baseUrl, fetchOptions } from "../constants/appConstants"

export const adminApi = {
  getFamilyDetails: async (userId) => {
    try {
      const response = await fetch(`${baseUrl}/family/${userId}`, {
        method: "GET",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch family details")
      }

      return response.json()
    } catch (error) {
      console.error("Error fetching family details:", error)
      throw error
    }
  },

  addFamilyMember: async (userId, familyMemberData) => {
    try {
      const response = await fetch(`${baseUrl}/family/${userId}`, {
        method: "POST",
        ...fetchOptions,
        body: JSON.stringify(familyMemberData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to add family member")
      }

      return response.json()
    } catch (error) {
      console.error("Error adding family member:", error)
      throw error
    }
  },

  updateFamilyMember: async (memberId, familyMemberData) => {
    try {
      const response = await fetch(`${baseUrl}/family/${memberId}`, {
        method: "PUT",
        ...fetchOptions,
        body: JSON.stringify(familyMemberData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update family member")
      }

      return response.json()
    } catch (error) {
      console.error("Error updating family member:", error)
      throw error
    }
  },

  deleteFamilyMember: async (memberId) => {
    try {
      const response = await fetch(`${baseUrl}/family/${memberId}`, {
        method: "DELETE",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete family member")
      }

      return response.json()
    } catch (error) {
      console.error("Error deleting family member:", error)
      throw error
    }
  },

  updateBulkFamilyMembers: async (familyMembersData) => {
    try {
      const response = await fetch(`${baseUrl}/family/bulk-update`, {
        method: "POST",
        ...fetchOptions,
        body: JSON.stringify(familyMembersData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update bulk family members")
      }

      return response.json()
    } catch (error) {
      console.error("Error updating bulk family members:", error)
      throw error
    }
  },

  addHostelGate: async (hostelGateData) => {
    try {
      const response = await fetch(`${baseUrl}/admin/hostel-gate`, {
        method: "POST",
        ...fetchOptions,
        body: JSON.stringify(hostelGateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to add hostel gate")
      }

      return response.json()
    } catch (error) {
      console.error("Error adding hostel gate:", error)
      throw error
    }
  },

  getAllHostelGates: async () => {
    try {
      const response = await fetch(`${baseUrl}/admin/hostel-gate/all`, {
        method: "GET",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch all hostel gates")
      }

      return response.json()
    } catch (error) {
      console.error("Error fetching all hostel gates:", error)
      throw error
    }
  },

  updateHostelGate: async (hostelGateId, hostelGateData) => {
    try {
      const response = await fetch(`${baseUrl}/admin/hostel-gate/${hostelGateId}`, {
        method: "PUT",
        ...fetchOptions,
        body: JSON.stringify(hostelGateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update hostel gate")
      }

      return response.json()
    } catch (error) {
      console.error("Error updating hostel gate:", error)
      throw error
    }
  },

  deleteHostelGate: async (hostelGateId) => {
    try {
      const response = await fetch(`${baseUrl}/admin/hostel-gate/${hostelGateId}`, {
        method: "DELETE",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete hostel gate")
      }

      return response.json()
    } catch (error) {
      console.error("Error deleting hostel gate:", error)
      throw error
    }
  },

  getStudentEditPermissions: async () => {
    return await adminApi.getConfig("studentEditableFields")
  },

  updateStudentEditPermissions: async (permissions) => {
    // Extract just the allowed fields to match the expected API format
    const allowedFields = permissions.filter((permission) => permission.allowed).map((permission) => permission.field)

    return await adminApi.updateConfig("studentEditableFields", allowedFields)
  },

  // Degrees management
  getDegrees: async () => {
    return await adminApi.getConfig("degrees")
  },

  updateDegrees: async (degrees) => {
    return await adminApi.updateConfig("degrees", degrees)
  },

  // Departments management
  getDepartments: async () => {
    return await adminApi.getConfig("departments")
  },

  updateDepartments: async (departments) => {
    return await adminApi.updateConfig("departments", departments)
  },

  // General config management functions
  getConfig: async (key) => {
    try {
      const response = await fetch(`${baseUrl}/config/${key}`, {
        method: "GET",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to fetch config for key: ${key}`)
      }

      return response.json()
    } catch (error) {
      console.error(`Error fetching config for key ${key}:`, error)
      throw error
    }
  },

  updateConfig: async (key, value) => {
    try {
      const response = await fetch(`${baseUrl}/config/${key}`, {
        method: "PUT",
        ...fetchOptions,
        body: JSON.stringify({ value }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to update config for key: ${key}`)
      }

      return response.json()
    } catch (error) {
      console.error(`Error updating config for key ${key}:`, error)
      throw error
    }
  },

  bulkUpdateStudentsStatus: async (rollNumbers, status) => {
    try {
      const response = await fetch(`${baseUrl}/student/profiles/status`, {
        method: "POST",
        ...fetchOptions,
        body: JSON.stringify({ rollNumbers, status }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to bulk update student status")
      }

      return response.json()
    } catch (error) {
      console.error("Error bulk updating student status:", error)
      throw error
    }
  },

  bulkUpdateDayScholarDetails: async (dayScholarData) => {
    try {
      const response = await fetch(`${baseUrl}/student/profiles/day-scholar`, {
        method: "PUT",
        ...fetchOptions,
        body: JSON.stringify({ data: dayScholarData }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update day scholar details")
      }

      return response.json()
    } catch (error) {
      console.error("Error updating day scholar details:", error)
      throw error
    }
  },

  // Undertakings related functions
  getUndertakings: async () => {
    try {
      const response = await fetch(`${baseUrl}/undertaking/admin/undertakings`, {
        method: "GET",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch undertakings")
      }

      return response.json()
    } catch (error) {
      console.error("Error fetching undertakings:", error)
      throw error
    }
  },

  createUndertaking: async (undertakingData) => {
    try {
      const response = await fetch(`${baseUrl}/undertaking/admin/undertakings`, {
        method: "POST",
        ...fetchOptions,
        body: JSON.stringify(undertakingData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create undertaking")
      }

      return response.json()
    } catch (error) {
      console.error("Error creating undertaking:", error)
      throw error
    }
  },

  updateUndertaking: async (undertakingId, undertakingData) => {
    try {
      const response = await fetch(`${baseUrl}/undertaking/admin/undertakings/${undertakingId}`, {
        method: "PUT",
        ...fetchOptions,
        body: JSON.stringify(undertakingData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update undertaking")
      }

      return response.json()
    } catch (error) {
      console.error("Error updating undertaking:", error)
      throw error
    }
  },

  deleteUndertaking: async (undertakingId) => {
    try {
      const response = await fetch(`${baseUrl}/undertaking/admin/undertakings/${undertakingId}`, {
        method: "DELETE",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete undertaking")
      }

      return response.json()
    } catch (error) {
      console.error("Error deleting undertaking:", error)
      throw error
    }
  },

  getUndertakingStudents: async (undertakingId) => {
    try {
      const response = await fetch(`${baseUrl}/undertaking/admin/undertakings/${undertakingId}/students`, {
        method: "GET",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch undertaking students")
      }

      return response.json()
    } catch (error) {
      console.error("Error fetching undertaking students:", error)
      throw error
    }
  },

  addStudentsToUndertaking: async (undertakingId, studentIds) => {
    try {
      const response = await fetch(`${baseUrl}/undertaking/admin/undertakings/${undertakingId}/students`, {
        method: "POST",
        ...fetchOptions,
        body: JSON.stringify({ studentIds }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to add students to undertaking")
      }

      return response.json()
    } catch (error) {
      console.error("Error adding students to undertaking:", error)
      throw error
    }
  },

  removeStudentFromUndertaking: async (undertakingId, studentId) => {
    try {
      const response = await fetch(`${baseUrl}/undertaking/admin/undertakings/${undertakingId}/students/${studentId}`, {
        method: "DELETE",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to remove student from undertaking")
      }

      return response.json()
    } catch (error) {
      console.error("Error removing student from undertaking:", error)
      throw error
    }
  },

  getUndertakingStudentsStatus: async (undertakingId) => {
    try {
      const response = await fetch(`${baseUrl}/undertaking/admin/undertakings/${undertakingId}/status`, {
        method: "GET",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch undertaking status")
      }

      return response.json()
    } catch (error) {
      console.error("Error fetching undertaking status:", error)
      throw error
    }
  },

  // Function to add students to undertaking by roll numbers
  addStudentsToUndertakingByRollNumbers: async (undertakingId, rollNumbers) => {
    try {
      const response = await fetch(`${baseUrl}/undertaking/admin/undertakings/${undertakingId}/students/by-roll-numbers`, {
        method: "POST",
        ...fetchOptions,
        body: JSON.stringify({ rollNumbers }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to add students to undertaking")
      }

      return response.json()
    } catch (error) {
      console.error("Error adding students to undertaking by roll numbers:", error)
      throw error
    }
  },

  renameDegree: async (oldName, newName) => {
    try {
      const response = await fetch(`${baseUrl}/student/degrees/rename`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ oldName, newName }),
      })
      if (!response.ok) {
        throw new Error("Failed to rename degree")
      }

      const result = await response.json()
      return result.data
    } catch (error) {
      console.error("Error renaming degree:", error)
      throw error
    }
  },

  renameDepartment: async (oldName, newName) => {
    try {
      const response = await fetch(`${baseUrl}/student/departments/rename`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ oldName, newName }),
      })
      if (!response.ok) {
        throw new Error("Failed to rename department")
      }

      const result = await response.json()
      return result.data
    } catch (error) {
      console.error("Error renaming department:", error)
      throw error
    }
  },

  // Registered students management
  getRegisteredStudents: async () => {
    return await adminApi.getConfig("registeredStudents")
  },

  updateRegisteredStudents: async (registeredStudents) => {
    return await adminApi.updateConfig("registeredStudents", registeredStudents)
  },
}

export default adminApi
