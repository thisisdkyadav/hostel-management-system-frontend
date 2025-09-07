import React, { useState } from "react"
import { FaUser, FaIdCard, FaEnvelope, FaPhone, FaVenusMars, FaBuilding, FaCalendarAlt, FaClock, FaSignInAlt, FaSignOutAlt, FaTimes, FaExclamationTriangle } from "react-icons/fa"
import { getMediaUrl } from "../../utils/mediaUtils"
const ScannedStudentInfo = ({ student, lastCheckInOut, onReset, onRecordEntry, recordingEntry, getNextStatus }) => {
  const [crossHostelReason, setCrossHostelReason] = useState("")
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-500 mb-6">
        <p className="text-green-700 font-medium">Student verified successfully!</p>
      </div>

      {/* Cross-Hostel Alert */}
      {student.isSameHostel === false && (
        <div className="bg-orange-50 border-2 border-orange-400 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-6 w-6 text-orange-600 mt-0.5" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-semibold text-orange-800 mb-2">Cross-Hostel Entry Alert</h3>
              <p className="text-orange-700 text-sm mb-3">This student belongs to a different hostel. Please provide a reason for allowing entry.</p>
              <div className="space-y-2">
                <label htmlFor="crossHostelReason" className="block text-sm font-medium text-orange-800">
                  Reason for Cross-Hostel Entry <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="crossHostelReason"
                  value={crossHostelReason}
                  onChange={(e) => setCrossHostelReason(e.target.value)}
                  placeholder="Enter reason for allowing this cross-hostel entry..."
                  className="w-full px-3 py-2 border border-orange-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                  rows="3"
                  required
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Profile Image Section */}
        <div className="md:w-1/3">
          <div className="aspect-square w-full max-w-[250px] mx-auto rounded-full overflow-hidden bg-gray-100">
            {student.profileImage ? (
              <img src={getMediaUrl(student.profileImage)} alt={student.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-50">
                <FaUser className="text-[#1360AB] w-1/3 h-1/3" />
              </div>
            )}
          </div>
        </div>

        {/* Student Details Section */}
        <div className="md:w-2/3">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <FaUser className="mr-3 text-[#1360AB]" />
            {student.name}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <FaIdCard className="text-[#1360AB] w-5 mt-1" />
              <div>
                <p className="text-xs text-gray-500">Roll Number</p>
                <p className="text-sm font-medium">{student.rollNumber}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <FaEnvelope className="text-[#1360AB] w-5 mt-1" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium">{student.email}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <FaPhone className="text-[#1360AB] w-5 mt-1" />
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-sm font-medium">{student.phone || "N/A"}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <FaVenusMars className="text-[#1360AB] w-5 mt-1" />
              <div>
                <p className="text-xs text-gray-500">Gender</p>
                <p className="text-sm font-medium capitalize">{student.gender || "N/A"}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <FaBuilding className="text-[#1360AB] w-5 mt-1" />
              <div>
                <p className="text-xs text-gray-500">Hostel & Room</p>
                <p className="text-sm font-medium">
                  {student.hostel}, Room {student.displayRoom}
                </p>
              </div>
            </div>
          </div>

          {/* Last Check In/Out Section */}
          {lastCheckInOut && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-3">Last {lastCheckInOut.status}</h4>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center">
                  <FaCalendarAlt className="text-[#1360AB] mr-2" />
                  <span className="text-sm">{formatDate(lastCheckInOut.dateAndTime)}</span>
                </div>
                <div className="flex items-center">
                  <FaClock className="text-[#1360AB] mr-2" />
                  <span className="text-sm">{formatTime(lastCheckInOut.dateAndTime)}</span>
                </div>
                <div className="flex items-center">
                  {lastCheckInOut.status === "Checked In" ? <FaSignInAlt className="text-green-600 mr-2" /> : <FaSignOutAlt className="text-orange-600 mr-2" />}
                  <span className="text-sm font-medium">{lastCheckInOut.status}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex gap-4">
            <button onClick={onReset} className="flex-1 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center">
              <FaTimes className="mr-2" /> Reset
            </button>

            <button
              onClick={() => onRecordEntry(student.isSameHostel === false ? crossHostelReason.trim() : null)}
              disabled={recordingEntry || (student.isSameHostel === false && !crossHostelReason.trim())}
              className="flex-1 py-2.5 bg-[#1360AB] text-white rounded-lg hover:bg-[#0d4b86] transition-colors flex items-center justify-center disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {getNextStatus() === "Checked In" ? (
                <>
                  <FaSignInAlt className="mr-2" /> Check In
                </>
              ) : (
                <>
                  <FaSignOutAlt className="mr-2" /> Check Out
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScannedStudentInfo
