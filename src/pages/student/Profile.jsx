import React, { useState, useEffect } from "react"

import { BsDoorOpenFill } from "react-icons/bs"
import userImg from "../../assets/girlImg.jpeg"
import { fetchStudentProfile } from "../../services/studentService"
import { useAuth } from "../../contexts/AuthProvider"
import RoomChangeForm from "../../components/students/RoomChangeForm"

const Profile = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [student, setStudent] = useState(null)
  const [error, setError] = useState(null)

  const { user } = useAuth()
  const userId = user?._id

  useEffect(() => {
    if (userId) {
      fetchStudentProfile(userId).then((data) => {
        if (data.error) {
          setError(data.message)
        } else {
          setStudent(data)
        }
      })
    }
  }, [userId])

  if (error) {
    return (
      <div className="text-red-500 text-center mt-10">
        <p>Error: {error}</p>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="text-center mt-10">
        <p>Loading profile...</p>
      </div>
    )
  }

  return (
    <>
      <div className="absolute top-[6%] left-[17%] flex items-center justify-between w-[80vw]">
        <div className="flex flex-row gap-2">
          <p className="text-2xl font-bold text-black">Profile</p>
        </div>
      </div>

      <div className="absolute left-[17%] top-[17%] flex flex-row gap-8 w-[75%]">
        <div className="flex flex-col gap-8 bg-white shadow-lg p-6 rounded-xl w-[60%]">
          {/* ...existing profile code... */}
          <div className="flex items-center gap-5">
            <img src={student.profilePic || userImg} className="rounded-full w-32 h-32 object-cover border-2 border-gray-300" alt="Profile" onError={(e) => (e.target.src = userImg)} />
            <div className="text-black flex flex-col gap-2">
              <p className="text-2xl font-bold">Name: {student.userId.name}</p>
              <p className="text-md">Email: {student.userId.email}</p>
              <p className="text-md">Roll No: {student.rollNumber}</p>
              <p className="text-md">Department: {student.department}</p>
              <p className="text-md">Degree: {student.degree}</p>
              <p className="text-md">Admission Year: {student.admissionYear}</p>
              <p className="text-md">Graduation Year: {student.graduationYear}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <p>
                <strong>DOB:</strong> {student.dob}
              </p>
              <p>
                <strong>Gender:</strong> {student.gender}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <p>
                <strong>Address:</strong> {student.address}
              </p>
              <p>
                <strong>Room:</strong> {student.roomNumber}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 bg-white shadow-lg p-6 rounded-xl h-[50%] w-[40%]">
          <div className="flex items-center space-x-2">
            <BsDoorOpenFill className="text-[#1360AB] text-xl" />
            <h3 className="text-gray-600">Your Room</h3>
          </div>

          <div className="flex items-center gap-6 mt-5">
            <div className="bg-[#E4F1FF] shadow-[0px_1px_20px_rgba(0,0,0,0.05)] p-4 rounded-2xl flex flex-wrap justify-end items-start gap-2 w-[142px]">
              <div className="bed bg-green-700 text-white w-9 h-[72px] flex justify-center items-center rounded-md text-sm font-bold">E1</div>
              <div className="table w-[22px] h-[20px] bg-green-700 rounded-md"></div>
              <div className="bed bg-[#1360AB] text-white w-9 h-[72px] flex justify-center items-center rounded-md text-sm font-bold shadow-lg">E2</div>
              <div className="table w-[22px] h-[20px] bg-[#1360AB] rounded-md shadow-lg"></div>
            </div>

            <p className="text-6xl font-medium text-[#1360AB]">
              {student.roomNumber} <span className="text-2xl font-bold">E2</span>
            </p>
          </div>
        </div>
      </div>

      <button className="fixed left-[80%] top-[90%] w-[14%] py-2 bg-[#1360AB] text-white rounded-lg shadow-md hover:bg-[#a79edb] transition" onClick={() => setIsOpen(true)}>
        Apply for Room Change
      </button>

      <RoomChangeForm isOpen={isOpen} setIsOpen={setIsOpen} student={student} />
    </>
  )
}

export default Profile
