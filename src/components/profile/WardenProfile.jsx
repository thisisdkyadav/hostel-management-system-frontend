import React, { useEffect, useState } from "react"
import { FiMail, FiPhone, FiHome, FiCalendar, FiMapPin, FiUser, FiBriefcase } from "react-icons/fi"
import ProfileHeader from "./ProfileHeader"
import ProfileCard from "./ProfileCard"
import ProfileInfo from "./ProfileInfo"
import { LoadingState, ErrorState, EmptyState } from "@/components/ui"
import { useWarden } from "../../contexts/WardenProvider"
import { useAuth } from "../../contexts/AuthProvider"

const WardenProfile = () => {
  const { profile, fetchProfile, isAssociateWardenOrSupervisor } = useWarden()
  const { user: authUser } = useAuth()

  const [wardenData, setWardenData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      if (profile) {
        setWardenData({
          name: profile.userId.name,
          email: profile.userId.email,
          phone: profile.userId.phone,
          hostel: profile.hostelId.name,
          joiningDate: profile.joinDate ? new Date(profile.joinDate).toLocaleDateString() : "Not available",
          status: profile.status,
        })
      }
    } catch (err) {
      console.error("Error loading warden profile:", err)
      setError("Failed to load your profile data. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [profile, fetchProfile])

  if (loading) {
    return <LoadingState message="Loading your profile..." description="Please wait while we fetch your information" />
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadProfile} />
  }

  if (!wardenData) {
    return <EmptyState icon={FiUser} title="Profile Not Found" message="We couldn't find your profile information. Please contact the administrator if this issue persists." />
  }

  const roleDisplay = authUser?.role === "Hostel Supervisor" ? "Hostel Supervisor" : authUser?.role === "Associate Warden" ? "Associate Warden" : "Warden"

  return (
    <div>
      <ProfileHeader user={wardenData} role={roleDisplay} subtitle={wardenData.hostel || "No hostel assigned"} />

      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: "var(--gap-lg)", marginTop: "var(--spacing-8)" }}>
        <div>
          <ProfileCard title="Personal Information">
            <ProfileInfo label="Email Address" value={wardenData.email} icon={FiMail} />
            <ProfileInfo label="Phone Number" value={wardenData.phone} icon={FiPhone} />
          </ProfileCard>
        </div>

        <div>
          <ProfileCard title="Professional Details">
            <ProfileInfo label="Assigned Hostel" value={wardenData.hostel} icon={FiHome} />
            <ProfileInfo label="Joining Date" value={wardenData.joiningDate} icon={FiCalendar} />
            <ProfileInfo label="Status" value={wardenData.status} icon={FiUser} />
          </ProfileCard>
        </div>
      </div>
    </div>
  )
}

export default WardenProfile
