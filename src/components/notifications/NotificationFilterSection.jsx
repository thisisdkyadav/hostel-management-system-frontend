import React from "react"
import { FaSearch, FaTimes } from "react-icons/fa"
import { Button, Input, Select } from "@/components/ui"

const NotificationFilterSection = ({ filters, updateFilter, resetFilters }) => {
  const handleChange = (e) => {
    const { name, value } = e.target
    updateFilter(name, value)
  }

  return (
    <div style={{ backgroundColor: 'var(--color-bg-primary)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', marginBottom: 'var(--spacing-6)', border: `var(--border-1) solid var(--color-border-light)` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
        <h3 style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)' }}>Filter Notifications</h3>
        <Button onClick={resetFilters} variant="ghost" size="small" icon={<FaTimes />}>
          Reset Filters
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-4)' }}>
        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Search</label>
          <Input type="text" name="searchTerm" value={filters.searchTerm} onChange={handleChange} placeholder="Search by title or content..." icon={<FaSearch />} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Hostel</label>
          <Select name="hostelId" value={filters.hostelId} onChange={handleChange} options={[
            { value: "all", label: "All Hostels" },
            { value: "hostel1", label: "Hostel 1" },
            { value: "hostel2", label: "Hostel 2" }
          ]} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Department</label>
          <Select name="department" value={filters.department} onChange={handleChange} options={[
            { value: "all", label: "All Departments" },
            { value: "CSE", label: "Computer Science" },
            { value: "ECE", label: "Electronics" },
            { value: "ME", label: "Mechanical" }
          ]} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Degree</label>
          <Select name="degree" value={filters.degree} onChange={handleChange} options={[
            { value: "all", label: "All Degrees" },
            { value: "BTech", label: "BTech" },
            { value: "MTech", label: "MTech" },
            { value: "PhD", label: "PhD" }
          ]} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Gender</label>
          <Select name="gender" value={filters.gender} onChange={handleChange} options={[
            { value: "all", label: "All Genders" },
            { value: "Male", label: "Male" },
            { value: "Female", label: "Female" },
            { value: "Other", label: "Other" }
          ]} />
        </div>
      </div>
    </div>
  )
}

export default NotificationFilterSection
