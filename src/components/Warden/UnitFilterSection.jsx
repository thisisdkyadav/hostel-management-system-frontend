import React from "react"

const UnitFilterSection = ({ filters, setFilters, resetFilters, hostels, currentView }) => {
  // Floor numbers for dropdown
  const floorNumbers = ["0", "1", "2", "3", "4", "5"]

  // Room types
  const roomTypes = ["Single", "Double", "Triple", "Quad"]

  // Occupancy statuses
  const occupancyStatuses = [
    { value: "empty", label: "Empty" },
    { value: "partial", label: "Partially Occupied" },
    { value: "full", label: "Fully Occupied" },
  ]

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg">Filter {currentView === "units" ? "Units" : "Rooms"}</h2>
        <button onClick={resetFilters} className="text-sm text-[#1360AB] hover:text-blue-700">
          Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Hostel Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hostel</label>
          <select name="hostelId" value={filters.hostelId} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
            <option value="">All Hostels</option>
            {hostels.map((hostel) => (
              <option key={hostel.id} value={hostel.id}>
                {hostel.name}
              </option>
            ))}
          </select>
        </div>

        {/* Floor Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
          <select name="floorNumber" value={filters.floorNumber} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
            <option value="">All Floors</option>
            {floorNumbers.map((floor) => (
              <option key={floor} value={floor}>
                Floor {floor}
              </option>
            ))}
          </select>
        </div>

        {/* Only show these filters if in rooms view */}
        {currentView === "rooms" && (
          <>
            {/* Room Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
              <select name="roomType" value={filters.roomType} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                <option value="">All Types</option>
                {roomTypes.map((type) => (
                  <option key={type} value={type.toLowerCase()}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Occupancy Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Occupancy Status</label>
              <select name="occupancyStatus" value={filters.occupancyStatus} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                <option value="">All Statuses</option>
                {occupancyStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Search Box */}
        <div className={currentView === "rooms" ? "md:col-span-3 lg:col-span-1" : "md:col-span-1"}>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input type="text" name="searchTerm" value={filters.searchTerm} onChange={handleFilterChange} placeholder={`Search ${currentView === "units" ? "units" : "rooms"}...`} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
        </div>
      </div>
    </div>
  )
}

export default UnitFilterSection
