import { useEffect, useState } from "react"
import { Button, Grid, HStack, Modal, Select, Text } from "hzero"
import { BTP_AWARD_OPTIONS, BTP_AWARD_POINTS, PROJECT_GRADE_OPTIONS, PROJECT_GRADE_POINTS } from "../scoring"
import { fieldClusterStyle, fieldLabelStyle } from "../styles"
import { Save } from "lucide-react"
import { infoBoxStyle, sectionLabelStyle } from "@/components/gymkhana/events-page/sharedPrimitives"

export const EditProjectThesisGradesModal = ({
  open,
  projectThesis,
  saving = false,
  onClose,
  onSave,
}) => {
  const [btpAwardLevel, setBtpAwardLevel] = useState("none")
  const [projectGrade, setProjectGrade] = useState("none")

  useEffect(() => {
    if (open) {
      setBtpAwardLevel(projectThesis?.btpAwardLevel || "none")
      setProjectGrade(projectThesis?.projectGrade || "none")
    }
  }, [open, projectThesis?.btpAwardLevel, projectThesis?.projectGrade])

  if (!open) return null

  const btpPoints = Number(BTP_AWARD_POINTS[btpAwardLevel] || 0)
  const projectGradePoints = Number(PROJECT_GRADE_POINTS[projectGrade] || 0)
  const currentBtpPoints = Number(BTP_AWARD_POINTS[projectThesis?.btpAwardLevel] || 0)
  const currentProjectGradePoints = Number(PROJECT_GRADE_POINTS[projectThesis?.projectGrade] || 0)
  const previewPoints = btpPoints + projectGradePoints
  const currentPoints = currentBtpPoints + currentProjectGradePoints
  const hasChanges =
    btpAwardLevel !== (projectThesis?.btpAwardLevel || "none") ||
    projectGrade !== (projectThesis?.projectGrade || "none")

  return (
    <Modal title="Edit BTP & Project Grade" onClose={onClose} width={620}>
      <Grid cols={1} gap={4}>
        <div style={infoBoxStyle}>
          <div style={{ ...sectionLabelStyle, marginBottom: "6px" }}>BTP / Project Grade Score</div>
          <Text as="div" color="body" size="sm" leading={1.6}>
            Update the verified BTP award and project grade. Project/thesis points and total score will be recalculated after saving.
          </Text>
        </div>

        <Grid min={240} gap={3}>
          <div style={fieldClusterStyle}>
            <label style={fieldLabelStyle}>BTP award</label>
            <Select
              name="btpAwardLevel"
              value={btpAwardLevel}
              onChange={(event) => setBtpAwardLevel(event.target.value)}
              options={BTP_AWARD_OPTIONS}
              disabled={saving}
            />
          </div>
          <div style={fieldClusterStyle}>
            <label style={fieldLabelStyle}>Project grade</label>
            <Select
              name="projectGrade"
              value={projectGrade}
              onChange={(event) => setProjectGrade(event.target.value)}
              options={PROJECT_GRADE_OPTIONS}
              disabled={saving}
            />
          </div>
        </Grid>

        <Grid cols={1} gap={2} style={{ padding: "var(--spacing-3)", border: "1px solid var(--color-border-primary)", borderRadius: "var(--radius-card-sm)", backgroundColor: "var(--color-bg-secondary)" }}>
          <HStack gap={3} justify="between">
            <Text as="span" size="sm" color="muted">BTP award points</Text>
            <Text as="span" weight="bold" color={btpPoints === 0 ? "var(--color-danger)" : "var(--color-primary)"}>
              +{btpPoints}
            </Text>
          </HStack>
          <HStack gap={3} justify="between">
            <Text as="span" size="sm" color="muted">Project grade points</Text>
            <Text as="span" weight="bold" color={projectGradePoints === 0 ? "var(--color-danger)" : "var(--color-primary)"}>
              +{projectGradePoints}
            </Text>
          </HStack>
          <div style={{ height: 1, backgroundColor: "var(--color-border-primary)" }} />
          <HStack gap={3} justify="between">
            <Text as="span" size="sm" color="primary" weight="semibold">
              Total preview
            </Text>
            <Text as="span" weight="bold" color={previewPoints === 0 ? "var(--color-danger)" : "var(--color-primary)"}>
              {hasChanges ? (
                <>
                  <Text as="span" color="muted" style={{ textDecoration: "line-through", marginRight: 6 }}>+{currentPoints}</Text>
                  +{previewPoints}
                </>
              ) : (
                <>+{previewPoints}</>
              )}
            </Text>
          </HStack>
        </Grid>

        <HStack gap={2} justify="end">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={() => onSave({ btpAwardLevel, projectGrade })}
            loading={saving}
            disabled={saving || !hasChanges}
          >
            <Save size={14} /> Save BTP Grades
          </Button>
        </HStack>
      </Grid>
    </Modal>
  )
}

