import React from "react"
import { FaBuilding, FaDoorOpen, FaUserGraduate } from "react-icons/fa"
import UnitCard from "./UnitCard"

const UnitListView = ({ units, viewMode, onUnitClick }) => {
  if (viewMode === "table") {
    return (
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hostel</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Floor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Rooms</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Occupancy</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {units.map((unit) => (
              <tr key={unit.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 flex items-center justify-center rounded-full">
                      <FaBuilding className="text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{unit.unitNumber}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{unit.hostel || "N/A"}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Floor {unit.floor || "0"}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <FaDoorOpen className="mr-1 text-gray-400" />
                    {unit.roomCount || 0}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FaUserGraduate className="mr-1 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {unit.occupancy || 0}/{unit.capacity || 0} students
                    </span>
                    <div className="ml-2 w-16 bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{
                          width: `${unit.capacity ? Math.round(((unit.occupancy || 0) / unit.capacity) * 100) : 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => onUnitClick(unit)} className="text-[#1360AB] hover:text-blue-900 bg-blue-50 px-3 py-1 rounded-md">
                    View Rooms
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {units.map((unit) => (
        <UnitCard key={unit.id} unit={unit} onClick={() => onUnitClick(unit)} />
      ))}
    </div>
  )
}

export default UnitListView
