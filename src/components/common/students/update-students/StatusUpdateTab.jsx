import React from "react"
import { Select } from "czero/react"
import CsvUploader from "@/components/common/CsvUploader"
import { MAX_BULK_RECORDS } from "@/constants/systemLimits"
import { Field } from "@/components/ui"
import BulkUploadTab, { FieldList, TabSection } from "./BulkUploadTab"
import PreviewTable from "./PreviewTable"

const STATUS_OPTIONS = ["Active", "Graduated", "Dropped", "Inactive"].map((status) => ({ value: status, label: status }))
const TEMPLATE_HEADERS = ["rollNumber"]
const COLUMNS = [{ key: "rollNumber", label: "Roll Number" }]
const INSTRUCTIONS = <FieldList fields={[["rollNumber", "String (Required) - The roll number of the student to update"]]} />

const StatusUpdateTab = ({ rows, error, status, selectedStatus, onStatusChange, onDataParsed }) => (
  <BulkUploadTab
    title="Update Student Status"
    error={error}
    status={rows.length > 0 ? status : ""}
    preview={<PreviewTable columns={COLUMNS} rows={rows} limit={10} />}
  >
    <Field label="Select Status to Apply" help="All selected students will be updated to this status">
      <Select value={selectedStatus} onChange={(e) => onStatusChange(e.target.value)} options={STATUS_OPTIONS} />
    </Field>

    <TabSection title="Upload CSV with Student Roll Numbers">
      <CsvUploader
        onDataParsed={onDataParsed}
        requiredFields={TEMPLATE_HEADERS}
        templateFileName="status_update_template.csv"
        templateHeaders={TEMPLATE_HEADERS}
        maxRecords={MAX_BULK_RECORDS}
        instructionText={INSTRUCTIONS}
      />
    </TabSection>
  </BulkUploadTab>
)

export default StatusUpdateTab
