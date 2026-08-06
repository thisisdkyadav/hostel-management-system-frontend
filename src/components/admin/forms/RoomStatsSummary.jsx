import React from "react"
import { Heading, Surface, Text } from "@/components/ui"

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
    <div style={{ backgroundColor: "var(--color-bg-primary)", border: `var(--border-1) solid var(--color-border-primary)`, borderRadius: "var(--radius-lg)", padding: "var(--spacing-4)", display: "flex", flexDirection: "column", gap: "var(--spacing-4)", }} >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "var(--spacing-4)", }} className="sm:grid-cols-4" >
        <Surface bg="brand" padding={3} radius="lg">
          <Text as="div" size="sm" color="muted">Total Rooms</Text>
          <Text as="div" size="2xl" weight="semibold" color="primary">{totalRooms}</Text>
        </Surface>

        <Surface bg="success" padding={3} radius="lg">
          <Text as="div" size="sm" color="muted">Total Capacity</Text>
          <Text as="div" size="2xl" weight="semibold" color="primary">{totalCapacity}</Text>
        </Surface>

        <Surface bg="var(--color-success-bg-light)" padding={3} radius="lg">
          <Text as="div" size="sm" color="muted">Active Rooms</Text>
          <Text as="div" size="2xl" weight="semibold" color="primary">{activeRooms}</Text>
        </Surface>

        <Surface bg="var(--color-orange-bg)" padding={3} radius="lg">
          <Text as="div" size="sm" color="muted">Inactive Rooms</Text>
          <Text as="div" size="2xl" weight="semibold" color="primary">{inactiveRooms}</Text>
        </Surface>
      </div>

      <div>
        <Heading as="h5" weight="medium" color="body" size="base" style={{ marginBottom: "var(--spacing-2)" }}>Floor Statistics</Heading>
        <div style={{ display: "grid", gap: "var(--spacing-2)" }}>
          {Object.entries(floorStats)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([floor, stats]) => (
              <div key={floor} style={{ backgroundColor: "var(--color-bg-hover)", padding: "var(--spacing-2)", borderRadius: "var(--radius-md)", display: "flex", justifyContent: "space-between", alignItems: "center", }} >
                <Text as="span" weight="medium" color="primary" size="base">Floor {floor}</Text>
                <Text as="div" size="sm" color="muted">
                  {isUnitBased ? `${stats.units.size} units, ${stats.count} rooms` : `${stats.count} rooms`} (Capacity: {stats.capacity})
                </Text>
              </div>
            ))}
        </div>
      </div>

      {isUnitBased && exceptions.length > 0 && (
        <div>
          <Heading as="h5" weight="medium" color="body" size="base" style={{ marginBottom: "var(--spacing-2)" }}>Unit Exceptions</Heading>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "var(--spacing-2)", }} className="sm:grid-cols-3" >
            {exceptions.map(({ unit, roomCount }) => (
              <Surface bg="warning" padding={2} radius="md" key={unit}>
                <Text as="span" weight="medium" color="primary" size="base">Unit {unit}</Text>
                <Text as="div" size="sm" color="muted">{roomCount} rooms</Text>
              </Surface>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default RoomStatsSummary
