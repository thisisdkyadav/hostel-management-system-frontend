/**
 * Custom Error Classes for API
 * Provides structured error handling throughout the application
 */

/**
 * Base API Error class
 * Extends Error with additional properties for API error handling
 */
export class ApiError extends Error {
  constructor(message, status = null, response = null) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.response = response
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

/**
 * Validation Error
 * For client-side or server-side validation failures
 */
export class ValidationError extends ApiError {
  constructor(message, errors = {}) {
    super(message, 400)
    this.name = "ValidationError"
    this.errors = errors
  }
}

/**
 * Authentication Error
 * For auth-related failures
 */
export class AuthError extends ApiError {
  constructor(message = "Authentication required") {
    super(message, 401)
    this.name = "AuthError"
  }
}

/**
 * Authorization Error
 * For permission-related failures
 */
export class ForbiddenError extends ApiError {
  constructor(message = "You do not have permission to perform this action") {
    super(message, 403)
    this.name = "ForbiddenError"
  }
}

/**
 * Not Found Error
 * For missing resources
 */
export class NotFoundError extends ApiError {
  constructor(message = "Resource not found") {
    super(message, 404)
    this.name = "NotFoundError"
  }
}

/**
 * Error handler utility
 * Logs errors and optionally re-throws them
 * @param {Error} error - The error to handle
 * @param {string} context - Context description for logging
 * @param {boolean} rethrow - Whether to rethrow the error (default: true)
 */
export const handleError = (error, context = "", rethrow = true) => {
  console.error(`Error${context ? ` in ${context}` : ""}:`, error)
  
  if (rethrow) {
    throw error
  }
  
  return null
}

export default {
  ApiError,
  NetworkError,
  ValidationError,
  AuthError,
  ForbiddenError,
  NotFoundError,
  handleError,
}
