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
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ flexShrink: 0, height: "var(--spacing-10)", width: "var(--spacing-10)", backgroundColor: "var(--color-info-bg)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-full)", }} >
            <FaBuilding style={{ color: "var(--color-primary)" }} />
          </div>
          <div style={{ marginLeft: "var(--spacing-4)" }}>
            <div style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-primary)" }}>
              {unit.unitNumber || unit.name}
            </div>
            <div className="sm:hidden" style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
              {unit.hostel}
            </div>
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
        <div style={{ display: "flex", alignItems: "center" }}>
          <FaDoorOpen style={{ marginRight: "var(--spacing-2)", color: "var(--color-text-disabled)" }} />
          {unit.roomCount || 0} rooms
        </div>
      ),
    },
    {
      header: "Occupancy",
      key: "occupancy",
      render: (unit) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <div className="hidden sm:block" style={{ width: "var(--spacing-20)", backgroundColor: "var(--color-bg-muted)", borderRadius: "var(--radius-full)", height: "var(--spacing-2-5)", marginRight: "var(--spacing-2)", }} >
            <div style={{ height: "var(--spacing-2-5)", borderRadius: "var(--radius-full)", backgroundColor: unit.capacity && unit.occupancy >= unit.capacity ? "var(--color-success)" : "var(--color-primary)",
                width: `${unit.capacity ? Math.min(100, Math.round(((unit.occupancy || 0) / unit.capacity) * 100)) : 0}%`,
              }}
            ></div>
          </div>
          <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>
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
        <button onClick={(e) => {
            e.stopPropagation()
            onUnitClick(unit)
          }}
          style={{
            color: "var(--color-primary)",
            padding: "var(--spacing-2)",
            borderRadius: "var(--radius-full)",
            transition: "var(--transition-colors)",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-info-bg-light)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{ height: "var(--icon-lg)", width: "var(--icon-lg)" }}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(1, minmax(0, 1fr))", gap: "var(--gap-md)", }} className="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" >
          {units.map((unit) => (
            <UnitCard key={unit.id} unit={unit} onClick={() => onUnitClick(unit)} />
          ))}
          {units.length === 0 && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "var(--spacing-8) 0", color: "var(--color-text-muted)", }} >
              No units to display
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default UnitListView
