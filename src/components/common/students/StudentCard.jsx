import React from "react"
import { IoMdSchool } from "react-icons/io"
import { FaBuilding, FaEnvelope, FaIdCard, FaEye } from "react-icons/fa"
import { getMediaUrl } from "../../../utils/mediaUtils"
import Card from "../Card"

const StudentCard = ({ student, onClick }) => {
  return (
    <Card className="overflow-hidden" onClick={onClick}>
      <Card.Header className="mb-0">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            {student.profileImage ? (
              <img src={getMediaUrl(student.profileImage)} alt={student.name} className="h-14 w-14 rounded-full object-cover border-2 border-[#1360AB] shadow-sm" />
            ) : (
              <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center border-2 border-[#1360AB]">
                <IoMdSchool className="text-[#1360AB] text-xl" />
              </div>
            )}
            <div className="ml-3">
              <h3 className="font-bold text-gray-800 text-base md:text-lg">{student.name}</h3>
              <p className="text-xs text-gray-500">{student.email}</p>
            </div>
          </div>
        </div>
      </Card.Header>

      <Card.Body className="mt-4 space-y-2.5">
        <div className="flex items-center text-sm">
          <div className="w-6 flex justify-center">
            <FaIdCard className="text-[#1360AB] text-opacity-80" />
          </div>
          <span className="ml-2 text-gray-700 font-medium">{student.rollNumber}</span>
        </div>

        <div className="flex items-center text-sm">
          <div className="w-6 flex justify-center">
            <FaBuilding className="text-[#1360AB] text-opacity-80" />
          </div>
          <div className="ml-2 flex justify-between w-full">
            <span className="px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-blue-50 text-[#1360AB]">{student.hostel || "N/A"}</span>
            <span className="text-gray-600 font-medium">{student.displayRoom || `Room not allocated`}</span>
          </div>
        </div>

        {student.department && (
          <div className="flex items-center text-sm">
            <div className="w-6 flex justify-center">
              <IoMdSchool className="text-[#1360AB] text-opacity-80" />
            </div>
            <div className="ml-2 flex justify-between w-full">
              <span className="text-gray-700">{student.department}</span>
              {student.year && <span className="text-gray-600 text-xs bg-gray-100 px-2 py-0.5 rounded">{student.year}</span>}
            </div>
          </div>
        )}
      </Card.Body>

      <Card.Footer className="mt-4 pt-3 border-t border-gray-100 flex justify-end items-center">
        <button className="text-[#1360AB] hover:bg-blue-50 p-2 rounded-full transition-colors" onClick={(e) => {
            e.stopPropagation()
            onClick()
          }}
          aria-label="View student details"
        >
          <FaEye className="h-4 w-4" />
        </button>
      </Card.Footer>
    </Card>
  )
}

export default StudentCard
