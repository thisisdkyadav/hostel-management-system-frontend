import { useContext } from "react"
import { AuthzContext } from "../contexts/AuthzContext"

const useAuthz = () => {
  const context = useContext(AuthzContext)
  if (!context) {
    throw new Error("useAuthz must be used inside AuthzProvider")
  }
  return context
}

export default useAuthz
