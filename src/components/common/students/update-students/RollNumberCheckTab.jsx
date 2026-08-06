import React from "react"
import CsvUploader from "@/components/common/CsvUploader"
import { Grid, Select } from "@/components/ui"
import { MAX_BULK_RECORDS } from "@/constants/systemLimits"
import ToggleButtonGroup from "@/components/common/ToggleButtonGroup"

const RollNumberCheckTab = ({ availableRollCheckBatches, availableStudentGroups, batchDegreeOptions, batchDepartmentOptions, configLoading, error, handleRollNumberCheckDataParsed, handleRollNumberCheckScopeTypeChange, rollCheckBatchOptionsLoading, rollNumberCheckData, rollNumberCheckScopeType, rollNumberCheckSummary, selectedRollCheckBatch, selectedRollCheckDegree, selectedRollCheckDepartment, selectedRollCheckGroup, setError, setRollNumberCheckSummary, setSelectedRollCheckBatch, setSelectedRollCheckDegree, setSelectedRollCheckDepartment, setSelectedRollCheckGroup, uploadStatus }) => {
const missingRollNumbers = Array.isArray(rollNumberCheckSummary?.missingRollNumbers)
  ? rollNumberCheckSummary.missingRollNumbers
  : []
const outOfScopeRollNumbers = Array.isArray(rollNumberCheckSummary?.outOfScopeRollNumbers)
  ? rollNumberCheckSummary.outOfScopeRollNumbers
  : []
const statusCounts = rollNumberCheckSummary?.statusCounts || {}
const rollCheckStatusItems = [
  { key: "Active", label: "Active" },
  { key: "Graduated", label: "Graduated" },
  { key: "Dropped", label: "Dropped" },
  { key: "Inactive", label: "Inactive" },
]

const rollCheckTemplateHeaders = ["rollNumber"]

const rollCheckInstructionsText = (
  <div>
    <p className="font-medium mb-1">How this works:</p>
    <ul className="grid grid-cols-1 gap-y-1">
      <li>
        <span className="font-medium">rollNumber:</span> Required. Upload the roll numbers you want to verify.
      </li>
      <li>
        Duplicate entries in the CSV are removed before the check runs.
      </li>
      <li>
        After confirmation, results are split into missing-in-system and outside-selected-scope buckets.
      </li>
    </ul>
  </div>
)

return (
  <div className="space-y-6">
    <h3 className="text-lg font-medium text-gray-800">Check Missing Roll Numbers</h3>

    <div className="space-y-4 rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] p-4">
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-body)] mb-2">Check Against</label>
        <ToggleButtonGroup
          options={[
            { value: "system", label: "System" },
            { value: "group", label: "Group" },
            { value: "batch", label: "Batch" },
          ]}
          value={rollNumberCheckScopeType}
          onChange={handleRollNumberCheckScopeTypeChange}
          size="small"
          variant="outline"
          fullWidth
          hideLabelsOnMobile={false}
        />
      </div>

      {rollNumberCheckScopeType === "group" && (
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-body)] mb-2">Group</label>
          <Select
            value={selectedRollCheckGroup}
            onChange={(event) => {
              setSelectedRollCheckGroup(event.target.value)
              setRollNumberCheckSummary(null)
              setError("")
            }}
            options={[
              { value: "", label: configLoading ? "Loading groups..." : "Select Group" },
              ...availableStudentGroups.map((group) => ({ value: group, label: group })),
            ]}
            disabled={configLoading}
          />
        </div>
      )}

      {rollNumberCheckScopeType === "batch" && (
        <Grid cols={{ base: 1, md: 3 }} gap={4}>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-body)] mb-2">Degree</label>
            <Select
              value={selectedRollCheckDegree}
              onChange={(event) => {
                setSelectedRollCheckDegree(event.target.value)
                setSelectedRollCheckBatch("")
                setRollNumberCheckSummary(null)
                setError("")
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
              value={selectedRollCheckDepartment}
              onChange={(event) => {
                setSelectedRollCheckDepartment(event.target.value)
                setSelectedRollCheckBatch("")
                setRollNumberCheckSummary(null)
                setError("")
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
              value={selectedRollCheckBatch}
              onChange={(event) => {
                setSelectedRollCheckBatch(event.target.value)
                setRollNumberCheckSummary(null)
                setError("")
              }}
              options={[
                {
                  value: "",
                  label: rollCheckBatchOptionsLoading ? "Loading batches..." : "Select Batch",
                },
                ...availableRollCheckBatches.map((batch) => ({ value: batch, label: batch })),
              ]}
              disabled={configLoading || rollCheckBatchOptionsLoading || !selectedRollCheckDegree || !selectedRollCheckDepartment}
            />
          </div>
        </Grid>
      )}

      <div className="text-xs text-[var(--color-text-muted)]">
        {rollNumberCheckScopeType === "system"
          ? "Checks whether each uploaded roll number exists in the system."
          : rollNumberCheckScopeType === "group"
            ? "Checks whether each uploaded roll number exists and belongs to the selected group."
            : "Checks whether each uploaded roll number exists and belongs to the selected batch scope."}
      </div>
    </div>

    <CsvUploader
      onDataParsed={handleRollNumberCheckDataParsed}
      requiredFields={["rollNumber"]}
      templateFileName="check_roll_numbers_template.csv"
      templateHeaders={rollCheckTemplateHeaders}
      maxRecords={MAX_BULK_RECORDS}
      instructionText={rollCheckInstructionsText}
    />

    {rollNumberCheckData.length > 0 && !error && (
      <div className="mt-4 p-4 bg-green-50 rounded-lg">
        <p className="text-green-700 font-medium">{uploadStatus}</p>
      </div>
    )}

    {rollNumberCheckData.length > 0 && (
      <div className="border rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Uploaded Roll Number
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rollNumberCheckData.slice(0, 10).map((student, index) => (
              <tr key={`${student.rollNumber}-${index}`} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{student.rollNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rollNumberCheckData.length > 10 && (
          <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500">
            Showing 10 of {rollNumberCheckData.length} uploaded roll numbers
          </div>
        )}
      </div>
    )}

    {rollNumberCheckSummary && (
      <div className="space-y-4">
        <Grid cols={{ base: 1, sm: 2, xl: 4 }} gap={3}>
          <div className="p-3 rounded-lg border bg-[var(--color-info-bg)] border-[var(--color-info-light)]">
            <div className="text-xs text-[var(--color-info-text)]">Submitted</div>
            <div className="text-lg font-semibold text-[var(--color-info-text)]">{rollNumberCheckSummary.submittedCount || 0}</div>
          </div>
          <div className="p-3 rounded-lg border bg-[var(--color-primary-bg)] border-[var(--color-primary-light)]">
            <div className="text-xs text-[var(--color-primary)]">Unique Checked</div>
            <div className="text-lg font-semibold text-[var(--color-primary)]">{rollNumberCheckSummary.uniqueCount || 0}</div>
          </div>
          <div className="p-3 rounded-lg border bg-[var(--color-success-bg)] border-[var(--color-success-light)]">
            <div className="text-xs text-[var(--color-success-text)]">Found</div>
            <div className="text-lg font-semibold text-[var(--color-success-text)]">{rollNumberCheckSummary.foundCount || 0}</div>
          </div>
          <div className="p-3 rounded-lg border bg-[var(--color-danger-bg)] border-[var(--color-danger-border)]">
            <div className="text-xs text-[var(--color-danger-text)]">Missing</div>
            <div className="text-lg font-semibold text-[var(--color-danger-text)]">{rollNumberCheckSummary.missingCount || 0}</div>
          </div>
        </Grid>

        <div className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] p-4 text-sm text-[var(--color-text-muted)]">
          Scope: <span className="font-medium text-[var(--color-text-body)]">{rollNumberCheckSummary.scopeLabel || "System"}</span>
          {rollNumberCheckScopeType !== "system" && (
            <>
              {" · "}
              In selected scope: <span className="font-medium text-[var(--color-text-body)]">{rollNumberCheckSummary.inScopeCount || 0}</span>
              {" · "}
              Outside selected scope: <span className="font-medium text-[var(--color-text-body)]">{rollNumberCheckSummary.outOfScopeCount || 0}</span>
            </>
          )}
        </div>

        <div className="space-y-3">
          <div className="text-sm font-medium text-[var(--color-text-body)]">
            Found Student Status Summary
          </div>
          <Grid cols={{ base: 2, sm: 4 }} gap={3}>
            {rollCheckStatusItems.map((item) => (
              <div
                key={item.key}
                className="p-3 rounded-lg border bg-[var(--color-bg-secondary)] border-[var(--color-border-primary)]"
              >
                <div className="text-xs text-[var(--color-text-muted)]">{item.label}</div>
                <div className="text-lg font-semibold text-[var(--color-text-body)]">
                  {statusCounts[item.key] || 0}
                </div>
              </div>
            ))}
          </Grid>
          <div className="text-xs text-[var(--color-text-muted)]">
            Active students found: <span className="font-medium text-[var(--color-text-body)]">{statusCounts.Active || 0}</span> of {rollNumberCheckSummary.foundCount || 0}
          </div>
          <div className="text-xs text-[var(--color-text-muted)]">
            Downloadable status lists are generated from the found students in the uploaded file.
          </div>
        </div>

        <div className="border rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Missing In System
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {missingRollNumbers.length > 0 ? (
                missingRollNumbers.map((rollNumber, index) => (
                  <tr key={`${rollNumber}-${index}`} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{rollNumber}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-600">No missing roll numbers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {rollNumberCheckScopeType !== "system" && (
          <div className="border rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Not In Selected {rollNumberCheckScopeType === "group" ? "Group" : "Batch"}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {outOfScopeRollNumbers.length > 0 ? (
                  outOfScopeRollNumbers.map((rollNumber, index) => (
                    <tr key={`${rollNumber}-${index}`} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{rollNumber}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-600">Every uploaded student that exists in the system is already in the selected scope.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )}

    {error && <div className="py-2 px-4 bg-red-50 text-red-600 rounded-lg border-l-4 border-red-500">{error}</div>}
  </div>
)
}

export default RollNumberCheckTab
