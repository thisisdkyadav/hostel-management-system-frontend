import React from "react"
import { FaSearch, FaTimes } from "react-icons/fa"
import { Grid, HStack, Select, Surface } from "@/components/ui"
import { Button, Input } from "czero/react"

const NotificationFilterSection = ({ filters, updateFilter, resetFilters }) => {
  const handleChange = (e) => {
    const { name, value } = e.target
    updateFilter(name, value)
  }

  return (
    <Surface bg="primary" padding={4} radius="xl" shadow="sm" border="var(--border-1) solid var(--color-border-light)" style={{ marginBottom: 'var(--spacing-6)' }}>
      <HStack gap="none" align="center" justify="between" style={{ marginBottom: 'var(--spacing-4)' }}>
        <h3 style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)' }}>Filter Notifications</h3>
        <Button onClick={resetFilters} variant="ghost" size="sm">
          <FaTimes /> Reset Filters
        </Button>
      </HStack>

      <Grid min={250} gap={4}>
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
      </Grid>
    </Surface>
  )
}

export default NotificationFilterSection
