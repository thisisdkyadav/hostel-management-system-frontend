import { createContext, useState, useContext, useEffect } from "react"
import { adminApi } from "../services/apiService"

const GlobalContext = createContext(null)
export const useGlobal = () => useContext(GlobalContext)

const GlobalProvider = ({ children }) => {
  const [hostelList, setHostelList] = useState()
  // const [wardens, setWardens] = useState([])

  const fetchHostelList = async () => {
    try {
      const data = await adminApi.getHostelList()
      console.log(data, "Hostel List from API")

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

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
}

export default GlobalProvider
