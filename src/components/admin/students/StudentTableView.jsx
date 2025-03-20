import React from "react"
import { FaSortAmountDown, FaSortAmountUp, FaEye } from "react-icons/fa"

const StudentTableView = ({ currentStudents, sortField, sortDirection, handleSort, viewStudentDetails }) => {
  return (
    <div className="mt-4 bg-white rounded-[20px] p-6 shadow-[0px_1px_20px_rgba(0,0,0,0.06)] overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort("name")}>
              <div className="flex items-center">
                Name
                {sortField === "name" && (sortDirection === "asc" ? <FaSortAmountUp className="ml-2" /> : <FaSortAmountDown className="ml-2" />)}
              </div>
            </th>
            <th className="px-6 py-3">ID</th>
            <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort("department")}>
              <div className="flex items-center">
                Department
                {sortField === "department" && (sortDirection === "asc" ? <FaSortAmountUp className="ml-2" /> : <FaSortAmountDown className="ml-2" />)}
              </div>
            </th>
            <th className="px-6 py-3">Year</th>
            <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort("hostel")}>
              <div className="flex items-center">
                Hostel
                {sortField === "hostel" && (sortDirection === "asc" ? <FaSortAmountUp className="ml-2" /> : <FaSortAmountDown className="ml-2" />)}
              </div>
            </th>
            <th className="px-6 py-3">Room</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {currentStudents.map((student) => (
            <tr key={student.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <img src={student.image} alt={student.name} className="h-8 w-8 rounded-full mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">{student.name}</div>
                    <div className="text-xs text-gray-500">{student.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">{student.id}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{student.department}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{student.year}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{student.hostel}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{student.displayRoom || student.room}</td>
              <td className="px-6 py-4">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${student.status === "Active" ? "bg-green-100 text-green-800" : student.status === "Inactive" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}
                >
                  {student.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm">
                <button className="text-[#1360AB] hover:text-blue-800" onClick={() => viewStudentDetails(student)}>
                  <FaEye className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default StudentTableView
