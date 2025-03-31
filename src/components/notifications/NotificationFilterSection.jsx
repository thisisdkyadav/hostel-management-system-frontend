import React from "react"
import { FaSearch, FaFilter } from "react-icons/fa"

const NotificationFilterSection = ({ filters, setFilters }) => {
  const handleChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input type="text" name="search" value={filters.search} onChange={handleChange} placeholder="Search by title or content..." className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select name="status" value={filters.status} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white">
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Target Type</label>
          <select name="targetType" value={filters.targetType} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white">
            <option value="all">All Target Types</option>
            <option value="all">All Students</option>
            <option value="hostel">By Hostel</option>
            <option value="department">By Department</option>
            <option value="degree">By Degree</option>
            <option value="admission_year">By Admission Year</option>
            <option value="specific">Specific Students</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default NotificationFilterSection
