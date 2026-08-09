import React, { useCallback, useEffect, useState } from "react"
import { FiMail, FiPhone, FiUser, FiShield } from "react-icons/fi"
import ProfileHeader from "./ProfileHeader"
import ProfileCard from "./ProfileCard"
import ProfileInfo from "./ProfileInfo"
import { EmptyState, ErrorState, Grid, LoadingState } from "hzero"
import { adminApi } from "@/service"
import { useAuth } from "../../contexts/AuthProvider"

const AdminProfile = () => {
  const { user } = useAuth()

  const [adminData, setAdminData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await adminApi.getMyProfile()
      const profile = response?.data?.profile || user

      if (!profile) {
        setAdminData(null)
        return
      }

      setAdminData({
        name: profile.name,
        email: profile.email,
        phone: profile.phone || "Not provided",
        role: "System Administrator",
      })
    } catch (err) {
      console.error("Error loading admin profile:", err)
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

  if (!adminData) {
    return <EmptyState icon={FiUser} title="Profile Not Found" message="We couldn't find your profile information. Please contact the system administrator if this issue persists." />
  }

  return (
    <div>
      <ProfileHeader user={adminData} role="Administrator" subtitle={`${adminData.role}`} />

      <Grid cols={{ base: 1, lg: 2 }} gap="var(--gap-lg)" style={{ marginTop: "var(--spacing-8)" }}>
        <div>
          <ProfileCard title="Personal Information">
            <ProfileInfo label="Email Address" value={adminData.email} icon={FiMail} />
            <ProfileInfo label="Phone Number" value={adminData.phone} icon={FiPhone} />
            <ProfileInfo label="Role" value={adminData.role} icon={FiShield} />
          </ProfileCard>
        </div>
      </Grid>
    </div>
  )
}

export default AdminProfile
