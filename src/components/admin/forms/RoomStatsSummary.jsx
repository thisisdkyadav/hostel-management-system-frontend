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
    <div className="bg-white border rounded-lg p-4 space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600">Total Rooms</div>
          <div className="text-xl font-semibold">{totalRooms}</div>
        </div>

        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600">Total Capacity</div>
          <div className="text-xl font-semibold">{totalCapacity}</div>
        </div>

        <div className="bg-emerald-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600">Active Rooms</div>
          <div className="text-xl font-semibold">{activeRooms}</div>
        </div>

        <div className="bg-orange-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600">Inactive Rooms</div>
          <div className="text-xl font-semibold">{inactiveRooms}</div>
        </div>
      </div>

      <div>
        <h5 className="font-medium mb-2 text-gray-700">Floor Statistics</h5>
        <div className="grid gap-2">
          {Object.entries(floorStats)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([floor, stats]) => (
              <div key={floor} className="bg-gray-50 p-2 rounded flex justify-between">
                <span className="font-medium">Floor {floor}</span>
                <div className="text-sm text-gray-600">
                  {isUnitBased ? `${stats.units.size} units, ${stats.count} rooms` : `${stats.count} rooms`} (Capacity: {stats.capacity})
                </div>
              </div>
            ))}
        </div>
      </div>

      {isUnitBased && exceptions.length > 0 && (
        <div>
          <h5 className="font-medium mb-2 text-gray-700">Unit Exceptions</h5>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {exceptions.map(({ unit, roomCount }) => (
              <div key={unit} className="bg-yellow-50 p-2 rounded">
                <span className="font-medium">Unit {unit}</span>
                <div className="text-sm text-gray-600">{roomCount} rooms</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default RoomStatsSummary
