import { TriangleAlert } from "lucide-react"
import { Alert, Field, Grid, Select, StatTile, Table, Text, VStack } from "hzero"
import CsvUploader from "@/components/common/CsvUploader"
import ToggleButtonGroup from "@/components/common/ToggleButtonGroup"
import { MAX_BULK_RECORDS } from "@/constants/systemLimits"

/**
 * Check a list of roll numbers against the system, a group, or a batch.
 *
 * The three result lists were three copies of the same raw table — hardcoded
 * greys, `bg-white` striping that stayed white in dark mode, and its own empty
 * row each time. They are one component now, and the eight result figures are
 * StatTiles.
 */

const SCOPES = [
  { value: "system", label: "System" },
  { value: "group", label: "Group" },
  { value: "batch", label: "Batch" },
]

const SCOPE_HELP = {
  system: "Checks whether each uploaded roll number exists in the system.",
  group: "Checks whether each uploaded roll number exists and belongs to the selected group.",
  batch: "Checks whether each uploaded roll number exists and belongs to the selected batch scope.",
}

const STATUSES = ["Active", "Graduated", "Dropped", "Inactive"]

const TEMPLATE_HEADERS = ["rollNumber"]

const INSTRUCTIONS = (
  <div>
    <p className="font-medium mb-1">How this works:</p>
    <ul className="grid grid-cols-1 gap-y-1">
      <li><span className="font-medium">rollNumber:</span> Required. Upload the roll numbers you want to verify.</li>
      <li>Duplicate entries in the CSV are removed before the check runs.</li>
      <li>After confirmation, results are split into missing-in-system and outside-selected-scope buckets.</li>
    </ul>
  </div>
)

/** A single-column list of roll numbers, with a caption when it is truncated. */
const RollNumberList = ({ title, rollNumbers, emptyMessage, limit, total }) => (
  <Table bordered striped>
    <Table.Header>
      <Table.Row><Table.Head>{title}</Table.Head></Table.Row>
    </Table.Header>
    <Table.Body>
      {rollNumbers.length > 0 ? (
        rollNumbers.slice(0, limit).map((rollNumber, index) => (
          <Table.Row key={`${rollNumber}-${index}`}>
            <Table.Cell>{rollNumber}</Table.Cell>
          </Table.Row>
        ))
      ) : (
        <Table.Row>
          <Table.Cell><Text as="span" size="sm" color="muted">{emptyMessage}</Text></Table.Cell>
        </Table.Row>
      )}
    </Table.Body>
    {limit && total > limit && (
      <Table.Foot>
        <Table.Row>
          <Table.Cell>
            <Text as="span" size="xs" color="muted">Showing {limit} of {total} uploaded roll numbers</Text>
          </Table.Cell>
        </Table.Row>
      </Table.Foot>
    )}
  </Table>
)

const RollNumberCheckTab = ({
  availableRollCheckBatches, availableStudentGroups, batchDegreeOptions, batchDepartmentOptions,
  configLoading, error, handleRollNumberCheckDataParsed, handleRollNumberCheckScopeTypeChange,
  rollCheckBatchOptionsLoading, rollNumberCheckData, rollNumberCheckScopeType, rollNumberCheckSummary,
  selectedRollCheckBatch, selectedRollCheckDegree, selectedRollCheckDepartment, selectedRollCheckGroup,
  setError, setRollNumberCheckSummary, setSelectedRollCheckBatch, setSelectedRollCheckDegree,
  setSelectedRollCheckDepartment, setSelectedRollCheckGroup, uploadStatus,
}) => {
  // Array.isArray rather than ??, which only guards null and undefined and
  // would pass anything else straight through to .map.
  const asList = (value) => (Array.isArray(value) ? value : [])
  const missingRollNumbers = asList(rollNumberCheckSummary?.missingRollNumbers)
  const outOfScopeRollNumbers = asList(rollNumberCheckSummary?.outOfScopeRollNumbers)
  const statusCounts = rollNumberCheckSummary?.statusCounts || {}

  // Changing the scope invalidates any result already on screen.
  const clearResult = () => {
    setRollNumberCheckSummary(null)
    setError("")
  }

  return (
    <VStack gap="large">
      <Text as="h3" size="lg" weight="medium" color="heading">Check Missing Roll Numbers</Text>

      <VStack gap="medium" className="rounded-[var(--radius-lg)] border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] p-[var(--spacing-4)]">
        <Field label="Check Against">
          <ToggleButtonGroup
            options={SCOPES}
            value={rollNumberCheckScopeType}
            onChange={handleRollNumberCheckScopeTypeChange}
            size="small"
            variant="outline"
            fullWidth
            hideLabelsOnMobile={false}
          />
        </Field>

        {rollNumberCheckScopeType === "group" && (
          <Field label="Group">
            <Select
              value={selectedRollCheckGroup}
              onChange={(event) => { setSelectedRollCheckGroup(event.target.value); clearResult() }}
              disabled={configLoading}
              placeholder={configLoading ? "Loading groups…" : "Select Group"}
              options={availableStudentGroups.map((group) => ({ value: group, label: group }))}
            />
          </Field>
        )}

        {rollNumberCheckScopeType === "batch" && (
          <Grid cols={{ base: 1, md: 3 }} gap={4}>
            <Field label="Degree">
              <Select
                value={selectedRollCheckDegree}
                onChange={(event) => { setSelectedRollCheckDegree(event.target.value); setSelectedRollCheckBatch(""); clearResult() }}
                disabled={configLoading}
                placeholder="Select Degree"
                options={batchDegreeOptions}
              />
            </Field>

            <Field label="Department">
              <Select
                value={selectedRollCheckDepartment}
                onChange={(event) => { setSelectedRollCheckDepartment(event.target.value); setSelectedRollCheckBatch(""); clearResult() }}
                disabled={configLoading}
                placeholder="Select Department"
                options={batchDepartmentOptions}
              />
            </Field>

            <Field label="Batch">
              <Select
                value={selectedRollCheckBatch}
                onChange={(event) => { setSelectedRollCheckBatch(event.target.value); clearResult() }}
                disabled={configLoading || rollCheckBatchOptionsLoading || !selectedRollCheckDegree || !selectedRollCheckDepartment}
                placeholder={rollCheckBatchOptionsLoading ? "Loading batches…" : "Select Batch"}
                options={availableRollCheckBatches.map((batch) => ({ value: batch, label: batch }))}
              />
            </Field>
          </Grid>
        )}

        <Text as="div" size="xs" color="muted">{SCOPE_HELP[rollNumberCheckScopeType]}</Text>
      </VStack>

      <CsvUploader
        onDataParsed={handleRollNumberCheckDataParsed}
        requiredFields={["rollNumber"]}
        templateFileName="check_roll_numbers_template.csv"
        templateHeaders={TEMPLATE_HEADERS}
        maxRecords={MAX_BULK_RECORDS}
        instructionText={INSTRUCTIONS}
      />

      {rollNumberCheckData.length > 0 && !error && <Alert type="success">{uploadStatus}</Alert>}

      {rollNumberCheckData.length > 0 && (
        <RollNumberList
          title="Uploaded Roll Number"
          rollNumbers={rollNumberCheckData.map((student) => student.rollNumber)}
          emptyMessage="Nothing uploaded."
          limit={10}
          total={rollNumberCheckData.length}
        />
      )}

      {rollNumberCheckSummary && (
        <VStack gap="medium">
          <Grid cols={{ base: 1, sm: 2, xl: 4 }} gap={3}>
            <StatTile label="Submitted" value={rollNumberCheckSummary.submittedCount || 0} tone="info" />
            <StatTile label="Unique Checked" value={rollNumberCheckSummary.uniqueCount || 0} tone="primary" />
            <StatTile label="Found" value={rollNumberCheckSummary.foundCount || 0} tone="success" />
            <StatTile label="Missing" value={rollNumberCheckSummary.missingCount || 0} tone="danger" icon={TriangleAlert} />
          </Grid>

          <VStack gap="xsmall" className="rounded-[var(--radius-lg)] border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] p-[var(--spacing-4)]">
            <Text as="div" size="sm" color="muted">
              Scope: <Text as="span" weight="medium" color="body">{rollNumberCheckSummary.scopeLabel || "System"}</Text>
              {rollNumberCheckScopeType !== "system" && (
                <>
                  {" · "}In selected scope: <Text as="span" weight="medium" color="body">{rollNumberCheckSummary.inScopeCount || 0}</Text>
                  {" · "}Outside selected scope: <Text as="span" weight="medium" color="body">{rollNumberCheckSummary.outOfScopeCount || 0}</Text>
                </>
              )}
            </Text>
          </VStack>

          <VStack gap="small">
            <Text as="div" size="sm" weight="medium" color="body">Found Student Status Summary</Text>
            <Grid cols={{ base: 2, sm: 4 }} gap={3}>
              {STATUSES.map((status) => (
                <StatTile
                  key={status}
                  label={status}
                  value={statusCounts[status] || 0}
                  note={status === "Active" ? `of ${rollNumberCheckSummary.foundCount || 0} found` : undefined}
                />
              ))}
            </Grid>
            <Text as="div" size="xs" color="muted">
              Downloadable status lists are generated from the found students in the uploaded file.
            </Text>
          </VStack>

          <RollNumberList
            title="Missing In System"
            rollNumbers={missingRollNumbers}
            emptyMessage="No missing roll numbers found."
          />

          {rollNumberCheckScopeType !== "system" && (
            <RollNumberList
              title={`Not In Selected ${rollNumberCheckScopeType === "group" ? "Group" : "Batch"}`}
              rollNumbers={outOfScopeRollNumbers}
              emptyMessage="Every uploaded student that exists in the system is already in the selected scope."
            />
          )}
        </VStack>
      )}

      {error && <Alert type="error">{error}</Alert>}
    </VStack>
  )
}

export default RollNumberCheckTab
