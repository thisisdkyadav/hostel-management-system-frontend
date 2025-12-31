import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthProvider"
import { useWarden } from "../../contexts/WardenProvider"
import { wardenApi, associateWardenApi, hostelSupervisorApi } from "../../service"
import { Select } from "@/components/ui"
import { CgSpinner } from "react-icons/cg"
import { FaBuilding } from "react-icons/fa"

/**
 * HostelSwitcher Component
 * 
 * Extracted from Sidebar.jsx - handles hostel switching for warden roles.
 * Only renders for Warden, Associate Warden, and Hostel Supervisor roles.
 */
const HostelSwitcher = ({ isOpen }) => {
  const { user } = useAuth()
  const wardenContext = useWarden()
  const [isUpdatingHostel, setIsUpdatingHostel] = useState(false)
  const [assignedHostels, setAssignedHostels] = useState([])
  const [activeHostelId, setActiveHostelId] = useState(null)

  const isWardenRole = user?.role === "Warden" || 
                       user?.role === "Associate Warden" || 
                       user?.role === "Hostel Supervisor"

  const fetchProfile = wardenContext?.fetchProfile

  // Update hostel data when context changes
  useEffect(() => {
    if (isWardenRole && wardenContext) {
      const profileData = wardenContext?.profile || user
      const hostels = profileData?.hostels || profileData?.hostelIds || []
      const currentActiveId = profileData?.activeHostelId?._id || 
                              profileData?.activeHostelId || 
                              user?.hostel?._id

      setAssignedHostels(hostels)
      setActiveHostelId(currentActiveId)
    } else {
      setAssignedHostels([])
      setActiveHostelId(null)
    }
  }, [user, wardenContext?.profile, isWardenRole, wardenContext])

  // Don't render if not a warden role or no hostels
  if (!isWardenRole || !assignedHostels || assignedHostels.length === 0) {
    return null
  }

  const handleHostelChange = async (event) => {
    const newHostelId = event.target.value
    if (!newHostelId || newHostelId === activeHostelId) {
      return
    }

    setIsUpdatingHostel(true)
    try {
      if (user?.role === "Warden") {
        await wardenApi.setActiveHostel(newHostelId)
      } else if (user?.role === "Associate Warden") {
        await associateWardenApi.setActiveHostel(newHostelId)
      } else if (user?.role === "Hostel Supervisor") {
        await hostelSupervisorApi.setActiveHostel(newHostelId)
      }

      if (fetchProfile) {
        await fetchProfile()
      } else {
        console.warn("fetchProfile function not available from context.")
        alert("Active hostel updated (manual refresh might be needed).")
      }
    } catch (error) {
      console.error("Failed to update active hostel:", error)
      alert(`Error updating active hostel: ${error.message}`)
      event.target.value = activeHostelId
    } finally {
      setIsUpdatingHostel(false)
    }
  }

  // Expanded view with select dropdown
  if (isOpen) {
    return (
      <div className={`border-t border-[var(--color-border-primary)] bg-[var(--color-bg-primary)]/70 backdrop-blur p-3`}>
        <div className="relative">
          <Select
            id="activeHostelSelect"
            value={activeHostelId || ""}
            onChange={handleHostelChange}
            disabled={isUpdatingHostel}
            options={[
              ...(!activeHostelId && assignedHostels.length > 0 
                ? [{ value: "", label: "Select Active Hostel", disabled: true }] 
                : []),
              ...assignedHostels
                .map((hostel) => {
                  const hostelId = typeof hostel === "string" ? hostel : hostel?._id
                  const hostelName = typeof hostel === "string" 
                    ? `Hostel (${hostelId?.slice(-4) || "Unknown"})` 
                    : hostel?.name || "Unknown Hostel"
                  return { value: hostelId, label: hostelName }
                })
                .filter((opt) => opt.value),
            ]}
          />
          {isUpdatingHostel && (
            <div className="absolute inset-y-0 right-8 flex items-center pointer-events-none">
              <CgSpinner className="animate-spin text-[var(--color-primary)]" />
            </div>
          )}
        </div>
      </div>
    )
  }

  // Collapsed view with icon only
  return (
    <div className={`border-t border-[var(--color-border-primary)] bg-[var(--color-bg-primary)]/70 backdrop-blur p-2`}>
      <div className="relative group" title="Active Hostel">
        <div className="w-full py-3 flex justify-center">
          <FaBuilding className="text-xl text-[var(--color-primary)]" />
        </div>
      </div>
    </div>
  )
}

export default HostelSwitcher
