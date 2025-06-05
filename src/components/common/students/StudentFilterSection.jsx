import React from "react"
import { BsFilterRight } from "react-icons/bs"
import { MdClearAll } from "react-icons/md"
import { FaSearch } from "react-icons/fa"
import SimpleDatePicker from "../SimpleDatePicker"

const StudentFilterSection = ({ filters, updateFilter, resetFilters, hostels, degrees, setPageSize }) => {
  return (
    <div className="mt-6 bg-white rounded-xl shadow-sm p-4 sm:p-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 pb-3 border-b border-gray-100">
        <h3 className="font-bold text-gray-700 flex items-center mb-2 sm:mb-0">
          <BsFilterRight className="mr-2 text-[#1360AB] text-lg" /> Filter Students
        </h3>
        <button onClick={resetFilters} className="text-sm text-gray-500 hover:text-[#1360AB] flex items-center px-2 py-1 hover:bg-gray-50 rounded-md transition-colors">
          <MdClearAll className="mr-1" /> Reset Filters
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, roll number, or email..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB]"
              value={filters.searchTerm}
              onChange={(e) => updateFilter("searchTerm", e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-4">
          {hostels.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Hostel</label>
              <select className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] bg-white" value={filters.hostelId} onChange={(e) => updateFilter("hostelId", e.target.value)}>
                <option value="">All Hostels</option>
                {hostels.map((hostel, index) => (
                  <option key={index} value={hostel._id || hostel.id}>
                    {hostel.name || hostel}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Unit</label>
            {/* <select className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] bg-white" value={filters.unitNumber} onChange={(e) => updateFilter("unitNumber", e.target.value)} disabled={!filters.hostelId}>
              <option value="">All Units</option>
              {units
                .filter((unit) => !filters.hostelId || unit.hostelId === filters.hostelId)
                .map((unit, index) => (
                  <option key={index} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
            </select> */}
            <input type="text" placeholder="Unit number" className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB]" value={filters.unitNumber} onChange={(e) => updateFilter("unitNumber", e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Room Number</label>
            <input type="text" placeholder="Room number" className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB]" value={filters.roomNumber} onChange={(e) => updateFilter("roomNumber", e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Department</label>
            {/* <select className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] bg-white" value={filters.department} onChange={(e) => updateFilter("department", e.target.value)}>
              <option value="">All Departments</option>
              {departments.map((dept, index) => (
                <option key={index} value={dept}>
                  {dept}
                </option>
              ))}
            </select> */}
            <input type="text" placeholder="Department" className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB]" value={filters.department} onChange={(e) => updateFilter("department", e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Degree</label>
            <input type="text" placeholder="Degree" className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB]" value={filters.degree} onChange={(e) => updateFilter("degree", e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Gender</label>
            <select className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] bg-white" value={filters.gender} onChange={(e) => updateFilter("gender", e.target.value)}>
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Allocation Status</label>
            <select className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] bg-white" value={filters.hasAllocation} onChange={(e) => updateFilter("hasAllocation", e.target.value)}>
              <option value="">All Students</option>
              <option value="true">Allocated Room</option>
              <option value="false">No Allocation</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Students per page</label>
            <select className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] bg-white" value={filters.studentsPerPage} onChange={(e) => setPageSize(e.target.value)}>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Admission Date From</label>
            <SimpleDatePicker selectedDate={filters.admissionDateFrom} onChange={(date) => updateFilter("admissionDateFrom", date)} placeholder="Select start date" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Admission Date To</label>
            <SimpleDatePicker selectedDate={filters.admissionDateTo} onChange={(date) => updateFilter("admissionDateTo", date)} placeholder="Select end date" minDate={filters.admissionDateFrom} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentFilterSection
