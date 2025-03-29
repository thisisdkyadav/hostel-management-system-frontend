import { createContext, useState, useContext, useEffect } from "react"
import { adminApi, wardenApi, associateWardenApi } from "../services/apiService"
import { useAuth } from "./AuthProvider"

const WardenContext = createContext(null)
export const useWarden = () => useContext(WardenContext)

const WardenProvider = ({ children }) => {
  const { user } = useAuth()
  const [hostelList, setHostelList] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const isAssociateWarden = user?.role === "Associate Warden"

  const fetchHostelList = async () => {
    try {
      const data = await adminApi.getHostelList()
      setHostelList(data)
    } catch (error) {
      console.error("Error fetching hostel list:", error)
    }
  }

  const fetchProfile = async () => {
    try {
      const api = isAssociateWarden ? associateWardenApi : wardenApi
      const data = await api.getProfile()

      console.log(data, isAssociateWarden ? "Associate Warden Profile from API" : "Warden Profile from API")
      setProfile(data)
    } catch (error) {
      console.error(`Error fetching ${isAssociateWarden ? "associate warden" : "warden"} profile:`, error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHostelList()
    fetchProfile()
  }, [isAssociateWarden])

  const value = {
    hostelList,
    fetchHostelList,
    profile,
    fetchProfile,
    isAssociateWarden,
    loading,
  }

  return <WardenContext.Provider value={value}>{children}</WardenContext.Provider>
}

export default WardenProvider
