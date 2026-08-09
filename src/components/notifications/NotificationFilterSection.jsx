import React from "react"
import { FaSearch, FaTimes } from "react-icons/fa"
import { Button, Field, Grid, Heading, HStack, Input, Label, Select, Surface } from "hzero"

const NotificationFilterSection = ({ filters, updateFilter, resetFilters }) => {
  const handleChange = (e) => {
    const { name, value } = e.target
    updateFilter(name, value)
  }

  return (
    <Surface bg="primary" padding={4} radius="xl" shadow="sm" border="var(--border-1) solid var(--color-border-light)" style={{ marginBottom: 'var(--spacing-6)' }}>
      <HStack gap="none" align="center" justify="between" style={{ marginBottom: 'var(--spacing-4)' }}>
        <Heading as="h3" weight="medium" color="body">Filter Notifications</Heading>
        <Button onClick={resetFilters} variant="ghost" size="sm">
          <FaTimes /> Reset Filters
        </Button>
      </HStack>

      <Grid min={250} gap={4}>
        <Field label="Search" color="body" spacing={2}>
          <Input type="text" name="searchTerm" value={filters.searchTerm} onChange={handleChange} placeholder="Search by title or content..." icon={<FaSearch />} />
        </Field>

        <Field label="Hostel" color="body" spacing={2}>
          <Select name="hostelId" value={filters.hostelId} onChange={handleChange} options={[
            { value: "all", label: "All Hostels" },
            { value: "hostel1", label: "Hostel 1" },
            { value: "hostel2", label: "Hostel 2" }
          ]} />
        </Field>

        <Field label="Department" color="body" spacing={2}>
          <Select name="department" value={filters.department} onChange={handleChange} options={[
            { value: "all", label: "All Departments" },
            { value: "CSE", label: "Computer Science" },
            { value: "ECE", label: "Electronics" },
            { value: "ME", label: "Mechanical" }
          ]} />
        </Field>

        <Field label="Degree" color="body" spacing={2}>
          <Select name="degree" value={filters.degree} onChange={handleChange} options={[
            { value: "all", label: "All Degrees" },
            { value: "BTech", label: "BTech" },
            { value: "MTech", label: "MTech" },
            { value: "PhD", label: "PhD" }
          ]} />
        </Field>

        <Field label="Gender" color="body" spacing={2}>
          <Select name="gender" value={filters.gender} onChange={handleChange} options={[
            { value: "all", label: "All Genders" },
            { value: "Male", label: "Male" },
            { value: "Female", label: "Female" },
            { value: "Other", label: "Other" }
          ]} />
        </Field>
      </Grid>
    </Surface>
  )
}

export default NotificationFilterSection
