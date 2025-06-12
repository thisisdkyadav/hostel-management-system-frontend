import { baseUrl } from "../constants/appConstants"

export const fetchStudentProfile = async (userId) => {
  if (!userId) {
    console.error("Error: User ID is undefined!")
    return { error: true, message: "User ID is required" }
  }
  console.log("userId is: ", userId)

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
    console.log("profile data is: ", profileData)

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
