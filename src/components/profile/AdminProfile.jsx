import React, { useEffect, useState } from "react"
import { FiMail, FiPhone, FiCalendar, FiMapPin, FiUser, FiShield, FiLock } from "react-icons/fi"
import ProfileHeader from "./ProfileHeader"
import ProfileCard from "./ProfileCard"
import ProfileInfo from "./ProfileInfo"
import { LoadingState, ErrorState, EmptyState } from "@/components/ui"
import { useAuth } from "../../contexts/AuthProvider"

const AdminProfile = () => {
  const { user } = useAuth()

  const [adminData, setAdminData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      if (user) {
        setAdminData({
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: "System Administrator",
        })
      }
    } catch (err) {
      console.error("Error loading admin profile:", err)
      setError("Failed to load your profile data. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [user])

  if (loading) {
    return <LoadingState message="Loading your profile..." description="Please wait while we fetch your information" />
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadProfile} />
  }

  if (!adminData) {
    return <EmptyState icon={FiUser} title="Profile Not Found" message="We couldn't find your profile information. Please contact the system administrator if this issue persists." />
  }

  return (
    <div>
      <ProfileHeader user={adminData} role="Administrator" subtitle={`${adminData.role}`} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "var(--gap-lg)", marginTop: "var(--spacing-8)", }} className="lg:grid-cols-2" >
        <div>
          <ProfileCard title="Personal Information">
            <ProfileInfo label="Email Address" value={adminData.email} icon={FiMail} />
            <ProfileInfo label="Phone Number" value={adminData.phone} icon={FiPhone} />
            <ProfileInfo label="Role" value={adminData.role} icon={FiShield} />
          </ProfileCard>
        </div>
      </div>
    </div>
  )
}

export default AdminProfile
