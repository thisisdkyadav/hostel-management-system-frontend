import React, { useState, useEffect } from "react"
import { FaFilter, FaSearch, FaTimes, FaClipboardList } from "react-icons/fa"
import apiService from "../../services/apiService"
import ComplaintItemM from "./ComplaintItemM"
import ComplaintsStatsM from "./ComplaintsStatsM"
import ComplaintDetailModal from "./ComplaintDetailModal"
import PrintComplaints from "./PrintComplaints"
import { maintenanceApi } from "../../services/apiService"
import Pagination from "../common/Pagination"

const ComplaintsM = () => {
  // State for complaints data
  const [complaints, setComplaints] = useState([])
  const [totalComplaints, setTotalComplaints] = useState(0)

  // Loading and error states
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("All")
  const [showFilterMenu, setShowFilterMenu] = useState(false)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Modal states for complaint details
  const [showModal, setShowModal] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState(null)

  // Statistics state - initialize with zeros
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  })

  // Styling objects for categories, statuses, and priorities
  const categoryBg = {
    Electrical: "bg-yellow-100 text-yellow-800",
    Plumbing: "bg-blue-100 text-blue-800",
    Civil: "bg-stone-100 text-stone-800",
    Water: "bg-cyan-100 text-cyan-800",
    Other: "bg-gray-100 text-gray-800",
  }

  const statusColor = {
    Pending: "border-amber-500 text-amber-500",
    "In Progress": "border-blue-500 text-blue-500",
    Resolved: "border-green-500 text-green-500",
  }

  const priorityColor = {
    Low: "bg-green-500",
    Medium: "bg-amber-500",
    High: "bg-red-500",
  }

  // Page change handler
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  // Fetch complaints with server-side filtering and pagination
  const fetchComplaints = async () => {
    try {
      setLoading(true)

      // Prepare query parameters for server-side filtering
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      }

      if (searchTerm) {
        params.search = searchTerm
      }

      if (filterStatus !== "All") {
        params.status = filterStatus
      }

      const queryString = new URLSearchParams(params).toString()
      console.log("Query String:", queryString)

      const complaintsData = await maintenanceApi.getComplaints(queryString)
      setComplaints(complaintsData.data)
      setTotalComplaints(complaintsData.meta.total || complaintsData.data.length)

      // Fetch stats separately
      await fetchStats()

      setError(null)
    } catch (err) {
      console.error("Failed to fetch data:", err)
      setError("Failed to load data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Fetch stats from API
  const fetchStats = async () => {
    try {
      const statsData = await maintenanceApi.getStats()
      setStats(statsData)
    } catch (err) {
      console.error("Error fetching stats:", err)
    }
  }

  // Effect to fetch data when filters or pagination changes
  useEffect(() => {
    fetchComplaints()
  }, [currentPage, searchTerm, filterStatus])

  // Open complaint details modal
  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint)
    setShowModal(true)
  }

  // Change complaint status using API then update local state
  const changeStatus = async (id, newStatus) => {
    try {
      const response = await apiService.maintenance.updateComplaintStatus(id, newStatus)
      const newComplaint = response.data

      // Update local state
      setComplaints((prevComplaints) => prevComplaints.map((complaint) => (complaint.id === id ? { ...complaint, status: newComplaint.status } : complaint)))

      // If the selected complaint is being viewed in modal, update it too
      if (selectedComplaint && selectedComplaint.id === id) {
        setSelectedComplaint({ ...selectedComplaint, status: newComplaint.status })
      }

      // Refresh data after update
      fetchComplaints()
    } catch (err) {
      console.error("Error updating complaint status:", err)
      alert("Failed to update complaint status. Please try again.")
    }
  }

  // Clear search and filter values
  const clearFilters = () => {
    setSearchTerm("")
    setFilterStatus("All")
    setCurrentPage(1)
  }

  // Handle search input with debounce
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Reset to first page when search changes
  }

  return (
    <div className="bg-white shadow-md p-6 rounded-[20px] w-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Complaints Management</h3>
        <div className="flex space-x-2">
          <PrintComplaints complaints={complaints} />
        </div>
      </div>

      {/* Stats Display */}
      <ComplaintsStatsM stats={stats} />

      <h3 className="text-lg font-semibold mb-4">Recent Complaints</h3>

      {/* Search, Filter & Clear Controls */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:space-x-2 no-print">
        <div className="w-full sm:flex-1 relative">
          <input type="text" placeholder="Search complaints..." className="w-full p-2 sm:p-3 pr-10 border rounded-md text-sm" value={searchTerm} onChange={handleSearchChange} />
          <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        <div className="relative w-full sm:w-auto">
          <button className="w-full sm:w-auto bg-[#1360AB] text-white px-3 py-2 sm:px-4 sm:py-3 rounded-md text-sm flex items-center justify-center sm:justify-start space-x-1" onClick={() => setShowFilterMenu(!showFilterMenu)}>
            <FaFilter className="text-sm" />
            <span>Filter: {filterStatus}</span>
          </button>
          {showFilterMenu && (
            <div className="absolute right-0 mt-1 w-full sm:w-40 bg-white border rounded-md shadow-lg z-10">
              <ul>
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setFilterStatus("All")
                    setShowFilterMenu(false)
                    setCurrentPage(1) // Reset to first page when filter changes
                  }}
                >
                  All
                </li>
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setFilterStatus("Pending")
                    setShowFilterMenu(false)
                    setCurrentPage(1)
                  }}
                >
                  Pending
                </li>
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setFilterStatus("In Progress")
                    setShowFilterMenu(false)
                    setCurrentPage(1)
                  }}
                >
                  In Progress
                </li>
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setFilterStatus("Resolved")
                    setShowFilterMenu(false)
                    setCurrentPage(1)
                  }}
                >
                  Resolved
                </li>
              </ul>
            </div>
          )}
        </div>

        {(searchTerm || filterStatus !== "All") && (
          <button className="hidden sm:block text-gray-500 hover:text-gray-700" onClick={clearFilters}>
            <FaTimes className="text-lg" />
          </button>
        )}

        {/* Clear filters button for mobile - full width */}
        {(searchTerm || filterStatus !== "All") && (
          <button className="sm:hidden w-full text-center text-blue-500 py-2 border border-blue-500 rounded-md" onClick={clearFilters}>
            Clear Filters
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4 no-print">{error}</div>}

      {/* Loading Spinner or Complaints List */}
      {loading ? (
        <div className="text-center py-8 no-print">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1360AB]"></div>
          <p className="mt-2 text-gray-500">Loading complaints...</p>
        </div>
      ) : (
        <>
          {complaints.length > 0 ? (
            <div className="mt-4 space-y-4">
              {complaints.map((complaint) => (
                <ComplaintItemM key={complaint.id} complaint={complaint} onViewDetails={handleViewDetails} onChangeStatus={changeStatus} categoryBg={categoryBg} statusColor={statusColor} priorityColor={priorityColor} />
              ))}

              {/* Pagination component */}
              <Pagination currentPage={currentPage} totalPages={Math.ceil(totalComplaints / itemsPerPage)} paginate={paginate} />
            </div>
          ) : (
            <div className="text-center py-10 no-print">
              <FaClipboardList className="mx-auto text-4xl text-gray-300" />
              <p className="mt-2 text-gray-500">No complaints match your filters</p>
              {(searchTerm || filterStatus !== "All") && (
                <button className="mt-2 text-blue-500 hover:underline" onClick={clearFilters}>
                  Clear filters
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Complaint Detail Modal */}
      <ComplaintDetailModal showModal={showModal} selectedComplaint={selectedComplaint} onClose={() => setShowModal(false)} changeStatus={changeStatus} categoryBg={categoryBg} statusColor={statusColor} priorityColor={priorityColor} />
    </div>
  )
}

export default ComplaintsM
