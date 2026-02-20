import { createContext, useState, useContext, useEffect } from "react"
import { Navigate, useLocation, useSearchParams } from "react-router-dom"
import { authApi } from "../service"
import LoadingPage from "@/pages/LoadingPage"
import useNetworkStatus from "../hooks/useNetworkStatus"

export const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingPage message="Authenticating..." />
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

  const loginWithSSO = async (token) => {
    setLoading(true)
    setError(null)
    try {
      const data = await authApi.verifySSOToken(token)
      setUser(data.user)
      const aesKey = data.user.aesKey
      localStorage.setItem("publicKey", aesKey)
      localStorage.setItem("user", JSON.stringify(data.user))
      return data.user
    } catch (err) {
      setError(err.message || "SSO login failed")
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

    switch (user.role) {
      case "Student":
        return "/student"
      case "Warden":
        return "/warden"
      case "Security":
        return "/guard"
      case "Hostel Gate":
        return "/hostel-gate"
      case "Admin":
        return "/admin"
      case "Super Admin":
        return "/super-admin"
      case "Maintenance Staff":
        return "/maintenance"
      case "Associate Warden":
        return "/associate-warden"
      case "Hostel Supervisor":
        return "/hostel-supervisor"
      case "Gymkhana":
        return "/gymkhana"
      default:
        return "/login"
    }
  }

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true
    setIsStandalone(standalone)

    if (isOnline) {
      checkAuth()
    } else {
      const storedUser = localStorage.getItem("user")

      if (storedUser) {
        setUser(JSON.parse(storedUser))
      } else {
        setUser(null)
      }
      setLoading(false)
      setStarting(false)
    }
  }, [isOnline])

  useEffect(() => { }, [user])

  const value = {
    user,
    loading,
    error,
    login,
    loginWithGoogle,
    loginWithSSO,
    logout,
    getHomeRoute,
    isStandalone,
    isOnline,
  }

  if (starting) {
    return <LoadingPage message="Starting" />
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
