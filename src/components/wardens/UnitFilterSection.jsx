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
        <button onClick={resetFilters} style={{ fontSize: "var(--font-size-sm)", color: "var(--color-primary)", backgroundColor: "transparent", border: "none", cursor: "pointer", transition: "var(--transition-colors)", }} onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-primary-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-primary)")}
        >
          Reset Filters
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(1, minmax(0, 1fr))", gap: "var(--gap-md)", }} className="md:grid-cols-3 lg:grid-cols-4" >
        {/* Hostel Filter */}
        <div>
          <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-body)", marginBottom: "var(--spacing-1)", }} >
            Hostel
          </label>
          <select name="hostelId" value={filters.hostelId} onChange={handleFilterChange} style={selectStyle} onFocus={(e) => Object.assign(e.currentTarget.style, selectFocusStyle)}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--input-border)"
              e.currentTarget.style.boxShadow = "none"
            }}
          >
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
          <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-body)", marginBottom: "var(--spacing-1)", }} >
            Floor
          </label>
          <select name="floorNumber" value={filters.floorNumber} onChange={handleFilterChange} style={selectStyle} onFocus={(e) => Object.assign(e.currentTarget.style, selectFocusStyle)}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--input-border)"
              e.currentTarget.style.boxShadow = "none"
            }}
          >
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
              <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-body)", marginBottom: "var(--spacing-1)", }} >
                Room Type
              </label>
              <select name="roomType" value={filters.roomType} onChange={handleFilterChange} style={selectStyle} onFocus={(e) => Object.assign(e.currentTarget.style, selectFocusStyle)}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--input-border)"
                  e.currentTarget.style.boxShadow = "none"
                }}
              >
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
              <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-body)", marginBottom: "var(--spacing-1)", }} >
                Occupancy Status
              </label>
              <select name="occupancyStatus" value={filters.occupancyStatus} onChange={handleFilterChange} style={selectStyle} onFocus={(e) => Object.assign(e.currentTarget.style, selectFocusStyle)}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--input-border)"
                  e.currentTarget.style.boxShadow = "none"
                }}
              >
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
          <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-body)", marginBottom: "var(--spacing-1)", }} >
            Search
          </label>
          <input type="text" name="searchTerm" value={filters.searchTerm} onChange={handleFilterChange} placeholder={`Search ${currentView === "units" ? "units" : "rooms"}...`} style={{ ...selectStyle, color: filters.searchTerm ? "var(--color-text-body)" : "var(--color-text-placeholder)", }} onFocus={(e) => Object.assign(e.currentTarget.style, selectFocusStyle)}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--input-border)"
              e.currentTarget.style.boxShadow = "none"
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default UnitFilterSection
