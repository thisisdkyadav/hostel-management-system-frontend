import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthProvider"

/**
 * Custom hook that provides a standardized logout handler.
 * Consolidates logout logic that was previously duplicated across all layout files.
 * 
 * @returns {Function} handleLogout - Async function that handles user logout with confirmation
 */
export const useLogout = () => {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?")
    if (!confirmLogout) return

    try {
      await logout()
      navigate("/")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return handleLogout
}

export default useLogout
