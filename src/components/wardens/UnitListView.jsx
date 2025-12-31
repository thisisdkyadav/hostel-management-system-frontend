import React from "react"
import { FaBuilding, FaDoorOpen, FaEye } from "react-icons/fa"
import UnitCard from "./UnitCard"
import BaseTable from "../common/table/BaseTable"
import { Button } from "@/components/ui"

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
            <div style={{
              height: "var(--spacing-2-5)", borderRadius: "var(--radius-full)", backgroundColor: unit.capacity && unit.occupancy >= unit.capacity ? "var(--color-success)" : "var(--color-primary)",
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
        <Button onClick={(e) => { e.stopPropagation(); onUnitClick(unit); }} variant="ghost" size="small" icon={<FaEye />} aria-label="View unit" />
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
