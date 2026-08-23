import { useMemo } from "react"
import { Avatar, Badge, DataTable, Text, VStack } from "hzero"
import HoverPanel from "../HoverPanel"
import StudentPeekPanel from "./StudentPeekPanel"
import { getMediaUrl } from "../../../utils/mediaUtils"

/**
 * The students table.
 *
 * Sorting happens on the server — the page holds one slice of a set it cannot
 * see — so the columns are declared sortable and the order comes back from
 * useStudents. The header used to be rebuilt here out of a div and an onClick,
 * which meant it could not be tabbed to or operated by keyboard; DataTable's
 * own header does that properly now that it takes controlled sort.
 */

const StudentTableView = ({ currentStudents, sortField, sortDirection, handleSort, viewStudentDetails, loading = false }) => {
  const columns = useMemo(
    () => [
      {
        key: "name",
        header: "Student",
        render: (student) => (
          <div className="flex items-center gap-[var(--spacing-3)] min-w-0">
            <Avatar
              src={student.profileImage ? getMediaUrl(student.profileImage) : undefined}
              name={student.name}
              size="small"
            />
            <HoverPanel
              className="student-table__name-hover"
              placement="outside-left"
              align="start"
              content={<StudentPeekPanel student={student} variant="directory" />}
            >
              <VStack gap="none" className="min-w-0">
                <Text as="div" size="sm" weight="medium" color="primary">{student.name}</Text>
                <Text as="div" size="xs" color="muted" className="truncate max-w-[15rem]">{student.email}</Text>
              </VStack>
            </HoverPanel>
          </div>
        ),
      },
      {
        key: "rollNumber",
        header: "Roll Number",
        sortable: false,
        render: (student) => <Text as="span" size="sm" color="body" weight="medium">{student.rollNumber}</Text>,
      },
      {
        key: "hostel",
        header: "Hostel",
        className: "hidden md:table-cell",
        render: (student) => <Badge variant="primary" soft size="small">{student.hostel}</Badge>,
      },
      {
        key: "batch",
        header: "Batch",
        className: "hidden lg:table-cell",
        sortable: false,
        render: (student) => <Text as="span" size="sm" color="body" weight="medium">{student.batch || "—"}</Text>,
      },
      {
        key: "room",
        header: "Room",
        className: "hidden sm:table-cell",
        sortable: false,
        render: (student) => <Text as="span" size="sm" color="tertiary" weight="medium">{student.displayRoom}</Text>,
      },
    ],
    []
  )

  return (
    <DataTable
      columns={columns}
      data={currentStudents}
      // No handler means nothing can act on a sort, so the headers should not
      // offer one — UpdateAllocationModal shows a fixed preview list.
      sortable={Boolean(handleSort)}
      sortKey={sortField}
      sortDir={sortDirection}
      onSortChange={handleSort}
      emptyMessage="Try changing your search or filter criteria"
      onRowClick={viewStudentDetails}
      loading={loading}
    />
  )
}

export default StudentTableView
