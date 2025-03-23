import React, { useEffect, useState } from "react"
import { FiMail, FiPhone, FiHome, FiCalendar, FiMapPin, FiUser, FiBriefcase, FiAlertCircle } from "react-icons/fi"
import ProfileHeader from "./ProfileHeader"
import ProfileCard from "./ProfileCard"
import ProfileInfo from "./ProfileInfo"
import { useWarden } from "../../contexts/WardenProvider"

const WardenProfile = ({ user, activeTab }) => {
  const { profile, fetchProfile } = useWarden()

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
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-[#1360AB] rounded-full animate-spin mb-4"></div>
        <h3 className="text-lg font-medium text-gray-700">Loading your profile...</h3>
        <p className="text-gray-500 mt-1">Please wait while we fetch your information</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <FiAlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-700">Something went wrong</h3>
        <p className="text-gray-500 mt-1 max-w-md mx-auto">{error}</p>
        <button
          onClick={() => {
            if (fetchProfile && typeof fetchProfile === "function") {
              fetchProfile()
            }
            setLoading(true)
            setError(null)
          }}
          className="mt-4 px-4 py-2 bg-[#1360AB] text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!wardenData) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <FiUser className="h-8 w-8 text-[#1360AB]" />
        </div>
        <h3 className="text-lg font-medium text-gray-700">Profile Not Found</h3>
        <p className="text-gray-500 mt-1 max-w-md mx-auto">We couldn't find your profile information. Please contact the administrator if this issue persists.</p>
      </div>
    )
  }

  if (activeTab === "profile") {
    return (
      <div>
        <ProfileHeader user={wardenData} role="Warden" subtitle={wardenData.hostel || "No hostel assigned"} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
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

  return (
    <div className="text-center py-8 text-gray-500">
      {activeTab === "security" && "Security settings will be displayed here"}
      {activeTab === "notifications" && "Notification preferences will be displayed here"}
    </div>
  )
}

export default WardenProfile
