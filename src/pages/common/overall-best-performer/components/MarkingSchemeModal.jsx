import { Grid, HStack, Modal, Surface, Text, VStack } from "hzero"
import { MARKING_SCHEME_ROWS } from "../scoring"
import { buildMetaChipStyle } from "../styles"
import { sectionLabelStyle } from "@/components/gymkhana/events-page/sharedPrimitives"

export const MarkingSchemeModal = ({ open, onClose }) => {
  if (!open) return null

  return (
    <Modal
      title="Overall Best Performer Marking Scheme"
      onClose={onClose}
      width={1120}
      fullHeight={true}
      minHeight="68vh"
      closeButtonVariant="button"
    >
      <VStack gap={3}>
        <HStack gap={3} align="start" justify="between" wrap>
          <div style={{ maxWidth: "78ch" }}>
            <div style={{ ...sectionLabelStyle, marginBottom: "6px" }}>Reference Guide</div>
            <Text as="div" size="sm" color="body" leading={1.65}>
              Check this marking scheme before filling the form and match every entry to the correct scoring category. Only one project track applies for a student: B.Tech. project work or PhD / PG thesis work.
            </Text>
          </div>
          <span style={buildMetaChipStyle()}>Total: 100 marks</span>
        </HStack>

        <div
          style={{
            border: "1px solid var(--color-border-primary)",
            borderRadius: "var(--radius-card-sm)",
            overflow: "hidden",
            backgroundColor: "var(--color-bg-primary)",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: 920, borderCollapse: "collapse" }}>
              <thead style={{ backgroundColor: "var(--color-bg-secondary)" }}>
                <tr>
                  <Surface as="th" padding="10px 12px" color="muted" size="xs" align="center" style={{ width: 68, textTransform: "uppercase" }}>
                    Sn.
                  </Surface>
                  <Surface as="th" padding="10px 12px" color="muted" size="xs" align="left" style={{ width: "38%", textTransform: "uppercase" }}>
                    Category Of Achievement
                  </Surface>
                  <Surface as="th" padding="10px 12px" color="muted" size="xs" align="left" style={{ textTransform: "uppercase" }}>
                    Marks Distribution
                  </Surface>
                </tr>
              </thead>
              <tbody>
                {MARKING_SCHEME_ROWS.map((row) => (
                  <tr key={`${row.serial}-${row.categoryTitle}`} style={{ borderTop: "1px solid var(--color-border-primary)" }}>
                    <td
                      style={{
                        padding: "12px 10px",
                        textAlign: "center",
                        verticalAlign: "top",
                        fontSize: "var(--font-size-base)",
                        fontWeight: "var(--font-weight-semibold)",
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {row.serial}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        verticalAlign: "top",
                        borderLeft: "1px solid var(--color-border-primary)",
                      }}
                    >
                      <Grid cols={1} gap="6px">
                        <Text as="div" size="base" weight="semibold" color="primary" leading={1.45}>
                          {row.categoryTitle}
                        </Text>
                        <Text as="div" size="sm" color="body" leading={1.55}>
                          {row.categorySubtitle}
                        </Text>
                        <Text as="div" size="sm" weight="semibold" color="brand">
                          Max {row.maxMarks} marks
                        </Text>
                      </Grid>
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        verticalAlign: "top",
                        borderLeft: "1px solid var(--color-border-primary)",
                      }}
                    >
                      <Grid cols={1} gap="10px">
                        {row.scoringBlocks.map((block, index) => (
                          <Grid cols={1} gap="4px" key={`${row.serial}-block-${index}`}>
                            {block.title ? (
                              <Text as="div" size="sm" weight="semibold" color="primary">
                                {block.title}
                              </Text>
                            ) : null}
                            <Grid cols={1} gap="3px">
                              {block.lines.map((line) => (
                                <Text as="div" size="sm" color="body" leading={1.55} key={line}>
                                  {line}
                                </Text>
                              ))}
                            </Grid>
                          </Grid>
                        ))}
                      </Grid>
                    </td>
                  </tr>
                ))}
                <tr style={{ borderTop: "1px solid var(--color-border-primary)", backgroundColor: "var(--color-bg-secondary)" }}>
                  <td style={{ padding: "12px 10px" }} />
                  <Surface as="td" padding="12px" color="primary" size="base" weight="semibold" style={{ borderLeft: "1px solid var(--color-border-primary)" }}>
                    Total
                  </Surface>
                  <Surface as="td" padding="12px" color="brand" size="xl" weight="bold" style={{ borderLeft: "1px solid var(--color-border-primary)" }}>
                    100 Marks
                  </Surface>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </VStack>
    </Modal>
  )
}

