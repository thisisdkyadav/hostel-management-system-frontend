/**
 * Centralized API Client
 * Provides a unified interface for making HTTP requests with:
 * - Automatic error handling
 * - Request/Response interceptors
 * - Consistent configuration
 */

import { API_BACKENDS, getApiBaseUrl, fetchOptions } from "../../constants/appConstants"
import { ApiError, NetworkError } from "./errors"

/**
 * Parse error response from server
 * @param {Response} response - Fetch response object
 * @returns {Promise<string>} Error message
 */
const parseErrorResponse = async (response) => {
  try {
    const errorData = await response.json()
    const errors = Array.isArray(errorData?.errors) ? errorData.errors : []
    const firstDetailedMessage =
      errors.find((item) => typeof item?.message === "string" && item.message.trim())?.message ||
      (typeof errors[0] === "string" ? errors[0] : "")

    if (firstDetailedMessage) {
      return {
        message: firstDetailedMessage,
        errors,
      }
    }

    if (typeof errorData?.message === "string" && errorData.message.trim()) {
      return {
        message: errorData.message,
        errors,
      }
    }

    return {
      message: errorData.error || `Request failed with status ${response.status}`,
      errors,
    }
  } catch {
    return {
      message: `Request failed with status ${response.status}`,
      errors: [],
    }
  }
}

/**
 * Build URL with query parameters
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Query parameters
 * @returns {string} Complete URL with query string
 */
const buildUrl = (endpoint, params = {}, resolvedBaseUrl = getApiBaseUrl()) => {
  const url = new URL(`${resolvedBaseUrl}${endpoint}`)
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.append(key, value)
    }
  })
  
  return url.toString()
}

/**
 * Build URL from query string (for backward compatibility)
 * @param {string} endpoint - API endpoint
 * @param {string} queryString - Query string
 * @returns {string} Complete URL
 */
const buildUrlWithQueryString = (endpoint, queryString = "", resolvedBaseUrl = getApiBaseUrl()) => {
  if (queryString) {
    return `${resolvedBaseUrl}${endpoint}?${queryString}`
  }
  return `${resolvedBaseUrl}${endpoint}`
}

const resolveBaseUrl = (options = {}, clientConfig = {}) => {
  if (options.baseUrl) return options.baseUrl
  if (clientConfig.baseUrl) return clientConfig.baseUrl

  const backend = options.backend || clientConfig.backend || API_BACKENDS.NODE
  return getApiBaseUrl(backend)
}

/**
 * Core request function
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Request options
 * @returns {Promise<any>} Response data
 */
const request = async (endpoint, options = {}, clientConfig = {}) => {
  const { params, queryString, backend: _backend, baseUrl: _baseUrl, ...fetchOpts } = options
  const resolvedBaseUrl = resolveBaseUrl(options, clientConfig)
  const defaultConfig = {
    baseUrl: resolvedBaseUrl,
    ...fetchOptions,
  }
  
  // Build URL
  let url
  if (queryString) {
    url = buildUrlWithQueryString(endpoint, queryString, resolvedBaseUrl)
  } else if (params) {
    url = buildUrl(endpoint, params, resolvedBaseUrl)
  } else {
    url = `${resolvedBaseUrl}${endpoint}`
  }

  // Merge options with defaults
  const config = {
    ...defaultConfig,
    ...fetchOpts,
    headers: {
      ...defaultConfig.headers,
      ...fetchOpts.headers,
    },
  }

  // Remove undefined body for GET/DELETE requests
  if (config.method === "GET" || config.method === "DELETE") {
    delete config.body
  }

  try {
    const response = await fetch(url, config)

    if (!response.ok) {
      const { message, errors } = await parseErrorResponse(response)
      throw new ApiError(message, response.status, response, errors)
    }

    return response.json()
  } catch (error) {
    // Re-throw ApiError as is
    if (error instanceof ApiError) {
      throw error
    }

    // Network errors
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new NetworkError("Network error. Please check your connection.")
    }

    // Unknown errors
    throw new ApiError(error.message || "An unexpected error occurred")
  }
}

/**
 * API Client with HTTP method shortcuts
 */
export const createApiClient = (clientConfig = {}) => {
  return {
    /**
     * GET request
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options (params, queryString, headers)
     * @returns {Promise<any>} Response data
     */
    get: (endpoint, options = {}) => {
      return request(endpoint, { ...options, method: "GET" }, clientConfig)
    },

    /**
     * POST request
     * @param {string} endpoint - API endpoint
     * @param {any} data - Request body data
     * @param {Object} options - Additional request options
     * @returns {Promise<any>} Response data
     */
    post: (endpoint, data, options = {}) => {
      return request(endpoint, {
        ...options,
        method: "POST",
        body: JSON.stringify(data),
      }, clientConfig)
    },

    /**
     * PUT request
     * @param {string} endpoint - API endpoint
     * @param {any} data - Request body data
     * @param {Object} options - Additional request options
     * @returns {Promise<any>} Response data
     */
    put: (endpoint, data, options = {}) => {
      return request(endpoint, {
        ...options,
        method: "PUT",
        body: JSON.stringify(data),
      }, clientConfig)
    },

    /**
     * PATCH request
     * @param {string} endpoint - API endpoint
     * @param {any} data - Request body data
     * @param {Object} options - Additional request options
     * @returns {Promise<any>} Response data
     */
    patch: (endpoint, data, options = {}) => {
      return request(endpoint, {
        ...options,
        method: "PATCH",
        body: JSON.stringify(data),
      }, clientConfig)
    },

    /**
     * DELETE request
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Additional request options
     * @returns {Promise<any>} Response data
     */
    delete: (endpoint, options = {}) => {
      return request(endpoint, { ...options, method: "DELETE" }, clientConfig)
    },

    /**
     * POST request with FormData (for file uploads)
     * @param {string} endpoint - API endpoint
     * @param {FormData} formData - Form data to send
     * @param {Object} options - Additional request options
     * @returns {Promise<any>} Response data
     */
    upload: async (endpoint, formData, options = {}) => {
      const resolvedBaseUrl = resolveBaseUrl(options, clientConfig)
      const url = `${resolvedBaseUrl}${endpoint}`
      const { backend: _backend, baseUrl: _baseUrl, ...fetchOptionsForUpload } = options
      
      try {
        const response = await fetch(url, {
          method: "POST",
          credentials: "include",
          body: formData,
          ...fetchOptionsForUpload,
        })

        if (!response.ok) {
          const { message, errors } = await parseErrorResponse(response)
          throw new ApiError(message, response.status, response, errors)
        }

        return response.json()
      } catch (error) {
        if (error instanceof ApiError) {
          throw error
        }
        throw new ApiError(error.message || "Upload failed")
      }
    },
  }
}

export const apiClient = createApiClient()
export const goApiClient = createApiClient({ backend: API_BACKENDS.GO })

// Export utilities for custom use cases
export { buildUrl, buildUrlWithQueryString, request }
export default apiClient
