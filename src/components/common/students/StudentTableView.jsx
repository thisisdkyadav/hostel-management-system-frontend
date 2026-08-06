import React from "react"
import { FaSortAmountDown, FaSortAmountUp, FaUserGraduate } from "react-icons/fa"
import { DataTable } from "czero/react"
import { getMediaUrl } from "../../../utils/mediaUtils"
import { Text } from "@/components/ui"

const StudentTableView = ({ currentStudents, sortField, sortDirection, handleSort, viewStudentDetails, loading = false }) => {
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
          <div style={{ flexShrink: 0, height: "var(--avatar-sm)", width: "var(--avatar-sm)", borderRadius: "var(--radius-full)", backgroundColor: "var(--color-primary-bg)", display: "flex", alignItems: "center", justifyContent: "center", }} >
            {student.profileImage ? (
              <img src={getMediaUrl(student.profileImage)} alt={student.name} style={{ height: "var(--avatar-sm)", width: "var(--avatar-sm)", borderRadius: "var(--radius-full)", objectFit: "cover", }} />
            ) : (
              <FaUserGraduate style={{ height: "var(--icon-md)", width: "var(--icon-md)", color: "var(--color-primary)" }} />
            )}
          </div>
          <div style={{ marginLeft: "var(--spacing-3)" }}>
            <Text as="div" weight="medium" color="primary" size="sm">
              {student.name}
            </Text>
            <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "150px", }} >
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
        <Text as="span" size="sm" color="body" weight="medium">
          {student.rollNumber}
        </Text>
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
        <span style={{ padding: "var(--spacing-1) var(--spacing-2)", display: "inline-flex", fontSize: "var(--font-size-xs)", lineHeight: "1.25", fontWeight: "var(--font-weight-medium)", borderRadius: "var(--radius-full)", backgroundColor: "var(--color-primary-bg)", color: "var(--color-primary)", }} >
          {student.hostel}
        </span>
      ),
    },
    {
      header: "Batch",
      key: "batch",
      className: "hidden lg:table-cell",
      render: (student) => (
        <Text as="span" size="sm" color="body" weight="medium">
          {student.batch || "—"}
        </Text>
      ),
    },
    {
      header: "Room",
      key: "room",
      className: "hidden sm:table-cell",
      render: (student) => (
        <Text as="span" size="sm" color="tertiary" weight="medium">
          {student.displayRoom}
        </Text>
      ),
    },
  ]

  return <DataTable columns={columns} data={currentStudents} emptyMessage="Try changing your search or filter criteria" onRowClick={viewStudentDetails} loading={loading} />
}

export default StudentTableView
