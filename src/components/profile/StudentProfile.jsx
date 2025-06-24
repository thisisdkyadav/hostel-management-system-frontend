import React, { useState, useEffect } from "react"
import { FiMail, FiPhone, FiHome, FiBook, FiBookmark, FiUser, FiHash, FiMapPin, FiEdit2, FiCalendar } from "react-icons/fi"
import ProfileHeader from "./ProfileHeader"
import ProfileCard from "./ProfileCard"
import ProfileInfo from "./ProfileInfo"
import ErrorState from "../common/ErrorState"
import LoadingState from "../common/LoadingState"
import EmptyState from "../common/EmptyState"
import { studentApi, studentProfileApi } from "../../services/apiService"
import StudentEditProfileModal from "./StudentEditProfileModal"
import StudentFamilyDetails from "./StudentFamilyDetails"
import { formatDateTime } from "../../utils/dateUtils"

const StudentProfile = ({ user }) => {
  const [studentData, setStudentData] = useState(null)
  const [healthDetails, setHealthDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

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

  const fetchHealthDetails = async () => {
    try {
      const response = await studentProfileApi.getHealthDetails()
      setHealthDetails(response.data)
    } catch (error) {
      console.error("Error fetching health details:", error)
      // setError("Failed to load your health details. Please try again later.")
    } finally {
      // setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudentData()
    fetchHealthDetails()
  }, [user.id])

  const handleProfileUpdate = () => {
    fetchStudentData()
    fetchHealthDetails()
    setIsEditModalOpen(false)
  }

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
      <div className="flex justify-between items-start">
        <ProfileHeader user={studentData} role="Student" subtitle={`${studentData.department} | ${studentData.degree}`} />

        <button onClick={() => setIsEditModalOpen(true)} className="px-4 py-2 bg-[#1360AB] text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center">
          <FiEdit2 className="mr-2" size={16} />
          Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div>
          <ProfileCard title="Personal Information">
            <ProfileInfo label="Email Address" value={studentData.email} icon={FiMail} />
            <ProfileInfo label="Phone Number" value={studentData.phone} icon={FiPhone} />
            <ProfileInfo label="Roll Number" value={studentData.rollNumber} icon={FiHash} />
            <ProfileInfo label="Permanent Address" value={studentData.address} icon={FiMapPin} />
            <ProfileInfo label="Date of Birth" value={formatDateTime(studentData.dateOfBirth).date} icon={FiCalendar} />
            <ProfileInfo label="Gender" value={studentData.gender} icon={FiUser} />
          </ProfileCard>
          <ProfileCard title="Academic Information">
            {studentData.department && <ProfileInfo label="Department" value={studentData.department} icon={FiBook} />}
            <ProfileInfo label="Degree" value={studentData.degree} icon={FiBookmark} />
            {/* {studentData.degree && <ProfileInfo label="Year" value={studentData.year} icon={FiUser} />} */}
          </ProfileCard>
          <ProfileCard title="Family Members">
            <StudentFamilyDetails userId={studentData.userId || user.id} editable={false} />
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

          <ProfileCard title="Health Details">
            <ProfileInfo label="Blood Group" value={healthDetails?.bloodGroup} icon={FiUser} />
            <ProfileInfo label="Insurance Number" value={healthDetails?.insurance?.insuranceNumber} icon={FiUser} />
            <ProfileInfo label="Insurance Provider" value={healthDetails?.insurance?.insuranceProvider?.name} icon={FiUser} />
            {healthDetails?.insurance?.insuranceProvider?.name && <ProfileInfo label="Insurance Period" value={`${formatDateTime(healthDetails?.insurance?.insuranceProvider?.startDate).date} - ${formatDateTime(healthDetails?.insurance?.insuranceProvider?.endDate).date}`} icon={FiUser} />}
          </ProfileCard>
        </div>
      </div>

      {isEditModalOpen && <StudentEditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onUpdate={handleProfileUpdate} userId={studentData.userId || user.id} currentData={studentData} />}
    </div>
  )
}

export default StudentProfile
