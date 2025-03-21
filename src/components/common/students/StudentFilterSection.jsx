import React from "react"
import { BsFilterRight } from "react-icons/bs"
import { MdClearAll } from "react-icons/md"
import { FaSearch } from "react-icons/fa"
import SimpleDatePicker from "../SimpleDatePicker"

const StudentFilterSection = ({ filters, resetFilters, hostels, years, departments, degrees, units }) => {
  console.log(hostels, "Hostels in Filter Section")

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
            <input type="text" placeholder="Search by name, roll number, or email..." className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#1360AB]" value={filters.searchTerm} onChange={(e) => filters.setSearchTerm(e.target.value)} />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Hostel</label>
          <select className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1360AB]" value={filters.selectedHostel} onChange={(e) => filters.setSelectedHostel(e.target.value)}>
            <option value="">All Hostels</option>
            {hostels.map((hostel, index) => (
              <option key={index} value={hostel._id || hostel}>
                {hostel.name || hostel}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Unit/Block</label>
          <input type="text" placeholder="Enter unit number" className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1360AB]" value={filters.selectedUnit} onChange={(e) => filters.setSelectedUnit(e.target.value)} disabled={!filters.selectedHostel} min="1" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Room Number</label>
          <input type="text" placeholder="Room number" className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1360AB]" value={filters.roomNumber} onChange={(e) => filters.setRoomNumber(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Year of Study</label>
          <select className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1360AB]" value={filters.selectedYear} onChange={(e) => filters.setSelectedYear(e.target.value)}>
            <option value="">All Years</option>
            {years.map((year, index) => (
              <option key={index} value={year.value || year}>
                {year.label || year}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Department</label>
          <select className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1360AB]" value={filters.selectedDepartment} onChange={(e) => filters.setSelectedDepartment(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map((dept, index) => (
              <option key={index} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Degree</label>
          <select className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1360AB]" value={filters.selectedDegree} onChange={(e) => filters.setSelectedDegree(e.target.value)}>
            <option value="">All Degrees</option>
            {degrees.map((degree, index) => (
              <option key={index} value={degree}>
                {degree}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Gender</label>
          <select className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1360AB]" value={filters.selectedGender} onChange={(e) => filters.setSelectedGender(e.target.value)}>
            <option value="">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Allocation Status</label>
          <select className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1360AB]" value={filters.hasAllocation} onChange={(e) => filters.setHasAllocation(e.target.value)}>
            <option value="">All Students</option>
            <option value="true">Allocated Room</option>
            <option value="false">No Allocation</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Admission Date From</label>
          <SimpleDatePicker selectedDate={filters.admissionDateFrom} onChange={filters.setAdmissionDateFrom} placeholder="Select start date" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Admission Date To</label>
          <SimpleDatePicker selectedDate={filters.admissionDateTo} onChange={filters.setAdmissionDateTo} placeholder="Select end date" minDate={filters.admissionDateFrom} />
        </div>
      </div>
    </div>
  )
}

export default StudentFilterSection
