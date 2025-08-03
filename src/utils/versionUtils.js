/**
 * Compares two semantic version strings
 * @param {string} v1 - First version string (e.g. "1.2.3")
 * @param {string} v2 - Second version string (e.g. "1.3.0")
 * @returns {number} - Returns -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2
 */
export const compareVersions = (v1, v2) => {
  // Handle undefined or invalid versions
  if (!v1 || !v2 || v1 === "unknown" || v2 === "unknown") {
    return 0
  }

  const v1Parts = v1.split(".").map(Number)
  const v2Parts = v2.split(".").map(Number)

  // Compare major, minor, and patch versions
  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1Part = v1Parts[i] || 0
    const v2Part = v2Parts[i] || 0

    if (v1Part > v2Part) return 1
    if (v1Part < v2Part) return -1
  }

  return 0 // Versions are equal
}

/**
 * Determines if a version update is major, minor, or patch
 * @param {string} oldVersion - Current version
 * @param {string} newVersion - New version
 * @returns {string} - "major", "minor", "patch", or "none"
 */
export const getUpdateType = (oldVersion, newVersion) => {
  // Handle undefined or invalid versions
  if (!oldVersion || !newVersion || oldVersion === "unknown" || newVersion === "unknown") {
    return "none"
  }

  const oldParts = oldVersion.split(".").map(Number)
  const newParts = newVersion.split(".").map(Number)

  if (newParts[0] > oldParts[0]) return "major"
  if (newParts[1] > oldParts[1]) return "minor"
  if (newParts[2] > oldParts[2]) return "patch"

  return "none"
}

/**
 * Stores the last seen version in localStorage
 * @param {string} version - Version to store
 */
export const storeLastSeenVersion = (version) => {
  if (version && version !== "unknown") {
    localStorage.setItem("last_seen_version", version)
  }
}

/**
 * Gets the last seen version from localStorage
 * @returns {string|null} - The last seen version or null if not found
 */
export const getLastSeenVersion = () => {
  return localStorage.getItem("last_seen_version")
}
