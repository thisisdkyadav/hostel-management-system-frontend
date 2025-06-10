import React, { useState, useEffect } from "react"
import { FaQrcode, FaHistory } from "react-icons/fa"
import MaintenanceQRGenerator from "../../components/guard/MaintenanceQRGenerator"
import { securityApi } from "../../services/apiService"
import { useAuth } from "../../contexts/AuthProvider"

const MaintenanceAttendance = () => {
  const { user } = useAuth()
  const [attendanceHistory, setAttendanceHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAttendanceHistory = async () => {
      try {
        setLoading(true)
        // Fetch maintenance staff attendance history using the unified API
        const response = await securityApi.getStaffAttendanceRecords({ staffType: "maintenance", userId: user?._id })

        // Process the attendance data to group by date
        const records = response.success ? response.records : []
        const processedData = processAttendanceRecords(records)

        setAttendanceHistory(processedData)
      } catch (error) {
        console.error("Error fetching attendance history:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAttendanceHistory()
  }, [user])

  // Process attendance records to group by date
  const processAttendanceRecords = (records) => {
    const groupedByDate = {}

    records.forEach((record) => {
      const date = new Date(record.createdAt).toLocaleDateString()

      if (!groupedByDate[date]) {
        groupedByDate[date] = {
          date: new Date(record.createdAt),
          checkIn: null,
          checkOut: null,
          status: "Absent",
        }
      }

      if (record.type === "checkIn") {
        groupedByDate[date].checkIn = new Date(record.createdAt)
        groupedByDate[date].status = "Present"
      } else if (record.type === "checkOut") {
        groupedByDate[date].checkOut = new Date(record.createdAt)
      }
    })

    return Object.values(groupedByDate).sort((a, b) => b.date - a.date)
  }

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
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Maintenance Staff Attendance</h1>
          <p className="text-gray-600">Generate your QR code for attendance tracking and view your attendance history.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <MaintenanceQRGenerator />
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="p-2.5 mr-3 rounded-xl bg-blue-100 text-[#1360AB]">
                  <FaHistory size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Attendance History</h2>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="w-12 h-12 border-4 border-[#1360AB] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : attendanceHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Check In
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Check Out
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {attendanceHistory.map((record) => (
                        <tr key={record._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(record.date).split(" ")[0]}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.checkIn ? formatDate(record.checkIn).split(" ")[1] : "N/A"}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.checkOut ? formatDate(record.checkOut).split(" ")[1] : "N/A"}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.status === "Present" ? "bg-green-100 text-green-800" : record.status === "Late" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>{record.status}</span>
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

export default MaintenanceAttendance
