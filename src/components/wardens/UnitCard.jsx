import React from "react"
import { FaBuilding, FaDoorOpen, FaUserGraduate } from "react-icons/fa"

const UnitCard = ({ unit, onClick }) => {
  const occupancyPercentage = unit.roomCount ? Math.round(((unit.occupiedRoomCount || 0) / unit.roomCount) * 100) : 0
  return (
    <div
      style={{
        backgroundColor: "var(--card-bg)",
        borderRadius: "var(--radius-card)",
        padding: "var(--spacing-5)",
        boxShadow: "var(--shadow-card)",
        border: `var(--border-1) solid var(--color-border-light)`,
        cursor: "pointer",
        transition: "var(--transition-all)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-card-hover)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-card)")}
      onClick={onClick}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--spacing-4)" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              padding: "var(--spacing-2-5)",
              borderRadius: "var(--radius-xl)",
              backgroundColor: "var(--color-info-bg)",
              color: "var(--color-primary)",
              marginRight: "var(--spacing-3)",
            }}
          >
            <FaBuilding size={parseInt(getComputedStyle(document.documentElement).getPropertyValue("--icon-lg"))} />
          </div>
          <div>
            <h3
              style={{
                fontWeight: "var(--font-weight-bold)",
                color: "var(--color-text-secondary)",
                fontSize: "var(--font-size-base)",
              }}
              className="md:text-lg"
            >
              {unit.name || unit.unitNumber}
            </h3>
            <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>{unit.hostel?.name || unit.hostel || "N/A"}</span>
          </div>
        </div>
        <span
          style={{
            backgroundColor: "var(--color-info-bg-light)",
            color: "var(--color-primary)",
            padding: "var(--badge-padding-sm)",
            fontSize: "var(--font-size-xs)",
            borderRadius: "var(--radius-full)",
          }}
        >
          Floor {unit.floor || unit.floorNumber || "0"}
        </span>
      </div>

      <div style={{ marginTop: "var(--spacing-4)", display: "flex", flexDirection: "column", gap: "var(--gap-sm)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", color: "var(--color-text-tertiary)" }}>
            <FaDoorOpen style={{ marginRight: "var(--spacing-2)", color: "var(--color-primary)", opacity: "var(--opacity-70)" }} />
            <span style={{ fontSize: "var(--font-size-sm)" }}>Total Rooms</span>
          </div>
          <span style={{ fontWeight: "var(--font-weight-medium)", fontSize: "var(--font-size-sm)" }}>{unit.roomCount || 0}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", color: "var(--color-text-tertiary)" }}>
            <FaUserGraduate style={{ marginRight: "var(--spacing-2)", color: "var(--color-primary)", opacity: "var(--opacity-70)" }} />
            <span style={{ fontSize: "var(--font-size-sm)" }}>Occupancy</span>
          </div>
          <span style={{ fontWeight: "var(--font-weight-medium)", fontSize: "var(--font-size-sm)" }}>
            {unit.occupancy || 0}/{unit.capacity || 0}
          </span>
        </div>

        <div style={{ paddingTop: "var(--spacing-2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--spacing-1-5)" }}>
            <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>Occupancy Rate</span>
            <span style={{ fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-body)" }}>
              {unit.capacity ? Math.round(((unit.occupancy || 0) / unit.capacity) * 100) : 0}%
            </span>
          </div>
          <div style={{ width: "100%", backgroundColor: "var(--color-bg-muted)", borderRadius: "var(--radius-full)", height: "var(--spacing-1-5)" }}>
            <div
              style={{
                height: "var(--spacing-1-5)",
                borderRadius: "var(--radius-full)",
                backgroundColor: unit.capacity && unit.occupancy >= unit.capacity ? "var(--color-success)" : "var(--color-primary)",
                width: `${unit.capacity ? Math.min(100, Math.round(((unit.occupancy || 0) / unit.capacity) * 100)) : 0}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      <button
        style={{
          marginTop: "var(--spacing-5)",
          width: "100%",
          padding: "var(--spacing-2-5) 0",
          backgroundColor: "var(--color-primary-bg)",
          color: "var(--color-primary)",
          borderRadius: "var(--radius-lg)",
          transition: "var(--transition-all)",
          fontSize: "var(--font-size-sm)",
          fontWeight: "var(--font-weight-medium)",
          border: "none",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "var(--color-primary)"
          e.currentTarget.style.color = "var(--color-white)"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "var(--color-primary-bg)"
          e.currentTarget.style.color = "var(--color-primary)"
        }}
      >
        View Rooms
      </button>
    </div>
  )
}

export default UnitCard
