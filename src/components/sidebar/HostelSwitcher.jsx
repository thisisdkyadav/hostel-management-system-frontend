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
 * Handles hostel switching for warden roles.
 * Only renders for Warden, Associate Warden, and Hostel Supervisor roles.
 */
const HostelSwitcher = ({ isOpen, onExpand }) => {
  const { user } = useAuth()
  const wardenContext = useWarden()
  const [isUpdatingHostel, setIsUpdatingHostel] = useState(false)
  const [updateError, setUpdateError] = useState(null)
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
    setUpdateError(null)
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
        console.warn("fetchProfile function not available from context; data may be stale until refresh.")
      }
    } catch (error) {
      console.error("Failed to update active hostel:", error)
      setUpdateError(error?.message || "Could not switch hostel. Please try again.")
      event.target.value = activeHostelId
    } finally {
      setIsUpdatingHostel(false)
    }
  }

  // Expanded view with labelled select dropdown
  if (isOpen) {
    return (
      <div className="border-t border-[var(--color-border-primary)] px-4 py-3 shrink-0">
        <div className="flex items-center gap-1.5 px-1 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          <FaBuilding size={10} className="text-[var(--color-primary)]" />
          Active Hostel
        </div>
        <div className="relative">
          <Select
            id="activeHostelSelect"
            value={activeHostelId || ""}
            onChange={handleHostelChange}
            disabled={isUpdatingHostel}
            size="small"
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
        {updateError && <p className="mt-1.5 px-1 text-xs text-[var(--color-danger)]">{updateError}</p>}
      </div>
    )
  }

  // Collapsed view - icon button that expands the sidebar to switch hostels
  return (
    <div className="border-t border-[var(--color-border-primary)] p-2 shrink-0">
      <button
        type="button"
        onClick={() => onExpand?.()}
        title="Active hostel - expand to switch"
        aria-label="Active hostel - expand sidebar to switch"
        className="w-full py-2.5 rounded-xl flex justify-center items-center text-[var(--color-primary)] hover:bg-[var(--color-bg-hover)] transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40"
      >
        {isUpdatingHostel ? <CgSpinner className="animate-spin text-xl" /> : <FaBuilding className="text-xl" />}
      </button>
    </div>
  )
}

export default HostelSwitcher
