import React, { useState, useEffect, useRef } from "react"
import { useStudents } from "../../../hooks/useStudents"
import { FaSearch, FaFilter, FaUserGraduate, FaUniversity, FaCalendarAlt } from "react-icons/fa"

const SelectStudentsForm = ({ targetType, targets, onChange, hostels, departments, degrees }) => {
  if (targetType === "all") return null

  const [selectedStudents, setSelectedStudents] = useState([])

  const { students, loading, filters, updateFilter } = useStudents({
    autoFetch: true,
    perPage: 10,
    initialFilters: {
      search: "",
    },
  })

  useEffect(() => {
    if (targetType === "specific") {
      setSelectedStudents(targets.specific || [])
    }
  }, [targetType, targets.specific])

  const handleStudentSelection = (student) => {
    const isSelected = selectedStudents.some((s) => s.id === student.id)

    let updatedStudents
    if (isSelected) {
      updatedStudents = selectedStudents.filter((s) => s.id !== student.id)
    } else {
      updatedStudents = [...selectedStudents, student]
    }

    setSelectedStudents(updatedStudents)
    onChange("specific", updatedStudents)
  }

  const handleHostelChange = (e) => {
    const { value, checked } = e.target
    let updatedHostels = [...targets.hostelIds]

    if (checked) {
      updatedHostels.push(value)
    } else {
      updatedHostels = updatedHostels.filter((id) => id !== value)
    }

    onChange("hostelIds", updatedHostels)
  }

  const handleDepartmentChange = (e) => {
    const { value, checked } = e.target
    let updatedDepartments = [...targets.departments]

    if (checked) {
      updatedDepartments.push(value)
    } else {
      updatedDepartments = updatedDepartments.filter((dept) => dept !== value)
    }

    onChange("departments", updatedDepartments)
  }

  const handleDegreeChange = (e) => {
    const { value, checked } = e.target
    let updatedDegrees = [...targets.degrees]

    if (checked) {
      updatedDegrees.push(value)
    } else {
      updatedDegrees = updatedDegrees.filter((deg) => deg !== value)
    }

    onChange("degrees", updatedDegrees)
  }

  switch (targetType) {
    case "hostel":
      return (
        <div className="space-y-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">Select Hostels</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {hostels?.map((hostel) => (
              <div key={hostel.id} className="flex items-center">
                <input type="checkbox" id={`hostel-${hostel.id}`} value={hostel.id} checked={targets.hostelIds.includes(hostel.id)} onChange={handleHostelChange} className="h-4 w-4 text-[#1360AB] focus:ring-blue-500 border-gray-300 rounded" />
                <label htmlFor={`hostel-${hostel.id}`} className="ml-2 block text-sm text-gray-700">
                  {hostel.name}
                </label>
              </div>
            ))}
          </div>
        </div>
      )

    case "department":
      return (
        <div className="space-y-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">Select Departments</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {departments?.map((department) => (
              <div key={department} className="flex items-center">
                <input type="checkbox" id={`dept-${department}`} value={department} checked={targets.departments.includes(department)} onChange={handleDepartmentChange} className="h-4 w-4 text-[#1360AB] focus:ring-blue-500 border-gray-300 rounded" />
                <label htmlFor={`dept-${department}`} className="ml-2 block text-sm text-gray-700">
                  {department}
                </label>
              </div>
            ))}
          </div>
        </div>
      )

    case "degree":
      return (
        <div className="space-y-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">Select Degrees</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {degrees?.map((degree) => (
              <div key={degree} className="flex items-center">
                <input type="checkbox" id={`degree-${degree}`} value={degree} checked={targets.degrees.includes(degree)} onChange={handleDegreeChange} className="h-4 w-4 text-[#1360AB] focus:ring-blue-500 border-gray-300 rounded" />
                <label htmlFor={`degree-${degree}`} className="ml-2 block text-sm text-gray-700">
                  {degree}
                </label>
              </div>
            ))}
          </div>
        </div>
      )

    case "admission_year":
      return (
        <div className="space-y-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">Admission Year Range</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 text-sm mb-1">Start Year</label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <FaCalendarAlt />
                </div>
                <input
                  type="number"
                  min="2000"
                  max="2099"
                  step="1"
                  value={targets.admissionYearStart}
                  onChange={(e) => onChange("admissionYearStart", e.target.value)}
                  className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all"
                  placeholder="2020"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-1">End Year</label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <FaCalendarAlt />
                </div>
                <input
                  type="number"
                  min="2000"
                  max="2099"
                  step="1"
                  value={targets.admissionYearEnd}
                  onChange={(e) => onChange("admissionYearEnd", e.target.value)}
                  className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all"
                  placeholder="2023"
                />
              </div>
            </div>
          </div>
        </div>
      )

    case "specific":
      return (
        <div className="space-y-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">Select Specific Students</label>

          <div className="relative">
            <div className="absolute left-3 top-3 text-gray-400">
              <FaSearch />
            </div>
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => updateFilter("searchTerm", e.target.value)}
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all"
              placeholder="Search by name, email, or roll number"
            />
          </div>

          <div className="mt-3 border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="inline-block w-6 h-6 mr-2 border-2 border-gray-200 border-t-[#1360AB] rounded-full animate-spin"></div>
                Loading students...
              </div>
            ) : students.length === 0 ? (
              <div className="p-4 text-center text-gray-500">{filters.searchTerm ? "No students found matching your search" : "Type to search for students"}</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {students.map((student) => {
                  const isSelected = selectedStudents.some((s) => s.id === student.id)
                  return (
                    <li key={student.id} className={`p-3 flex items-center hover:bg-gray-50 cursor-pointer ${isSelected ? "bg-blue-50" : ""}`} onClick={() => handleStudentSelection(student)}>
                      <input type="checkbox" checked={isSelected} onChange={() => {}} className="h-4 w-4 text-[#1360AB] focus:ring-blue-500 border-gray-300 rounded" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{student.name}</p>
                        <p className="text-xs text-gray-500">
                          {student.email} • {student.rollNumber || "No Roll Number"}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <div className="mt-2">
            <p className="text-sm text-gray-600">{selectedStudents.length} student(s) selected</p>
          </div>
        </div>
      )

    default:
      return null
  }
}

export default SelectStudentsForm
