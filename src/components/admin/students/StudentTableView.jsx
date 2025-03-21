import React from "react"
import { FaSortAmountDown, FaSortAmountUp, FaEye, FaUserGraduate } from "react-icons/fa"

const StudentTableView = ({ currentStudents, sortField, sortDirection, handleSort, viewStudentDetails }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gradient-to-r from-blue-50 to-blue-100">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("name")}>
                <div className="flex items-center">
                  <span>Student</span>
                  {sortField === "name" && (sortDirection === "asc" ? <FaSortAmountUp className="ml-2 text-blue-600" /> : <FaSortAmountDown className="ml-2 text-blue-600" />)}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Roll Number</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("hostel")}>
                <div className="flex items-center">
                  <span>Hostel</span>
                  {sortField === "hostel" && (sortDirection === "asc" ? <FaSortAmountUp className="ml-2 text-blue-600" /> : <FaSortAmountDown className="ml-2 text-blue-600" />)}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Room</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentStudents.map((student, index) => (
              <tr key={student.id || index} className={`transition-colors hover:bg-blue-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">{student.image ? <img src={student.image} alt={student.name} className="h-10 w-10 rounded-full" /> : <FaUserGraduate className="h-5 w-5 text-blue-600" />}</div>
                    <div className="ml-4">
                      <div className="font-medium text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{student.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">{student.rollNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-3 py-1 inline-flex text-sm leading-5 font-medium rounded-full bg-blue-100 text-blue-800">{student.hostel}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">{student.displayRoom}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => viewStudentDetails(student)} className="text-blue-600 hover:text-blue-900 transition-colors bg-blue-50 hover:bg-blue-100 p-2 rounded-full">
                    <FaEye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {currentStudents.length === 0 && <div className="text-center py-10 text-gray-500">No students to display</div>}
    </div>
  )
}

export default StudentTableView
