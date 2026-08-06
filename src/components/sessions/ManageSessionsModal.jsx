import React, { useState, useEffect } from "react"
import { Heading, HStack, IconCircle, Modal, Spinner, Text, VStack } from "@/components/ui"
import { Button } from "czero/react"
import { authApi } from "../../service"
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
    if (!userAgent) return <HiGlobeAlt style={{ height: 'var(--icon-xl)', width: 'var(--icon-xl)' }} />

    const userAgentLower = userAgent.toLowerCase()
    if (userAgentLower.includes("mobile") || userAgentLower.includes("android") || userAgentLower.includes("iphone")) {
      return <HiDeviceMobile style={{ height: 'var(--icon-xl)', width: 'var(--icon-xl)' }} />
    } else if (userAgentLower.includes("tablet") || userAgentLower.includes("ipad")) {
      return <HiDeviceMobile style={{ height: 'var(--icon-xl)', width: 'var(--icon-xl)' }} />
    } else {
      return <HiDesktopComputer style={{ height: 'var(--icon-xl)', width: 'var(--icon-xl)' }} />
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
      <CommonSuccessModal show={showSuccess} onClose={() => {
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
      <VStack gap="var(--gap-lg)">
        {error && (
          <div style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger-text)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--font-size-sm)', }} >
            {error}
          </div>
        )}

        <Text as="div" color="muted" size="sm">
          <p>Below are all your active sessions across different devices. You can log out from any session that you don't recognize or no longer need.</p>
        </Text>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-8) 0', }} >
            <Spinner size="var(--spacing-8)" thickness="thick" />
            <Text as="span" color="muted" style={{ marginLeft: 'var(--spacing-3)' }}>
              Loading your sessions...
            </Text>
          </div>
        ) : devices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-8) 0', }} >
            <IconCircle size="var(--avatar-xl)" bg="muted" color="var(--color-text-placeholder)" style={{ margin: '0 auto', marginBottom: 'var(--spacing-4)' }}>
              <HiDesktopComputer size={30} />
            </IconCircle>
            <Heading as="h3" size="lg" weight="medium" color="secondary">
              No Active Sessions
            </Heading>
            <Text color="placeholder" style={{ marginTop: 'var(--spacing-2)' }}>
              You don't have any other active sessions at the moment.
            </Text>
          </div>
        ) : (
          <VStack gap="var(--gap-md)">
            {devices.map((device) => (
              <div key={device.sessionId} style={{ border: `var(--border-1) solid var(--color-border-primary)`, borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', }} >
                <HStack gap="none" align="center">
                  <div style={{ backgroundColor: 'var(--color-primary-bg)', color: 'var(--color-primary)', padding: 'var(--spacing-2)', borderRadius: 'var(--radius-lg)', marginRight: 'var(--spacing-4)', }} >
                    {getDeviceIcon(device.userAgent)}
                  </div>
                  <div>
                    <Heading as="h4" weight="medium" color="secondary">
                      {device.deviceName || "Unknown Device"}
                    </Heading>
                    <Text as="div" size="xs" color="placeholder" style={{ marginTop: 'var(--spacing-1)' }}>
                      <p>IP: {device.ip || "Unknown"}</p>
                      <p>Login time: {device.loginTime ? new Date(device.loginTime).toLocaleString() : "Unknown"}</p>
                      <p>Last active: {device.lastActive ? new Date(device.lastActive).toLocaleString() : "Unknown"}</p>
                      <p>Browser: {getBrowserInfo(device.userAgent)}</p>
                      {device.isCurrent && (
                        <span style={{ display: 'inline-block', marginTop: 'var(--spacing-1)', backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success-text)', padding: 'var(--badge-padding-xs)', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-xs)', }} >
                          Current Session
                        </span>
                      )}
                    </Text>
                  </div>
                </HStack>
                <div>
                  {!device.isCurrent && (
                    <Button onClick={() => handleLogout(device.sessionId, device.deviceName)}
                      disabled={loggingOut === device.sessionId}
                      variant="danger" size="sm"
                      loading={loggingOut === device.sessionId}
                      aria-label="Logout from this device"
                    >
                      <HiOutlineLogout />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </VStack>
        )}

        <div style={{ paddingTop: 'var(--spacing-4)', display: 'flex', justifyContent: 'flex-end', }} >
          <Button onClick={onClose} variant="secondary" size="md">
            Close
          </Button>
        </div>
      </VStack>
    </Modal>
  )
}

export default ManageSessionsModal
