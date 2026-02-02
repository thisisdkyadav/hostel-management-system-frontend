import React, { useState, useEffect } from "react"
import { ChevronDown, ChevronUp, RotateCcw, Search, SlidersHorizontal } from "lucide-react"
import MultiSelectDropdown from "../MultiSelectDropdown"
import { Input, Select, DatePicker, Card, HStack, VStack, Label, Divider, Badge } from "@/components/ui"
import { Button } from "czero/react"
import { studentApi } from "../../../service"

const StudentFilterSection = ({ filters, updateFilter, resetFilters, hostels, setPageSize, missingOptions = [] }) => {
  const [departments, setDepartments] = useState([])
  const [degreeOptions, setDegreeOptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [degreesLoading, setDegreesLoading] = useState(false)
  const [degreesError, setDegreesError] = useState(null)
  const [isExpanded, setIsExpanded] = useState(false)

  const fetchDepartments = async () => {
    setLoading(true)
    setError(null)
    try {
      const departmentData = await studentApi.getDepartmentList()
      if (departmentData && Array.isArray(departmentData)) {
        setDepartments(departmentData)
      } else {
        setDepartments([])
      }
    } catch (error) {
      console.error("Failed to fetch departments:", error)
      setError("Failed to load departments")
      setDepartments([])
    } finally {
      setLoading(false)
    }
  }

  const fetchDegrees = async () => {
    setDegreesLoading(true)
    setDegreesError(null)
    try {
      const degreesData = await studentApi.getDegreesList()
      if (degreesData && Array.isArray(degreesData)) {
        setDegreeOptions(degreesData)
      } else {
        setDegreeOptions([])
      }
    } catch (error) {
      console.error("Failed to fetch degrees:", error)
      setDegreesError("Failed to load degrees")
      setDegreeOptions([])
    } finally {
      setDegreesLoading(false)
    }
  }

  useEffect(() => {
    fetchDepartments()
    fetchDegrees()
  }, [])

  // Count active filters (excluding searchTerm and studentsPerPage)
  const getActiveFilterCount = () => {
    let count = 0
    if (filters.hostelId) count++
    if (filters.unitNumber) count++
    if (filters.roomNumber) count++
    if (filters.department) count++
    if (filters.degree) count++
    if (filters.gender) count++
    if (filters.status) count++
    if (filters.hasAllocation) count++
    if (filters.isDayScholar) count++
    if (filters.admissionDateFrom) count++
    if (filters.admissionDateTo) count++
    if (filters.missingOptions && filters.missingOptions.length > 0) count++
    return count
  }

  const activeFilterCount = getActiveFilterCount()

  return (
    <Card style={{ marginTop: 'var(--spacing-6)', overflow: 'visible' }} padding="p-4">
      {/* Compact row: Search + More Filters + Reset */}
      <HStack gap="small" align="center">
        <div style={{ flex: 1 }}>
          <Input
            type="text"
            placeholder="Search by name, roll number, or email..."
            value={filters.searchTerm}
            onChange={(e) => updateFilter("searchTerm", e.target.value)}
            icon={<Search size={16} />}
          />
        </div>
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          variant="secondary"
          size="sm"
        >
          <SlidersHorizontal size={16} />
          {isExpanded ? "Less" : "More"}
          {activeFilterCount > 0 && !isExpanded && (
            <Badge variant="primary" size="small" style={{ marginLeft: 'var(--spacing-1-5)' }}>
              {activeFilterCount}
            </Badge>
          )}
          {isExpanded ? <ChevronUp size={14} style={{ marginLeft: 'var(--spacing-1)' }} /> : <ChevronDown size={14} style={{ marginLeft: 'var(--spacing-1)' }} />}
        </Button>
        <Button onClick={resetFilters} variant="ghost" size="sm">
          <RotateCcw size={14} />
          Reset
        </Button>
      </HStack>

      {/* Expanded filters section */}
      {isExpanded && (
        <VStack gap="medium" style={{ marginTop: 'var(--spacing-4)' }}>
          <Divider spacing="none" />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', rowGap: 'var(--spacing-4)', columnGap: 'var(--spacing-4)', paddingTop: 'var(--spacing-4)' }}>
            {hostels.length > 0 && (
              <VStack gap="xsmall">
                <Label size="sm">Hostel</Label>
                <Select
                  value={filters.hostelId}
                  onChange={(e) => updateFilter("hostelId", e.target.value)}
                  placeholder="All Hostels"
                  options={hostels.map((hostel) => ({
                    value: hostel._id || hostel.id,
                    label: hostel.name || hostel
                  }))}
                />
              </VStack>
            )}

            <VStack gap="xsmall">
              <Label size="sm">Unit</Label>
              <Input type="text" placeholder="Unit number" value={filters.unitNumber} onChange={(e) => updateFilter("unitNumber", e.target.value)} />
            </VStack>

            <VStack gap="xsmall">
              <Label size="sm">Room Number</Label>
              <Input type="text" placeholder="Room number" value={filters.roomNumber} onChange={(e) => updateFilter("roomNumber", e.target.value)} />
            </VStack>

            <VStack gap="xsmall">
              <Label size="sm">Department</Label>
              <Select
                value={filters.department}
                onChange={(e) => updateFilter("department", e.target.value)}
                disabled={loading}
                placeholder="All Departments"
                options={loading ? [{ value: "", label: "Loading departments..." }] : error ? [{ value: "", label: "Error loading departments" }] : departments.map((dept) => ({ value: dept, label: dept }))}
              />
              {error && (
                <HStack gap="small" align="center">
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-danger)' }}>{error}</span>
                  <Button onClick={fetchDepartments} variant="ghost" size="sm" disabled={loading}>
                    Retry
                  </Button>
                </HStack>
              )}
            </VStack>

            <VStack gap="xsmall">
              <Label size="sm">Degree</Label>
              <Select
                value={filters.degree}
                onChange={(e) => updateFilter("degree", e.target.value)}
                disabled={degreesLoading}
                placeholder="All Degrees"
                options={degreesLoading ? [{ value: "", label: "Loading degrees..." }] : degreesError ? [{ value: "", label: "Error loading degrees" }] : degreeOptions.map((degree) => ({ value: degree, label: degree }))}
              />
              {degreesError && (
                <HStack gap="small" align="center">
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-danger)' }}>{degreesError}</span>
                  <Button onClick={fetchDegrees} variant="ghost" size="sm" disabled={degreesLoading}>
                    Retry
                  </Button>
                </HStack>
              )}
            </VStack>

            <VStack gap="xsmall">
              <Label size="sm">Gender</Label>
              <Select
                value={filters.gender}
                onChange={(e) => updateFilter("gender", e.target.value)}
                placeholder="All Genders"
                options={[
                  { value: "Male", label: "Male" },
                  { value: "Female", label: "Female" },
                  { value: "Other", label: "Other" }
                ]}
              />
            </VStack>

            <VStack gap="xsmall">
              <Label size="sm">Status</Label>
              <Select
                value={filters.status}
                onChange={(e) => updateFilter("status", e.target.value)}
                options={[
                  { value: "Active", label: "Active" },
                  { value: "Graduated", label: "Graduated" },
                  { value: "Dropped", label: "Dropped" },
                  { value: "Inactive", label: "Inactive" },
                  { value: "", label: "All Statuses" }
                ]}
              />
            </VStack>

            <VStack gap="xsmall">
              <Label size="sm">Allocation Status</Label>
              <Select
                value={filters.hasAllocation}
                onChange={(e) => updateFilter("hasAllocation", e.target.value)}
                placeholder="All Students"
                options={[
                  { value: "true", label: "Allocated Room" },
                  { value: "false", label: "No Allocation" }
                ]}
              />
            </VStack>

            <VStack gap="xsmall">
              <Label size="sm">Day Scholar</Label>
              <Select
                value={filters.isDayScholar}
                onChange={(e) => updateFilter("isDayScholar", e.target.value)}
                placeholder="All Students"
                options={[
                  { value: "true", label: "Day Scholar" },
                  { value: "false", label: "Hosteller" }
                ]}
              />
            </VStack>

            <VStack gap="xsmall">
              <Label size="sm">Students per page</Label>
              <Select
                value={filters.studentsPerPage}
                onChange={(e) => setPageSize(e.target.value)}
                options={[
                  { value: "10", label: "10" },
                  { value: "20", label: "20" },
                  { value: "50", label: "50" },
                  { value: "100", label: "100" },
                  { value: "200", label: "200" }
                ]}
              />
            </VStack>

            {missingOptions.length > 0 && (
              <div>
                <MultiSelectDropdown label="Missing Information" options={missingOptions} selectedValues={filters.missingOptions || []} onChange={(selectedValues) => updateFilter("missingOptions", selectedValues)} placeholder="Select missing fields..." />
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-4)' }}>
            <VStack gap="xsmall">
              <Label size="sm">Admission Date From</Label>
              <DatePicker
                name="admissionDateFrom"
                value={filters.admissionDateFrom}
                onChange={(e) => updateFilter("admissionDateFrom", e.target.value)}
                placeholder="Select start date"
              />
            </VStack>

            <VStack gap="xsmall">
              <Label size="sm">Admission Date To</Label>
              <DatePicker
                name="admissionDateTo"
                value={filters.admissionDateTo}
                onChange={(e) => updateFilter("admissionDateTo", e.target.value)}
                placeholder="Select end date"
                min={filters.admissionDateFrom}
              />
            </VStack>
          </div>
        </VStack>
      )}
    </Card>
  )
}

export default StudentFilterSection
