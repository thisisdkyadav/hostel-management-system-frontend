import { useEffect, useState } from "react"
import useVersionCheck from "../../hooks/useVersionCheck"
import Toast from "./Toast"

const VersionUpdateNotification = () => {
  // Temporarily disabled due to issues
  return null

  const { updateAvailable, handleUpdate } = useVersionCheck()
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    if (updateAvailable) {
      setShowToast(true)
    }
  }, [updateAvailable])

  if (!showToast) return null

  return <Toast message="New version available." action="Update now" onAction={handleUpdate} onClose={() => setShowToast(false)} />
}

export default VersionUpdateNotification
