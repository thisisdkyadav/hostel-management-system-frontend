import { useEffect, useState } from "react"
import { Button, Grid, HStack, InfoRow, Input, Modal, Text } from "hzero"
import { SECTION_MAX_POINTS, clampPoints } from "../scoring"
import { fieldClusterStyle, fieldLabelStyle } from "../styles"
import { Save } from "lucide-react"
import { infoBoxStyle, sectionLabelStyle } from "@/components/gymkhana/events-page/sharedPrimitives"

export const EditCourseworkScoreModal = ({
  open,
  scoreValue,
  saving = false,
  onClose,
  onSave,
}) => {
  const [draftScore, setDraftScore] = useState("")

  useEffect(() => {
    if (open) {
      setDraftScore(scoreValue || "")
    }
  }, [open, scoreValue])

  if (!open) return null

  const numericScore = Number(draftScore)
  const isValidScore = !Number.isNaN(numericScore) && numericScore >= 6.5 && numericScore <= 10
  const previewPoints = isValidScore
    ? clampPoints(numericScore * 1.5, SECTION_MAX_POINTS.coursework)
    : 0

  return (
    <Modal title="Edit CGPA / CPI" onClose={onClose} width={520}>
      <Grid cols={1} gap={4}>
        <div style={infoBoxStyle}>
          <div style={{ ...sectionLabelStyle, marginBottom: "6px" }}>Coursework Score</div>
          <Text as="div" color="body" size="sm" leading={1.6}>
            Update the verified CGPA / CPI. The coursework points and total score will be recalculated after saving.
          </Text>
        </div>

        <div style={fieldClusterStyle}>
          <label style={fieldLabelStyle}>CGPA / CPI</label>
          <Input
            type="number"
            min="6.5"
            max="10"
            step="0.01"
            value={draftScore}
            onChange={(event) => setDraftScore(event.target.value)}
            disabled={saving}
            placeholder="Enter CGPA / CPI"
          />
          <Text as="div" color={isValidScore ? "var(--color-text-muted)" : "var(--color-danger)"}>
            Enter a value between 6.50 and 10.00.
          </Text>
        </div>

        <InfoRow label="Coursework points preview" value={<>+{previewPoints}</>} style={{ padding: "var(--spacing-3)", border: "1px solid var(--color-border-primary)", borderRadius: "var(--radius-card-sm)", backgroundColor: "var(--color-bg-secondary)" }} />

        <HStack gap={2} justify="end">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={() => onSave(numericScore)}
            loading={saving}
            disabled={saving || !isValidScore}
          >
            <Save size={14} /> Save CGPA / CPI
          </Button>
        </HStack>
      </Grid>
    </Modal>
  )
}

