export const fetchOptions = {
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
}

export const API_BACKENDS = {
  NODE: "node",
  GO: "go",
}

export const apiBaseUrls = {
  [API_BACKENDS.NODE]: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
  [API_BACKENDS.GO]: import.meta.env.VITE_GO_API_URL || "http://localhost:5001/api/v1",
}

export const getApiBaseUrl = (backend = API_BACKENDS.NODE) => {
  return apiBaseUrls[backend] || apiBaseUrls[API_BACKENDS.NODE]
}

// Keep node as the default legacy base URL for existing modules.
export const baseUrl = getApiBaseUrl(API_BACKENDS.NODE)
export const goBaseUrl = getApiBaseUrl(API_BACKENDS.GO)
