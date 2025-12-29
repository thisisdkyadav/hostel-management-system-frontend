import React from "react"
import Button from "../common/Button"
import Input from "../common/ui/Input"
import Select from "../common/ui/Select"

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

  const selectStyle = {
    width: "100%",
    padding: "var(--spacing-2)",
    border: `var(--border-1) solid var(--input-border)`,
    borderRadius: "var(--radius-input)",
    fontSize: "var(--font-size-base)",
    color: "var(--color-text-body)",
    backgroundColor: "var(--input-bg)",
    outline: "none",
    transition: "var(--transition-colors)",
  }

  const selectFocusStyle = {
    borderColor: "var(--input-border-focus)",
    boxShadow: "var(--input-focus-ring)",
  }

  return (
    <div style={{ backgroundColor: "var(--card-bg)", padding: "var(--spacing-6)", borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-card)", marginBottom: "var(--spacing-6)", }} >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--spacing-4)" }}>
        <h2 style={{ fontWeight: "var(--font-weight-semibold)", fontSize: "var(--font-size-xl)" }}>
          Filter {currentView === "units" ? "Units" : "Rooms"}
        </h2>
        <Button onClick={resetFilters} variant="ghost" size="small">
          Reset Filters
        </Button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(1, minmax(0, 1fr))", gap: "var(--gap-md)", }} className="md:grid-cols-3 lg:grid-cols-4" >
        {/* Hostel Filter */}
        <div>
          <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-body)", marginBottom: "var(--spacing-1)", }} >
            Hostel
          </label>
          <Select name="hostelId" value={filters.hostelId} onChange={handleFilterChange} options={[
            { value: "", label: "All Hostels" },
            ...hostels.map((hostel) => ({ value: hostel.id, label: hostel.name }))
          ]} />
        </div>

        {/* Floor Filter */}
        <div>
          <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-body)", marginBottom: "var(--spacing-1)", }} >
            Floor
          </label>
          <Select name="floorNumber" value={filters.floorNumber} onChange={handleFilterChange} options={[
            { value: "", label: "All Floors" },
            ...floorNumbers.map((floor) => ({ value: floor, label: `Floor ${floor}` }))
          ]} />
        </div>

        {/* Only show these filters if in rooms view */}
        {currentView === "rooms" && (
          <>
            {/* Room Type Filter */}
            <div>
              <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-body)", marginBottom: "var(--spacing-1)", }} >
                Room Type
              </label>
              <Select name="roomType" value={filters.roomType} onChange={handleFilterChange} options={[
                { value: "", label: "All Types" },
                ...roomTypes.map((type) => ({ value: type.toLowerCase(), label: type }))
              ]} />
            </div>

            {/* Occupancy Status Filter */}
            <div>
              <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-body)", marginBottom: "var(--spacing-1)", }} >
                Occupancy Status
              </label>
              <Select name="occupancyStatus" value={filters.occupancyStatus} onChange={handleFilterChange} options={[
                { value: "", label: "All Statuses" },
                ...occupancyStatuses.map((status) => ({ value: status.value, label: status.label }))
              ]} />
            </div>
          </>
        )}

        {/* Search Box */}
        <div className={currentView === "rooms" ? "md:col-span-3 lg:col-span-1" : "md:col-span-1"}>
          <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-body)", marginBottom: "var(--spacing-1)", }} >
            Search
          </label>
          <Input type="text" name="searchTerm" value={filters.searchTerm} onChange={handleFilterChange} placeholder={`Search ${currentView === "units" ? "units" : "rooms"}...`} />
        </div>
      </div>
    </div>
  )
}

export default UnitFilterSection
