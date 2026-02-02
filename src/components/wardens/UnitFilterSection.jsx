import React from "react"
import { Input, Select, VStack, Label } from "@/components/ui"
import { Button } from "czero/react"

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
    <div style={{ backgroundColor: "var(--card-bg)", padding: "var(--spacing-6)", borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-card)", marginBottom: "var(--spacing-6)", }} >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--spacing-4)" }}>
        <h2 style={{ fontWeight: "var(--font-weight-semibold)", fontSize: "var(--font-size-xl)" }}>
          Filter {currentView === "units" ? "Units" : "Rooms"}
        </h2>
        <Button onClick={resetFilters} variant="ghost" size="sm">
          Reset Filters
        </Button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(1, minmax(0, 1fr))", gap: "var(--gap-md)", }} className="md:grid-cols-3 lg:grid-cols-4" >
        {/* Hostel Filter */}
        <VStack gap="xsmall">
          <Label htmlFor="hostelId">Hostel</Label>
          <Select id="hostelId" name="hostelId" value={filters.hostelId} onChange={handleFilterChange} options={[
            { value: "", label: "All Hostels" },
            ...hostels.map((hostel) => ({ value: hostel.id, label: hostel.name }))
          ]} />
        </VStack>

        {/* Floor Filter */}
        <VStack gap="xsmall">
          <Label htmlFor="floorNumber">Floor</Label>
          <Select id="floorNumber" name="floorNumber" value={filters.floorNumber} onChange={handleFilterChange} options={[
            { value: "", label: "All Floors" },
            ...floorNumbers.map((floor) => ({ value: floor, label: `Floor ${floor}` }))
          ]} />
        </VStack>

        {/* Only show these filters if in rooms view */}
        {currentView === "rooms" && (
          <>
            {/* Room Type Filter */}
            <VStack gap="xsmall">
              <Label htmlFor="roomType">Room Type</Label>
              <Select id="roomType" name="roomType" value={filters.roomType} onChange={handleFilterChange} options={[
                { value: "", label: "All Types" },
                ...roomTypes.map((type) => ({ value: type.toLowerCase(), label: type }))
              ]} />
            </VStack>

            {/* Occupancy Status Filter */}
            <VStack gap="xsmall">
              <Label htmlFor="occupancyStatus">Occupancy Status</Label>
              <Select id="occupancyStatus" name="occupancyStatus" value={filters.occupancyStatus} onChange={handleFilterChange} options={[
                { value: "", label: "All Statuses" },
                ...occupancyStatuses.map((status) => ({ value: status.value, label: status.label }))
              ]} />
            </VStack>
          </>
        )}

        {/* Search Box */}
        <VStack gap="xsmall" className={currentView === "rooms" ? "md:col-span-3 lg:col-span-1" : "md:col-span-1"}>
          <Label htmlFor="searchTerm">Search</Label>
          <Input id="searchTerm" type="text" name="searchTerm" value={filters.searchTerm} onChange={handleFilterChange} placeholder={`Search ${currentView === "units" ? "units" : "rooms"}...`} />
        </VStack>
      </div>
    </div>
  )
}

export default UnitFilterSection
