import { baseUrl, fetchOptions } from "../constants/appConstants"

export const addCertificate = async (certificateData) => {
  const response = await fetch(`${baseUrl}/certificate/add`, {
    ...fetchOptions,
    method: "POST",
    body: JSON.stringify(certificateData),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Failed to add certificate")
  }

  return response.json()
}

export const getCertificatesByStudent = async (studentId) => {
  const response = await fetch(`${baseUrl}/certificate/${studentId}`, {
    ...fetchOptions,
    method: "GET",
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Failed to fetch certificates")
  }

  return response.json()
}

export const updateCertificate = async (certificateId, certificateData) => {
  const response = await fetch(`${baseUrl}/certificate/update/${certificateId}`, {
    ...fetchOptions,
    method: "PUT",
    body: JSON.stringify(certificateData),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Failed to update certificate")
  }

  return response.json()
}

export const deleteCertificate = async (certificateId) => {
  const response = await fetch(`${baseUrl}/certificate/${certificateId}`, {
    ...fetchOptions,
    method: "DELETE",
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Failed to delete certificate")
  }

  return response.json()
}
