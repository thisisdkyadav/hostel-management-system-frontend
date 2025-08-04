import { baseUrl } from "../constants/appConstants"

export const fetchStudentProfile = async (userId) => {
  if (!userId) {
    console.error("Error: User ID is undefined!")
    return { error: true, message: "User ID is required" }
  }

  try {
    const response = await fetch(`${baseUrl}/student/profile/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `HTTP error! Status: ${response.status}`)
    }

    const result = await response.json()
    return result.data
  } catch (error) {
    console.error("Failed to fetch student profile:", error)
    return { error: true, message: error.message }
  }
}

export const updateProfile = async (userId, profileData) => {
  try {
    const response = await fetch(`${baseUrl}/student/profile/update/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(profileData),
    })

    if (!response.ok) {
      throw new Error("Failed to update profile")
    }
    const result = await response.json()
    console.log("response.json() is: ", result)

    return result.data
  } catch (error) {
    console.error("Error updating profile:", error)
    throw error
  }
}

export const getStudentId = async (userId) => {
  try {
    const response = await fetch(`${baseUrl}/student/id/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error("Failed to get student ID")
    }

    const result = await response.json()
    return result.data
  } catch (error) {
    console.error("Error getting student ID:", error)
    throw error
  }
}

// get department list
export const getDepartmentList = async () => {
  try {
    const response = await fetch(`${baseUrl}/student/departments/list`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error("Failed to get department list")
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error("Error getting department list:", error)
    throw error
  }
}

export const getDegreesList = async () => {
  try {
    const response = await fetch(`${baseUrl}/student/degrees/list`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
    if (!response.ok) {
      throw new Error("Failed to get degrees")
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error("Error getting degrees:", error)
    throw error
  }
}
