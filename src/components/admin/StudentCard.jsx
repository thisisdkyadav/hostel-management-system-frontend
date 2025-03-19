import React from "react"
import { IoMdSchool } from "react-icons/io"
import { FaBuilding, FaSearch, FaEye } from "react-icons/fa"

const StudentCard = ({ student, onClick }) => {
  return (
    <div key={student.id} className="bg-white rounded-[20px] p-5 shadow-[0px_1px_20px_rgba(0,0,0,0.06)] hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <img src={student.image} alt={student.name} className="h-16 w-16 rounded-full object-cover border-2 border-[#1360AB]" />
          <div className="ml-4">
            <h3 className="font-bold text-gray-800">{student.name}</h3>
            <p className="text-sm text-gray-500">{student.id}</p>
          </div>
        </div>
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full 
                                      ${student.status === "Active" ? "bg-green-100 text-green-800" : student.status === "Inactive" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}
        >
          {student.status}
        </span>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center text-sm">
            <IoMdSchool className="text-gray-500 mr-2" />
            <span>{student.department}</span>
          </div>
          <span className="text-sm text-gray-600">{student.year}</span>
        </div>

        <div className="flex items-center text-sm">
          <FaBuilding className="text-gray-500 mr-2" />
          <span>
            {student.hostel}, Room {student.room}
          </span>
        </div>

        <div className="flex items-center text-sm">
          <FaSearch className="text-gray-500 mr-2" />
          <span>{student.phone}</span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
        <span className="text-xs text-gray-500">Admitted: {new Date(student.admissionDate).toLocaleDateString()}</span>
        <button className="text-[#1360AB] hover:bg-blue-50 p-2 rounded-full" onClick={onClick}>
          <FaEye className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

export default StudentCard
