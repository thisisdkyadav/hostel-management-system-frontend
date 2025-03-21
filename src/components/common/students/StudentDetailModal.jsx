import React, { useState, useEffect } from "react"
import { FaEnvelope, FaPhone, FaUserGraduate, FaCalendarAlt, FaMapMarkerAlt, FaBuilding } from "react-icons/fa"
import { studentApi } from "../../../services/apiService"

const StudentDetailModal = ({ selectedStudent, setShowStudentDetail }) => {
  const [studentDetails, setStudentDetails] = useState({})
  const [loading, setLoading] = useState(true)

  const fetchStudentDetails = async () => {
    try {
      setLoading(true)
      const response = await studentApi.getStudentDetails(selectedStudent.id)
      console.log("Student Details:", response.data)
      setStudentDetails(response.data)
    } catch (error) {
      console.error("Error fetching student details:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedStudent?.id) {
      fetchStudentDetails()
    }
  }, [selectedStudent?.id])

  if (!selectedStudent) return null

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-[20px] w-[800px] max-h-[90vh] overflow-y-auto shadow-xl">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1360AB]"></div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-[#1360AB]">Student Profile</h2>
              <button onClick={() => setShowStudentDetail(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-white p-6 rounded-xl mb-6 shadow-sm">
              <div className="flex flex-col md:flex-row items-center md:items-start">
                {studentDetails.image ? (
                  <img src={studentDetails.image} alt={studentDetails.name || "Student"} className="h-24 w-24 rounded-full object-cover border-4 border-[#1360AB] shadow-md mb-4 md:mb-0" />
                ) : (
                  <div className="flex items-center justify-center h-24 w-24 rounded-full bg-blue-100 border-4 border-[#1360AB] shadow-md mb-4 md:mb-0">
                    <FaUserGraduate className="h-12 w-12 text-[#1360AB]" />
                  </div>
                )}
                <div className="md:ml-6 flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold text-gray-800">{studentDetails.name || "N/A"}</h3>
                  <p className="text-gray-500 mb-2 font-mono">{studentDetails.rollNumber || "N/A"}</p>

                  <div className="flex flex-col md:flex-row md:items-center">
                    <div className="flex items-center mb-1 md:mb-0 md:mr-4">
                      <FaEnvelope className="text-[#1360AB] mr-2" />
                      <span className="text-gray-700">{studentDetails.email || "N/A"}</span>
                    </div>
                    <div className="flex items-center">
                      <FaPhone className="text-[#1360AB] mr-2" />
                      <span className="text-gray-700">{studentDetails.phone || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3">
                  <FaUserGraduate className="text-[#1360AB] mr-2" />
                  <h4 className="text-sm font-semibold text-[#1360AB]">Academic Information</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Department:</span>
                    <span className="font-medium">{studentDetails.department || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Degree:</span>
                    <span className="font-medium">{studentDetails.degree || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Year:</span>
                    <span className="font-medium">{studentDetails.year || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Admission Date:</span>
                    <span className="font-medium">{formatDate(studentDetails.admissionDate)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3">
                  <FaBuilding className="text-[#1360AB] mr-2" />
                  <h4 className="text-sm font-semibold text-[#1360AB]">Hostel Information</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hostel:</span>
                    <span className="font-medium">{studentDetails.hostel?.name || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hostel Type:</span>
                    <span className="font-medium">{studentDetails.hostel?.type || "N/A"}</span>
                  </div>
                  {studentDetails.hostel?.type === "unit-based" && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Unit Number:</span>
                      <span className="font-medium">{studentDetails.unit?.unitNumber || "N/A"}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Room Number:</span>
                    <span className="font-medium">{studentDetails.room?.roomNumber || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bed Number:</span>
                    <span className="font-medium">{studentDetails.bed || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3">
                  <FaCalendarAlt className="text-[#1360AB] mr-2" />
                  <h4 className="text-sm font-semibold text-[#1360AB]">Personal Information</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gender:</span>
                    <span className="font-medium">{studentDetails.gender || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date of Birth:</span>
                    <span className="font-medium">{formatDate(studentDetails.dateOfBirth)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-600 mb-1">Address:</span>
                    <span className="font-medium">{studentDetails.address || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3">
                  <FaMapMarkerAlt className="text-[#1360AB] mr-2" />
                  <h4 className="text-sm font-semibold text-[#1360AB]">Guardian Information</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guardian Name:</span>
                    <span className="font-medium">{studentDetails.guardian || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guardian Phone:</span>
                    <span className="font-medium">{studentDetails.guardianPhone || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-4">
              <button onClick={() => setShowStudentDetail(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Close
              </button>
              <button className="px-4 py-2 bg-[#1360AB] text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md">Edit Student</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default StudentDetailModal
