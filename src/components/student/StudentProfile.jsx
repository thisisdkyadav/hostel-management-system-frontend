import React from "react"
import { FaUser, FaGraduationCap, FaIdCard } from "react-icons/fa"

const StudentProfile = ({ profile }) => {
  if (!profile) return null

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 flex flex-col md:flex-row items-center">
      <div className="mb-4 md:mb-0 md:mr-6">
        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-[#1360AB] text-2xl">{profile.profileImage ? <img src={profile.profileImage} alt="Profile" className="w-full h-full rounded-full object-cover" /> : <FaUser />}</div>
      </div>

      <div className="flex-1 text-center md:text-left">
        <h2 className="text-xl font-bold text-gray-800">{profile.name}</h2>
        <div className="flex flex-col md:flex-row md:items-center text-sm text-gray-600 mt-1 space-y-1 md:space-y-0 md:space-x-4">
          <span className="flex items-center justify-center md:justify-start">
            <FaIdCard className="mr-1" /> {profile.rollNumber}
          </span>
          <span className="flex items-center justify-center md:justify-start">
            <FaGraduationCap className="mr-1" /> {profile.degree}
          </span>
        </div>
      </div>

      <div className="mt-4 md:mt-0 flex space-x-2">
        <div className="bg-blue-50 px-3 py-1 rounded-full text-xs text-[#1360AB]">{profile.year} Year</div>
        <div className="bg-green-50 px-3 py-1 rounded-full text-xs text-green-600">{profile.hostelName}</div>
      </div>
    </div>
  )
}

export default StudentProfile
