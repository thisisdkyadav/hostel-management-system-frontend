import { Button } from "hzero"
import { Grid, HStack, Modal, Surface, Text } from "@/components/ui"
import { StatusPill } from "@/components/elections/ElectionShared"

export const AdminResultsEditModal = ({
  postResult,
  draft,
  onClose,
  onChange,
  modalBodyStyle,
  badgeRowStyle,
  flatPanelStyle,
  labelStyle,
  textareaStyle,
  mutedTextStyle,
  pillBaseStyle,
  statusToneStyles,
}) => {
  if (!postResult) return null

  return (
    <Modal
      isOpen={Boolean(postResult)}
      onClose={onClose}
      title={`Results · ${postResult.postTitle}`}
      width={720}
      footer={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            gap: "var(--spacing-3)",
            flexWrap: "wrap",
          }}
        >
          <div style={badgeRowStyle}>
            <StatusPill tone="default" pillBaseStyle={pillBaseStyle} statusToneStyles={statusToneStyles}>
              {postResult.totalVotes} vote(s)
            </StatusPill>
            {postResult.previewWinnerName ? (
              <StatusPill tone="success" pillBaseStyle={pillBaseStyle} statusToneStyles={statusToneStyles}>
                Lead: {postResult.previewWinnerName}
              </StatusPill>
            ) : null}
          </div>
          <Button size="sm" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div style={modalBodyStyle}>
        {(postResult.candidates || []).length === 0 ? (
          <Surface padding={5} color="muted" align="center">
            No verified candidates. Results will appear here after verification and voting.
          </Surface>
        ) : (
          <>
            <Grid cols={1} gap="10px" style={{ ...flatPanelStyle }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: "var(--color-text-body)",
                  fontWeight: "var(--font-weight-medium)",
                }}
              >
                <input
                  type="checkbox"
                  checked={draft?.showVoteCountToStudents !== false}
                  onChange={(event) => onChange({ showVoteCountToStudents: event.target.checked })}
                />
                Show vote count to students for this post
              </label>
              <div style={mutedTextStyle}>
                Leave this on to show candidate vote counts and percentages to students after result publication.
                Turn it off to publish only the winner/result without the counts.
              </div>
            </Grid>

            <Grid cols={1} gap="10px" style={{ ...flatPanelStyle }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: "var(--color-text-body)",
                  fontWeight: "var(--font-weight-medium)",
                }}
              >
                <input
                  type="checkbox"
                  checked={Boolean(draft?.winnerIsTie)}
                  onChange={(event) => {
                    const nextIsTie = event.target.checked
                    const selectedWinnerIds = Array.isArray(draft?.winnerNominationIds)
                      ? draft.winnerNominationIds.map((value) => String(value))
                      : draft?.winnerNominationId
                        ? [String(draft.winnerNominationId)]
                        : []

                    if (!nextIsTie) {
                      const nextSingleWinnerId = selectedWinnerIds[0] || ""
                      onChange({
                        winnerIsTie: false,
                        winnerNominationIds: nextSingleWinnerId ? [nextSingleWinnerId] : [],
                        winnerNominationId: nextSingleWinnerId,
                      })
                      return
                    }

                    onChange({
                      winnerIsTie: true,
                      winnerNominationIds: selectedWinnerIds,
                      winnerNominationId: selectedWinnerIds[0] || "",
                    })
                  }}
                />
                Publish this post as a tie
              </label>
              <div style={mutedTextStyle}>
                Turn this on to select multiple tied winners for the published result. Leave it off to publish a
                single winner.
              </div>
            </Grid>

            <Grid cols={1} gap="12px">
              {(postResult.candidates || []).map((candidate) => {
                const selectedWinnerIds = Array.isArray(draft?.winnerNominationIds)
                  ? draft.winnerNominationIds.map((value) => String(value))
                  : draft?.winnerNominationId
                    ? [String(draft.winnerNominationId)]
                    : []
                const checked = selectedWinnerIds.includes(String(candidate.nominationId))
                return (
                  <label
                    key={candidate.nominationId}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "var(--spacing-3)",
                      padding: "var(--spacing-3)",
                      border: "1px solid var(--color-border-primary)",
                      borderRadius: "var(--radius-lg)",
                      backgroundColor: checked ? "var(--color-primary-bg)" : "var(--color-bg-primary)",
                      cursor: "pointer",
                    }}
                  >
                    <HStack gap={3} align="center">
                      <input
                        type={draft?.winnerIsTie ? "checkbox" : "radio"}
                        name={`winner-${postResult.postId}`}
                        checked={checked}
                        onChange={() => {
                          if (draft?.winnerIsTie) {
                            const nextIds = checked
                              ? selectedWinnerIds.filter((value) => value !== String(candidate.nominationId))
                              : [...selectedWinnerIds, String(candidate.nominationId)]
                            onChange({
                              winnerNominationIds: nextIds,
                              winnerNominationId: nextIds[0] || "",
                            })
                            return
                          }

                          onChange({
                            winnerNominationIds: [String(candidate.nominationId)],
                            winnerNominationId: String(candidate.nominationId),
                          })
                        }}
                      />
                      <Grid cols={1} gap="4px">
                        <Text as="span" weight="semibold" color="heading">
                          {candidate.candidateName}
                        </Text>
                        {!candidate.isNota && candidate.candidateRollNumber ? (
                          <span style={mutedTextStyle}>{candidate.candidateRollNumber}</span>
                        ) : null}
                      </Grid>
                    </HStack>
                    <Text as="strong" color="heading">{candidate.voteCount}</Text>
                  </label>
                )
              })}
            </Grid>

            {draft?.winnerIsTie && (draft?.winnerNominationIds || []).length < 2 ? (
              <div style={mutedTextStyle}>Select at least two options to publish this post as a tie.</div>
            ) : null}

            <div style={flatPanelStyle}>
              <label style={labelStyle}>Notes</label>
              <textarea
                style={textareaStyle}
                value={draft?.notes || ""}
                onChange={(event) => onChange({ notes: event.target.value })}
                placeholder="Optional notes for this result."
              />
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
