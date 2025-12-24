import React, { useState, useEffect } from "react"
import { BsFilterRight } from "react-icons/bs"
import { MdClearAll } from "react-icons/md"
import { FaSearch } from "react-icons/fa"
import SimpleDatePicker from "../SimpleDatePicker"
import MultiSelectDropdown from "../MultiSelectDropdown"
import Button from "../Button"
import { getDepartmentList, getDegreesList } from "../../../services/studentService"

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
      const departmentData = await getDepartmentList()
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
      const degreesData = await getDegreesList()
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

  const inputStyle = { width: '100%', padding: 'var(--spacing-2-5)', border: 'var(--border-1) solid var(--color-border-input)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-body)', fontSize: 'var(--font-size-sm)' }
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
          <div style={{ position: 'relative' }}>
            <input type="text" placeholder="Search by name, roll number, or email..." style={{ ...inputStyle, paddingLeft: 'var(--spacing-10)', paddingRight: 'var(--spacing-4)', paddingTop: 'var(--spacing-3)', paddingBottom: 'var(--spacing-3)', borderRadius: 'var(--radius-xl)' }} value={filters.searchTerm} onChange={(e) => updateFilter("searchTerm", e.target.value)}
            />
            <FaSearch style={{ position: 'absolute', left: 'var(--spacing-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-disabled)' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', rowGap: 'var(--spacing-4)', columnGap: 'var(--spacing-4)' }}>
          {hostels.length > 0 && (
            <div>
              <label style={labelStyle}>Hostel</label>
              <select style={inputStyle} value={filters.hostelId} onChange={(e) => updateFilter("hostelId", e.target.value)}>
                <option value="">All Hostels</option>
                {hostels.map((hostel, index) => (
                  <option key={index} value={hostel._id || hostel.id}>
                    {hostel.name || hostel}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label style={labelStyle}>Unit</label>
            <input type="text" placeholder="Unit number" style={inputStyle} value={filters.unitNumber} onChange={(e) => updateFilter("unitNumber", e.target.value)} />
          </div>

          <div>
            <label style={labelStyle}>Room Number</label>
            <input type="text" placeholder="Room number" style={inputStyle} value={filters.roomNumber} onChange={(e) => updateFilter("roomNumber", e.target.value)} />
          </div>

          <div>
            <label style={labelStyle}>Department</label>
            <select style={inputStyle} value={filters.department} onChange={(e) => updateFilter("department", e.target.value)} disabled={loading}>
              <option value="">All Departments</option>
              {loading ? (
                <option value="" disabled>
                  Loading departments...
                </option>
              ) : error ? (
                <option value="" disabled>
                  Error loading departments
                </option>
              ) : (
                departments.map((dept, index) => (
                  <option key={index} value={dept}>
                    {dept}
                  </option>
                ))
              )}
            </select>
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
            <select style={inputStyle} value={filters.degree} onChange={(e) => updateFilter("degree", e.target.value)} disabled={degreesLoading}>
              <option value="">All Degrees</option>
              {degreesLoading ? (
                <option value="" disabled>
                  Loading degrees...
                </option>
              ) : degreesError ? (
                <option value="" disabled>
                  Error loading degrees
                </option>
              ) : (
                degreeOptions.map((degree, index) => (
                  <option key={index} value={degree}>
                    {degree}
                  </option>
                ))
              )}
            </select>
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
            <select style={inputStyle} value={filters.gender} onChange={(e) => updateFilter("gender", e.target.value)}>
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Status</label>
            <select style={inputStyle} value={filters.status} onChange={(e) => updateFilter("status", e.target.value)}>
              <option value="Active">Active</option>
              <option value="Graduated">Graduated</option>
              <option value="Dropped">Dropped</option>
              <option value="Inactive">Inactive</option>
              <option value="">All Statuses</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Allocation Status</label>
            <select style={inputStyle} value={filters.hasAllocation} onChange={(e) => updateFilter("hasAllocation", e.target.value)}>
              <option value="">All Students</option>
              <option value="true">Allocated Room</option>
              <option value="false">No Allocation</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Day Scholar</label>
            <select style={inputStyle} value={filters.isDayScholar} onChange={(e) => updateFilter("isDayScholar", e.target.value)}>
              <option value="">All Students</option>
              <option value="true">Day Scholar</option>
              <option value="false">Hosteller</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Students per page</label>
            <select style={inputStyle} value={filters.studentsPerPage} onChange={(e) => setPageSize(e.target.value)}>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
            </select>
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
