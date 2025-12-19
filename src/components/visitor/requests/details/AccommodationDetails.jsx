import React from "react"
import { FaBuilding } from "react-icons/fa"
import { useGlobal } from "../../../../contexts/GlobalProvider"

const AccommodationDetails = ({ hostelName, allocatedRooms }) => {
  return (
    <div style={{ backgroundColor: "var(--color-bg-muted)", padding: "var(--spacing-4)", borderRadius: "var(--radius-lg)", }} >
      <h3 style={{ fontWeight: "var(--font-weight-medium)", color: "var(--color-text-secondary)", marginBottom: "var(--spacing-3)", display: "flex", alignItems: "center", }} >
        <FaBuilding style={{ marginRight: "var(--spacing-2)", color: "var(--color-primary)", fontSize: "var(--icon-md)", }} />{" "}
        Accommodation Details
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)", }} >
            Hostel:
          </span>
          <span style={{ fontWeight: "var(--font-weight-medium)", fontSize: "var(--font-size-sm)", }} >
            {hostelName}
          </span>
        </div>
        {allocatedRooms && allocatedRooms.length > 0 ? (
          <div>
            <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)", display: "block", marginBottom: "var(--spacing-1)", }} >
              Allocated Rooms:
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-1)" }}>
              {allocatedRooms.map((room, index) => (
                <div key={index} style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", }} >
                  {room.length > 1 ? `${room[1]}-${room[0]}` : `Room ${room[0]}`}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)", }} >
              Room:
            </span>
            <span style={{ fontWeight: "var(--font-weight-medium)", fontSize: "var(--font-size-sm)", }} >
              Not allocated yet
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default AccommodationDetails
