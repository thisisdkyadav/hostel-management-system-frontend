import React from "react"
import { BsFilterRight } from "react-icons/bs"
import { MdClearAll } from "react-icons/md"
import { FaSearch } from "react-icons/fa"

const StudentFilterSection = ({ searchTerm, setSearchTerm, resetFilters, selectedHostel, setSelectedHostel, selectedYear, setSelectedYear, selectedDepartment, setSelectedDepartment, selectedStatus, setSelectedStatus, selectedGender, setSelectedGender, hostels, years, departments }) => {
  return (
    <div className="mt-6 bg-white rounded-[20px] p-6 shadow-[0px_1px_20px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-700 flex items-center">
          <BsFilterRight className="mr-2 text-[#1360AB]" /> Filter Students
        </h3>
        <button onClick={resetFilters} className="text-sm text-gray-500 hover:text-[#1360AB] flex items-center">
          <MdClearAll className="mr-1" /> Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-3">
          <div className="relative">
            <input type="text" placeholder="Search by name, ID, email or department..." className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#1360AB]" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Hostel</label>
          <select className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1360AB]" value={selectedHostel} onChange={(e) => setSelectedHostel(e.target.value)}>
            <option value="">All Hostels</option>
            {hostels.map((hostel, index) => (
              <option key={index} value={hostel}>
                {hostel}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Year</label>
          <select className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1360AB]" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
            <option value="">All Years</option>
            {years.map((year, index) => (
              <option key={index} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Department</label>
          <select className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1360AB]" value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map((dept, index) => (
              <option key={index} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
          <select className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1360AB]" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Gender</label>
          <select className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1360AB]" value={selectedGender} onChange={(e) => setSelectedGender(e.target.value)}>
            <option value="">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default StudentFilterSection
