import React, { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthProvider"
import StudentProfile from "../../components/profile/StudentProfile"
import WardenProfile from "../../components/profile/WardenProfile"
import AdminProfile from "../../components/profile/AdminProfile"
import SuperAdminProfile from "../../components/profile/SuperAdminProfile"

const ProfilePage = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")

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
      default:
        return <div>No profile data available</div>
    }
  }

  return (
    <div style={{ flex: 1, padding: 'var(--spacing-6) var(--spacing-8)' }}>
      <div style={{ maxWidth: 'var(--container-xl)', margin: '0 auto' }}>
        <div style={{ marginBottom: 'var(--spacing-6)' }}>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-secondary)' }}>My Profile</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>View and manage your profile information</p>
        </div>

        <div style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <div style={{ padding: 'var(--spacing-6)' }}>{renderProfile()}</div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
