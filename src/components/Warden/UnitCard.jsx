import React from "react"
import { FaBuilding, FaDoorOpen, FaUserGraduate } from "react-icons/fa"

const UnitCard = ({ unit, onClick }) => {
  const occupancyPercentage = unit.roomCount ? Math.round(((unit.occupiedRoomCount || 0) / unit.roomCount) * 100) : 0

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-blue-100 text-blue-600">
              <FaBuilding size={24} />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-900">{unit.name}</h3>
              <p className="text-sm text-gray-500">{unit.hostel?.name || "N/A"}</p>
            </div>
          </div>
          <div className="bg-blue-50 text-blue-700 px-2 py-1 text-xs rounded">Floor {unit.floor || "0"}</div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center text-gray-500">
              <FaDoorOpen className="mr-2" />
              <span>Total Rooms</span>
            </div>
            <span className="font-medium">{unit.roomCount || 0}</span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center text-gray-500">
              <FaUserGraduate className="mr-2" />
              <span>Occupied Rooms</span>
            </div>
            <span className="font-medium">{unit.occupiedRoomCount || 0}</span>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-500">Occupancy</span>
              <span className="text-sm font-medium text-gray-700">{occupancyPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className={`h-2 rounded-full ${occupancyPercentage > 80 ? "bg-green-500" : occupancyPercentage > 40 ? "bg-blue-500" : "bg-yellow-500"}`} style={{ width: `${occupancyPercentage}%` }}></div>
            </div>
          </div>
        </div>

        <button className="mt-4 w-full py-2 bg-blue-50 text-[#1360AB] rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">View Rooms</button>
      </div>
    </div>
  )
}

export default UnitCard
