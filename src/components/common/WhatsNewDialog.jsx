import { useState, useEffect } from "react"
import Modal from "./Modal"
import { getLastSeenVersion } from "../../utils/versionUtils"

const WhatsNewDialog = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [lastVersion, setLastVersion] = useState(null)
  const currentVersion = import.meta.env.VITE_APP_VERSION || "unknown"

  useEffect(() => {
    // Check if this is the first load after an update
    const lastSeen = getLastSeenVersion()
    const hasUpdated = lastSeen && lastSeen !== currentVersion && currentVersion !== "unknown"

    if (hasUpdated) {
      setLastVersion(lastSeen)

      // Show dialog after a short delay to allow the app to load first
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [currentVersion])

  // Get release notes for the current version
  // In a real app, you would fetch this from an API or include it in the build
  const getReleaseNotes = () => {
    // This is a placeholder - in a real app, you would have actual release notes
    return ["Improved version checking and automatic updates", "Added loading screen during updates", "Fixed various bugs and improved performance", "Added better offline support"]
  }

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={`What's New in v${currentVersion}`}>
      <div className="p-4">
        <p className="text-sm text-gray-600 mb-4">
          Your app has been updated from v{lastVersion} to v{currentVersion}
        </p>

        <h3 className="font-medium text-lg mb-2">Release Notes:</h3>
        <ul className="list-disc pl-5 space-y-1">
          {getReleaseNotes().map((note, index) => (
            <li key={index} className="text-gray-700">
              {note}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex justify-end">
          <button onClick={() => setIsOpen(false)} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            Got it
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default WhatsNewDialog
