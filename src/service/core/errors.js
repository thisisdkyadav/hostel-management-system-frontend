/**
 * Custom Error Classes for API
 * Provides structured error handling throughout the application
 */

/**
 * Base API Error class
 * Extends Error with additional properties for API error handling
 */
export class ApiError extends Error {
  constructor(message, status = null, response = null, errors = []) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.response = response
    this.errors = Array.isArray(errors) ? errors : []
    this.timestamp = new Date().toISOString()

    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError)
    }
  }

  /**
   * Check if error is due to authentication issues
   */
  isAuthError() {
    return this.status === 401 || this.status === 403
  }

  /**
   * Check if error is due to not found resource
   */
  isNotFound() {
    return this.status === 404
  }

  /**
   * Check if error is due to validation
   */
  isValidationError() {
    return this.status === 400 || this.status === 422
  }

  /**
   * Check if error is a server error
   */
  isServerError() {
    return this.status >= 500
  }

  /**
   * Convert error to plain object for logging
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      errors: this.errors,
      timestamp: this.timestamp,
    }
  }
}

/**
 * Network Error
 * For connectivity issues
 */
export class NetworkError extends ApiError {
  constructor(message = "Network error. Please check your connection.") {
    super(message, 0)
    this.name = "NetworkError"
  }
}
