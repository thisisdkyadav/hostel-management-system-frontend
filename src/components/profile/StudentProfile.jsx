import React, { useState, useEffect } from "react"
import { FiMail, FiPhone, FiHome, FiBook, FiBookmark, FiUser, FiHash, FiMapPin, FiAlertCircle } from "react-icons/fi"
import ProfileHeader from "./ProfileHeader"
import ProfileCard from "./ProfileCard"
import ProfileInfo from "./ProfileInfo"
import { studentApi } from "../../services/apiService"

const StudentProfile = ({ user, activeTab }) => {
  const [studentData, setStudentData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStudentData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await studentApi.getStudent()
      console.log("Student data:", response)
      setStudentData(response.data)
    } catch (error) {
      console.error("Error fetching student data:", error)
      setError("Failed to load your profile data. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudentData()
  }, [user.id])

  // Handle loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-[#1360AB] rounded-full animate-spin mb-4"></div>
        <h3 className="text-lg font-medium text-gray-700">Loading your profile...</h3>
        <p className="text-gray-500 mt-1">Please wait while we fetch your information</p>
      </div>
    )
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <FiAlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-700">Something went wrong</h3>
        <p className="text-gray-500 mt-1 max-w-md mx-auto">{error}</p>
        <button onClick={fetchStudentData} className="mt-4 px-4 py-2 bg-[#1360AB] text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          Try Again
        </button>
      </div>
    )
  }

  // Handle case where data is loaded but empty
  if (!studentData) {
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
        <ProfileHeader user={studentData} role="Student" subtitle={`${studentData.department || "Department"} | ${studentData.degree || "Degree"} | ${studentData.year || "Year"}`} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div>
            <ProfileCard title="Personal Information">
              <ProfileInfo label="Email Address" value={studentData.email} icon={FiMail} />
              <ProfileInfo label="Phone Number" value={studentData.phone} icon={FiPhone} />
              <ProfileInfo label="Roll Number" value={studentData.rollNumber} icon={FiHash} />
              <ProfileInfo label="Permanent Address" value={studentData.address} icon={FiMapPin} />
            </ProfileCard>
          </div>

          <div>
            <ProfileCard title="Hostel Information">
              <ProfileInfo label="Hostel" value={studentData.hostel} icon={FiHome} />
              <ProfileInfo label="Unit" value={studentData.unit} icon={FiBookmark} />
              <ProfileInfo label="Room Number" value={`${studentData.room}(${studentData.bedNumber})`} icon={FiHome} />
            </ProfileCard>

            <ProfileCard title="Academic Information">
              <ProfileInfo label="Department" value={studentData.department} icon={FiBook} />
              <ProfileInfo label="Degree" value={studentData.degree} icon={FiBookmark} />
              <ProfileInfo label="Year" value={studentData.year} icon={FiUser} />
            </ProfileCard>

            <ProfileCard title="Emergency Contact">
              <ProfileInfo label="Guardian Name" value={studentData.guardian} icon={FiUser} />
              <ProfileInfo label="Guardian Phone" value={studentData.guardianPhone} icon={FiPhone} />
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

export default StudentProfile
