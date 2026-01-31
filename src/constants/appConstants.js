export const fetchOptions = {
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
}

export const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1"
