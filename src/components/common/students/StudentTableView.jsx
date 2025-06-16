import React from "react"
import { FaSortAmountDown, FaSortAmountUp, FaEye, FaUserGraduate } from "react-icons/fa"
import BaseTable from "../table/BaseTable"
import { getMediaUrl } from "../../../utils/mediaUtils"
const StudentTableView = ({ currentStudents, sortField, sortDirection, handleSort, viewStudentDetails }) => {
  const columns = [
    {
      header: "Student",
      key: "name",
      customHeaderRender: () => (
        <div className="flex items-center cursor-pointer" onClick={() => handleSort("name")}>
          <span>Student</span>
          {sortField === "name" && <span className="ml-2 text-[#1360AB]">{sortDirection === "asc" ? <FaSortAmountUp className="inline" /> : <FaSortAmountDown className="inline" />}</span>}
        </div>
      ),
      render: (student) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
            {student.profileImage ? <img src={getMediaUrl(student.profileImage)} alt={student.name} className="h-8 w-8 rounded-full object-cover" /> : <FaUserGraduate className="h-4 w-4 text-[#1360AB]" />}
          </div>
          <div className="ml-3">
            <div className="font-medium text-gray-900 text-sm">{student.name}</div>
            <div className="text-xs text-gray-500 truncate max-w-[150px]">{student.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Roll Number",
      key: "rollNumber",
      render: (student) => <span className="text-sm text-gray-700 font-medium">{student.rollNumber}</span>,
    },
    {
      header: "Hostel",
      key: "hostel",
      className: "hidden md:table-cell",
      customHeaderRender: () => (
        <div className="flex items-center cursor-pointer" onClick={() => handleSort("hostel")}>
          <span>Hostel</span>
          {sortField === "hostel" && <span className="ml-2 text-[#1360AB]">{sortDirection === "asc" ? <FaSortAmountUp className="inline" /> : <FaSortAmountDown className="inline" />}</span>}
        </div>
      ),
      render: (student) => <span className="px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-blue-50 text-[#1360AB]">{student.hostel}</span>,
    },
    {
      header: "Room",
      key: "room",
      className: "hidden sm:table-cell",
      render: (student) => <span className="text-sm text-gray-600 font-medium">{student.displayRoom}</span>,
    },
    {
      header: "Actions",
      key: "actions",
      align: "right",
      render: (student) => (
        <button onClick={() => viewStudentDetails(student)} className="text-[#1360AB] hover:text-blue-800 transition-colors p-2 rounded-full hover:bg-blue-50" aria-label="View student details">
          <FaEye className="h-4 w-4" />
        </button>
      ),
    },
  ]

  return <BaseTable columns={columns} data={currentStudents} emptyMessage="No students to display" />
}

export default StudentTableView
