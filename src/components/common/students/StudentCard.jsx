import React from "react"
import { IoMdSchool } from "react-icons/io"
import { FaBuilding, FaSearch, FaEye } from "react-icons/fa"

const StudentCard = ({ student, onClick }) => {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden" onClick={onClick}>
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          {student.image ? (
            <img src={student.image} alt={student.name} className="h-14 w-14 rounded-full object-cover border-2 border-[#1360AB] shadow-sm" />
          ) : (
            <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center border-2 border-[#1360AB]">
              <IoMdSchool className="text-[#1360AB] text-xl" />
            </div>
          )}
          <div className="ml-3">
            <h3 className="font-bold text-gray-800 text-base md:text-lg">{student.name}</h3>
            <p className="text-xs text-gray-500">{student.id}</p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${student.status === "Active" ? "bg-green-100 text-green-800" : student.status === "Inactive" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>{student.status}</span>
      </div>

      <div className="mt-4 space-y-2.5">
        <div className="flex items-center text-sm">
          <div className="w-6 flex justify-center">
            <IoMdSchool className="text-[#1360AB] text-opacity-80" />
          </div>
          <div className="ml-2 flex justify-between w-full">
            <span className="text-gray-700">{student.department}</span>
            <span className="text-gray-600 text-xs bg-gray-100 px-2 py-0.5 rounded">{student.year}</span>
          </div>
        </div>

        <div className="flex items-center text-sm">
          <div className="w-6 flex justify-center">
            <FaBuilding className="text-[#1360AB] text-opacity-80" />
          </div>
          <span className="ml-2 text-gray-700 truncate">
            {student.hostel}, Room {student.room}
          </span>
        </div>

        <div className="flex items-center text-sm">
          <div className="w-6 flex justify-center">
            <FaSearch className="text-[#1360AB] text-opacity-80" />
          </div>
          <span className="ml-2 text-gray-700">{student.phone || "No phone"}</span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
        <span className="text-xs text-gray-500">Admitted: {new Date(student.admissionDate).toLocaleDateString()}</span>
        <button
          className="text-[#1360AB] hover:bg-blue-50 p-2 rounded-full transition-colors"
          onClick={(e) => {
            e.stopPropagation()
            onClick()
          }}
          aria-label="View student details"
        >
          <FaEye className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default StudentCard
