import React from "react"
import { MdFilterAlt, MdClearAll } from "react-icons/md"

const RoomChangeRequestFilterSection = ({ filters, setFilters, resetFilters }) => {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 pb-3 border-b border-gray-100">
        <h3 className="font-bold text-gray-700 flex items-center mb-2 sm:mb-0">
          <MdFilterAlt className="mr-2 text-[#1360AB]" /> Filter Requests
        </h3>
        <button onClick={resetFilters} className="text-sm text-gray-500 hover:text-[#1360AB] flex items-center px-2 py-1 hover:bg-gray-50 rounded-md transition-colors">
          <MdClearAll className="mr-1" /> Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">Status</label>
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] bg-white">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">Priority</label>
          <select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })} className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] bg-white">
            <option value="">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">Date Range</label>
          <input type="date" value={filters.dateFrom || ""} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })} className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB]" placeholder="From date" />
        </div>
      </div>
    </div>
  )
}

export default RoomChangeRequestFilterSection
