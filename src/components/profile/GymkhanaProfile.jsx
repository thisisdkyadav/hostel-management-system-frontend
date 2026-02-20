import React, { useCallback, useEffect, useState } from "react"
import { FiMail, FiPhone, FiUser, FiShield } from "react-icons/fi"
import ProfileHeader from "./ProfileHeader"
import ProfileCard from "./ProfileCard"
import ProfileInfo from "./ProfileInfo"
import { LoadingState, ErrorState, EmptyState } from "@/components/ui"
import { useAuth } from "../../contexts/AuthProvider"
import { gymkhanaEventsApi } from "../../service/modules/gymkhanaEvents.api"

const GymkhanaProfile = () => {
  const { user } = useAuth()
  const [gymkhanaData, setGymkhanaData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await gymkhanaEventsApi.getMyProfile()
      const profile = response?.data?.profile || user

      if (!profile) {
        setGymkhanaData(null)
        return
      }

      setGymkhanaData({
        name: profile.name,
        email: profile.email,
        phone: profile.phone || "Not provided",
        role: "Gymkhana",
      })
    } catch (err) {
      console.error("Error loading gymkhana profile:", err)
      setError("Failed to load your profile data. Please try again later.")
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  if (loading) {
    return <LoadingState message="Loading your profile..." description="Please wait while we fetch your information" />
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadProfile} />
  }

  if (!gymkhanaData) {
    return <EmptyState icon={FiUser} title="Profile Not Found" message="We couldn't find your profile information. Please contact the administrator if this issue persists." />
  }

  return (
    <div>
      <ProfileHeader user={gymkhanaData} role="Gymkhana" subtitle="Student Affairs Events Team" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "var(--gap-lg)", marginTop: "var(--spacing-8)" }} className="lg:grid-cols-2">
        <div>
          <ProfileCard title="Personal Information">
            <ProfileInfo label="Email Address" value={gymkhanaData.email} icon={FiMail} />
            <ProfileInfo label="Phone Number" value={gymkhanaData.phone} icon={FiPhone} />
            <ProfileInfo label="Role" value={gymkhanaData.role} icon={FiShield} />
          </ProfileCard>
        </div>
      </div>
    </div>
  )
}

export default GymkhanaProfile
