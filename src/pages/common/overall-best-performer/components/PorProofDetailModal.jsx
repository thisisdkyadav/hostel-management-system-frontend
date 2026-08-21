import { Grid, HStack, Modal, Text, VStack } from "hzero"
import { buildMetaChipStyle, fieldClusterStyle } from "../styles"
import { CalendarDays } from "lucide-react"
import { sectionLabelStyle } from "@/components/gymkhana/events-page/sharedPrimitives"

export const PorProofDetailModal = ({ open, onClose, porRequest }) => {
  if (!open || !porRequest) return null

  return (
    <Modal
      title="Verified POR Details"
      onClose={onClose}
      width={980}
      minHeight="50vh"
      closeButtonVariant="button"
    >
      <VStack gap={4}>
        <HStack gap={2} wrap>
          <span style={buildMetaChipStyle({ fontFamily: "monospace", backgroundColor: "var(--color-bg-muted)" })}>
            {porRequest.id}
          </span>
          <span style={buildMetaChipStyle()}>{porRequest.status || "approved"}</span>
          <span style={buildMetaChipStyle()}>{porRequest.gymkhanaCategoryLabel || "—"}</span>
          <span style={buildMetaChipStyle()}>
            <CalendarDays size={12} />
            {porRequest.approvedAt
              ? `Verified ${new Date(porRequest.approvedAt).toLocaleString()}`
              : porRequest.updatedAt || porRequest.createdAt
                ? `Updated ${new Date(porRequest.updatedAt || porRequest.createdAt).toLocaleString()}`
                : "Timestamp unavailable"}
          </span>
        </HStack>

        <Grid cols="minmax(0, 1.15fr) minmax(0, 0.85fr)" gap={4}>
          <Grid cols={1} gap={4}>
            <div style={fieldClusterStyle}>
              <span style={sectionLabelStyle}>POR Submission</span>
              <Text as="div" size="lg" weight="semibold" color="primary">
                {porRequest.positionTitle || "—"}
              </Text>
              <Text as="div" color="muted" size="sm">
                Tenure: {porRequest.tenure || "—"}
              </Text>
              <Text as="div" size="sm" color="body" leading={1.7}>
                {porRequest.positionDetails || "—"}
              </Text>
            </div>

            <div style={fieldClusterStyle}>
              <span style={sectionLabelStyle}>Disciplinary Disclosure</span>
              <Text as="div" size="sm" weight="semibold" color="primary">
                {porRequest.hasDisciplinaryAction ? "Disciplinary action disclosed" : "No disciplinary action declared"}
              </Text>
              {porRequest.hasDisciplinaryAction ? (
                <Text as="div" size="sm" color="body" leading={1.7}>
                  {porRequest.disciplinaryActionDetails || "No details provided."}
                </Text>
              ) : null}
            </div>
          </Grid>

          <Grid cols={1} gap={4}>
            <div style={fieldClusterStyle}>
              <span style={sectionLabelStyle}>Student Details</span>
              <Grid cols={1} gap={2} style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>
                <div><strong>Name:</strong> {porRequest.student?.name || "—"}</div>
                <div><strong>Roll Number:</strong> {porRequest.student?.rollNumber || "—"}</div>
                <div><strong>Email:</strong> {porRequest.student?.email || "—"}</div>
                <div><strong>Department:</strong> {porRequest.student?.department || "—"}</div>
                <div><strong>Degree:</strong> {porRequest.student?.degree || "—"}</div>
                <div><strong>Batch:</strong> {porRequest.student?.batch || "—"}</div>
              </Grid>
            </div>

            <div style={fieldClusterStyle}>
              <span style={sectionLabelStyle}>Routing Details</span>
              <Grid cols={1} gap={2} style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>
                <div><strong>Club:</strong> {porRequest.club?.name || "—"}</div>
                <div><strong>Club Email:</strong> {porRequest.club?.email || "—"}</div>
                <div><strong>GS Category:</strong> {porRequest.gymkhanaCategoryLabel || "—"}</div>
                <div><strong>Current Stage:</strong> {porRequest.currentApprovalStage || "Completed"}</div>
                <div><strong>Revision Count:</strong> {porRequest.revisionCount || 0}</div>
              </Grid>
            </div>
          </Grid>
        </Grid>
      </VStack>
    </Modal>
  )
}

