import React, { useState, useEffect } from "react"
import { FaHistory, FaCalendarAlt, FaFilter, FaSearch, FaTimes, FaChartBar, FaTasks } from "react-icons/fa"
import Modal from "../../common/Modal"
import { securityApi } from "../../../services/apiService"
import { adminApi } from "../../../services/adminApi"
import Pagination from "../../common/Pagination"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

const MaintenanceStaffDetailsModal = ({ staff, onClose }) => {
  const [activeTab, setActiveTab] = useState("attendance")
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [workStats, setWorkStats] = useState({ totalWorkDone: 0, todayWorkDone: 0 })
  const [loading, setLoading] = useState(false)
  const [statsLoading, setStatsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    if (activeTab === "attendance") {
      fetchAttendanceRecords()
    } else if (activeTab === "workStats") {
      fetchWorkStats()
    }
  }, [currentPage, startDate, endDate, activeTab])

  const fetchAttendanceRecords = async () => {
    setLoading(true)
    try {
      const filters = {
        staffType: "maintenance",
        userId: staff.userId,
        page: currentPage,
        limit: itemsPerPage,
      }

      // Add date filters
      if (startDate) {
        filters.startDate = startDate.toISOString()
      }

      if (endDate) {
        filters.endDate = endDate.toISOString()
      }

      const response = await securityApi.getStaffAttendanceRecords(filters)

      if (response.success) {
        setAttendanceRecords(response.records || [])
        setTotalPages(Math.ceil(response.totalCount / itemsPerPage) || 1)
      }
    } catch (error) {
      console.error("Error fetching attendance records:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchWorkStats = async () => {
    setStatsLoading(true)
    try {
      const response = await adminApi.getMaintenanceStaffStats(staff.userId)
      if (response.success) {
        setWorkStats({
          totalWorkDone: response.data.totalWorkDone || 0,
          todayWorkDone: response.data.todayWorkDone || 0,
        })
      }
    } catch (error) {
      console.error("Error fetching work stats:", error)
      setWorkStats({ totalWorkDone: 0, todayWorkDone: 0 })
    } finally {
      setStatsLoading(false)
    }
  }

  const clearFilters = () => {
    setStartDate(null)
    setEndDate(null)
    setCurrentPage(1)
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  return (
    <Modal title={`${staff.name} - Details`} onClose={onClose} width={900}>
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button onClick={() => setActiveTab("attendance")} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "attendance" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
              <FaHistory className="mr-2 inline" />
              Attendance History
            </button>
            <button onClick={() => setActiveTab("workStats")} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "workStats" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
              <FaChartBar className="mr-2 inline" />
              Work Statistics
            </button>
          </nav>
        </div>

        {activeTab === "attendance" && (
          <>
            {/* Filters */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <FaFilter className="mr-2 text-gray-500" /> Filter Records
              </h3>
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} showTimeSelect dateFormat="MMMM d, yyyy h:mm aa" className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholderText="Select start date & time" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    showTimeSelect
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholderText="Select end date & time"
                    minDate={startDate}
                  />
                </div>
                <div>
                  <button onClick={clearFilters} className="p-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
                    <FaTimes className="mr-1 inline" /> Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Attendance Content */}
            <div className="bg-white rounded-lg border border-gray-200">
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
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hostel
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {attendanceRecords.map((record) => (
                        <tr key={record._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(record.createdAt).split(" ")[0]}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(record.createdAt).split(" ")[1]}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.type === "checkIn" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{record.type === "checkIn" ? "Check In" : "Check Out"}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.hostelId?.name || "N/A"}</td>
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

            {/* Pagination */}
            {attendanceRecords.length > 0 && (
              <div className="mt-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} paginate={paginate} />
              </div>
            )}
          </>
        )}

        {activeTab === "workStats" && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {statsLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-12 h-12 border-4 border-[#1360AB] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Total Work Done */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-blue-800 mb-2">Total Work Done</h3>
                      <p className="text-3xl font-bold text-blue-600">{workStats.totalWorkDone}</p>
                      <p className="text-sm text-blue-600 mt-1">Complaints Resolved</p>
                    </div>
                    <div className="p-3 bg-blue-200 rounded-full">
                      <FaTasks className="text-2xl text-blue-600" />
                    </div>
                  </div>
                </div>

                {/* Today's Work Done */}
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-green-800 mb-2">Today's Work</h3>
                      <p className="text-3xl font-bold text-green-600">{workStats.todayWorkDone}</p>
                      <p className="text-sm text-green-600 mt-1">Complaints Resolved Today</p>
                    </div>
                    <div className="p-3 bg-green-200 rounded-full">
                      <FaCalendarAlt className="text-2xl text-green-600" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}

export default MaintenanceStaffDetailsModal
