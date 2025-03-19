import { createContext, useState, useContext, useEffect } from "react"
import { adminApi } from "../services/apiService"

const AdminContext = createContext(null)
export const useAdmin = () => useContext(AdminContext)

const AdminProvider = ({ children }) => {
  const [hostelList, setHostelList] = useState()
  // const [wardens, setWardens] = useState([])

  const fetchHostelList = async () => {
    try {
      const data = await adminApi.getHostelList()
      setHostelList(data)
    } catch (error) {
      console.error("Error fetching hostel list:", error)
    }
  }

  // const fetchWardens = async () => {
  //   try {
  //     const response = await adminApi.getAllWardens()
  //     setWardens(response || [])
  //   } catch (error) {
  //     console.error("Error fetching wardens:", error)
  //   }
  // }

  useEffect(() => {
    fetchHostelList()
    // fetchWardens()
  }, [])

  const value = {
    hostelList,
    fetchHostelList,
    // wardens,
    // fetchWardens,
  }

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export default AdminProvider
