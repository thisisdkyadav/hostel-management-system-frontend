import React, { useState, useEffect } from "react"
import { FaFilter, FaCalendarAlt, FaUserCog, FaUsers, FaSearch, FaUserCheck, FaCheck, FaTimes } from "react-icons/fa"
import Modal from "../../common/Modal"
import { securityApi } from "../../../services/apiService"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import Pagination from "../../common/Pagination"

const HostelDetailsModal = ({ hostel, onClose }) => {
  const [activeTab, setActiveTab] = useState("entries")
  const [staffType, setStaffType] = useState("all")
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [presentStaff, setPresentStaff] = useState([])
  const [loading, setLoading] = useState(false)
  const [dateRangeMode, setDateRangeMode] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    fetchAttendanceRecords()
  }, [staffType, startDate, endDate, currentPage])

  const fetchAttendanceRecords = async () => {
    setLoading(true)
    try {
      const filters = {}

      // Add staff type filter if not "all"
      if (staffType !== "all") {
        filters.staffType = staffType
      }

      // Add date filters
      if (startDate) {
        filters.startDate = startDate.toISOString()
      }

      if (endDate) {
        filters.endDate = endDate.toISOString()
      }

      // Add hostel ID filter
      filters.hostelId = hostel.id

      // Add pagination
      filters.page = currentPage
      filters.limit = itemsPerPage

      // Fetch attendance records
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

  const clearFilters = () => {
    setStaffType("all")
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

  const renderAttendanceEntries = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )
    }

    if (attendanceRecords.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No attendance records found.</p>
        </div>
      )
    }

    return (
      <>
        <div className="overflow-x-auto mt-4">
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination currentPage={currentPage} totalPages={totalPages} paginate={paginate} />
          </div>
        )}
      </>
    )
  }

  const renderPresentStaff = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )
    }

    if (presentStaff.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No staff present during the selected time period.</p>
        </div>
      )
    }

    return (
      <div className="overflow-x-auto mt-4">
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
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {presentStaff.map((staff) => (
              <tr key={staff._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${staff.role === "Security" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}`}>{staff.role}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staff.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    <FaCheck className="mr-1" /> Present
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <Modal title={`${hostel.name} - Staff Attendance`} onClose={onClose} width={900}>
      <div className="space-y-6">
        {/* View Type Selector - Hidden for now */}
        {/* <div className="flex justify-center mb-4">
          <div className="inline-flex p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setDateRangeMode(false)}
              className={`px-4 py-2 rounded-md ${!dateRangeMode ? 'bg-white shadow-sm text-[#1360AB]' : 'text-gray-600'}`}
            >
              <FaUserCog className="inline mr-2" /> Attendance Entries
            </button>
            <button
              onClick={() => setDateRangeMode(true)}
              className={`px-4 py-2 rounded-md ${dateRangeMode ? 'bg-white shadow-sm text-[#1360AB]' : 'text-gray-600'}`}
            >
              <FaUserCheck className="inline mr-2" /> Staff Present
            </button>
          </div>
        </div> */}

        {/* Filters */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <FaFilter className="mr-2 text-gray-500" /> Filter Records
          </h3>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Staff Type</label>
              <select value={staffType} onChange={(e) => setStaffType(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="all">All Staff</option>
                <option value="security">Security Guards</option>
                <option value="maintenance">Maintenance Staff</option>
              </select>
            </div>
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

        {/* Content */}
        <div className="bg-white rounded-lg border border-gray-200">{renderAttendanceEntries()}</div>
      </div>
    </Modal>
  )
}

export default HostelDetailsModal
