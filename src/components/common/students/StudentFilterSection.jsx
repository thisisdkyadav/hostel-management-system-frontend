import React, { useState, useEffect } from "react"
import { BsFilterRight } from "react-icons/bs"
import { MdClearAll } from "react-icons/md"
import { FaSearch } from "react-icons/fa"
import SimpleDatePicker from "../SimpleDatePicker"
import MultiSelectDropdown from "../MultiSelectDropdown"
import Button from "../Button"
import Input from "../ui/Input"
import Select from "../ui/Select"
import { studentApi } from "../../../service"

const StudentFilterSection = ({ filters, updateFilter, resetFilters, hostels, degrees, setPageSize, dayScholarOptions, missingOptions = [] }) => {
  const [departments, setDepartments] = useState([])
  const [degreeOptions, setDegreeOptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [degreesLoading, setDegreesLoading] = useState(false)
  const [degreesError, setDegreesError] = useState(null)

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

  const labelStyle = { display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-1-5)' }

  return (
    <div style={{ marginTop: 'var(--spacing-6)', backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', padding: 'var(--spacing-6)', overflow: 'visible' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)', paddingBottom: 'var(--spacing-3)', borderBottom: 'var(--border-1) solid var(--color-border-light)' }}>
        <h3 style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-body)', display: 'flex', alignItems: 'center' }}>
          <BsFilterRight style={{ marginRight: 'var(--spacing-2)', color: 'var(--color-primary)', fontSize: 'var(--font-size-lg)' }} /> Filter Students
        </h3>
        <Button onClick={resetFilters} variant="ghost" size="small" icon={<MdClearAll />}>
          Reset Filters
        </Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
        <div>
          <Input
            type="text"
            placeholder="Search by name, roll number, or email..."
            value={filters.searchTerm}
            onChange={(e) => updateFilter("searchTerm", e.target.value)}
            icon={<FaSearch />}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', rowGap: 'var(--spacing-4)', columnGap: 'var(--spacing-4)' }}>
          {hostels.length > 0 && (
            <div>
              <label style={labelStyle}>Hostel</label>
              <Select
                value={filters.hostelId}
                onChange={(e) => updateFilter("hostelId", e.target.value)}
                placeholder="All Hostels"
                options={hostels.map((hostel) => ({
                  value: hostel._id || hostel.id,
                  label: hostel.name || hostel
                }))}
              />
            </div>
          )}

          <div>
            <label style={labelStyle}>Unit</label>
            <Input type="text" placeholder="Unit number" value={filters.unitNumber} onChange={(e) => updateFilter("unitNumber", e.target.value)} />
          </div>

          <div>
            <label style={labelStyle}>Room Number</label>
            <Input type="text" placeholder="Room number" value={filters.roomNumber} onChange={(e) => updateFilter("roomNumber", e.target.value)} />
          </div>

          <div>
            <label style={labelStyle}>Department</label>
            <Select
              value={filters.department}
              onChange={(e) => updateFilter("department", e.target.value)}
              disabled={loading}
              placeholder="All Departments"
              options={loading ? [{ value: "", label: "Loading departments..." }] : error ? [{ value: "", label: "Error loading departments" }] : departments.map((dept) => ({ value: dept, label: dept }))}
            />
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', marginTop: 'var(--spacing-1)' }}>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-danger)', marginRight: 'var(--spacing-2)' }}>{error}</p>
                <Button onClick={fetchDepartments} variant="ghost" size="small" disabled={loading}>
                  Retry
                </Button>
              </div>
            )}
          </div>

          <div>
            <label style={labelStyle}>Degree</label>
            <Select
              value={filters.degree}
              onChange={(e) => updateFilter("degree", e.target.value)}
              disabled={degreesLoading}
              placeholder="All Degrees"
              options={degreesLoading ? [{ value: "", label: "Loading degrees..." }] : degreesError ? [{ value: "", label: "Error loading degrees" }] : degreeOptions.map((degree) => ({ value: degree, label: degree }))}
            />
            {degreesError && (
              <div style={{ display: 'flex', alignItems: 'center', marginTop: 'var(--spacing-1)' }}>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-danger)', marginRight: 'var(--spacing-2)' }}>{degreesError}</p>
                <Button onClick={fetchDegrees} variant="ghost" size="small" disabled={degreesLoading}>
                  Retry
                </Button>
              </div>
            )}
          </div>

          <div>
            <label style={labelStyle}>Gender</label>
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
          </div>

          <div>
            <label style={labelStyle}>Status</label>
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
          </div>

          <div>
            <label style={labelStyle}>Allocation Status</label>
            <Select
              value={filters.hasAllocation}
              onChange={(e) => updateFilter("hasAllocation", e.target.value)}
              placeholder="All Students"
              options={[
                { value: "true", label: "Allocated Room" },
                { value: "false", label: "No Allocation" }
              ]}
            />
          </div>

          <div>
            <label style={labelStyle}>Day Scholar</label>
            <Select
              value={filters.isDayScholar}
              onChange={(e) => updateFilter("isDayScholar", e.target.value)}
              placeholder="All Students"
              options={[
                { value: "true", label: "Day Scholar" },
                { value: "false", label: "Hosteller" }
              ]}
            />
          </div>

          <div>
            <label style={labelStyle}>Students per page</label>
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
          </div>

          {missingOptions.length > 0 && (
            <div>
              <MultiSelectDropdown label="Missing Information" options={missingOptions} selectedValues={filters.missingOptions || []} onChange={(selectedValues) => updateFilter("missingOptions", selectedValues)} placeholder="Select missing fields..." />
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-4)', marginTop: 'var(--spacing-2)' }}>
          <div>
            <label style={labelStyle}>Admission Date From</label>
            <SimpleDatePicker selectedDate={filters.admissionDateFrom} onChange={(date) => updateFilter("admissionDateFrom", date)} placeholder="Select start date" />
          </div>

          <div>
            <label style={labelStyle}>Admission Date To</label>
            <SimpleDatePicker selectedDate={filters.admissionDateTo} onChange={(date) => updateFilter("admissionDateTo", date)} placeholder="Select end date" minDate={filters.admissionDateFrom} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentFilterSection
