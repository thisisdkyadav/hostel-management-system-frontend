import React, { useState, useEffect } from "react"
import { FiMail, FiPhone, FiHome, FiBook, FiBookmark, FiUser, FiHash, FiMapPin } from "react-icons/fi"
import ProfileHeader from "./ProfileHeader"
import ProfileCard from "./ProfileCard"
import ProfileInfo from "./ProfileInfo"
import ErrorState from "../common/ErrorState"
import LoadingState from "../common/LoadingState"
import EmptyState from "../common/EmptyState"
import { studentApi } from "../../services/apiService"

const StudentProfile = ({ user }) => {
  const [studentData, setStudentData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStudentData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await studentApi.getStudent()
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

  if (loading) {
    return <LoadingState message="Loading your profile..." description="Please wait while we fetch your information" />
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchStudentData} />
  }

  if (!studentData) {
    return <EmptyState icon={FiUser} title="Profile Not Found" message="We couldn't find your profile information. Please contact the administrator if this issue persists." />
  }

  return (
    <div>
      <ProfileHeader user={studentData} role="Student" subtitle={`${studentData.department} | ${studentData.degree} | ${studentData.year}`} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div>
          <ProfileCard title="Personal Information">
            <ProfileInfo label="Email Address" value={studentData.email} icon={FiMail} />
            <ProfileInfo label="Phone Number" value={studentData.phone} icon={FiPhone} />
            <ProfileInfo label="Roll Number" value={studentData.rollNumber} icon={FiHash} />
            <ProfileInfo label="Permanent Address" value={studentData.address} icon={FiMapPin} />
          </ProfileCard>
          <ProfileCard title="Academic Information">
            <ProfileInfo label="Department" value={studentData.department} icon={FiBook} />
            <ProfileInfo label="Degree" value={studentData.degree} icon={FiBookmark} />
            <ProfileInfo label="Year" value={studentData.year} icon={FiUser} />
          </ProfileCard>
        </div>

        <div>
          <ProfileCard title="Hostel Information">
            <ProfileInfo label="Hostel" value={studentData.hostel} icon={FiHome} />
            <ProfileInfo label="Unit" value={studentData.unit} icon={FiBookmark} />
            <ProfileInfo label="Room Number" value={`${studentData.room}(${studentData.bedNumber})`} icon={FiHome} />
          </ProfileCard>

          <ProfileCard title="Emergency Contact">
            <ProfileInfo label="Guardian Name" value={studentData.guardian} icon={FiUser} />
            <ProfileInfo label="Guardian Phone" value={studentData.guardianPhone} icon={FiPhone} />
            <ProfileInfo label="Guardian Email" value={studentData.guardianEmail} icon={FiMail} />
          </ProfileCard>
        </div>
      </div>
    </div>
  )
}

export default StudentProfile
