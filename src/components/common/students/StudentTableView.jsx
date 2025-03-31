import React from "react"
import { FaSortAmountDown, FaSortAmountUp, FaEye, FaUserGraduate } from "react-icons/fa"

const StudentTableView = ({ currentStudents, sortField, sortDirection, handleSort, viewStudentDetails }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("name")}>
                <div className="flex items-center">
                  <span>Student</span>
                  {sortField === "name" && <span className="ml-2 text-[#1360AB]">{sortDirection === "asc" ? <FaSortAmountUp className="inline" /> : <FaSortAmountDown className="inline" />}</span>}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Roll Number</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hidden md:table-cell" onClick={() => handleSort("hostel")}>
                <div className="flex items-center">
                  <span>Hostel</span>
                  {sortField === "hostel" && <span className="ml-2 text-[#1360AB]">{sortDirection === "asc" ? <FaSortAmountUp className="inline" /> : <FaSortAmountDown className="inline" />}</span>}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden sm:table-cell">Room</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {currentStudents.map((student, index) => (
              <tr key={student.id || index} className={`transition-colors hover:bg-blue-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                      {student.profileImage ? <img src={student.profileImage} alt={student.name} className="h-8 w-8 rounded-full object-cover" /> : <FaUserGraduate className="h-4 w-4 text-[#1360AB]" />}
                    </div>
                    <div className="ml-3">
                      <div className="font-medium text-gray-900 text-sm">{student.name}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[150px]">{student.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 font-medium">{student.rollNumber}</td>
                <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-blue-50 text-[#1360AB]">{student.hostel}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 font-medium hidden sm:table-cell">{student.displayRoom}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-right">
                  <button onClick={() => viewStudentDetails(student)} className="text-[#1360AB] hover:text-blue-800 transition-colors p-2 rounded-full hover:bg-blue-50" aria-label="View student details">
                    <FaEye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {currentStudents.length === 0 && <div className="text-center py-8 text-gray-500">No students to display</div>}
    </div>
  )
}

export default StudentTableView
