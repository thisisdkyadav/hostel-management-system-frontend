import React from "react"
import { Checkbox, Grid, HStack } from "@/components/ui"
import CsvUploader from "@/components/common/CsvUploader"
import { Input } from "czero/react"
import { MAX_BULK_RECORDS } from "@/constants/systemLimits"
import SheetPreviewTable from "@/components/sheet/SheetPreviewTable"
import ToggleButtonGroup from "@/components/common/ToggleButtonGroup"

const GroupsAssignmentTab = ({ availableStudentGroups, configLoading, error, groupAssignmentData, groupAssignmentMode, groupRangeEnd, groupRangeStart, groupSelectionMode, handleGroupDataParsed, handleGroupRangeChange, handleGroupSelectionModeChange, handleGroupToggle, selectedGroups, setGroupAssignmentMode, uploadStatus }) => {
const groupTemplateHeaders = ["rollNumber"]

const groupInstructionsText = (
  <div>
    <p className="font-medium mb-1">How this works:</p>
    <ul className="grid grid-cols-1 gap-y-1">
      <li>
        <span className="font-medium">1.</span> Select one or more configured groups.
      </li>
      <li>
        <span className="font-medium">2.</span> Choose whether to add those groups, remove them, or replace the student&apos;s full group list.
      </li>
      <li>
        <span className="font-medium">3.</span> Pick either CSV upload or a numeric roll number range.
      </li>
      <li>
        <span className="font-medium">4.</span> Range mode works only for purely numeric roll numbers stored in the database.
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
          value={groupSelectionMode}
          onChange={handleGroupSelectionModeChange}
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
            { value: "add", label: "Add Groups" },
            { value: "remove", label: "Remove Groups" },
            { value: "replace", label: "Replace Groups" },
          ]}
          value={groupAssignmentMode}
          onChange={setGroupAssignmentMode}
          size="small"
          variant="outline"
          fullWidth
          hideLabelsOnMobile={false}
        />
      </div>
    </Grid>

    <div className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] p-4">
      <HStack align="center" justify="between" gap={3} className="mb-3">
        <div>
          <h3 className="text-sm font-medium text-[var(--color-text-body)]">Select Groups</h3>
          <p className="text-xs text-[var(--color-text-muted)]">Students can belong to multiple groups at the same time.</p>
        </div>
        <div className="text-xs text-[var(--color-text-muted)]">
          {selectedGroups.length} selected
        </div>
      </HStack>

      {configLoading ? (
        <div className="text-sm text-[var(--color-text-muted)]">Loading groups...</div>
      ) : availableStudentGroups.length === 0 ? (
        <div className="text-sm text-[var(--color-text-muted)]">
          No student groups are configured yet. Create groups first from Settings.
        </div>
      ) : (
        <Grid cols={{ base: 1, md: 2 }} gap={3}>
          {availableStudentGroups.map((group) => (
            <Checkbox
              key={group}
              id={`group-${group}`}
              value={group}
              checked={selectedGroups.includes(group)}
              onChange={handleGroupToggle}
              label={group}
            />
          ))}
        </Grid>
      )}
    </div>

    {selectedGroups.length > 0 && (
      <div className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] p-4 text-sm text-[var(--color-text-muted)]">
        Selected groups: <span className="font-medium text-[var(--color-text-body)]">{selectedGroups.join(", ")}</span>
      </div>
    )}

    {groupSelectionMode === "csv" ? (
      <CsvUploader
        onDataParsed={handleGroupDataParsed}
        requiredFields={["rollNumber"]}
        templateFileName="student_group_assignment_template.csv"
        templateHeaders={groupTemplateHeaders}
        maxRecords={MAX_BULK_RECORDS}
        instructionText={groupInstructionsText}
      />
    ) : (
      <div className="space-y-4 rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] p-4">
        <Grid cols={{ base: 1, md: 2 }} gap={4}>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-body)] mb-2">Range Start</label>
            <Input
              type="text"
              value={groupRangeStart}
              onChange={(event) => handleGroupRangeChange("start", event.target.value)}
              placeholder="Numeric roll number start"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-body)] mb-2">Range End</label>
            <Input
              type="text"
              value={groupRangeEnd}
              onChange={(event) => handleGroupRangeChange("end", event.target.value)}
              placeholder="Numeric roll number end"
            />
          </div>
        </Grid>
        <div className="text-xs text-[var(--color-text-muted)]">
          Range mode is inclusive and works only for purely numeric roll numbers stored in the database. Alphanumeric roll numbers still need CSV upload.
        </div>
        <div className="text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-tertiary)] p-3 rounded-lg">
          {groupInstructionsText}
        </div>
      </div>
    )}

    {groupAssignmentData.length > 0 && !error && (
      <div className="p-4 rounded-lg bg-[var(--color-success-bg)] text-[var(--color-success-text)]">
        {uploadStatus}
      </div>
    )}

    {groupSelectionMode === "range" && uploadStatus && !error && (
      <div className="p-4 rounded-lg bg-[var(--color-success-bg)] text-[var(--color-success-text)]">
        {uploadStatus}
      </div>
    )}

    {groupSelectionMode === "csv" && groupAssignmentData.length > 0 && (
      <div className="border rounded-lg overflow-hidden">
        <SheetPreviewTable rows={groupAssignmentData.slice(0, 100)} />
      </div>
    )}

    {error && <div className="py-2 px-4 bg-red-50 text-red-600 rounded-lg border-l-4 border-red-500">{error}</div>}
  </div>
)
}

export default GroupsAssignmentTab
