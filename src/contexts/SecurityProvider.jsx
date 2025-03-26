import { createContext, useState, useContext, useEffect } from "react"
import { securityApi } from "../services/apiService"

const SecurityContext = createContext(null)
export const useSecurity = () => useContext(SecurityContext)

const SecurityProvider = ({ children }) => {
  const [securityInfo, setSecurityInfo] = useState()
  const [visitors, setVisitors] = useState([])

  const fetchSecurityInfo = async () => {
    try {
      const data = await securityApi.getSecurityInfo()
      setSecurityInfo(data.security)
    } catch (error) {
      console.error("Error fetching security info:", error)
    }
  }

  const fetchVisitors = async () => {
    try {
      const data = await securityApi.getVisitors()
      setVisitors(data)
    } catch (error) {
      console.error("Error fetching visitors:", error)
    }
  }

  useEffect(() => {
    fetchSecurityInfo()
    fetchVisitors()
  }, [])

  const value = { securityInfo, setSecurityInfo, visitors, setVisitors, fetchVisitors }

  return <SecurityContext.Provider value={value}>{children}</SecurityContext.Provider>
}

export default SecurityProvider
