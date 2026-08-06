import React from "react"
import CsvUploader from "@/components/common/CsvUploader"
import { MAX_BULK_RECORDS } from "@/constants/systemLimits"
import BulkUploadTab, { FieldList } from "./BulkUploadTab"
import PreviewTable from "./PreviewTable"

const TEMPLATE_HEADERS = ["rollNumber", "bloodGroup"]
const COLUMNS = [
  { key: "rollNumber", label: "Roll Number" },
  { key: "bloodGroup", label: "Blood Group" },
]
const INSTRUCTIONS = (
  <FieldList
    fields={[
      ["rollNumber", "String (Required)"],
      ["bloodGroup", "String (A+, B+, AB+, O+, A-, B-, AB-, O-)"],
    ]}
  />
)

const HealthInfoTab = ({ rows, error, status, onDataParsed }) => (
  <BulkUploadTab
    title="Update Health Information"
    error={error}
    status={rows.length > 0 ? status : ""}
    preview={<PreviewTable columns={COLUMNS} rows={rows} limit={5} />}
  >
    <CsvUploader
      onDataParsed={onDataParsed}
      requiredFields={TEMPLATE_HEADERS}
      templateFileName="health_update_template.csv"
      templateHeaders={TEMPLATE_HEADERS}
      maxRecords={MAX_BULK_RECORDS}
      instructionText={INSTRUCTIONS}
    />
  </BulkUploadTab>
)

export default HealthInfoTab
