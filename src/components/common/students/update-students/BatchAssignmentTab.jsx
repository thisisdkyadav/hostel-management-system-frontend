import React from "react"
import CsvUploader from "@/components/common/CsvUploader"
import { Alert, Grid, Input, Select } from "hzero"
import { MAX_BULK_RECORDS } from "@/constants/systemLimits"
import { MIXED_BATCH_SCOPE_KEY, getBatchScopeLabel } from "@/utils/studentBatchConfig"
import SheetPreviewTable from "@/components/sheet/SheetPreviewTable"
import ToggleButtonGroup from "@/components/common/ToggleButtonGroup"

const BatchAssignmentTab = ({ availableBatches, batchAssignmentData, batchAssignmentMode, batchDegreeOptions, batchDepartmentOptions, batchOptionsLoading, batchRangeEnd, batchRangeStart, batchSelectionMode, configLoading, error, handleBatchDataParsed, handleBatchRangeChange, handleBatchSelectionModeChange, selectedBatch, selectedBatchDegree, selectedBatchDepartment, setBatchAssignmentMode, setSelectedBatch, setSelectedBatchDegree, setSelectedBatchDepartment, uploadStatus }) => {
const batchTemplateHeaders = ["rollNumber"]

const batchInstructionsText = (
  <div>
    <p className="font-medium mb-1">How this works:</p>
    <ul className="grid grid-cols-1 gap-y-1">
      <li>
        <span className="font-medium">1.</span> Select a degree or Mixed Degree.
      </li>
      <li>
        <span className="font-medium">2.</span> Select a department or Mixed Department.
      </li>
      <li>
        <span className="font-medium">3.</span> Select one configured batch for that combination. The list includes exact matches plus any mixed-scope batches that apply.
      </li>
      <li>
        <span className="font-medium">4.</span> Choose whether you want to add to the existing list or replace it entirely.
      </li>
      <li>
        <span className="font-medium">5.</span> Pick either CSV upload or a numeric roll number range. Range mode works only for purely numeric roll numbers stored in the database.
      </li>
    </ul>
  </div>
)

return (
  <div className="space-y-6">
    <Grid cols={{ base: 1, md: 2 }} gap={4}>
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-body)] mb-2">Student Selection</label>
        <ToggleButtonGroup
          options={[
            { value: "csv", label: "CSV Upload" },
            { value: "range", label: "Roll Number Range" },
          ]}
          value={batchSelectionMode}
          onChange={handleBatchSelectionModeChange}
          size="small"
          variant="outline"
          fullWidth
          hideLabelsOnMobile={false}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--color-text-body)] mb-2">Update Mode</label>
        <ToggleButtonGroup
          options={[
            { value: "append", label: "Add to Existing" },
            { value: "replace", label: "Replace Existing" },
          ]}
          value={batchAssignmentMode}
          onChange={setBatchAssignmentMode}
          size="small"
          variant="outline"
          fullWidth
          hideLabelsOnMobile={false}
        />
      </div>
    </Grid>

    <Grid cols={{ base: 1, md: 3 }} gap={4}>
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-body)] mb-2">Degree</label>
        <Select
          value={selectedBatchDegree}
          onChange={(event) => {
            setSelectedBatchDegree(event.target.value)
            setSelectedBatch("")
          }}
          options={[
            { value: "", label: "Select Degree" },
            ...batchDegreeOptions,
          ]}
          disabled={configLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--color-text-body)] mb-2">Department</label>
        <Select
          value={selectedBatchDepartment}
          onChange={(event) => {
            setSelectedBatchDepartment(event.target.value)
            setSelectedBatch("")
          }}
          options={[
            { value: "", label: "Select Department" },
            ...batchDepartmentOptions,
          ]}
          disabled={configLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--color-text-body)] mb-2">Batch</label>
        <Select
          value={selectedBatch}
          onChange={(event) => setSelectedBatch(event.target.value)}
          options={[
            { value: "", label: batchOptionsLoading ? "Loading batches..." : "Select Batch" },
            ...availableBatches.map((batch) => ({ value: batch, label: batch })),
          ]}
          disabled={configLoading || batchOptionsLoading || !selectedBatchDegree || !selectedBatchDepartment}
        />
      </div>
    </Grid>

    <div className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] p-4 text-sm text-[var(--color-text-muted)]">
      The batch list includes exact and mixed-scope batches that apply to the selected lookup scope. If you choose an exact degree or department, that field is updated on the student profile. If you choose <span className="font-medium text-[var(--color-text-body)]">{getBatchScopeLabel(MIXED_BATCH_SCOPE_KEY, "degree")}</span> or <span className="font-medium text-[var(--color-text-body)]">{getBatchScopeLabel(MIXED_BATCH_SCOPE_KEY, "department")}</span>, that field stays unchanged and is used only to make mixed-scope batches available.
    </div>

    {batchSelectionMode === "csv" ? (
      <CsvUploader
        onDataParsed={handleBatchDataParsed}
        requiredFields={["rollNumber"]}
        templateFileName="student_batch_assignment_template.csv"
        templateHeaders={batchTemplateHeaders}
        maxRecords={MAX_BULK_RECORDS}
        instructionText={batchInstructionsText}
      />
    ) : (
      <div className="space-y-4 rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] p-4">
        <Grid cols={{ base: 1, md: 2 }} gap={4}>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-body)] mb-2">Range Start</label>
            <Input
              type="text"
              value={batchRangeStart}
              onChange={(event) => handleBatchRangeChange("start", event.target.value)}
              placeholder="Numeric roll number start"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-body)] mb-2">Range End</label>
            <Input
              type="text"
              value={batchRangeEnd}
              onChange={(event) => handleBatchRangeChange("end", event.target.value)}
              placeholder="Numeric roll number end"
            />
          </div>
        </Grid>
        <div className="text-xs text-[var(--color-text-muted)]">
          Range mode is inclusive and works only for purely numeric roll numbers stored in the database. Alphanumeric roll numbers still need CSV upload.
        </div>
        <div className="text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-tertiary)] p-3 rounded-lg">
          {batchInstructionsText}
        </div>
      </div>
    )}

    {batchAssignmentData.length > 0 && !error && (
      <div className="p-4 rounded-lg bg-[var(--color-success-bg)] text-[var(--color-success-text)]">
        {uploadStatus}
      </div>
    )}

    {batchSelectionMode === "range" && uploadStatus && !error && (
      <div className="p-4 rounded-lg bg-[var(--color-success-bg)] text-[var(--color-success-text)]">
        {uploadStatus}
      </div>
    )}

    {batchSelectionMode === "csv" && batchAssignmentData.length > 0 && (
      <div className="border rounded-lg overflow-hidden">
        <SheetPreviewTable rows={batchAssignmentData.slice(0, 100)} />
      </div>
    )}

    {error && <Alert type="error">{error}</Alert>}
  </div>
)
}

export default BatchAssignmentTab
