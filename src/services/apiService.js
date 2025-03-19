const fetchOptions = {
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
}

const baseUrl = "http://localhost:5000/api"

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
    console.log("Google token:", token)

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

  logout: async () => {
    const response = await fetch(`${baseUrl}/auth/logout`, {
      method: "POST",
      ...fetchOptions,
    })

    if (!response.ok) {
      throw new Error("Logout failed on server")
    }

    return response.json()
  },
}

export const studentApi = {}

export const wardenApi = {}

export const guardApi = {}

export const maintenanceApi = {}

export const adminApi = {
  getAllHostels: async () => {
    const response = await fetch(`${baseUrl}/admin/hostels`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch hostels")
    }

    const data = await response.json()
    console.log("Fetched hostels:", data)

    return data
  },

  addHostel: async (hostelData) => {
    const response = await fetch(`${baseUrl}/admin/hostel/add`, {
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
}

export default {
  auth: authApi,
  student: studentApi,
  warden: wardenApi,
  guard: guardApi,
  maintenance: maintenanceApi,
  admin: adminApi,
}
