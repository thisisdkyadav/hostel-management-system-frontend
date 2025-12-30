/**
 * Centralized API Client
 * Provides a unified interface for making HTTP requests with:
 * - Automatic error handling
 * - Request/Response interceptors
 * - Consistent configuration
 */

import { baseUrl, fetchOptions } from "../../constants/appConstants"
import { ApiError, NetworkError, ValidationError } from "./errors"

/**
 * Default request configuration
 */
const defaultConfig = {
  baseUrl,
  ...fetchOptions,
}

/**
 * Parse error response from server
 * @param {Response} response - Fetch response object
 * @returns {Promise<string>} Error message
 */
const parseErrorResponse = async (response) => {
  try {
    const errorData = await response.json()
    return errorData.message || errorData.error || `Request failed with status ${response.status}`
  } catch {
    return `Request failed with status ${response.status}`
  }
}

/**
 * Build URL with query parameters
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Query parameters
 * @returns {string} Complete URL with query string
 */
const buildUrl = (endpoint, params = {}) => {
  const url = new URL(`${defaultConfig.baseUrl}${endpoint}`)
  
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
const buildUrlWithQueryString = (endpoint, queryString = "") => {
  if (queryString) {
    return `${defaultConfig.baseUrl}${endpoint}?${queryString}`
  }
  return `${defaultConfig.baseUrl}${endpoint}`
}

/**
 * Core request function
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Request options
 * @returns {Promise<any>} Response data
 */
const request = async (endpoint, options = {}) => {
  const { params, queryString, ...fetchOpts } = options
  
  // Build URL
  let url
  if (queryString) {
    url = buildUrlWithQueryString(endpoint, queryString)
  } else if (params) {
    url = buildUrl(endpoint, params)
  } else {
    url = `${defaultConfig.baseUrl}${endpoint}`
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
      const errorMessage = await parseErrorResponse(response)
      throw new ApiError(errorMessage, response.status, response)
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
export const apiClient = {
  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options (params, queryString, headers)
   * @returns {Promise<any>} Response data
   */
  get: (endpoint, options = {}) => {
    return request(endpoint, { ...options, method: "GET" })
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
    })
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
    })
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
    })
  },

  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Additional request options
   * @returns {Promise<any>} Response data
   */
  delete: (endpoint, options = {}) => {
    return request(endpoint, { ...options, method: "DELETE" })
  },

  /**
   * POST request with FormData (for file uploads)
   * @param {string} endpoint - API endpoint
   * @param {FormData} formData - Form data to send
   * @param {Object} options - Additional request options
   * @returns {Promise<any>} Response data
   */
  upload: async (endpoint, formData, options = {}) => {
    const url = `${defaultConfig.baseUrl}${endpoint}`
    
    try {
      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
        body: formData,
        ...options,
      })

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response)
        throw new ApiError(errorMessage, response.status, response)
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

// Export utilities for custom use cases
export { buildUrl, buildUrlWithQueryString, request }
export default apiClient
