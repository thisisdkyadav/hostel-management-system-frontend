import { createContext, useState, useContext, useEffect, use } from "react"
import { Navigate, useLocation, useSearchParams } from "react-router-dom"
import { authApi } from "../services/apiService"
import LoadingScreen from "../components/common/LoadingScreen"
import useNetworkStatus from "../hooks/useNetworkStatus"

export const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

export const AuthProvider = ({ children }) => {
  const isOnline = useNetworkStatus()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(true)
  const [error, setError] = useState(null)
  const [isStandalone, setIsStandalone] = useState(false)

  const checkAuth = async () => {
    try {
      setStarting(true)
      const userData = await authApi.verify()
      setUser(userData)
      localStorage.setItem("user", JSON.stringify(userData))
    } catch (err) {
      console.error("Auth verification failed", err)
    } finally {
      setLoading(false)
      setStarting(false)
    }
  }

  const login = async (credentials) => {
    setLoading(true)
    setError(null)

    try {
      const data = await authApi.login(credentials)
      setUser(data.user)
      const aesKey = data.user.aesKey
      localStorage.setItem("publicKey", aesKey)
      localStorage.setItem("user", JSON.stringify(data.user))
      return data.user
    } catch (err) {
      setError(err.message || "Login failed")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const loginWithGoogle = async (token) => {
    setLoading(true)
    setError(null)
    try {
      const data = await authApi.loginWithGoogle(token)
      setUser(data.user)
      const aesKey = data.user.aesKey
      localStorage.setItem("publicKey", aesKey)
      localStorage.setItem("user", JSON.stringify(data.user))
      return data.user
    } catch (err) {
      setError(err.message || "Login failed")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
      localStorage.removeItem("publicKey")
      setUser(null)
    } catch (err) {
      console.error("Logout error", err)
    } finally {
      setUser(null)
    }
  }

  const getHomeRoute = () => {
    if (!user) return "/login"

    console.log("user role", user.role)

    switch (user.role) {
      case "Student":
        return "/student"
      case "Warden":
        return "/warden"
      case "Security":
        return "/guard"
      case "Admin":
        return "/admin"
      case "Super Admin":
        return "/super-admin"
      case "Maintenance Staff":
        return "/maintenance"
      case "Associate Warden":
        return "/associate-warden"
      default:
        return "/login"
    }
  }

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true
    setIsStandalone(standalone)

    if (isOnline) {
      console.log("Online")
      checkAuth()
    } else {
      console.log("Offline")
      const storedUser = localStorage.getItem("user")
      console.log("Stored user", storedUser)

      if (storedUser) {
        setUser(JSON.parse(storedUser))
      } else {
        setUser(null)
      }
      setLoading(false)
      setStarting(false)
    }
  }, [isOnline])

  const value = {
    user,
    loading,
    error,
    login,
    loginWithGoogle,
    logout,
    getHomeRoute,
    isStandalone,
    isOnline,
  }

  if (starting) {
    return <LoadingScreen />
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
