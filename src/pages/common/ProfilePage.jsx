import React from "react"
import { useAuth } from "../../contexts/AuthProvider"
import StudentProfile from "../../components/profile/StudentProfile"
import WardenProfile from "../../components/profile/WardenProfile"
import AdminProfile from "../../components/profile/AdminProfile"
import SuperAdminProfile from "../../components/profile/SuperAdminProfile"
import GymkhanaProfile from "../../components/profile/GymkhanaProfile"
import AcademicsProfile from "../../components/profile/AcademicsProfile"
import SignatureSettingsCard from "../../components/profile/SignatureSettingsCard"
import { Heading, Surface, Text } from "hzero"

const ProfilePage = () => {
  const { user } = useAuth()
  const activeTab = "profile"

  // Render appropriate profile based on user role
  const renderProfile = () => {
    switch (user?.role) {
      case "Student":
        return <StudentProfile user={user} activeTab={activeTab} />
      case "Warden":
        return <WardenProfile user={user} activeTab={activeTab} />
      case "Associate Warden":
        return <WardenProfile user={user} activeTab={activeTab} />
      case "Hostel Supervisor":
        return <WardenProfile user={user} activeTab={activeTab} />
      case "Admin":
        return <AdminProfile user={user} activeTab={activeTab} />
      case "Super Admin":
        return <SuperAdminProfile user={user} activeTab={activeTab} />
      case "Gymkhana":
        return <GymkhanaProfile user={user} activeTab={activeTab} />
      case "Academics":
        return <AcademicsProfile user={user} activeTab={activeTab} />
      default:
        return <div>No profile data available</div>
    }
  }

  return (
    <div style={{ flex: 1, padding: 'var(--spacing-6) var(--spacing-8)' }}>
      <div style={{ maxWidth: 'var(--container-xl)', margin: '0 auto' }}>
        <div style={{ marginBottom: 'var(--spacing-6)' }}>
          <Heading as="h1" size="2xl" weight="bold" color="secondary">My Profile</Heading>
          <Text color="muted">View and manage your profile information</Text>
        </div>

        <div style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <Surface padding={6}>{renderProfile()}</Surface>
        </div>

        {user ? <SignatureSettingsCard user={user} /> : null}
      </div>
    </div>
  )
}

export default ProfilePage
