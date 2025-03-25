import React from "react"
import { FaExclamationCircle, FaEye } from "react-icons/fa"
import { MdPendingActions } from "react-icons/md"
import { Link } from "react-router-dom"
import { getStatusColor, getPriorityColor, getTimeSince } from "../../utils/adminUtils"

const ComplaintsSummary = ({ complaints = [], loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-5 animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
        <div className="space-y-3">
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!complaints || complaints.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-800">Your Complaints</h3>
          <Link to="complaints" className="text-xs text-[#1360AB] hover:underline">
            View All
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center py-6 text-gray-500">
          <FaExclamationCircle className="text-gray-300 text-3xl mb-2" />
          <p className="text-sm">No active complaints</p>
          <Link to="complaints" className="mt-2 text-xs text-[#1360AB] hover:underline">
            Submit a new complaint
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-medium text-gray-800 flex items-center">
          <MdPendingActions className="mr-2 text-[#1360AB]" />
          Your Active Complaints
        </h3>
        <Link to="complaints" className="text-xs text-[#1360AB] hover:underline">
          View All
        </Link>
      </div>
      <div className="max-h-[320px] overflow-y-auto">
        {complaints.map((complaint) => (
          <div key={complaint.id} className="px-5 py-3 border-b border-gray-100 last:border-0 hover:bg-blue-50 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-800 line-clamp-1">{complaint.title}</h4>
                <div className="text-xs text-gray-500 mt-1">
                  {complaint.hostel} · Room {complaint.roomNumber} · {complaint.category}
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(complaint.status)}`}>{complaint.status}</span>
                <span className="text-xs text-gray-500 mt-1">{getTimeSince(complaint.createdDate)}</span>
              </div>
            </div>

            <div className="mt-2 flex justify-between items-center">
              <p className="text-xs text-gray-600 line-clamp-1 max-w-[70%]">{complaint.description}</p>
              <Link to={`complaints`} className="text-[#1360AB] hover:bg-blue-100 p-1.5 rounded-full transition-colors">
                <FaEye className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ComplaintsSummary
