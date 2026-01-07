import { useState, useEffect } from "react"

const LAYOUT_PREFERENCE_KEY = "student_layout_preference"

/**
 * Custom hook for managing student layout preference (sidebar vs bottombar).
 * Consolidates layout preference logic that was previously duplicated in:
 * - Sidebar.jsx
 * - StudentLayout.jsx
 * - MobileHeader.jsx
 * 
 * @returns {Object} { layoutPreference, updatePreference, loading }
 */
export const useLayoutPreference = () => {
  const [layoutPreference, setLayoutPreference] = useState("sidebar")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const savedPreference = localStorage.getItem(LAYOUT_PREFERENCE_KEY)
      if (savedPreference) {
        setLayoutPreference(savedPreference)
      }
    } catch (error) {
      console.error("Error loading layout preference:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const updatePreference = (newPreference) => {
    try {
      localStorage.setItem(LAYOUT_PREFERENCE_KEY, newPreference)
      setLayoutPreference(newPreference)
    } catch (error) {
      console.error("Error saving layout preference:", error)
    }
  }

  return { layoutPreference, updatePreference, loading }
}

export default useLayoutPreference
