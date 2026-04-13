import React, { useState, useEffect } from "react"
import { FiMail, FiPhone, FiHome, FiBook, FiBookmark, FiUser, FiHash, FiMapPin, FiEdit2, FiCalendar } from "react-icons/fi"
import ProfileHeader from "./ProfileHeader"
import ProfileCard from "./ProfileCard"
import ProfileInfo from "./ProfileInfo"
import { ErrorState, LoadingState, EmptyState } from "@/components/ui"
import { Button } from "czero/react"
import { studentApi, studentProfileApi } from "../../service"
import StudentEditProfileModal from "./StudentEditProfileModal"
import StudentFamilyDetails from "./StudentFamilyDetails"
import { formatDateTime } from "../../utils/dateUtils"

const normalizeStudentProfile = (profile) => {
  if (!profile || typeof profile !== "object") return null

  return {
    userId: profile.userId || profile._id || "",
    id: profile.id || "",
    name: profile.name || "",
    email: profile.email || "",
    phone: profile.phone || "",
    profileImage: profile.profileImage || "",
    rollNumber: profile.rollNumber || "",
    department: profile.department || "",
    degree: profile.degree || "",
    batch: profile.batch || "",
    groups: Array.isArray(profile.groups) ? profile.groups.filter(Boolean) : [],
    year: profile.year || "",
    gender: profile.gender || "",
    dateOfBirth: profile.dateOfBirth || "",
    address: profile.address || "",
    guardian: profile.guardian || "",
    guardianPhone: profile.guardianPhone || "",
    guardianEmail: profile.guardianEmail || "",
    alumniEmailId: profile.alumniEmailId || "",
    hostel: profile.hostel || "",
    unit: profile.unit || "",
    room: profile.room || "",
    bedNumber: profile.bedNumber || "",
    displayRoom: profile.displayRoom || "",
  }
}

const formatOptionalDate = (value) => {
  if (!value) return null
  return formatDateTime(value).date
}

const StudentProfile = ({ user }) => {
  const [studentData, setStudentData] = useState(null)
  const [healthDetails, setHealthDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const currentUserId = user?._id || user?.id

  const fetchStudentData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await studentApi.getStudent()
      setStudentData(normalizeStudentProfile(response))
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
  }, [currentUserId])

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

  const academicSubtitle = [studentData.department, studentData.degree, studentData.batch].filter(Boolean).join(" | ")
  const groupsLabel = Array.isArray(studentData.groups) && studentData.groups.length > 0
    ? studentData.groups.join(", ")
    : ""
  const roomLabel = studentData.displayRoom || [studentData.room, studentData.bedNumber].filter(Boolean).join(" ")
  const dateOfBirthLabel = formatOptionalDate(studentData.dateOfBirth)
  const insuranceProvider = healthDetails?.insurance?.insuranceProvider
  const insurancePeriodLabel = insuranceProvider?.startDate && insuranceProvider?.endDate
    ? `${formatDateTime(insuranceProvider.startDate).date} - ${formatDateTime(insuranceProvider.endDate).date}`
    : null

  return (
    <div>
      <div className="flex justify-between items-start">
        <ProfileHeader user={studentData} role="Student" subtitle={academicSubtitle} />

        <Button onClick={() => setIsEditModalOpen(true)} variant="primary" size="md">
          <FiEdit2 /> Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: "var(--gap-lg)", marginTop: "var(--spacing-8)" }}>
        <div>
          <ProfileCard title="Personal Information">
            <ProfileInfo label="Email Address" value={studentData.email} icon={FiMail} />
            <ProfileInfo label="Alumni Email ID" value={studentData.alumniEmailId} icon={FiMail} />
            <ProfileInfo label="Phone Number" value={studentData.phone} icon={FiPhone} />
            <ProfileInfo label="Roll Number" value={studentData.rollNumber} icon={FiHash} />
            <ProfileInfo label="Permanent Address" value={studentData.address} icon={FiMapPin} />
            <ProfileInfo label="Date of Birth" value={dateOfBirthLabel} icon={FiCalendar} />
            <ProfileInfo label="Gender" value={studentData.gender} icon={FiUser} />
          </ProfileCard>
          <ProfileCard title="Academic Information">
            {studentData.department && <ProfileInfo label="Department" value={studentData.department} icon={FiBook} />}
            <ProfileInfo label="Degree" value={studentData.degree} icon={FiBookmark} />
            {studentData.batch && <ProfileInfo label="Batch" value={studentData.batch} icon={FiBookmark} />}
            {groupsLabel && <ProfileInfo label="Groups" value={groupsLabel} icon={FiUser} />}
            {/* {studentData.degree && <ProfileInfo label="Year" value={studentData.year} icon={FiUser} />} */}
          </ProfileCard>
          <ProfileCard title="Family Members">
            <StudentFamilyDetails userId={studentData.userId || currentUserId} editable={false} />
          </ProfileCard>
        </div>

        <div>
          <ProfileCard title="Hostel Information">
            <ProfileInfo label="Hostel" value={studentData.hostel} icon={FiHome} />
            <ProfileInfo label="Unit" value={studentData.unit} icon={FiBookmark} />
            <ProfileInfo label="Room Number" value={roomLabel} icon={FiHome} />
          </ProfileCard>

          <ProfileCard title="Emergency Contact">
            <ProfileInfo label="Guardian Name" value={studentData.guardian} icon={FiUser} />
            <ProfileInfo label="Guardian Phone" value={studentData.guardianPhone} icon={FiPhone} />
            <ProfileInfo label="Guardian Email" value={studentData.guardianEmail} icon={FiMail} />
          </ProfileCard>

          <ProfileCard title="Health Details">
            <ProfileInfo label="Blood Group" value={healthDetails?.bloodGroup} icon={FiUser} />
            <ProfileInfo label="Insurance Number" value={healthDetails?.insurance?.insuranceNumber} icon={FiUser} />
            <ProfileInfo label="Insurance Provider" value={insuranceProvider?.name} icon={FiUser} />
            {insurancePeriodLabel && <ProfileInfo label="Insurance Period" value={insurancePeriodLabel} icon={FiUser} />}
          </ProfileCard>
        </div>
      </div>

      {isEditModalOpen && <StudentEditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onUpdate={handleProfileUpdate} userId={studentData.userId || currentUserId} currentData={studentData} />}
    </div>
  )
}

export default StudentProfile
