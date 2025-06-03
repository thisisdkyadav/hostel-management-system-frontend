import React, { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthProvider"
import StudentProfile from "../components/profile/StudentProfile"
import WardenProfile from "../components/profile/WardenProfile"
import AdminProfile from "../components/profile/AdminProfile"
import SuperAdminProfile from "../components/profile/SuperAdminProfile"

const Profile = () => {
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
    <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
          <p className="text-gray-500">View and manage your profile information</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 md:p-6">{renderProfile()}</div>
        </div>
      </div>
    </div>
  )
}

export default Profile
