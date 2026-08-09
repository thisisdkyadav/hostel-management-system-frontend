import { useEffect, useState } from "react"
import { ChevronDown, ChevronUp, RotateCcw, Search, SlidersHorizontal } from "lucide-react"
import { Badge, Button, Card, DatePicker, Divider, Field, Grid, HStack, Input, Select, VStack } from "hzero"
import MultiSelectDropdown from "../MultiSelectDropdown"
import { useAsyncOptions } from "../../../hooks/useAsyncOptions"
import { studentApi } from "../../../service"

/**
 * Search and filters for the students list.
 *
 * Every filter is a label above a control, which is what Field is; the three
 * that fetch their options share one hook rather than three copies of the same
 * loading/error/retry state.
 *
 * A loading select is disabled with a placeholder saying so, rather than
 * carrying a fake "Loading departments..." option — that option was selectable,
 * and choosing it filtered by the empty string.
 */

const GENDERS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
]

const STATUSES = [
  { value: "Active", label: "Active" },
  { value: "Graduated", label: "Graduated" },
  { value: "Dropped", label: "Dropped" },
  { value: "Inactive", label: "Inactive" },
  { value: "", label: "All Statuses" },
]

const ALLOCATION = [
  { value: "true", label: "Allocated Room" },
  { value: "false", label: "No Allocation" },
]

const DAY_SCHOLAR = [
  { value: "true", label: "Day Scholar" },
  { value: "false", label: "Hosteller" },
]

const PAGE_SIZES = ["10", "20", "50", "100", "200"].map((value) => ({ value, label: value }))

/** The filters that narrow the list, as opposed to search and page size. */
const NARROWING = [
  "hostelId", "unitNumber", "roomNumber", "department", "degree", "batch",
  "gender", "status", "hasAllocation", "isDayScholar",
  "admissionDateFrom", "admissionDateTo",
]

const toOptions = (values) => values.map((value) => ({ value, label: value }))

/** A Select whose options are fetched, so it can be loading or have failed. */
const AsyncSelect = ({ label, placeholder, source, value, onChange }) => (
  <Field
    label={label}
    error={source.error ? (
      <HStack gap="small" align="center">
        <span>{source.error}</span>
        <Button onClick={source.reload} variant="ghost" size="sm" disabled={source.loading}>Retry</Button>
      </HStack>
    ) : undefined}
  >
    <Select
      value={value}
      onChange={onChange}
      disabled={source.loading}
      placeholder={source.loading ? "Loading…" : placeholder}
      options={toOptions(source.options)}
    />
  </Field>
)

const StudentFilterSection = ({ filters, updateFilter, resetFilters, hostels, setPageSize, missingOptions = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const departments = useAsyncOptions(studentApi.getDepartmentList, [], "departments")
  const degrees = useAsyncOptions(studentApi.getDegreesList, [], "degrees")
  const batches = useAsyncOptions(
    () => studentApi.getBatchList({ degree: filters.degree || undefined, department: filters.department || undefined }),
    [filters.degree, filters.department],
    "batches",
  )

  // Narrowing the degree or department can strip the chosen batch out of the
  // list, which would otherwise leave the filter applied but unnamed.
  useEffect(() => {
    if (batches.loading || !filters.batch) return
    if (!batches.options.includes(filters.batch)) updateFilter("batch", "")
  }, [batches.loading, batches.options, filters.batch, updateFilter])

  const activeFilterCount =
    NARROWING.filter((key) => filters[key]).length + (filters.missingOptions?.length > 0 ? 1 : 0)

  return (
    <Card style={{ marginTop: "var(--spacing-6)", overflow: "visible" }} padding="p-4">
      <HStack gap="small" align="center">
        <div style={{ flex: 1 }}>
          <Input
            type="text"
            placeholder="Search by name, roll number, or email..."
            value={filters.searchTerm}
            onChange={(e) => updateFilter("searchTerm", e.target.value)}
            icon={<Search />}
            aria-label="Search students"
          />
        </div>
        <Button onClick={() => setIsExpanded(!isExpanded)} variant="secondary" size="sm" aria-expanded={isExpanded}>
          <SlidersHorizontal />
          {isExpanded ? "Less" : "More"}
          {activeFilterCount > 0 && !isExpanded && <Badge variant="primary" size="small">{activeFilterCount}</Badge>}
          {isExpanded ? <ChevronUp /> : <ChevronDown />}
        </Button>
        <Button onClick={resetFilters} variant="ghost" size="sm">
          <RotateCcw /> Reset
        </Button>
      </HStack>

      {isExpanded && (
        <VStack gap="medium" style={{ marginTop: "var(--spacing-4)" }}>
          <Divider spacing="none" />

          <Grid cols={3} gap={4} style={{ paddingTop: "var(--spacing-4)" }}>
            {hostels.length > 0 && (
              <Field label="Hostel">
                <Select
                  value={filters.hostelId}
                  onChange={(e) => updateFilter("hostelId", e.target.value)}
                  placeholder="All Hostels"
                  options={hostels.map((hostel) => ({ value: hostel._id || hostel.id, label: hostel.name || hostel }))}
                />
              </Field>
            )}

            <Field label="Unit">
              <Input type="text" placeholder="Unit number" value={filters.unitNumber} onChange={(e) => updateFilter("unitNumber", e.target.value)} />
            </Field>

            <Field label="Room Number">
              <Input type="text" placeholder="Room number" value={filters.roomNumber} onChange={(e) => updateFilter("roomNumber", e.target.value)} />
            </Field>

            <AsyncSelect
              label="Department"
              placeholder="All Departments"
              source={departments}
              value={filters.department}
              onChange={(e) => updateFilter("department", e.target.value)}
            />

            <AsyncSelect
              label="Degree"
              placeholder="All Degrees"
              source={degrees}
              value={filters.degree}
              onChange={(e) => updateFilter("degree", e.target.value)}
            />

            <Field label="Gender">
              <Select value={filters.gender} onChange={(e) => updateFilter("gender", e.target.value)} placeholder="All Genders" options={GENDERS} />
            </Field>

            <AsyncSelect
              label="Batch"
              placeholder="All Batches"
              source={batches}
              value={filters.batch}
              onChange={(e) => updateFilter("batch", e.target.value)}
            />

            <Field label="Status">
              <Select value={filters.status} onChange={(e) => updateFilter("status", e.target.value)} options={STATUSES} />
            </Field>

            <Field label="Allocation Status">
              <Select value={filters.hasAllocation} onChange={(e) => updateFilter("hasAllocation", e.target.value)} placeholder="All Students" options={ALLOCATION} />
            </Field>

            <Field label="Day Scholar">
              <Select value={filters.isDayScholar} onChange={(e) => updateFilter("isDayScholar", e.target.value)} placeholder="All Students" options={DAY_SCHOLAR} />
            </Field>

            <Field label="Students per page">
              <Select value={filters.studentsPerPage} onChange={(e) => setPageSize(e.target.value)} options={PAGE_SIZES} />
            </Field>

            {missingOptions.length > 0 && (
              <MultiSelectDropdown
                label="Missing Information"
                options={missingOptions}
                selectedValues={filters.missingOptions || []}
                onChange={(selectedValues) => updateFilter("missingOptions", selectedValues)}
                placeholder="Select missing fields..."
              />
            )}
          </Grid>

          <Grid cols={2} gap={4}>
            <Field label="Admission Date From">
              <DatePicker
                name="admissionDateFrom"
                value={filters.admissionDateFrom}
                onChange={(e) => updateFilter("admissionDateFrom", e.target.value)}
                placeholder="Select start date"
              />
            </Field>

            <Field label="Admission Date To">
              <DatePicker
                name="admissionDateTo"
                value={filters.admissionDateTo}
                onChange={(e) => updateFilter("admissionDateTo", e.target.value)}
                placeholder="Select end date"
                min={filters.admissionDateFrom}
              />
            </Field>
          </Grid>
        </VStack>
      )}
    </Card>
  )
}

export default StudentFilterSection
