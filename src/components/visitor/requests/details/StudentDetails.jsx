import React from "react"
import { getMediaUrl } from "../../../../utils/mediaUtils"
const StudentDetails = ({ studentName, studentEmail, studentProfileImage }) => {
  return (
    <div className="bg-white rounded-md p-4 border border-gray-200">
      <h3 className="text-sm font-medium text-gray-600 mb-3">Student Information</h3>
      <div className="flex items-center">
        {studentProfileImage ? (
          <img src={getMediaUrl(studentProfileImage)} alt={studentName} className="w-12 h-12 rounded-full object-cover mr-4" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-4">
            <span className="text-gray-500 text-lg font-medium">{studentName ? studentName.charAt(0).toUpperCase() : "?"}</span>
          </div>
        )}
        <div>
          <p className="font-medium text-gray-800">{studentName || "Not provided"}</p>
          <p className="text-sm text-gray-500">{studentEmail || "Email not provided"}</p>
        </div>
      </div>
    </div>
  )
}

export default StudentDetails
