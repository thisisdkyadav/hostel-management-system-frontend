import React, { useState, useEffect } from "react"
import { FaEnvelope, FaPhone, FaUserGraduate, FaCalendarAlt, FaMapMarkerAlt, FaBuilding } from "react-icons/fa"
import { studentApi } from "../../../services/apiService"
import Modal from "../../common/Modal"
import EditStudentModal from "./EditStudentModal"

const StudentDetailModal = ({ selectedStudent, setShowStudentDetail, onUpdate, isImport = false }) => {
  const [studentDetails, setStudentDetails] = useState({})
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)

  const fetchStudentDetails = async () => {
    try {
      setLoading(true)
      const response = await studentApi.getStudentDetails(selectedStudent.userId)
      console.log("Student Details:", response.data)
      setStudentDetails(response.data)
    } catch (error) {
      console.error("Error fetching student details:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedStudent?.id && !isImport) {
      fetchStudentDetails()
    } else if (isImport) {
      console.log("Selected Student for Import:", selectedStudent)

      setStudentDetails({
        ...selectedStudent,
        image: selectedStudent.profileImage || "",
        rollNumber: selectedStudent.rollNumber || "",
        department: selectedStudent.department || "",
        degree: selectedStudent.degree || "",
        year: selectedStudent.year || "",
        admissionDate: selectedStudent.admissionDate || "",
        hostel: selectedStudent.hostel || "",
        unit: selectedStudent.unit || "",
        room: selectedStudent.room || "",
        bedNumber: selectedStudent.bedNumber || "",
      })
      setLoading(false)
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
    <>
      <Modal title="Student Profile" onClose={() => setShowStudentDetail(false)} width={800}>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative w-16 h-16">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-[#1360AB] rounded-full animate-spin border-t-transparent"></div>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-r from-blue-50 to-white p-5 rounded-xl mb-6 shadow-sm">
              <div className="flex flex-col md:flex-row items-center md:items-start">
                {studentDetails.profileImage ? (
                  <img src={studentDetails.profileImage} alt={studentDetails.name || "Student"} className="h-24 w-24 rounded-full object-cover border-4 border-[#1360AB] shadow-md mb-4 md:mb-0" />
                ) : (
                  <div className="flex items-center justify-center h-24 w-24 rounded-full bg-blue-100 border-4 border-[#1360AB] shadow-md mb-4 md:mb-0">
                    <FaUserGraduate className="h-12 w-12 text-[#1360AB]" />
                  </div>
                )}
                <div className="md:ml-6 flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold text-gray-800">{studentDetails.name || "N/A"}</h3>
                  <p className="text-gray-500 mb-2 font-mono">{studentDetails.rollNumber || "N/A"}</p>

                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                    <div className="flex items-center justify-center md:justify-start">
                      <FaEnvelope className="text-[#1360AB] mr-2 flex-shrink-0" />
                      <span className="text-gray-700 text-sm truncate">{studentDetails.email || "N/A"}</span>
                    </div>
                    <div className="flex items-center justify-center md:justify-start">
                      <FaPhone className="text-[#1360AB] mr-2 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{studentDetails.phone || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-gray-50 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3 pb-2 border-b border-gray-200">
                  <FaUserGraduate className="text-[#1360AB] mr-2 flex-shrink-0" />
                  <h4 className="text-sm font-semibold text-[#1360AB]">Academic Information</h4>
                </div>
                <div className="space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Department:</span>
                    <span className="font-medium text-sm">{studentDetails.department || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Degree:</span>
                    <span className="font-medium text-sm">{studentDetails.degree || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Year:</span>
                    <span className="font-medium text-sm">{studentDetails.year || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Admission Date:</span>
                    <span className="font-medium text-sm">{formatDate(studentDetails.admissionDate)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3 pb-2 border-b border-gray-200">
                  <FaBuilding className="text-[#1360AB] mr-2 flex-shrink-0" />
                  <h4 className="text-sm font-semibold text-[#1360AB]">Hostel Information</h4>
                </div>
                <div className="space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Hostel:</span>
                    <span className="font-medium text-sm">{studentDetails.hostel || "N/A"}</span>
                  </div>
                  {studentDetails.hostelType === "unit-based" && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Unit Number:</span>
                      <span className="font-medium text-sm">{studentDetails.unit || "N/A"}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Room Number:</span>
                    <span className="font-medium text-sm">{studentDetails.room || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Bed Number:</span>
                    <span className="font-medium text-sm">{studentDetails.bedNumber || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3 pb-2 border-b border-gray-200">
                  <FaCalendarAlt className="text-[#1360AB] mr-2 flex-shrink-0" />
                  <h4 className="text-sm font-semibold text-[#1360AB]">Personal Information</h4>
                </div>
                <div className="space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Gender:</span>
                    <span className="font-medium text-sm">{studentDetails.gender || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Date of Birth:</span>
                    <span className="font-medium text-sm">{formatDate(studentDetails.dateOfBirth)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-600 text-sm mb-1">Address:</span>
                    <span className="font-medium text-sm">{studentDetails.address || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3 pb-2 border-b border-gray-200">
                  <FaMapMarkerAlt className="text-[#1360AB] mr-2 flex-shrink-0" />
                  <h4 className="text-sm font-semibold text-[#1360AB]">Guardian Information</h4>
                </div>
                <div className="space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Guardian Name:</span>
                    <span className="font-medium text-sm">{studentDetails.guardian || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Guardian Phone:</span>
                    <span className="font-medium text-sm">{studentDetails.guardianPhone || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Guardian Email:</span>
                    <span className="font-medium text-sm">{studentDetails.guardianEmail || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-4 pt-4 border-t border-gray-100">
              {!isImport && (
                <>
                  <a href={`mailto:${studentDetails.guardianEmail}`} className="px-4 py-2.5 bg-[#1360AB] text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                    Email Guardian
                  </a>
                  <a href={`mailto:${studentDetails.email}`} className="px-4 py-2.5 bg-[#1360AB] text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                    Email Student
                  </a>
                  <button onClick={() => setShowEditModal(true)} className="px-4 py-2.5 bg-[#1360AB] text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                    Edit Student
                  </button>
                </>
              )}
              <button onClick={() => setShowStudentDetail(false)} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Close
              </button>
            </div>
          </>
        )}
      </Modal>

      {showEditModal && (
        <EditStudentModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          studentData={studentDetails}
          onUpdate={() => {
            fetchStudentDetails()
            if (onUpdate) onUpdate()
          }}
        />
      )}
    </>
  )
}

export default StudentDetailModal
