import React from "react"

const RoomStatsSummary = ({ data, isUnitBased }) => {
  const totalRooms = data.length
  const totalCapacity = data.reduce((sum, room) => sum + (parseInt(room.capacity) || 0), 0)
  const activeRooms = data.filter((room) => room.status === "Active").length
  const inactiveRooms = totalRooms - activeRooms

  const floorStats = data.reduce((stats, room) => {
    const floorNumber = isUnitBased ? (room.unitNumber ? Math.floor(parseInt(room.unitNumber) / 100) : parseInt(room.floor) || 0) : room.roomNumber ? Math.floor(parseInt(room.roomNumber) / 100) : 0

    if (!stats[floorNumber]) {
      stats[floorNumber] = {
        count: 0,
        units: new Set(),
        capacity: 0,
      }
    }

    stats[floorNumber].count++
    stats[floorNumber].capacity += parseInt(room.capacity) || 0

    if (isUnitBased && room.unitNumber) {
      stats[floorNumber].units.add(room.unitNumber)
    }

    return stats
  }, {})

  const unitRoomCounts = {}
  const exceptions = []

  if (isUnitBased) {
    data.forEach((room) => {
      if (!room.unitNumber) return
      if (!unitRoomCounts[room.unitNumber]) {
        unitRoomCounts[room.unitNumber] = 0
      }
      unitRoomCounts[room.unitNumber]++
    })

    const countFrequency = {}
    Object.values(unitRoomCounts).forEach((count) => {
      countFrequency[count] = (countFrequency[count] || 0) + 1
    })

    let standardRoomCount = 0
    let maxFrequency = 0

    Object.entries(countFrequency).forEach(([count, freq]) => {
      if (freq > maxFrequency) {
        maxFrequency = freq
        standardRoomCount = parseInt(count)
      }
    })

    Object.entries(unitRoomCounts).forEach(([unit, count]) => {
      if (count !== standardRoomCount) {
        exceptions.push({ unit, roomCount: count })
      }
    })
  }

  return (
    <div
      style={{
        backgroundColor: "var(--color-bg-primary)",
        border: `var(--border-1) solid var(--color-border-primary)`,
        borderRadius: "var(--radius-lg)",
        padding: "var(--spacing-4)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--spacing-4)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "var(--spacing-4)",
        }}
        className="sm:grid-cols-4"
      >
        <div
          style={{
            backgroundColor: "var(--color-primary-bg)",
            padding: "var(--spacing-3)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>Total Rooms</div>
          <div style={{ fontSize: "var(--font-size-2xl)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)" }}>{totalRooms}</div>
        </div>

        <div
          style={{
            backgroundColor: "var(--color-success-bg)",
            padding: "var(--spacing-3)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>Total Capacity</div>
          <div style={{ fontSize: "var(--font-size-2xl)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)" }}>{totalCapacity}</div>
        </div>

        <div
          style={{
            backgroundColor: "var(--color-success-bg-light)",
            padding: "var(--spacing-3)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>Active Rooms</div>
          <div style={{ fontSize: "var(--font-size-2xl)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)" }}>{activeRooms}</div>
        </div>

        <div
          style={{
            backgroundColor: "var(--color-orange-bg)",
            padding: "var(--spacing-3)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>Inactive Rooms</div>
          <div style={{ fontSize: "var(--font-size-2xl)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)" }}>{inactiveRooms}</div>
        </div>
      </div>

      <div>
        <h5 style={{ fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-2)", color: "var(--color-text-body)", fontSize: "var(--font-size-base)" }}>Floor Statistics</h5>
        <div style={{ display: "grid", gap: "var(--spacing-2)" }}>
          {Object.entries(floorStats)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([floor, stats]) => (
              <div
                key={floor}
                style={{
                  backgroundColor: "var(--color-bg-hover)",
                  padding: "var(--spacing-2)",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontWeight: "var(--font-weight-medium)", color: "var(--color-text-primary)", fontSize: "var(--font-size-base)" }}>Floor {floor}</span>
                <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
                  {isUnitBased ? `${stats.units.size} units, ${stats.count} rooms` : `${stats.count} rooms`} (Capacity: {stats.capacity})
                </div>
              </div>
            ))}
        </div>
      </div>

      {isUnitBased && exceptions.length > 0 && (
        <div>
          <h5 style={{ fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-2)", color: "var(--color-text-body)", fontSize: "var(--font-size-base)" }}>Unit Exceptions</h5>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "var(--spacing-2)",
            }}
            className="sm:grid-cols-3"
          >
            {exceptions.map(({ unit, roomCount }) => (
              <div
                key={unit}
                style={{
                  backgroundColor: "var(--color-warning-bg)",
                  padding: "var(--spacing-2)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <span style={{ fontWeight: "var(--font-weight-medium)", color: "var(--color-text-primary)", fontSize: "var(--font-size-base)" }}>Unit {unit}</span>
                <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>{roomCount} rooms</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default RoomStatsSummary
