import { createContext, useState, useContext, useEffect } from "react"
import { adminApi } from "../services/apiService"

const WardenContext = createContext(null)
export const useWarden = () => useContext(WardenContext)

const WardenProvider = ({ children }) => {
  const [hostelList, setHostelList] = useState()

  const fetchHostelList = async () => {
    try {
      const data = await adminApi.getHostelList()
      console.log(data, "Hostel List from API")

      setHostelList(data)
    } catch (error) {
      console.error("Error fetching hostel list:", error)
    }
  }

  useEffect(() => {
    fetchHostelList()
  }, [])

  const value = {
    hostelList,
    fetchHostelList,
  }

  return <WardenContext.Provider value={value}>{children}</WardenContext.Provider>
}

export default WardenProvider
