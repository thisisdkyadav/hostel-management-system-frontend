import React from "react"
import { FaEnvelope, FaPhone } from "react-icons/fa"

const StudentDetailModal = ({ selectedStudent, setShowStudentDetail }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-[20px] w-[800px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-bold">Student Details</h2>
          <button onClick={() => setShowStudentDetail(false)} className="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex mb-6">
          <img src={selectedStudent.image} alt={selectedStudent.name} className="h-32 w-32 rounded-full object-cover border-4 border-[#1360AB]" />
          <div className="ml-6">
            <h3 className="text-2xl font-bold text-gray-800">{selectedStudent.name}</h3>
            <p className="text-gray-500 mb-2">{selectedStudent.id}</p>
            <div className="flex items-center mb-1">
              <FaEnvelope className="text-gray-400 mr-2" />
              <span>{selectedStudent.email}</span>
            </div>
            <div className="flex items-center mb-1">
              <FaPhone className="text-gray-400 mr-2" />
              <span>{selectedStudent.phone}</span>
            </div>
            <span
              className={`mt-2 px-3 py-1 inline-flex text-sm font-semibold rounded-full 
                    ${selectedStudent.status === "Active" ? "bg-green-100 text-green-800" : selectedStudent.status === "Inactive" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}
            >
              {selectedStudent.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-500 mb-3">Academic Information</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Department:</span>
                <span className="font-medium">{selectedStudent.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Year:</span>
                <span className="font-medium">{selectedStudent.year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Admission Date:</span>
                <span className="font-medium">{new Date(selectedStudent.admissionDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-500 mb-3">Hostel Information</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Hostel:</span>
                <span className="font-medium">{selectedStudent.hostel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Room Number:</span>
                <span className="font-medium">{selectedStudent.room}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-500 mb-3">Personal Information</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Gender:</span>
                <span className="font-medium">{selectedStudent.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Address:</span>
              </div>
              <div>
                <span className="font-medium">{selectedStudent.address}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-500 mb-3">Guardian Information</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Guardian Name:</span>
                <span className="font-medium">{selectedStudent.guardian}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Guardian Phone:</span>
                <span className="font-medium">{selectedStudent.guardianPhone}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          <button onClick={() => setShowStudentDetail(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            Close
          </button>
          <button className="px-4 py-2 bg-[#1360AB] text-white rounded-lg hover:bg-blue-700">Edit Student</button>
        </div>
      </div>
    </div>
  )
}

export default StudentDetailModal
