import React from "react"
import { FaSortAmountDown, FaSortAmountUp, FaUserGraduate } from "react-icons/fa"
import BaseTable from "../table/BaseTable"
import { getMediaUrl } from "../../../utils/mediaUtils"

const StudentTableView = ({ currentStudents, sortField, sortDirection, handleSort, viewStudentDetails }) => {
  const columns = [
    {
      header: "Student",
      key: "name",
      customHeaderRender: () => (
        <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => handleSort("name")}>
          <span>Student</span>
          {sortField === "name" && (
            <span style={{ marginLeft: "var(--spacing-2)", color: "var(--color-primary)" }}>
              {sortDirection === "asc" ? <FaSortAmountUp style={{ display: "inline" }} /> : <FaSortAmountDown style={{ display: "inline" }} />}
            </span>
          )}
        </div>
      ),
      render: (student) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              flexShrink: 0,
              height: "var(--avatar-sm)",
              width: "var(--avatar-sm)",
              borderRadius: "var(--radius-full)",
              backgroundColor: "var(--color-primary-bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {student.profileImage ? (
              <img
                src={getMediaUrl(student.profileImage)}
                alt={student.name}
                style={{
                  height: "var(--avatar-sm)",
                  width: "var(--avatar-sm)",
                  borderRadius: "var(--radius-full)",
                  objectFit: "cover",
                }}
              />
            ) : (
              <FaUserGraduate style={{ height: "var(--icon-md)", width: "var(--icon-md)", color: "var(--color-primary)" }} />
            )}
          </div>
          <div style={{ marginLeft: "var(--spacing-3)" }}>
            <div
              style={{
                fontWeight: "var(--font-weight-medium)",
                color: "var(--color-text-primary)",
                fontSize: "var(--font-size-sm)",
              }}
            >
              {student.name}
            </div>
            <div
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--color-text-muted)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "150px",
              }}
            >
              {student.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Roll Number",
      key: "rollNumber",
      render: (student) => (
        <span
          style={{
            fontSize: "var(--font-size-sm)",
            color: "var(--color-text-body)",
            fontWeight: "var(--font-weight-medium)",
          }}
        >
          {student.rollNumber}
        </span>
      ),
    },
    {
      header: "Hostel",
      key: "hostel",
      className: "hidden md:table-cell",
      customHeaderRender: () => (
        <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => handleSort("hostel")}>
          <span>Hostel</span>
          {sortField === "hostel" && (
            <span style={{ marginLeft: "var(--spacing-2)", color: "var(--color-primary)" }}>
              {sortDirection === "asc" ? <FaSortAmountUp style={{ display: "inline" }} /> : <FaSortAmountDown style={{ display: "inline" }} />}
            </span>
          )}
        </div>
      ),
      render: (student) => (
        <span
          style={{
            padding: "var(--spacing-1) var(--spacing-2)",
            display: "inline-flex",
            fontSize: "var(--font-size-xs)",
            lineHeight: "1.25",
            fontWeight: "var(--font-weight-medium)",
            borderRadius: "var(--radius-full)",
            backgroundColor: "var(--color-primary-bg)",
            color: "var(--color-primary)",
          }}
        >
          {student.hostel}
        </span>
      ),
    },
    {
      header: "Room",
      key: "room",
      className: "hidden sm:table-cell",
      render: (student) => (
        <span
          style={{
            fontSize: "var(--font-size-sm)",
            color: "var(--color-text-tertiary)",
            fontWeight: "var(--font-weight-medium)",
          }}
        >
          {student.displayRoom}
        </span>
      ),
    },
  ]

  return <BaseTable columns={columns} data={currentStudents} emptyMessage="No students to display" onRowClick={viewStudentDetails} />
}

export default StudentTableView
