import React from "react"
import { FaExclamationCircle, FaEye } from "react-icons/fa"
import { MdPendingActions } from "react-icons/md"
import { Link } from "react-router-dom"
import { getStatusColor, getPriorityColor, getTimeSince } from "../../utils/adminUtils"

const ComplaintsSummary = ({ complaints = [], loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-3 animate-pulse">
        <div className="h-5 bg-gray-200 rounded mb-3 w-1/3"></div>
        <div className="space-y-2">
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!complaints || complaints.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-800 text-sm">Your Complaints</h3>
          <Link to="complaints" className="text-xs text-[#1360AB] hover:underline">
            View All
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center py-4 text-gray-500">
          <FaExclamationCircle className="text-gray-300 text-2xl mb-1" />
          <p className="text-xs">No active complaints</p>
          <Link to="complaints" className="mt-1 text-xs text-[#1360AB] hover:underline">
            Submit a new complaint
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-medium text-gray-800 text-sm flex items-center">
          <MdPendingActions className="mr-1.5 text-[#1360AB]" />
          Your Active Complaints
        </h3>
        <Link to="complaints" className="text-xs text-[#1360AB] hover:underline">
          View All
        </Link>
      </div>
      <div className="max-h-[250px] overflow-y-auto">
        {complaints.map((complaint) => (
          <div key={complaint.id} className="px-4 py-2 border-b border-gray-100 last:border-0 hover:bg-blue-50 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-800 text-sm line-clamp-1">{complaint.title}</h4>
                <div className="text-xs text-gray-500 mt-0.5">
                  {complaint.hostel} · Room {complaint.roomNumber} · {complaint.category}
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className={`px-1.5 py-0.5 text-[10px] rounded-full ${getStatusColor(complaint.status)}`}>{complaint.status}</span>
                <span className="text-[10px] text-gray-500 mt-0.5">{getTimeSince(complaint.createdDate)}</span>
              </div>
            </div>

            <div className="mt-1 flex justify-between items-center">
              <p className="text-[11px] text-gray-600 line-clamp-1 max-w-[70%]">{complaint.description}</p>
              <Link to={`complaints`} className="text-[#1360AB] hover:bg-blue-100 p-1 rounded-full transition-colors">
                <FaEye className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ComplaintsSummary
