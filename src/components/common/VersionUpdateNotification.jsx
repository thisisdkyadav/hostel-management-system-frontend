import { useEffect, useState } from "react"
import useVersionCheck from "../../hooks/useVersionCheck"
import Toast from "./Toast"
import UpdateLoadingScreen from "./UpdateLoadingScreen"

const VersionUpdateNotification = ({ autoUpdateOnLoad = true }) => {
  console.log("VersionUpdateNotification rendered, autoUpdateOnLoad:", autoUpdateOnLoad)

  const { updateAvailable, handleUpdate, currentVersion, updateType } = useVersionCheck({
    autoUpdateOnLoad,
    checkInterval: 30000, // Check every 30 seconds (for testing)
  })

  const [showToast, setShowToast] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    console.log("updateAvailable changed:", updateAvailable)
    if (updateAvailable) {
      console.log("Setting showToast to true")
      setShowToast(true)
    }
  }, [updateAvailable])

  const handleUpdateClick = () => {
    setShowToast(false)
    setIsUpdating(true)

    // Small delay to ensure the loading screen is shown before the actual update
    setTimeout(() => {
      handleUpdate()
    }, 500)
  }

  // Get appropriate message based on update type
  const getMessage = () => {
    if (updateType === "major") {
      return "A major update is available!"
    } else if (updateType === "minor") {
      return "A new version is available with improvements"
    } else if (updateType === "patch") {
      return "A bug fix update is available"
    } else if (updateType === "pwa") {
      return "App update available"
    }
    return "A new version is available!"
  }

  if (isUpdating) {
    return <UpdateLoadingScreen onComplete={() => setIsUpdating(false)} />
  }

  if (!showToast) return null

  return <Toast message={getMessage()} action="Update now" onAction={handleUpdateClick} onClose={() => setShowToast(false)} persistent={true} />
}

export default VersionUpdateNotification
