import React, { useState, useEffect, useRef } from "react"
import { useStudents } from "../../../hooks/useStudents"
import { FaSearch, FaFilter, FaUserGraduate, FaUniversity, FaCalendarAlt } from "react-icons/fa"

const SelectStudentsForm = ({ targetType, targets, onChange, hostels, departments, degrees }) => {
  if (targetType === "all") return null

  const [selectedStudents, setSelectedStudents] = useState([])

  const { students, loading, filters, updateFilter } = useStudents({
    autoFetch: true,
    perPage: 10,
    initialFilters: {
      search: "",
    },
  })

  useEffect(() => {
    if (targetType === "specific") {
      setSelectedStudents(targets.specific || [])
    }
  }, [targetType, targets.specific])

  const handleStudentSelection = (student) => {
    const isSelected = selectedStudents.some((s) => s.id === student.id)

    let updatedStudents
    if (isSelected) {
      updatedStudents = selectedStudents.filter((s) => s.id !== student.id)
    } else {
      updatedStudents = [...selectedStudents, student]
    }

    setSelectedStudents(updatedStudents)
    onChange("specific", updatedStudents)
  }

  const handleHostelChange = (e) => {
    const { value, checked } = e.target
    let updatedHostels = [...targets.hostelIds]

    if (checked) {
      updatedHostels.push(value)
    } else {
      updatedHostels = updatedHostels.filter((id) => id !== value)
    }

    onChange("hostelIds", updatedHostels)
  }

  const handleDepartmentChange = (e) => {
    const { value, checked } = e.target
    let updatedDepartments = [...targets.departments]

    if (checked) {
      updatedDepartments.push(value)
    } else {
      updatedDepartments = updatedDepartments.filter((dept) => dept !== value)
    }

    onChange("departments", updatedDepartments)
  }

  const handleDegreeChange = (e) => {
    const { value, checked } = e.target
    let updatedDegrees = [...targets.degrees]

    if (checked) {
      updatedDegrees.push(value)
    } else {
      updatedDegrees = updatedDegrees.filter((deg) => deg !== value)
    }

    onChange("degrees", updatedDegrees)
  }

  switch (targetType) {
    case "hostel":
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          <label style={{ display: 'block', color: 'var(--color-text-body)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Select Hostels</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-3)' }}>
            {hostels?.map((hostel) => (
              <div key={hostel.id} style={{ display: 'flex', alignItems: 'center' }}>
                <input type="checkbox" id={`hostel-${hostel.id}`} value={hostel.id} checked={targets.hostelIds.includes(hostel.id)} onChange={handleHostelChange} style={{ height: 'var(--spacing-4)', width: 'var(--spacing-4)', accentColor: 'var(--color-primary)', borderColor: 'var(--input-border)', borderRadius: 'var(--radius-sm)' }} />
                <label htmlFor={`hostel-${hostel.id}`} style={{ marginLeft: 'var(--spacing-2)', display: 'block', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-body)' }}>
                  {hostel.name}
                </label>
              </div>
            ))}
          </div>
        </div>
      )

    case "department":
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          <label style={{ display: 'block', color: 'var(--color-text-body)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Select Departments</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-3)' }}>
            {departments?.map((department) => (
              <div key={department} style={{ display: 'flex', alignItems: 'center' }}>
                <input type="checkbox" id={`dept-${department}`} value={department} checked={targets.departments.includes(department)} onChange={handleDepartmentChange} style={{ height: 'var(--spacing-4)', width: 'var(--spacing-4)', accentColor: 'var(--color-primary)', borderColor: 'var(--input-border)', borderRadius: 'var(--radius-sm)' }} />
                <label htmlFor={`dept-${department}`} style={{ marginLeft: 'var(--spacing-2)', display: 'block', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-body)' }}>
                  {department}
                </label>
              </div>
            ))}
          </div>
        </div>
      )

    case "degree":
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          <label style={{ display: 'block', color: 'var(--color-text-body)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Select Degrees</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-3)' }}>
            {degrees?.map((degree) => (
              <div key={degree} style={{ display: 'flex', alignItems: 'center' }}>
                <input type="checkbox" id={`degree-${degree}`} value={degree} checked={targets.degrees.includes(degree)} onChange={handleDegreeChange} style={{ height: 'var(--spacing-4)', width: 'var(--spacing-4)', accentColor: 'var(--color-primary)', borderColor: 'var(--input-border)', borderRadius: 'var(--radius-sm)' }} />
                <label htmlFor={`degree-${degree}`} style={{ marginLeft: 'var(--spacing-2)', display: 'block', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-body)' }}>
                  {degree}
                </label>
              </div>
            ))}
          </div>
        </div>
      )

    case "admission_year":
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          <label style={{ display: 'block', color: 'var(--color-text-body)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Admission Year Range</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-4)' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-1)' }}>Start Year</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 'var(--spacing-3)', top: 'var(--spacing-3)', color: 'var(--color-text-placeholder)' }}>
                  <FaCalendarAlt />
                </div>
                <input
                  type="number"
                  min="2000"
                  max="2099"
                  step="1"
                  value={targets.admissionYearStart}
                  onChange={(e) => onChange("admissionYearStart", e.target.value)}
                  style={{ width: '100%', padding: 'var(--input-padding)', paddingLeft: 'var(--spacing-10)', border: `var(--border-1) solid var(--input-border)`, borderRadius: 'var(--radius-lg)', outline: 'none', transition: 'var(--transition-colors)' }}
                  onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--input-border-focus)' }}
                  onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--input-border)' }}
                  placeholder="2020"
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-1)' }}>End Year</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 'var(--spacing-3)', top: 'var(--spacing-3)', color: 'var(--color-text-placeholder)' }}>
                  <FaCalendarAlt />
                </div>
                <input
                  type="number"
                  min="2000"
                  max="2099"
                  step="1"
                  value={targets.admissionYearEnd}
                  onChange={(e) => onChange("admissionYearEnd", e.target.value)}
                  style={{ width: '100%', padding: 'var(--input-padding)', paddingLeft: 'var(--spacing-10)', border: `var(--border-1) solid var(--input-border)`, borderRadius: 'var(--radius-lg)', outline: 'none', transition: 'var(--transition-colors)' }}
                  onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--input-border-focus)' }}
                  onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--input-border)' }}
                  placeholder="2023"
                />
              </div>
            </div>
          </div>
        </div>
      )

    case "specific":
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          <label style={{ display: 'block', color: 'var(--color-text-body)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Select Specific Students</label>

          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 'var(--spacing-3)', top: 'var(--spacing-3)', color: 'var(--color-text-placeholder)' }}>
              <FaSearch />
            </div>
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => updateFilter("searchTerm", e.target.value)}
              style={{ width: '100%', padding: 'var(--input-padding)', paddingLeft: 'var(--spacing-10)', border: `var(--border-1) solid var(--input-border)`, borderRadius: 'var(--radius-lg)', outline: 'none', transition: 'var(--transition-colors)' }}
              onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--input-border-focus)' }}
              onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--input-border)' }}
              placeholder="Search by name, email, or roll number"
            />
          </div>

          <div style={{ marginTop: 'var(--spacing-3)', border: `var(--border-1) solid var(--color-border-primary)`, borderRadius: 'var(--radius-lg)', maxHeight: '240px', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 'var(--spacing-4)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <div style={{ display: 'inline-block', width: 'var(--spacing-6)', height: 'var(--spacing-6)', marginRight: 'var(--spacing-2)', border: 'var(--border-2) solid var(--color-border-primary)', borderTop: 'var(--border-2) solid var(--color-primary)', borderRadius: 'var(--radius-full)', animation: 'spin 1s linear infinite' }}></div>
                Loading students...
              </div>
            ) : students.length === 0 ? (
              <div style={{ padding: 'var(--spacing-4)', textAlign: 'center', color: 'var(--color-text-muted)' }}>{filters.searchTerm ? "No students found matching your search" : "Type to search for students"}</div>
            ) : (
              <ul style={{ borderTop: 'none' }}>
                {students.map((student) => {
                  const isSelected = selectedStudents.some((s) => s.id === student.id)
                  return (
                    <li key={student.id} style={{ padding: 'var(--spacing-3)', display: 'flex', alignItems: 'center', cursor: 'pointer', backgroundColor: isSelected ? 'var(--color-info-bg-light)' : 'transparent', borderBottom: `var(--border-1) solid var(--color-border-primary)` }} onClick={() => handleStudentSelection(student)} onMouseEnter={(e) => !isSelected && (e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)')} onMouseLeave={(e) => !isSelected && (e.currentTarget.style.backgroundColor = 'transparent')}>
                      <input type="checkbox" checked={isSelected} onChange={() => {}} style={{ height: 'var(--spacing-4)', width: 'var(--spacing-4)', accentColor: 'var(--color-primary)', borderColor: 'var(--input-border)', borderRadius: 'var(--radius-sm)' }} />
                      <div style={{ marginLeft: 'var(--spacing-3)' }}>
                        <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>{student.name}</p>
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                          {student.email} • {student.rollNumber || "No Roll Number"}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <div style={{ marginTop: 'var(--spacing-2)' }}>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{selectedStudents.length} student(s) selected</p>
          </div>
        </div>
      )

    default:
      return null
  }
}

export default SelectStudentsForm
