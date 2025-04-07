import React from "react"
import { FaSearch, FaTimes } from "react-icons/fa"

const NotificationFilterSection = ({ filters, updateFilter, resetFilters }) => {
  const handleChange = (e) => {
    const { name, value } = e.target
    updateFilter(name, value)
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-gray-700">Filter Notifications</h3>
        <button onClick={resetFilters} className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
          <FaTimes className="mr-1" /> Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input type="text" name="searchTerm" value={filters.searchTerm} onChange={handleChange} placeholder="Search by title or content..." className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hostel</label>
          <select name="hostelId" value={filters.hostelId} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white">
            <option value="all">All Hostels</option>
            <option value="hostel1">Hostel 1</option>
            <option value="hostel2">Hostel 2</option>
            {/* Add more hostels as needed */}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
          <select name="department" value={filters.department} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white">
            <option value="all">All Departments</option>
            <option value="CSE">Computer Science</option>
            <option value="ECE">Electronics</option>
            <option value="ME">Mechanical</option>
            {/* Add more departments as needed */}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Degree</label>
          <select name="degree" value={filters.degree} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white">
            <option value="all">All Degrees</option>
            <option value="BTech">BTech</option>
            <option value="MTech">MTech</option>
            <option value="PhD">PhD</option>
            {/* Add more degrees as needed */}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
          <select name="gender" value={filters.gender} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white">
            <option value="all">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default NotificationFilterSection
