import { baseUrl, fetchOptions } from "../constants/appConstants"

// Admin management operations
export const getAllAdmins = async () => {
  const response = await fetch(`${baseUrl}/super-admin/admins`, {
    method: "GET",
    ...fetchOptions,
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Failed to fetch admin users")
  }

  return response.json()
}

export const createAdmin = async (adminData) => {
  const response = await fetch(`${baseUrl}/super-admin/admins`, {
    method: "POST",
    ...fetchOptions,
    body: JSON.stringify(adminData),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Failed to create admin user")
  }

  return response.json()
}

export const updateAdmin = async (adminId, adminData) => {
  const response = await fetch(`${baseUrl}/super-admin/admins/${adminId}`, {
    method: "PUT",
    ...fetchOptions,
    body: JSON.stringify(adminData),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Failed to update admin user")
  }

  return response.json()
}

export const deleteAdmin = async (adminId) => {
  const response = await fetch(`${baseUrl}/super-admin/admins/${adminId}`, {
    method: "DELETE",
    ...fetchOptions,
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Failed to delete admin user")
  }

  return response.json()
}

// API key management operations
export const getAllApiKeys = async () => {
  const response = await fetch(`${baseUrl}/super-admin/api-clients`, {
    method: "GET",
    ...fetchOptions,
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Failed to fetch API keys")
  }

  return response.json()
}

export const createApiKey = async (keyData) => {
  const response = await fetch(`${baseUrl}/super-admin/api-clients`, {
    method: "POST",
    ...fetchOptions,
    body: JSON.stringify(keyData),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Failed to create API key")
  }

  return response.json()
}

export const updateApiKeyStatus = async (keyId, isActive) => {
  const response = await fetch(`${baseUrl}/super-admin/api-clients/${keyId}`, {
    method: "PUT",
    ...fetchOptions,
    body: JSON.stringify({ isActive }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Failed to update API key status")
  }

  return response.json()
}

export const deleteApiKey = async (keyId) => {
  const response = await fetch(`${baseUrl}/super-admin/api-clients/${keyId}`, {
    method: "DELETE",
    ...fetchOptions,
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Failed to delete API key")
  }

  return response.json()
}

// Dashboard statistics
export const getDashboardStats = async () => {
  const response = await fetch(`${baseUrl}/super-admin/dashboard`, {
    method: "GET",
    ...fetchOptions,
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Failed to fetch dashboard statistics")
  }

  return response.json()
}

export default {
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getAllApiKeys,
  createApiKey,
  updateApiKeyStatus,
  deleteApiKey,
  getDashboardStats,
}
