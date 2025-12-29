import React, { useState, useEffect, useRef } from "react"
import { useStudents } from "../../../hooks/useStudents"
import { FaSearch, FaFilter, FaUserGraduate, FaUniversity, FaCalendarAlt } from "react-icons/fa"
import Input from "../common/ui/Input"
import Checkbox from "../common/ui/Checkbox"

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
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
          <label style={{ display: "block", color: "var(--color-text-body)", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-2)" }}>Select Hostels</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--spacing-3)" }}>
            {hostels?.map((hostel) => (
              <Checkbox key={hostel.id} id={`hostel-${hostel.id}`} value={hostel.id} checked={targets.hostelIds.includes(hostel.id)} onChange={handleHostelChange} label={hostel.name} />
            ))}
          </div>
        </div>
      )

    case "department":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
          <label style={{ display: "block", color: "var(--color-text-body)", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-2)" }}>Select Departments</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--spacing-3)" }}>
            {departments?.map((department) => (
              <Checkbox key={department} id={`dept-${department}`} value={department} checked={targets.departments.includes(department)} onChange={handleDepartmentChange} label={department} />
            ))}
          </div>
        </div>
      )

    case "degree":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
          <label style={{ display: "block", color: "var(--color-text-body)", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-2)" }}>Select Degrees</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--spacing-3)" }}>
            {degrees?.map((degree) => (
              <Checkbox key={degree} id={`degree-${degree}`} value={degree} checked={targets.degrees.includes(degree)} onChange={handleDegreeChange} label={degree} />
            ))}
          </div>
        </div>
      )

    case "admission_year":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
          <label style={{ display: "block", color: "var(--color-text-body)", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-2)" }}>Admission Year Range</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "var(--spacing-4)" }}>
            <div>
              <label style={{ display: "block", color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)", marginBottom: "var(--spacing-1)" }}>Start Year</label>
              <Input type="number" min="2000" max="2099" step="1" value={targets.admissionYearStart} onChange={(e) => onChange("admissionYearStart", e.target.value)} placeholder="2020" icon={<FaCalendarAlt />} />
            </div>
            <div>
              <label style={{ display: "block", color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)", marginBottom: "var(--spacing-1)" }}>End Year</label>
              <Input type="number" min="2000" max="2099" step="1" value={targets.admissionYearEnd} onChange={(e) => onChange("admissionYearEnd", e.target.value)} placeholder="2023" icon={<FaCalendarAlt />} />
            </div>
          </div>
        </div>
      )

    case "specific":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
          <label style={{ display: "block", color: "var(--color-text-body)", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-2)" }}>Select Specific Students</label>

          <Input type="text" value={filters.searchTerm} onChange={(e) => updateFilter("searchTerm", e.target.value)} placeholder="Search by name, email, or roll number" icon={<FaSearch />} />

          <div style={{ marginTop: "var(--spacing-3)", border: `var(--border-1) solid var(--color-border-primary)`, borderRadius: "var(--radius-lg)", maxHeight: "240px", overflowY: "auto" }}>
            {loading ? (
              <div style={{ padding: "var(--spacing-4)", textAlign: "center", color: "var(--color-text-muted)" }}>
                <div
                  style={{
                    display: "inline-block",
                    width: "var(--spacing-6)",
                    height: "var(--spacing-6)",
                    marginRight: "var(--spacing-2)",
                    border: "var(--border-2) solid var(--color-border-primary)",
                    borderTop: "var(--border-2) solid var(--color-primary)",
                    borderRadius: "var(--radius-full)",
                    animation: "spin 1s linear infinite",
                  }}
                ></div>
                Loading students...
              </div>
            ) : students.length === 0 ? (
              <div style={{ padding: "var(--spacing-4)", textAlign: "center", color: "var(--color-text-muted)" }}>{filters.searchTerm ? "No students found matching your search" : "Type to search for students"}</div>
            ) : (
              <ul style={{ borderTop: "none" }}>
                {students.map((student) => {
                  const isSelected = selectedStudents.some((s) => s.id === student.id)
                  return (
                    <li
                      key={student.id}
                      style={{ padding: "var(--spacing-3)", display: "flex", alignItems: "center", cursor: "pointer", backgroundColor: isSelected ? "var(--color-info-bg-light)" : "transparent", borderBottom: `var(--border-1) solid var(--color-border-primary)` }}
                      onClick={() => handleStudentSelection(student)}
                      onMouseEnter={(e) => !isSelected && (e.currentTarget.style.backgroundColor = "var(--color-bg-hover)")}
                      onMouseLeave={(e) => !isSelected && (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <Checkbox checked={isSelected} onChange={() => {}} />
                      <div style={{ marginLeft: "var(--spacing-3)" }}>
                        <p style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-primary)" }}>{student.name}</p>
                        <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                          {student.email} • {student.rollNumber || "No Roll Number"}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <div style={{ marginTop: "var(--spacing-2)" }}>
            <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>{selectedStudents.length} student(s) selected</p>
          </div>
        </div>
      )

    default:
      return null
  }
}

export default SelectStudentsForm
