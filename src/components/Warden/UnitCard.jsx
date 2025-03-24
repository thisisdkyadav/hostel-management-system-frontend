import React from "react"
import { FaBuilding, FaDoorOpen, FaUserGraduate } from "react-icons/fa"

const UnitCard = ({ unit, onClick }) => {
  const occupancyPercentage = unit.roomCount ? Math.round(((unit.occupiedRoomCount || 0) / unit.roomCount) * 100) : 0
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 cursor-pointer" onClick={onClick}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <div className="p-2.5 rounded-xl bg-blue-100 text-[#1360AB] mr-3">
            <FaBuilding size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-base md:text-lg">{unit.name || unit.unitNumber}</h3>
            <span className="text-xs text-gray-500">{unit.hostel?.name || unit.hostel || "N/A"}</span>
          </div>
        </div>
        <span className="bg-blue-50 text-[#1360AB] px-2.5 py-1 text-xs rounded-full">Floor {unit.floor || unit.floorNumber || "0"}</span>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-600">
            <FaDoorOpen className="mr-2 text-[#1360AB] text-opacity-70" />
            <span className="text-sm">Total Rooms</span>
          </div>
          <span className="font-medium text-sm">{unit.roomCount || 0}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-600">
            <FaUserGraduate className="mr-2 text-[#1360AB] text-opacity-70" />
            <span className="text-sm">Occupancy</span>
          </div>
          <span className="font-medium text-sm">
            {unit.occupancy || 0}/{unit.capacity || 0}
          </span>
        </div>

        <div className="pt-2">
          <div className="flex justify-between mb-1.5">
            <span className="text-xs text-gray-500">Occupancy Rate</span>
            <span className="text-xs font-medium text-gray-700">{unit.capacity ? Math.round(((unit.occupancy || 0) / unit.capacity) * 100) : 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full ${unit.capacity && unit.occupancy >= unit.capacity ? "bg-green-500" : "bg-[#1360AB]"}`}
              style={{
                width: `${unit.capacity ? Math.min(100, Math.round(((unit.occupancy || 0) / unit.capacity) * 100)) : 0}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      <button className="mt-5 w-full py-2.5 bg-[#E4F1FF] text-[#1360AB] rounded-lg hover:bg-[#1360AB] hover:text-white transition-all duration-300 text-sm font-medium">View Rooms</button>
    </div>
  )
}

export default UnitCard
