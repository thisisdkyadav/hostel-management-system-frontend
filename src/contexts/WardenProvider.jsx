import { createContext, useState, useContext, useEffect } from "react"
import { adminApi, wardenApi, associateWardenApi, hostelSupervisorApi } from "../service"
import { useAuth } from "./AuthProvider"

const WardenContext = createContext(null)
export const useWarden = () => useContext(WardenContext)

const WardenProvider = ({ children }) => {
  const { user } = useAuth()
  const [hostelList, setHostelList] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const isAssociateWardenOrSupervisor = user?.role === "Associate Warden" || user?.role === "Hostel Supervisor"

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
      const api = user?.role === "Associate Warden" ? associateWardenApi : user?.role === "Hostel Supervisor" ? hostelSupervisorApi : wardenApi
      const data = await api.getProfile()

      setProfile(data)
    } catch (error) {
      console.error(`Error fetching ${user?.role === "Associate Warden" ? "associate warden" : user?.role === "Hostel Supervisor" ? "hostel supervisor" : "warden"} profile:`, error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHostelList()
    fetchProfile()
  }, [user?.role])

  const value = {
    hostelList,
    fetchHostelList,
    profile,
    fetchProfile,
    isAssociateWardenOrSupervisor,
    loading,
  }

  return (
    <WardenContext.Provider value={value}>
      <div key={profile?.activeHostelId?._id}>{children}</div>
    </WardenContext.Provider>
  )
}

export default WardenProvider
