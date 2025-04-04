import React from "react"
import { FaBuilding, FaDoorOpen } from "react-icons/fa"
import UnitCard from "./UnitCard"
import BaseTable from "../common/table/BaseTable"

const UnitListView = ({ units, viewMode, onUnitClick }) => {
  const columns = [
    {
      header: "Unit Number",
      key: "unitNumber",
      render: (unit) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 flex items-center justify-center rounded-full">
            <FaBuilding className="text-[#1360AB]" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{unit.unitNumber || unit.name}</div>
            <div className="text-xs text-gray-500 sm:hidden">{unit.hostel}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Hostel",
      key: "hostel",
      className: "hidden sm:table-cell",
      render: (unit) => unit.hostel?.name || unit.hostel || "N/A",
    },
    {
      header: "Floor",
      key: "floor",
      className: "hidden md:table-cell",
      render: (unit) => `Floor ${unit.floor || unit.floorNumber || "0"}`,
    },
    {
      header: "Total Rooms",
      key: "roomCount",
      className: "hidden lg:table-cell",
      render: (unit) => (
        <div className="flex items-center">
          <FaDoorOpen className="mr-2 text-gray-400" />
          {unit.roomCount || 0} rooms
        </div>
      ),
    },
    {
      header: "Occupancy",
      key: "occupancy",
      render: (unit) => (
        <div className="flex items-center">
          <div className="w-20 bg-gray-200 rounded-full h-2.5 mr-2 hidden sm:block">
            <div
              className={`h-2.5 rounded-full ${unit.capacity && unit.occupancy >= unit.capacity ? "bg-green-500" : "bg-[#1360AB]"}`}
              style={{
                width: `${unit.capacity ? Math.min(100, Math.round(((unit.occupancy || 0) / unit.capacity) * 100)) : 0}%`,
              }}
            ></div>
          </div>
          <span className="text-sm text-gray-700">
            {unit.occupancy || 0}/{unit.capacity || 0}
          </span>
        </div>
      ),
    },
    {
      header: "Actions",
      key: "actions",
      align: "right",
      render: (unit) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onUnitClick(unit)
          }}
          className="text-[#1360AB] hover:bg-blue-50 p-2 rounded-full transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
        </button>
      ),
    },
  ]

  return (
    <>
      {viewMode === "table" ? (
        <BaseTable columns={columns} data={units} onRowClick={onUnitClick} emptyMessage="No units to display" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {units.map((unit) => (
            <UnitCard key={unit.id} unit={unit} onClick={() => onUnitClick(unit)} />
          ))}
          {units.length === 0 && <div className="col-span-full text-center py-8 text-gray-500">No units to display</div>}
        </div>
      )}
    </>
  )
}

export default UnitListView
