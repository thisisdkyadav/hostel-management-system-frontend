import React, { useState, useEffect } from "react"
import { FaQrcode, FaHistory } from "react-icons/fa"
import AttendanceQRScanner from "../../components/guard/AttendanceQRScanner"
import { securityApi } from "../../services/apiService"

const HostelGateAttendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true)
      // Fetch staff attendance records
      const response = await securityApi.getStaffAttendanceRecords()
      setAttendanceRecords(response.success ? response.records : [])
    } catch (error) {
      console.error("Error fetching attendance records:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAttendanceRecords()
  }, [])

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Staff Attendance Scanner</h1>
          <p className="text-gray-600">Scan QR codes to record attendance for security guards and maintenance staff.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <AttendanceQRScanner onRefresh={fetchAttendanceRecords} />
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="p-2.5 mr-3 rounded-xl bg-blue-100 text-[#1360AB]">
                  <FaHistory size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Recent Staff Attendance Records</h2>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="w-12 h-12 border-4 border-[#1360AB] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : attendanceRecords.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {attendanceRecords.map((record) => (
                        <tr key={record._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{record.userId.name}</div>
                            <div className="text-sm text-gray-500">{record.userId.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.userId.role === "Security" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}`}>{record.userId.role}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(record.createdAt)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.type === "checkIn" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{record.type === "checkIn" ? "Check In" : "Check Out"}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No attendance records found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HostelGateAttendance
