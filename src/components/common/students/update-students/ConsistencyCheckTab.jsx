import { TriangleAlert } from "lucide-react"
import { Alert, Button, Grid, StatTile, Table, Text, VStack } from "hzero"
import CsvUploader from "@/components/common/CsvUploader"
import { MAX_BULK_RECORDS } from "@/constants/systemLimits"
import { escapeCsvValue as escapeCSV } from "@/utils/csvExport"
import BulkUploadTab, { FieldList } from "./BulkUploadTab"
import PreviewTable from "./PreviewTable"

const TEMPLATE_HEADERS = [
  "rollNumber",
  "name",
  "email",
  "secondaryEmail",
  "facultyAdvisorEmail",
  "phone",
  "profileImage",
  "gender",
  "dateOfBirth",
  "degree",
  "department",
  "year",
  "address",
  "admissionDate",
  "guardian",
  "guardianPhone",
  "guardianEmail",
]

const FIELD_HELP = [
  ["rollNumber", "String. Used to look up the student and check every other filled field."],
  ["email", "Email. Also used the other way: if this matches a student, their roll number is checked."],
  ["other fields", "Optional. Empty cells are ignored. Filled cells are compared to the stored student."],
]

const PREVIEW_COLUMNS = [
  { key: "rollNumber", label: "Roll Number" },
  { key: "email", label: "Email" },
  { key: "name", label: "Name" },
  { key: "filledFieldCount", label: "Filled Fields" },
]

const RESULT_ROW_LIMIT = 25

const asList = (value) => (Array.isArray(value) ? value : [])

const downloadRows = (headers, rows, filenameBase) => {
  if (!Array.isArray(rows) || rows.length === 0) return false

  const csvContent = [
    headers.map(escapeCSV).join(","),
    ...rows.map((row) => headers.map((header) => escapeCSV(row?.[header] ?? "")).join(",")),
  ].join("\n")

  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", `${filenameBase}_${new Date().toISOString().split("T")[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  return true
}

const flattenFieldMismatches = (entries, identity) => (
  asList(entries).flatMap((entry) => asList(entry.mismatches).map((mismatch) => ({
    rollNumber: identity === "email" ? (entry.csvRollNumber || "") : (entry.rollNumber || ""),
    email: identity === "email" ? (entry.csvEmail || "") : (entry.csvEmail || entry.email || ""),
    systemRollNumber: entry.systemRollNumber || "",
    systemEmail: entry.systemEmail || "",
    field: mismatch.field,
    csvValue: mismatch.csvValue ?? "",
    systemValue: mismatch.systemValue ?? "",
  })))
)

const ResultTable = ({ columns, rows, emptyMessage, limit = RESULT_ROW_LIMIT }) => (
  <Table bordered striped>
    <Table.Header>
      <Table.Row>
        {columns.map((column) => (
          <Table.Head key={column.key}>{column.label}</Table.Head>
        ))}
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {rows.length > 0 ? (
        rows.slice(0, limit).map((row, index) => (
          <Table.Row key={`${row.rollNumber || row.email || "row"}-${index}`}>
            {columns.map((column) => (
              <Table.Cell key={column.key}>{row[column.key] || "—"}</Table.Cell>
            ))}
          </Table.Row>
        ))
      ) : (
        <Table.Row>
          <Table.Cell colSpan={columns.length}>
            <Text as="span" size="sm" color="muted">{emptyMessage}</Text>
          </Table.Cell>
        </Table.Row>
      )}
    </Table.Body>
    {rows.length > limit && (
      <Table.Foot>
        <Table.Row>
          <Table.Cell colSpan={columns.length}>
            <Text as="span" size="xs" color="muted">Showing {limit} of {rows.length}. Export the CSV for the full list.</Text>
          </Table.Cell>
        </Table.Row>
      </Table.Foot>
    )}
  </Table>
)

const ExportButton = ({ rows, headers, filename, label, emptyMessage, setError }) => (
  <Button
    variant="secondary"
    size="sm"
    disabled={rows.length === 0}
    onClick={() => {
      const exported = downloadRows(headers, rows, filename)
      if (!exported) setError(emptyMessage)
    }}
  >
    {label}
  </Button>
)

const ConsistencyCheckTab = ({
  error,
  rows,
  summary,
  uploadStatus,
  onDataParsed,
  setError,
}) => {
  const notInSystem = asList(summary?.notInSystem)
  const identityMismatches = asList(summary?.identityMismatches)
  const fieldMismatchesByRoll = flattenFieldMismatches(summary?.fieldMismatchesByRoll, "roll")
  const fieldMismatchesByEmail = flattenFieldMismatches(summary?.fieldMismatchesByEmail, "email")

  return (
    <VStack gap={5}>
      <BulkUploadTab
        title="Check Data Consistency"
        error={error}
        status={rows.length > 0 ? uploadStatus : ""}
        preview={
          <PreviewTable
            columns={PREVIEW_COLUMNS}
            rows={rows.map((row) => ({
              ...row,
              filledFieldCount: Object.keys(row).filter((key) => key !== "csvRow" && row[key]).length,
            }))}
            limit={10}
          />
        }
      >
        <Text as="p" size="sm" color="muted">
          Upload the same student CSV used for bulk updates. The check looks up each row by roll number
          and compares every filled field. Email and roll number are also checked the other way: if the
          email matches a student, their stored roll number is verified, and if the roll number matches,
          their stored email is verified. Rows that are not in the system are counted only — nothing is changed.
        </Text>

        <CsvUploader
          onDataParsed={onDataParsed}
          requiredFields={["rollNumber", "email"]}
          templateFileName="student_consistency_check_template.csv"
          templateHeaders={TEMPLATE_HEADERS}
          maxRecords={MAX_BULK_RECORDS}
          instructionText={<FieldList fields={FIELD_HELP} />}
        />
      </BulkUploadTab>

      {summary && (
        <VStack gap="medium">
          <Grid cols={{ base: 1, sm: 2, xl: 4 }} gap={3}>
            <StatTile label="Rows Checked" value={summary.checkedCount || 0} tone="info" />
            <StatTile label="Found By Roll Number" value={summary.foundByRollCount || 0} tone="primary" />
            <StatTile label="Details Match (By Roll)" value={summary.matchingByRollCount || 0} tone="success" />
            <StatTile label="Not In System" value={summary.notInSystemCount || 0} tone="danger" icon={TriangleAlert} />
          </Grid>

          <Grid cols={{ base: 1, sm: 2, xl: 4 }} gap={3}>
            <StatTile label="Found By Email" value={summary.foundByEmailCount || 0} tone="primary" />
            <StatTile label="Email Not In System" value={summary.emailsNotInSystemCount || 0} tone="warning" />
            <StatTile label="Roll ↔ Email Mismatches" value={summary.identityMismatchCount || 0} tone="danger" />
            <StatTile label="Field Mismatches (By Roll)" value={summary.fieldMismatchByRollCount || 0} tone="warning" />
          </Grid>

          {summary.notInSystemCount > 0 && (
            <Alert type="info">
              {summary.notInSystemCount} uploaded student{summary.notInSystemCount === 1 ? "" : "s"} {summary.notInSystemCount === 1 ? "is" : "are"} not in the system (roll number not found). Those rows are listed only and are not changed.
            </Alert>
          )}

          <VStack gap="small">
            <Text as="div" size="sm" weight="medium" color="body">Not In System (By Roll Number)</Text>
            <ResultTable
              columns={[
                { key: "rollNumber", label: "Roll Number" },
                { key: "email", label: "Email" },
              ]}
              rows={notInSystem}
              emptyMessage="Every uploaded roll number exists in the system."
            />
            <ExportButton
              rows={notInSystem.map((row) => ({ rollNumber: row.rollNumber, email: row.email }))}
              headers={["rollNumber", "email"]}
              filename="consistency_not_in_system"
              label="Export not in system"
              emptyMessage="No missing students to export"
              setError={setError}
            />
          </VStack>

          <VStack gap="small">
            <Text as="div" size="sm" weight="medium" color="body">Roll Number ↔ Email Mismatches</Text>
            <ResultTable
              columns={[
                { key: "type", label: "Check" },
                { key: "csvRollNumber", label: "CSV Roll" },
                { key: "csvEmail", label: "CSV Email" },
                { key: "systemRollNumber", label: "System Roll" },
                { key: "systemEmail", label: "System Email" },
                { key: "message", label: "Issue" },
              ]}
              rows={identityMismatches.map((row) => ({
                ...row,
                type: row.type === "email_to_roll" ? "Email → roll" : "Roll → email",
              }))}
              emptyMessage="Every matched email and roll number pair agrees."
            />
            <ExportButton
              rows={identityMismatches.map((row) => ({
                type: row.type,
                csvRollNumber: row.csvRollNumber,
                csvEmail: row.csvEmail,
                systemRollNumber: row.systemRollNumber,
                systemEmail: row.systemEmail,
                message: row.message,
              }))}
              headers={["type", "csvRollNumber", "csvEmail", "systemRollNumber", "systemEmail", "message"]}
              filename="consistency_identity_mismatches"
              label="Export identity mismatches"
              emptyMessage="No identity mismatches to export"
              setError={setError}
            />
          </VStack>

          <VStack gap="small">
            <Text as="div" size="sm" weight="medium" color="body">Field Mismatches (Looked Up By Roll Number)</Text>
            <ResultTable
              columns={[
                { key: "rollNumber", label: "Roll Number" },
                { key: "email", label: "CSV Email" },
                { key: "systemEmail", label: "System Email" },
                { key: "field", label: "Field" },
                { key: "csvValue", label: "CSV Value" },
                { key: "systemValue", label: "System Value" },
              ]}
              rows={fieldMismatchesByRoll}
              emptyMessage="For students found by roll number, every filled field matches."
            />
            <ExportButton
              rows={fieldMismatchesByRoll}
              headers={["rollNumber", "email", "systemEmail", "field", "csvValue", "systemValue"]}
              filename="consistency_field_mismatches_by_roll"
              label="Export field mismatches by roll"
              emptyMessage="No field mismatches to export"
              setError={setError}
            />
          </VStack>

          <VStack gap="small">
            <Text as="div" size="sm" weight="medium" color="body">Field Mismatches (Looked Up By Email, Roll Did Not Match)</Text>
            <ResultTable
              columns={[
                { key: "email", label: "CSV Email" },
                { key: "rollNumber", label: "CSV Roll" },
                { key: "systemRollNumber", label: "System Roll" },
                { key: "field", label: "Field" },
                { key: "csvValue", label: "CSV Value" },
                { key: "systemValue", label: "System Value" },
              ]}
              rows={fieldMismatchesByEmail}
              emptyMessage="No extra mismatches for students found by email with a different roll number."
            />
            <ExportButton
              rows={fieldMismatchesByEmail}
              headers={["email", "rollNumber", "systemRollNumber", "field", "csvValue", "systemValue"]}
              filename="consistency_field_mismatches_by_email"
              label="Export field mismatches by email"
              emptyMessage="No email-side field mismatches to export"
              setError={setError}
            />
          </VStack>
        </VStack>
      )}
    </VStack>
  )
}

export default ConsistencyCheckTab
