const API_BASE_URL = "http://localhost:5000/api"

export const fetchStudentProfile = async (userId) => {
  if (!userId) {
    console.error("Error: User ID is undefined!")
    return { error: true, message: "User ID is required" }
  }
  console.log("userId is: ", userId)

  try {
    const response = await fetch(`${API_BASE_URL}/student/profile/${userId}`, {
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

export const submitComplaint = async (complaintData) => {
  try {
    console.log(complaintData)

    const response = await fetch(`${API_BASE_URL}/complaint/student/complaints`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(complaintData),
    })

    if (!response.ok) {
      throw new Error("Failed to submit complaint")
    }

    return await response.json()
  } catch (error) {
    console.error("Error submitting complaint:", error)
    throw error
  }
}

export const updateProfile = async (userId, profileData) => {
  try {
    console.log("profile data is: ", profileData)

    const response = await fetch(`${API_BASE_URL}/student/profile/update/${userId}`, {
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

export const submitVisitorRequest = async (visitorData) => {
  try {
   

    const response = await fetch(`${API_BASE_URL}/visitor/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(visitorData),
    });

    if (!response.ok) {
      throw new Error("Failed to submit visitor request");
    }

    return await response.json();
  } catch (error) {
    console.error("Error submitting visitor request:", error);
    throw error;
  }
};

// Get All Visitor Requests
export const getVisitorRequests = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch visitor requests");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching visitor requests:", error);
    throw error;
  }
};

// Update Visitor Request Status
// export const updateVisitorStatus = async (requestId, status) => {
//   try {
//     console.log(`Updating visitor request ${requestId} to status: ${status}`);

//     const response = await fetch(`${API_BASE_URL}/update-status/${requestId}`, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       credentials: "include",
//       body: JSON.stringify({ status }),
//     });

//     if (!response.ok) {
//       throw new Error("Failed to update visitor request status");
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Error updating visitor request status:", error);
//     throw error;
//   }
// };