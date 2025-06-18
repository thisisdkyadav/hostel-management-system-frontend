import React, { useState, useEffect } from "react"
import Modal from "../common/Modal"
import { authApi } from "../../services/apiService"
import CommonSuccessModal from "../common/CommonSuccessModal"
import { HiDesktopComputer, HiDeviceMobile, HiGlobeAlt, HiOutlineLogout } from "react-icons/hi"

const ManageSessionsModal = ({ onClose, email }) => {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [loggingOut, setLoggingOut] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [loggedOutDevice, setLoggedOutDevice] = useState(null)

  useEffect(() => {
    fetchDevices()
  }, [])

  const fetchDevices = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await authApi.getUserDevices()
      console.log(data)
      setDevices(data.devices || [])
    } catch (err) {
      console.error("Error fetching devices:", err)
      setError(err.message || "Failed to load your active sessions")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async (sessionId, deviceName) => {
    try {
      setLoggingOut(sessionId)
      await authApi.logoutFromDevice(sessionId)
      setLoggedOutDevice(deviceName)
      setShowSuccess(true)
      // Remove the logged out device from the list
      setDevices(devices.filter((device) => device.sessionId !== sessionId))
    } catch (err) {
      console.error("Error logging out from device:", err)
      setError(err.message || "Failed to log out from device")
    } finally {
      setLoggingOut(null)
    }
  }

  const getDeviceIcon = (userAgent) => {
    if (!userAgent) return <HiGlobeAlt className="h-6 w-6" />

    const userAgentLower = userAgent.toLowerCase()
    if (userAgentLower.includes("mobile") || userAgentLower.includes("android") || userAgentLower.includes("iphone")) {
      return <HiDeviceMobile className="h-6 w-6" />
    } else if (userAgentLower.includes("tablet") || userAgentLower.includes("ipad")) {
      return <HiDeviceMobile className="h-6 w-6" />
    } else {
      return <HiDesktopComputer className="h-6 w-6" />
    }
  }

  const getBrowserInfo = (userAgent) => {
    if (!userAgent) return "Unknown browser"

    if (userAgent.includes("Firefox")) {
      return "Firefox"
    } else if (userAgent.includes("Edg/")) {
      return "Microsoft Edge"
    } else if (userAgent.includes("Chrome")) {
      return "Chrome"
    } else if (userAgent.includes("Safari")) {
      return "Safari"
    } else {
      return "Unknown browser"
    }
  }

  if (showSuccess) {
    return (
      <CommonSuccessModal
        show={showSuccess}
        onClose={() => {
          setShowSuccess(false)
          onClose()
        }}
        title="Session Ended"
        message={`You have successfully logged out from ${loggedOutDevice || "the device"}.`}
        buttonText="Done"
      />
    )
  }

  return (
    <Modal title="Manage Your Sessions" onClose={onClose} width={600}>
      <div className="space-y-6">
        {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm">{error}</div>}

        <div className="text-gray-600 text-sm">
          <p>Below are all your active sessions across different devices. You can log out from any session that you don't recognize or no longer need.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-[#1360AB] rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600">Loading your sessions...</span>
          </div>
        ) : devices.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto bg-gray-100 text-gray-500 w-16 h-16 flex items-center justify-center rounded-full mb-4">
              <HiDesktopComputer size={30} />
            </div>
            <h3 className="text-lg font-medium text-gray-800">No Active Sessions</h3>
            <p className="text-gray-500 mt-2">You don't have any other active sessions at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {devices.map((device) => (
              <div key={device.sessionId} className="border rounded-lg p-4 flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-blue-50 text-[#1360AB] p-2 rounded-lg mr-4">{getDeviceIcon(device.userAgent)}</div>
                  <div>
                    <h4 className="font-medium text-gray-800">{device.deviceName || "Unknown Device"}</h4>
                    <div className="text-xs text-gray-500 mt-1">
                      <p>IP: {device.ip || "Unknown"}</p>
                      <p>Login time: {device.loginTime ? new Date(device.loginTime).toLocaleString() : "Unknown"}</p>
                      <p>Last active: {device.lastActive ? new Date(device.lastActive).toLocaleString() : "Unknown"}</p>
                      <p>Browser: {getBrowserInfo(device.userAgent)}</p>
                      {device.isCurrent && <span className="inline-block mt-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">Current Session</span>}
                    </div>
                  </div>
                </div>
                <div>
                  {!device.isCurrent && (
                    <button onClick={() => handleLogout(device.sessionId, device.deviceName)} disabled={loggingOut === device.sessionId} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
                      {loggingOut === device.sessionId ? <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div> : <HiOutlineLogout className="h-5 w-5" />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 flex justify-end">
          <button onClick={onClose} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
            Close
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ManageSessionsModal
