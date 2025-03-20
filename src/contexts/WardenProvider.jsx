import { createContext, useState, useContext, useEffect } from "react"
import { adminApi, wardenApi } from "../services/apiService"

const WardenContext = createContext(null)
export const useWarden = () => useContext(WardenContext)

const WardenProvider = ({ children }) => {
  const [hostelList, setHostelList] = useState()
  const [profile, setProfile] = useState(null)

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
      const data = await wardenApi.getProfile()
      console.log(data, "Warden Profile from API")

      setProfile(data)
    } catch (error) {
      console.error("Error fetching warden profile:", error)
    }
  }

  useEffect(() => {
    fetchHostelList()
    fetchProfile()
  }, [])

  const value = {
    hostelList,
    fetchHostelList,
    profile,
    fetchProfile,
  }

  return <WardenContext.Provider value={value}>{children}</WardenContext.Provider>
}

export default WardenProvider
