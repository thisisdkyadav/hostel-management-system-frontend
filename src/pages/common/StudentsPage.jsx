import { useMemo, useState } from "react"
import { Alert, Page, Pagination, Text, useToast } from "hzero"
import PageFooter from "../../components/common/PageFooter"
import StudentsHeader from "../../components/headers/StudentsHeader"
import StudentStats from "../../components/common/students/StudentStats"
import StudentFilterSection from "../../components/common/students/StudentFilterSection"
import StudentDetailModal from "../../components/common/students/StudentDetailModal"
import ImportStudentModal from "../../components/common/students/ImportStudentModal"
import UpdateStudentsModal from "../../components/common/students/UpdateStudentsModal"
import UpdateAllocationModal from "../../components/common/students/UpdateAllocationModal"
import StudentExportModal from "../../components/common/students/StudentExportModal"
import StudentTableView from "../../components/common/students/StudentTableView"
import { useStudents } from "../../hooks/useStudents"
import { useGlobal } from "../../contexts/GlobalProvider"
import { useAuth } from "../../contexts/AuthProvider"
import { hostelApi, studentApi } from "../../service"
import { buildCsvContent } from "@/utils/csvExport"

/**
 * The students list, and the four bulk operations that hang off it.
 *
 * Import, bulk update and allocation are Admin-only; the list, the detail
 * modal and export are open to every role that can reach this route.
 */

const isAdmin = (role) => role === "Admin"

/** Columns that identify a record to the system rather than to a reader. */
const INTERNAL_FIELDS = ["id", "userId", "allocationId"]

const failure = (message, count) => ({
  success: false,
  message,
  total: count,
  successCount: 0,
  errorCount: count,
  results: [],
  errors: [],
})

const countOf = (value) => (Array.isArray(value) ? value.length : 1)

const StudentsPage = () => {
  const { user } = useAuth()
  const { hostelList = [] } = useGlobal()
  const { toast } = useToast()

  const canManage = isAdmin(user?.role)
  const hostels = useMemo(() => (canManage ? hostelList : []), [hostelList, canManage])

  const [selectedStudent, setSelectedStudent] = useState(null)
  const [openModal, setOpenModal] = useState(null)
  const close = () => setOpenModal(null)

  const {
    students, totalCount, loading, error, filters, updateFilter, pagination, totalPages,
    setCurrentPage, setPageSize, sorting, handleSort, resetFilters, refreshStudents,
    importStudents, missingOptions, buildQueryParams,
  } = useStudents({ perPage: 10 })

  const handleImportStudents = async (importedStudents, options = {}) => {
    const total = countOf(importedStudents)
    if (!canManage) return failure("You do not have permission to import students.", total)

    try {
      const result = await importStudents(importedStudents, options)
      if (!result?.success) return failure(result?.error?.message || "Error importing students", total)

      return {
        success: true,
        message: "Import completed",
        total: result?.data?.total ?? total,
        successCount: result?.data?.successCount ?? 0,
        errorCount: result?.data?.errorCount ?? 0,
        results: result?.data?.results || [],
        errors: result?.data?.errors || [],
      }
    } catch (cause) {
      return failure(`An error occurred: ${cause.message}`, total)
    }
  }

  const handleUpdateStudents = async (updatedStudents, _tab, options = {}) => {
    const total = countOf(updatedStudents)
    if (!canManage) return failure("You do not have permission to bulk update students.", total)

    try {
      const response = await studentApi.updateStudents(updatedStudents, options)
      const results = Array.isArray(response?.results) ? response.results : (response?.results ? [response.results] : [])
      const errors = Array.isArray(response?.errors) ? response.errors : []

      refreshStudents()

      return {
        success: true,
        message: response?.message || "Students updated successfully",
        total,
        successCount: results.length,
        errorCount: errors.length,
        results,
        errors,
      }
    } catch (cause) {
      return failure(cause.message || "An error occurred while updating students", total)
    }
  }

  // `silent` is set when this runs as one step of a larger batch, so the batch
  // reports once rather than once per hostel.
  const handleUpdateAllocations = async (allocations, hostelId, { silent = false } = {}) => {
    const deny = "You do not have permission to update allocations."
    if (!canManage) {
      if (!silent) toast.error(deny)
      return { success: false, errors: [{ message: deny }], message: deny }
    }

    try {
      const response = await hostelApi.updateRoomAllocations(allocations, hostelId)
      if (!response.success) {
        const message = response.message || "Failed to update allocations"
        if (!silent) toast.error(message)
        return { success: false, errors: response.errors || [], message }
      }

      refreshStudents()
      const errors = response.errors || []
      if (!silent) {
        if (errors.length > 0) {
          toast.warning(`${errors.length} allocation${errors.length === 1 ? "" : "s"} failed: ${errors.map((e) => `${e.rollNumber}: ${e.message}`).join(", ")}`)
        } else {
          toast.success("Allocations updated.")
        }
        close()
      }
      return { success: true, errors, data: response.data || [], message: response.message || null }
    } catch (cause) {
      const message = cause.message || "An error occurred while updating allocations"
      if (!silent) toast.error(message)
      return { success: false, errors: [{ message }], message }
    }
  }

  const viewStudentDetails = (student) => {
    setSelectedStudent(student)
    setOpenModal("detail")
  }

  /**
   * Every value goes through escapeCsvValue, which neutralises formula
   * injection before quoting. Student names and guardian details are free text
   * a student controls, and a cell beginning `=` is evaluated by the
   * spreadsheet of whoever opens the export.
   */
  const downloadStudentsCsv = (rows, filenamePrefix) => {
    if (rows.length === 0) throw new Error("No students to export")

    const headers = Object.keys(rows[0]).filter((key) => !INTERNAL_FIELDS.includes(key))
    const body = rows.map((student) =>
      headers.map((header) => {
        const value = student[header] ?? ""
        return Array.isArray(value) || typeof value === "object" ? JSON.stringify(value) : value
      })
    )

    const blob = new Blob([buildCsvContent(headers, body)], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `${filenamePrefix}_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleExportStudents = async ({ mode, rollNumbers = [] }) => {
    const skipped = (count, noun) =>
      toast.warning(`${count} ${noun}${count === 1 ? "" : "s"} could not be included in the export.`)

    if (mode === "visible") {
      const userIds = students.map((student) => student.userId).filter(Boolean)
      if (userIds.length === 0) throw new Error("No students to export")
      const response = await studentApi.getStudentsByIds(userIds)
      if (response.errors?.length > 0) skipped(response.errors.length, "student record")
      downloadStudentsCsv(response.data, "students_visible_export")
      return
    }

    if (mode === "filtered") {
      const { page: _page, limit: _limit, ...filterParams } = buildQueryParams()
      const response = await studentApi.exportStudents({ mode: "filters", filters: filterParams })
      downloadStudentsCsv(response.data, "students_filtered_export")
      return
    }

    if (mode === "rollNumbers") {
      if (rollNumbers.length === 0) throw new Error("Upload at least one roll number before exporting.")
      const response = await studentApi.exportStudents({ mode: "rollNumbers", rollNumbers })
      if (response.errors?.length > 0) skipped(response.errors.length, "roll number")
      downloadStudentsCsv(response.data, "students_roll_numbers_export")
    }
  }

  return (
    <Page>
      <StudentsHeader
        onImport={() => setOpenModal("import")}
        onBulkUpdate={() => setOpenModal("update")}
        onUpdateAllocations={() => setOpenModal("allocate")}
        onExport={() => setOpenModal("export")}
        userRole={user?.role}
        canImport={canManage}
        canBulkUpdate={canManage}
        canUpdateAllocations={canManage}
      />

      <Page.Body>
        {error && <Alert type="error">{error}</Alert>}

        <StudentStats />

        <StudentFilterSection
          filters={filters}
          updateFilter={updateFilter}
          resetFilters={resetFilters}
          hostels={hostels}
          setPageSize={setPageSize}
          missingOptions={missingOptions}
        />

        <div className="mt-[var(--spacing-4)]">
          <StudentTableView
            currentStudents={students}
            sortField={sorting.sortField}
            sortDirection={sorting.sortDirection}
            handleSort={handleSort}
            viewStudentDetails={viewStudentDetails}
            loading={loading}
          />
        </div>

        {openModal === "detail" && selectedStudent && (
          <StudentDetailModal
            selectedStudent={selectedStudent}
            setShowStudentDetail={close}
            onUpdate={refreshStudents}
          />
        )}

        {canManage && (
          <>
            <ImportStudentModal isOpen={openModal === "import"} onClose={close} onImport={handleImportStudents} />
            <UpdateStudentsModal isOpen={openModal === "update"} onClose={close} onUpdate={handleUpdateStudents} />
            {openModal === "allocate" && (
              <UpdateAllocationModal isOpen onClose={close} onAllocate={handleUpdateAllocations} />
            )}
          </>
        )}

        <StudentExportModal
          isOpen={openModal === "export"}
          onClose={close}
          onExport={handleExportStudents}
          visibleCount={students.length}
          filteredCount={totalCount}
        />
      </Page.Body>

      <PageFooter
        leftContent={[
          <Text as="span" size="sm" color="muted" key="count">
            Showing <Text as="span" weight="semibold">{loading ? 0 : students.length}</Text> of{" "}
            <Text as="span" weight="semibold">{loading ? 0 : totalCount}</Text> students
          </Text>,
        ]}
        rightContent={[
          <Pagination
            key="pagination"
            currentPage={pagination.currentPage || 1}
            totalPages={totalPages || 0}
            paginate={setCurrentPage}
            compact
            showPageInfo={false}
          />,
        ]}
      />
    </Page>
  )
}

export default StudentsPage
