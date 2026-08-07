import { Table, Button, Input } from "hzero"
import { Grid, Modal, Surface, Text } from "@/components/ui"
import { History } from "lucide-react"
import { StatusPill } from "@/components/elections/ElectionShared"

export const ElectionHistoryModal = ({
  isOpen,
  onClose,
  elections,
  selectedElectionId,
  onSelect,
  showMockElections = false,
  onToggleShowMockElections = null,
  modalBodyStyle,
  mutedTextStyle,
  formatStageLabel,
  getStatusTone,
  formatDateTime,
  pillBaseStyle,
  statusToneStyles,
}) => {
  const visibleElections = showMockElections
    ? elections
    : elections.filter((election) => !Boolean(election?.mockSettings?.enabled))

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Election History"
      width={860}
      footer={
        <Button size="sm" variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div style={modalBodyStyle}>
        {onToggleShowMockElections ? (
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "var(--spacing-3)",
              color: "var(--color-text-body)",
              fontWeight: "var(--font-weight-medium)",
            }}
          >
            <input
              type="checkbox"
              checked={showMockElections}
              onChange={(event) => onToggleShowMockElections(event.target.checked)}
            />
            Show mock elections
          </label>
        ) : null}
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Election</Table.Head>
            <Table.Head>Phase</Table.Head>
            <Table.Head>Stage</Table.Head>
            <Table.Head>Voting</Table.Head>
            <Table.Head align="right">Action</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {visibleElections.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={5}>
                <Surface padding={5} color="muted" align="center">
                  {showMockElections ? "No elections available yet." : "No non-mock elections available here."}
                </Surface>
              </Table.Cell>
            </Table.Row>
          ) : (
            visibleElections.map((election) => (
              <Table.Row key={election.id}>
                <Table.Cell>
                  <Grid cols={1} gap="4px">
                    <Text as="span" weight="semibold">
                      {election.title}
                      {election?.mockSettings?.enabled ? " · Mock" : ""}
                    </Text>
                    <span style={mutedTextStyle}>{election.academicYear}</span>
                  </Grid>
                </Table.Cell>
                <Table.Cell>{formatStageLabel(election.phase)}</Table.Cell>
                <Table.Cell>
                  <StatusPill
                    tone={getStatusTone(election.currentStage)}
                    pillBaseStyle={pillBaseStyle}
                    statusToneStyles={statusToneStyles}
                  >
                    {formatStageLabel(election.currentStage)}
                  </StatusPill>
                </Table.Cell>
                <Table.Cell>{formatDateTime(election.timeline?.votingStartAt)}</Table.Cell>
                <Table.Cell align="right">
                  <Button
                    size="sm"
                    variant={selectedElectionId === election.id ? "secondary" : "ghost"}
                    onClick={() => {
                      onSelect(election.id)
                      onClose()
                    }}
                  >
                    {selectedElectionId === election.id ? "Selected" : "Open"}
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table>
      </div>
    </Modal>
  )
}

export const CloneElectionModal = ({
  isOpen,
  onClose,
  titleValue,
  onTitleChange,
  onSubmit,
  loading,
  mutedTextStyle,
  errorTextStyle,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Copy Election"
    width={520}
    footer={
      <>
        <Button size="sm" variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button size="sm" onClick={onSubmit} loading={loading} disabled={!String(titleValue || "").trim()}>
          Create Copy
        </Button>
      </>
    }
  >
    <Grid cols={1} gap={3}>
      <div style={mutedTextStyle}>
        This creates a fresh draft copy of the current election configuration and nominations. Votes, results, and voting email state are not copied.
      </div>
      <div>
        <Text as="div" size="sm" weight="semibold" style={{ marginBottom: "6px" }}>
          New election name
        </Text>
        <Input
          value={titleValue}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="Enter the mock election name"
          autoFocus
        />
        {!String(titleValue || "").trim() ? (
          <div style={errorTextStyle}>Election name is required.</div>
        ) : null}
      </div>
    </Grid>
  </Modal>
)
