import React from "react"
import { FaBuilding, FaDoorOpen, FaEye } from "react-icons/fa"
import { DataTable, Button } from "hzero"
import { HStack, IconCircle, Text } from "@/components/ui"

const UnitListView = ({ units, onUnitClick }) => {
  const columns = [
    {
      header: "Unit Number",
      key: "unitNumber",
      render: (unit) => (
        <HStack gap="none" align="center">
          <IconCircle size="var(--spacing-10)" bg="info">
            <FaBuilding color="var(--color-primary)" />
          </IconCircle>
          <div style={{ marginLeft: "var(--spacing-4)" }}>
            <Text as="div" size="sm" weight="medium" color="primary">
              {unit.unitNumber || unit.name}
            </Text>
            <Text as="div" size="xs" color="muted" className="sm:hidden">
              {unit.hostel}
            </Text>
          </div>
        </HStack>
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
        <HStack gap="none" align="center">
          <FaDoorOpen style={{ marginRight: "var(--spacing-2)" }} color="var(--color-text-disabled)" />
          {unit.roomCount || 0} rooms
        </HStack>
      ),
    },
    {
      header: "Occupancy",
      key: "occupancy",
      render: (unit) => (
        <HStack gap="none" align="center">
          <div className="hidden sm:block" style={{ width: "var(--spacing-20)", backgroundColor: "var(--color-bg-muted)", borderRadius: "var(--radius-full)", height: "var(--spacing-2-5)", marginRight: "var(--spacing-2)", }} >
            <div style={{
              height: "var(--spacing-2-5)", borderRadius: "var(--radius-full)", backgroundColor: unit.capacity && unit.occupancy >= unit.capacity ? "var(--color-success)" : "var(--color-primary)",
              width: `${unit.capacity ? Math.min(100, Math.round(((unit.occupancy || 0) / unit.capacity) * 100)) : 0}%`,
            }}
            ></div>
          </div>
          <Text as="span" size="sm" color="body">
            {unit.occupancy || 0}/{unit.capacity || 0}
          </Text>
        </HStack>
      ),
    },
    {
      header: "Actions",
      key: "actions",
      align: "right",
      render: (unit) => (
        <Button onClick={(e) => { e.stopPropagation(); onUnitClick(unit); }} variant="ghost" size="sm" aria-label="View unit"><FaEye /></Button>
      ),
    },
  ]

  return <DataTable columns={columns} data={units} onRowClick={onUnitClick} emptyMessage="No units to display" />
}

export default UnitListView
