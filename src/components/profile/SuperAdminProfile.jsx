import React, { useEffect, useState } from "react"
import { FiMail, FiPhone, FiShield, FiKey, FiUser, FiClock } from "react-icons/fi"
import ProfileHeader from "./ProfileHeader"
import ProfileCard from "./ProfileCard"
import ProfileInfo from "./ProfileInfo"
import { LoadingState, ErrorState, EmptyState } from "@/components/ui"
import { useAuth } from "../../contexts/AuthProvider"
import { format } from "date-fns"

const SuperAdminProfile = () => {
  const { user } = useAuth()

  const [superAdminData, setSuperAdminData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      if (user) {
        setSuperAdminData({
          name: user.name,
          email: user.email,
          phone: user.phone || "Not provided",
          role: "Super Administrator",
          lastLogin: user.lastLogin || new Date().toISOString(),
          permissions: ["Full System Access", "Admin Management", "API Key Management"],
        })
      }
    } catch (err) {
      console.error("Error loading super admin profile:", err)
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

  if (!superAdminData) {
    return <EmptyState icon={FiUser} title="Profile Not Found" message="We couldn't find your profile information. Please contact support if this issue persists." />
  }

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "PPpp")
    } catch (error) {
      return "Never"
    }
  }

  return (
    <div>
      <ProfileHeader user={superAdminData} role="Super Administrator" subtitle="System Owner" />

      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: "var(--gap-lg)", marginTop: "var(--spacing-8)" }}>
        <div>
          <ProfileCard title="Personal Information">
            <ProfileInfo label="Email Address" value={superAdminData.email} icon={FiMail} />
            <ProfileInfo label="Phone Number" value={superAdminData.phone} icon={FiPhone} />
            <ProfileInfo label="Role" value={superAdminData.role} icon={FiShield} />
            <ProfileInfo label="Last Login" value={formatDate(superAdminData.lastLogin)} icon={FiClock} />
          </ProfileCard>
        </div>

        <div>
          <ProfileCard title="System Access">
            <ProfileInfo label="Permission Level" value="Full System Access" icon={FiShield} />
            <ProfileInfo label="API Key Management" value="Authorized" icon={FiKey} />
            <ProfileInfo label="Admin Management" value="Authorized" icon={FiUser} />
          </ProfileCard>
        </div>
      </div>
    </div>
  )
}

export default SuperAdminProfile
