import { formatStageLabel, formatStatusLabel } from "@/components/por/porStatus"
import { shouldShowStudentColumn } from "./listView"

export const csvDateTime = (value) => {
  if (!value) return ""
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString()
}

export const escapeCsvValue = (value) => {
  const str = String(value ?? "")
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
}

// Column set for the POR CSV export. Mirrors the on-screen table's visibility:
// student identity columns are dropped for the student's own view (same rule as the table).

export const buildPorCsvColumns = (viewer) => {
  const columns = []

  if (shouldShowStudentColumn(viewer)) {
    columns.push(
      { header: "Student Name", value: (r) => r?.student?.name },
      { header: "Roll Number", value: (r) => r?.student?.rollNumber },
      { header: "Email", value: (r) => r?.student?.email },
      { header: "Department", value: (r) => r?.student?.department },
      { header: "Degree", value: (r) => r?.student?.degree },
      { header: "Batch", value: (r) => r?.student?.batch },
    )
  }

  columns.push(
    { header: "Club", value: (r) => r?.club?.name },
    { header: "POR Category", value: (r) => r?.porCategoryName || r?.porCategory?.name },
    { header: "Position Title", value: (r) => r?.positionTitle },
    { header: "Tenure", value: (r) => r?.tenure },
    { header: "Status", value: (r) => formatStatusLabel(r?.status) },
    { header: "Current Stage", value: (r) => formatStageLabel(r?.currentApprovalStage) },
    {
      header: "Current Approver(s)",
      value: (r) => {
        const approvers = Array.isArray(r?.currentApproverUsers) ? r.currentApproverUsers : []
        const names = approvers.map((user) => user?.name).filter(Boolean)
        if (names.length) return names.join("; ")
        return r?.currentApproverUser?.name || ""
      },
    },
    { header: "Disciplinary Action", value: (r) => (r?.hasDisciplinaryAction ? "Yes" : "No") },
    { header: "Disciplinary Details", value: (r) => r?.disciplinaryActionDetails },
    { header: "Revision Count", value: (r) => r?.revisionCount ?? 0 },
    { header: "Rejection Reason", value: (r) => r?.rejectionReason },
    { header: "Submitted On", value: (r) => csvDateTime(r?.createdAt) },
    { header: "Last Updated", value: (r) => csvDateTime(r?.updatedAt) },
    { header: "Approved On", value: (r) => csvDateTime(r?.approvedAt) },
  )

  return columns
}

export const buildPorCsvContent = (requests = [], viewer) => {
  const columns = buildPorCsvColumns(viewer)
  const headerRow = columns.map((col) => col.header)
  const dataRows = requests.map((request) => columns.map((col) => col.value(request)))
  return [headerRow, ...dataRows].map((row) => row.map(escapeCsvValue).join(",")).join("\n")
}

export const getFilenameFromUrl = (url, fallback = "document.pdf") => {
  const normalized = String(url || "").trim()
  if (!normalized) return fallback
  if (normalized.startsWith("media://")) return fallback

  try {
    const parsed = new URL(normalized)
    const candidate = decodeURIComponent(parsed.pathname.split("/").pop() || "")
    return candidate || fallback
  } catch {
    const candidate = decodeURIComponent(normalized.split("/").pop()?.split("?")[0] || "")
    return candidate || fallback
  }
}
