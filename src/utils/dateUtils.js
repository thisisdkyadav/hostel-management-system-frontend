/**
 * Utility functions for date and time handling with Indian Standard Time
 */

/**
 * Format a date for display in Indian format
 * @param {string|Date} dateTimeInput - The input date/time
 * @returns {object} Object with formatted date and time strings
 */
export const formatDateTime = (dateTimeInput) => {
  const dateTime = new Date(dateTimeInput)

  return {
    date: dateTime.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }),
    time: dateTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
  }
}

/**
 * Format a date for input elements
 * @param {string|Date} dateTimeInput - The input date/time
 * @returns {string} Formatted date string for datetime-local input
 */
export const formatDateTimeForInput = (dateTimeInput) => {
  const date = new Date(dateTimeInput)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

/**
 * Get current date and time formatted for input elements
 * @returns {string} Current date and time formatted for datetime-local input
 */
export const getCurrentDateTimeForInput = () => {
  return formatDateTimeForInput(new Date())
}

/**
 * Convert local datetime to ISO string for API
 * @param {string} localDateTime - The local datetime string from input
 * @returns {string} ISO formatted string for API
 */
export const toISOString = (localDateTime) => {
  return new Date(localDateTime).toISOString()
}

/**
 * Check if a date is in the future
 * @param {string|Date} dateTime - The date to check
 * @returns {boolean} True if the date is in the future
 */
export const isUpcoming = (dateTime) => {
  return new Date(dateTime) > new Date()
}
