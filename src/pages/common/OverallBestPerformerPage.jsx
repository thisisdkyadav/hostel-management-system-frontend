import { useEffect, useMemo, useState } from "react"
import { DataTable, Button, Input, Panel } from "hzero"
import { Grid, HStack, InfoRow, Modal, Surface, Text, VStack } from "@/components/ui"
import {
  Download,
  FileText,
  CalendarDays,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  Eye,
  MessageSquare,
  Plus,
  Save,
  Trophy,
  Upload,
  Users,
  XCircle,
  BookOpen,
  Share2,
  Sparkles,
  Cpu,
  Activity,
  Compass,
  MoreHorizontal,
  Pencil,
} from "lucide-react"
import PageHeader from "@/components/common/PageHeader"
import CsvUploader from "@/components/common/CsvUploader"
import PdfUploadField from "@/components/common/pdf/PdfUploadField"
import PdfViewerModal from "@/components/common/pdf/PdfViewerModal"
import StudentDetailModal from "@/components/common/students/StudentDetailModal"
import ProfileAvatar from "@/components/profile/ProfileAvatar"
import {
  infoBoxStyle,
  sectionLabelStyle,
} from "@/components/gymkhana/events-page/sharedPrimitives"
import {
  EmptyState,
  ErrorState,
  LoadingState,
  useToast,
} from "@/components/ui/feedback"
import { Badge, Select, StatCards } from "@/components/ui"
import { useAuth } from "@/contexts/AuthProvider"
import useLocalFormDraft, {
  readLocalFormDraft,
} from "@/hooks/useLocalFormDraft"
import { overallBestPerformerApi, porApi, studentApi } from "@/service"
import "../../styles/por-requests.css"

import { ACTIVITY_LEVEL_OPTIONS, APPLICANT_STAGE_OPTIONS, AWARD_OPTIONS, BTP_AWARD_OPTIONS, BTP_AWARD_POINTS, CO_CURRICULAR_OPTIONS, MARKING_SCHEME_ROWS, PROJECT_GRADE_OPTIONS, PROJECT_GRADE_POINTS, PROOF_SOURCE_OPTIONS, PUBLICATION_OPTIONS, RESPONSIBILITY_OPTIONS, REVIEW_SECTION_META, SECTION_MAX_POINTS, TECH_TRANSFER_OPTIONS, clampPoints, computeStudentScorePreview, formatScoreTypeLabel, formatSignedPoints, getApplicantStage, getApplicationItemsForReviewSection, validateScoredItems } from "./overall-best-performer/scoring"
import { badgeStyle, buildMetaChipStyle, checklistItemStyle, fieldClusterStyle, fieldLabelStyle, getApplicationWindowLabel, getPointBadgeStyle, helperTextStyle, inputStyle, statusTone, textareaStyle } from "./overall-best-performer/styles"
import { collectApplicationPdfDocuments, collectLinkedPorsFromApplication, downloadBlobFile, downloadCsvFile, escapeCsvValue, formatExportDateTime, getPorOptionLabel, mergePdfDocuments, resolvePrimaryProof, slugifyFilePart, summarizeItemsForExport, summarizeProofsForExport, uploadBestPerformerProof } from "./overall-best-performer/documents"
import { buildEligibleStudentRows, buildOverallBestPerformerDraftKey, buildPayload, createEmptyItem, createInitialForm, createOccurrenceFormState, formatDateTimeInput, getDefaultBestPerformerOccurrenceId, hasSelectedProof, normalizeRollNumbers } from "./overall-best-performer/form"






































































const PorProofDetailModal = ({ open, onClose, porRequest }) => {
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

const SupportingProofField = ({
  label,
  proofSourceType = "upload",
  proofUrl = "",
  proofPorId = "",
  onChange,
  verifiedPors = [],
  disabled = false,
  uploadedText = "Supporting PDF uploaded",
  viewerTitle = "Supporting document",
}) => {
  const [showPorModal, setShowPorModal] = useState(false)
  const selectedPor = (verifiedPors || []).find((por) => por.id === proofPorId) || null
  const canUsePor = Array.isArray(verifiedPors) && verifiedPors.length > 0
  const effectiveSourceType = proofSourceType === "por" && canUsePor ? "por" : "upload"

  const handleSourceChange = (nextSourceType) => {
    if (nextSourceType === "por") {
      onChange({
        proofSourceType: "por",
        proofUrl: "",
        proofPorId: proofPorId || selectedPor?.id || "",
      })
      return
    }

    onChange({
      proofSourceType: "upload",
      proofUrl,
      proofPorId: "",
    })
  }

  return (
    <>
      <Grid cols={1} gap={3}>
        {canUsePor ? (
          <div style={fieldClusterStyle}>
            <span style={sectionLabelStyle}>Proof Source</span>
            <HStack gap={2} wrap>
              {PROOF_SOURCE_OPTIONS.map((option) => (
                <Button
                  key={`${label}-${option.value}`}
                  size="sm"
                  variant={effectiveSourceType === option.value ? undefined : "secondary"}
                  onClick={() => handleSourceChange(option.value)}
                  disabled={disabled}
                >
                  {option.label}
                </Button>
              ))}
            </HStack>
          </div>
        ) : null}

        {effectiveSourceType === "por" ? (
          <div style={fieldClusterStyle}>
            <span style={sectionLabelStyle}>{label}</span>
            <Select
              name={`${label}-verifiedPor`}
              value={proofPorId}
              onChange={(event) =>
                onChange({
                  proofSourceType: "por",
                  proofUrl: "",
                  proofPorId: event.target.value,
                })
              }
              disabled={disabled}
              placeholder="Select a verified POR"
              options={(verifiedPors || []).map((por) => ({
                value: por.id,
                label: getPorOptionLabel(por),
              }))}
            />

            {selectedPor ? (
              <div
                style={{
                  padding: "var(--spacing-3)",
                  borderRadius: "var(--radius-card-sm)",
                  border: "1px solid var(--color-border-primary)",
                  backgroundColor: "var(--color-bg-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "var(--spacing-3)",
                  flexWrap: "wrap",
                }}
              >
                <Grid cols={1} gap="4px">
                  <Text as="div" size="sm" weight="semibold" color="primary">
                    {selectedPor.positionTitle || "Verified POR"}
                  </Text>
                  <Text as="div" size="xs" color="muted">
                    {selectedPor.club?.name || "—"} · {selectedPor.gymkhanaCategoryLabel || "—"} · {selectedPor.tenure || "—"}
                  </Text>
                </Grid>
                <Button size="sm" variant="secondary" onClick={() => setShowPorModal(true)}>
                  <Eye size={14} /> View POR
                </Button>
              </div>
            ) : (
              <div style={helperTextStyle}>Select one of your verified PORs to use it as supporting proof.</div>
            )}
          </div>
        ) : (
          <PdfUploadField
            label={label}
            value={proofUrl}
            onChange={(url) =>
              onChange({
                proofSourceType: "upload",
                proofUrl: url,
                proofPorId: "",
              })
            }
            onUpload={uploadBestPerformerProof}
            disabled={disabled}
            uploadedText={uploadedText}
            viewerTitle={viewerTitle}
          />
        )}

        {!canUsePor ? (
          <div style={helperTextStyle}>Only uploaded PDFs are available right now because you do not have any verified PORs yet.</div>
        ) : null}
      </Grid>

      <PorProofDetailModal
        open={showPorModal}
        onClose={() => setShowPorModal(false)}
        porRequest={selectedPor}
      />
    </>
  )
}

const MinimalScoredItemsEditor = ({
  step,
  title,
  subtitle,
  items,
  onChange,
  options,
  verifiedPors = [],
  disabled = false,
  uploadLabel = "Supporting document",
  titleLabel = "Title",
  titlePlaceholder = "",
  descriptionLabel = "Description",
  descriptionPlaceholder = "",
  embedded = false,
}) => {
  const rows = Array.isArray(items) ? items : []

  const updateItem = (index, field, value) => {
    onChange(rows.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)))
  }

  const updateItemFields = (index, nextFields) => {
    onChange(
      rows.map((item, itemIndex) => (itemIndex === index ? { ...item, ...nextFields } : item))
    )
  }

  const addItem = () => {
    onChange([...(rows || []), createEmptyItem(options?.[0]?.value || "")])
  }

  const removeItem = (index) => {
    onChange(rows.filter((_, itemIndex) => itemIndex !== index))
  }

  const content = (
    <>
      <VStack gap={3}>
        {!rows.length ? (
          <Text as="div" color="muted" size="sm" style={{ fontStyle: "italic", padding: "var(--spacing-2) 0" }}>
            No entries added yet.
          </Text>
        ) : null}
 
        {rows.map((item, index) => (
          <Grid cols={1} gap={3} style={{ padding: "var(--spacing-4)", borderRadius: "var(--radius-card-sm)", border: "1px solid var(--color-border-primary)", backgroundColor: "var(--color-bg-secondary)" }} key={`${title}-${index}`}>
            <HStack gap={3} align="center" justify="between" wrap>
              <HStack gap={2} align="center" wrap>
                <span style={sectionLabelStyle}>Item {index + 1}</span>
                {item.scoreType ? (
                  <span style={buildMetaChipStyle()}>
                    {options.find((option) => option.value === item.scoreType)?.label || item.scoreType}
                  </span>
                ) : null}
              </HStack>
              {!disabled ? (
                <Button size="sm" variant="ghost" onClick={() => removeItem(index)}>
                  Remove
                </Button>
              ) : null}
            </HStack>
 
            <Grid cols={1} gap={3}>
              <div>
                <label style={fieldLabelStyle}>Marking category</label>
                <Select
                  name={`scoreType-${index}`}
                  value={item.scoreType}
                  disabled={disabled}
                  onChange={(event) => updateItem(index, "scoreType", event.target.value)}
                  options={options}
                  placeholder="Select marking category"
                />
              </div>
              <div>
                <label style={fieldLabelStyle}>{titleLabel}</label>
                <input
                  value={item.title}
                  disabled={disabled}
                  onChange={(event) => updateItem(index, "title", event.target.value)}
                  style={inputStyle}
                  placeholder={titlePlaceholder}
                />
              </div>
              <div>
                <label style={fieldLabelStyle}>{descriptionLabel}</label>
                <textarea
                  value={item.notes}
                  disabled={disabled}
                  onChange={(event) => updateItem(index, "notes", event.target.value)}
                  style={textareaStyle}
                  placeholder={descriptionPlaceholder}
                />
              </div>
              <div>
                <SupportingProofField
                  label={uploadLabel}
                  proofSourceType={item.proofSourceType}
                  proofUrl={item.proofUrl}
                  proofPorId={item.proofPorId}
                  onChange={(proofState) => updateItemFields(index, proofState)}
                  verifiedPors={verifiedPors}
                  disabled={disabled}
                  uploadedText="Supporting PDF uploaded"
                  viewerTitle={`${title} supporting document`}
                />
              </div>
            </Grid>
          </Grid>
        ))}
      </VStack>
    </>
  )
 
  if (embedded) {
    return (
      <Grid cols={1} gap={3}>
        <HStack gap={3} align="start" justify="between" wrap>
          <div>
            <div style={sectionLabelStyle}>{title}</div>
          </div>
          {!disabled ? <Button size="sm" variant="secondary" onClick={addItem}><Plus size={14} /> Add item</Button> : null}
        </HStack>
        {content}
      </Grid>
    )
  }
 
  return (
    <Panel
      title={`${step}. ${title}`}
      actions={!disabled ? <Button size="sm" variant="secondary" onClick={addItem}><Plus size={14} /> Add item</Button> : null}
    >
      {content}
    </Panel>
  )
}
 
const SingleSelectionAchievementEditor = ({
  heading,
  value,
  options,
  titleValue,
  notesValue,
  proofUrl,
  proofSourceType = "upload",
  proofPorId = "",
  onValueChange,
  onTitleChange,
  onNotesChange,
  onProofChange,
  verifiedPors = [],
  disabled = false,
  titleLabel = "Title",
  titlePlaceholder = "",
  descriptionLabel = "Description",
  descriptionPlaceholder = "",
}) => (
  <Grid cols={1} gap={3}>
    <Grid cols={1} gap={3}>
      <div>
        <label style={fieldLabelStyle}>{heading} category</label>
        <Select
          name={`${heading}-category`}
          value={value}
          disabled={disabled}
          onChange={(event) => onValueChange(event.target.value)}
          options={options}
          placeholder={`Select ${heading} category`}
        />
      </div>

      {value !== "none" ? (
        <>
          <div>
            <label style={fieldLabelStyle}>{titleLabel}</label>
            <input
              value={titleValue}
              disabled={disabled}
              onChange={(event) => onTitleChange(event.target.value)}
              style={inputStyle}
              placeholder={titlePlaceholder}
            />
          </div>
          <div>
            <label style={fieldLabelStyle}>{descriptionLabel}</label>
            <textarea
              value={notesValue}
              disabled={disabled}
              onChange={(event) => onNotesChange(event.target.value)}
              style={textareaStyle}
              placeholder={descriptionPlaceholder}
            />
          </div>
          <div>
            <SupportingProofField
              label="Supporting document"
              proofSourceType={proofSourceType}
              proofUrl={proofUrl}
              proofPorId={proofPorId}
              onChange={onProofChange}
              verifiedPors={verifiedPors}
              disabled={disabled}
              uploadedText="Supporting PDF uploaded"
              viewerTitle={`${heading} supporting document`}
            />
          </div>
        </>
      ) : (
        <Text as="div" size="sm" color="muted" leading={1.6}>
          Leave this as `No entry` if it does not apply to you.
        </Text>
      )}
    </Grid>
  </Grid>
)

const SummaryMetric = ({ icon: Icon, label, value }) => {
  const getMetricSettings = (lbl) => {
    const l = String(lbl).toLowerCase()
    if (l.includes("current") || l.includes("calculated")) {
      return {
        bg: "linear-gradient(135deg, var(--color-primary-bg) 0%, rgba(91, 159, 232, 0.04) 100%)",
        border: "var(--color-primary-bg)",
        text: "var(--color-primary)"
      }
    }
    if (l.includes("final")) {
      return {
        bg: "linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(34, 197, 94, 0.02) 100%)",
        border: "rgba(34, 197, 94, 0.15)",
        text: "var(--color-success)"
      }
    }
    return {
      bg: "linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(245, 158, 11, 0.02) 100%)",
      border: "rgba(245, 158, 11, 0.15)",
      text: "var(--color-warning)"
    }
  }

  const activeTone = getMetricSettings(label)

  return (
    <div style={{
      background: activeTone.bg,
      border: `1px solid ${activeTone.border}`,
      borderRadius: "var(--radius-card-sm)",
      padding: "var(--spacing-4)",
      display: "flex",
      alignItems: "center",
      gap: "var(--spacing-3)",
      boxShadow: "var(--shadow-sm)",
      transition: "all var(--transition-normal) ease",
    }} className="summary-metric-hover">
      <div style={{
        width: 44,
        height: 44,
        borderRadius: "var(--radius-md)",
        backgroundColor: `color-mix(in srgb, ${activeTone.text} 12%, transparent)`,
        color: activeTone.text,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0
      }}>
        {Icon && <Icon size={20} />}
      </div>
      <div>
        <Text as="div" size="xs" color="muted" weight="semibold" style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {label}
        </Text>
        <Text as="div" size="xl" weight="bold" color="primary" style={{ marginTop: "2px" }}>
          {value}
        </Text>
      </div>
    </div>
  )
}

const ScoreBreakdownCard = ({ breakdown }) => {
  const rows = [
    ["Coursework", breakdown?.coursework || 0, SECTION_MAX_POINTS.coursework],
    ["Project / Thesis", breakdown?.projectThesis || 0, SECTION_MAX_POINTS.projectThesis],
    ["Position of Responsibility", breakdown?.responsibilities || 0, SECTION_MAX_POINTS.responsibilities],
    ["Awards & Extracurricular", breakdown?.awards || 0, SECTION_MAX_POINTS.awards],
    ["Cultural", breakdown?.cultural || 0, SECTION_MAX_POINTS.cultural],
    ["Science & Technology", breakdown?.scienceTechnology || 0, SECTION_MAX_POINTS.scienceTechnology],
    ["Games & Sports", breakdown?.gamesSports || 0, SECTION_MAX_POINTS.gamesSports],
    ["Co-curricular", breakdown?.coCurricular || 0, SECTION_MAX_POINTS.coCurricular],
  ]

  return (
    <Panel title="Score Breakdown">
      <Panel.Body>
        {rows.map(([label, value, max]) => {
          const pct = Math.min(100, Math.max(0, (value / max) * 100))
          return (
            <div key={label} className="por-scorecard-row">
              <div className="por-scorecard-header">
                <span className="por-scorecard-label">{label}</span>
                <span className="por-scorecard-value-container">
                  {value} <span className="por-scorecard-max">/ {max}</span>
                </span>
              </div>
              <div className="por-scorecard-progress-bg">
                <div
                  className="por-scorecard-progress-bar"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: pct >= 100 ? "var(--color-success)" : "var(--color-primary)",
                  }}
                />
              </div>
            </div>
          )
        })}
        <InfoRow label="Total Score" value={breakdown?.total || 0} style={{ marginTop: "var(--spacing-4)" }} />
      </Panel.Body>
    </Panel>
  )
}

const MarkingSchemeModal = ({ open, onClose }) => {
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

const ProofActionButton = ({ proof, onViewPor, onViewPdf }) => {
  if (!proof) {
    return <Text as="span" color="muted">—</Text>
  }

  if (proof.sourceType === "por") {
    if (!proof.linkedPor) {
      return <Text as="span" color="muted">Verified POR linked</Text>
    }

    return (
      <Button size="sm" variant="secondary" onClick={() => onViewPor?.(proof.linkedPor || null)}>
        <Eye size={14} /> View POR
      </Button>
    )
  }

  if (proof.url) {
    return (
      <Button
        size="sm"
        variant="secondary"
        onClick={() =>
          onViewPdf?.({
            url: proof.url,
            title: proof.label || "Supporting Document",
          })
        }
      >
        <Eye size={14} /> View PDF
      </Button>
    )
  }

  return <Text as="span" color="muted">—</Text>
}

const PorDetailCard = ({
  icon: Icon,
  title,
  accentColor = "var(--color-primary)",
  children,
  headerAction = null,
  bodyStyle = null,
}) => (
  <div className="por-detail-card" style={{ marginTop: "var(--spacing-4)" }}>
    <div className="por-detail-card-header">
      <div className="por-detail-card-header-left">
        <span
          className="por-detail-card-icon-wrapper"
          style={{
            backgroundColor: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
            color: accentColor,
            width: 24,
            height: 24,
            borderRadius: "var(--radius-md)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {Icon && <Icon size={14} />}
        </span>
        <h4 className="por-detail-card-title">{title}</h4>
      </div>
      {headerAction}
    </div>
    <div className="por-detail-card-body" style={bodyStyle || undefined}>{children}</div>
  </div>
)

const PorDetailInfoRow = ({ label, value }) => (
  <div className="por-detail-info-row">
    <span className="por-detail-info-label">{label}</span>
    <span className="por-detail-info-value">{value}</span>
  </div>
)








const ItemsReviewTable = ({ title, items = [], onViewPor, onViewPdf, onOpenMore }) => {
  if (!items.length) return null

  const meta = REVIEW_SECTION_META[title] || { icon: FileText, accent: "var(--color-primary)" }
  const Icon = meta.icon
  const accentColor = meta.accent

  return (
    <PorDetailCard icon={Icon} title={title} accentColor={accentColor} bodyStyle={{ padding: 0, gap: 0 }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 680 }}>
          <thead>
            <tr style={{ backgroundColor: "var(--color-bg-secondary)", borderBottom: "1px solid var(--color-border-primary)" }}>
              {["Title", "Type", "Points", "Proof", ""].map((heading) => (
                <th
                  key={heading || "more"}
                  style={{
                    textAlign: "left",
                    padding: "10px 16px",
                    fontSize: "var(--font-size-xs)",
                    color: "var(--color-text-muted)",
                    textTransform: "uppercase",
                    fontWeight: "var(--font-weight-semibold)",
                    letterSpacing: "0.05em",
                    ...(heading === "Proof" ? { width: 140, minWidth: 140 } : {}),
                    ...(heading === "" ? { width: 96, minWidth: 96, textAlign: "right" } : {}),
                  }}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={`${title}-${index}`} className="por-review-table-row" style={{ borderBottom: index < items.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                <Surface as="td" padding="12px 16px" color="primary" size="sm" weight="medium">{item.title}</Surface>
                <Surface as="td" padding="12px 16px" color="body" size="sm">{formatScoreTypeLabel(item.scoreType)}</Surface>
                <td style={{ padding: "12px 16px" }}>
                  <span style={getPointBadgeStyle(item.calculatedPoints || 0)}>
                    +{item.calculatedPoints || 0}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", width: 140, minWidth: 140 }}>
                  <ProofActionButton proof={resolvePrimaryProof(item.proofs)} onViewPor={onViewPor} onViewPdf={onViewPdf} />
                </td>
                <Surface as="td" padding="12px 16px" align="right">
                  <Button
                    size="sm"
                    onClick={() =>
                      onOpenMore?.({
                        sectionTitle: title,
                        sectionKey: meta.sectionKey,
                        options: meta.options || [],
                        item,
                        itemIndex: index,
                      })
                    }
                  >
                    <MoreHorizontal size={14} /> More
                  </Button>
                </Surface>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PorDetailCard>
  )
}

const ReviewItemDetailModal = ({
  detail,
  canEditType = false,
  saving = false,
  onClose,
  onSaveType,
  onViewPor,
  onViewPdf,
}) => {
  const [selectedType, setSelectedType] = useState(detail?.item?.scoreType || "")
  const [selectedExcludedFromScoring, setSelectedExcludedFromScoring] = useState(
    Boolean(detail?.item?.excludedFromScoring)
  )

  const item = detail?.item || {}
  const currentScoreType = item.scoreType || ""
  const currentExcludedFromScoring = Boolean(item.excludedFromScoring)
  const proofs = Array.isArray(item.proofs) ? item.proofs : []
  const typeOptions = useMemo(() => {
    const options = Array.isArray(detail?.options) ? detail.options : []
    if (!item.scoreType || options.some((option) => option.value === item.scoreType)) return options
    return [{ value: item.scoreType, label: formatScoreTypeLabel(item.scoreType) }, ...options]
  }, [detail?.options, item.scoreType])

  useEffect(() => {
    setSelectedType(currentScoreType)
    setSelectedExcludedFromScoring(currentExcludedFromScoring)
  }, [currentScoreType, currentExcludedFromScoring, detail?.itemIndex, detail?.sectionKey])

  if (!detail) return null

  const canSave =
    canEditType &&
    selectedType &&
    (selectedType !== item.scoreType || selectedExcludedFromScoring !== currentExcludedFromScoring)

  const meta = (detail?.sectionTitle && REVIEW_SECTION_META[detail.sectionTitle]) || {
    icon: FileText,
    accent: "var(--color-primary)",
    pointsMap: {},
  }
  const SectionIcon = meta.icon
  const accentColor = meta.accent
  const pointsMap = meta.pointsMap || {}
  const currentPoints = Number(item.calculatedPoints ?? pointsMap[item.scoreType] ?? 0)
  const nextPoints = selectedExcludedFromScoring ? 0 : Number(pointsMap[selectedType] ?? currentPoints)
  const pointsDelta = nextPoints - currentPoints
  const hasPointChange =
    canEditType &&
    selectedType &&
    (selectedType !== item.scoreType || selectedExcludedFromScoring !== currentExcludedFromScoring)
  const isNextZeroPoints = nextPoints === 0
  const deltaColor = pointsDelta > 0
    ? "var(--color-success)"
    : pointsDelta < 0
      ? "var(--color-danger)"
      : "var(--color-text-muted)"
  const nextPointColor = isNextZeroPoints ? "var(--color-danger)" : "var(--color-primary)"

  const titleNode = (
    <HStack gap={3} align="center">
      <span
        style={{
          backgroundColor: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
          color: accentColor,
          width: 36,
          height: 36,
          borderRadius: "var(--radius-md)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {SectionIcon && <SectionIcon size={18} />}
      </span>
      <div style={{ minWidth: 0 }}>
        <Text as="div" size="xs" weight="semibold" color="muted" style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {detail.sectionTitle}
        </Text>
        <Text as="div" size="md" weight="bold" color="heading" style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
          {item.title || "Untitled Item"}
        </Text>
      </div>
    </HStack>
  )

  return (
    <Modal title={titleNode} onClose={onClose} width={1200}>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)", padding: "var(--spacing-1)" }}>
        {/* Main 2-Column Responsive Layout using Pure CSS Grid */}
        <Grid min={360} gap={4} align="start">
          {/* Left Column: Achievement Details */}
          <VStack gap={4}>
            <PorDetailCard
              icon={SectionIcon}
              title="Achievement Details"
              accentColor={accentColor}
              bodyStyle={{ padding: "var(--spacing-3)" }}
            >
              <div className="por-detail-info-grid">
                <PorDetailInfoRow label="Year" value={item.year || "—"} />
                <PorDetailInfoRow label="Level" value={item.level || "—"} />
                <PorDetailInfoRow label="Event name" value={item.eventName || "—"} />
                <PorDetailInfoRow label="Performance" value={item.performance || "—"} />
                <PorDetailInfoRow label="Participation" value={item.participationType || "—"} />
                <PorDetailInfoRow label="Reference code" value={item.referenceCode || "—"} />
              </div>
            </PorDetailCard>

            {/* Notes Section styled beautifully */}
            <div style={{
              background: "var(--color-bg-secondary)",
              border: "1px solid var(--color-border-primary)",
              borderLeft: `4px solid ${accentColor}`,
              borderRadius: "var(--radius-card-sm)",
              padding: "var(--spacing-4)",
              boxShadow: "var(--shadow-sm)",
            }}>
              <HStack align="center" gap={2} size="xs" weight="semibold" color="secondary" style={{ marginBottom: "var(--spacing-2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <MessageSquare size={12} style={{ color: accentColor }} />
                Student Notes
              </HStack>
              <Text as="div" color={item.notes ? "var(--color-text-body)" : "var(--color-text-muted)"} size="sm" leading={1.6} style={{ fontStyle: item.notes ? "normal" : "italic" }}>
                {item.notes || "No notes added by the student."}
              </Text>
            </div>
          </VStack>

          {/* Right Column: Score, Classification & Proofs */}
          <VStack gap={4}>
            {/* Beautiful Dashboard Scorecard */}
            <div style={{
              background: "linear-gradient(135deg, var(--color-primary-bg) 0%, rgba(91, 159, 232, 0.05) 100%)",
              border: "1px solid var(--color-primary-bg)",
              borderRadius: "var(--radius-card-sm)",
              padding: "var(--spacing-4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "var(--spacing-4)",
              boxShadow: "var(--shadow-sm)",
              minHeight: 102,
            }}>
              <div>
                <Text as="div" size="xs" weight="bold" color="brand" style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {hasPointChange ? "Score Preview" : "Awarded Score"}
                </Text>
                <Text as="div" size="xs" color="muted" style={{ marginTop: "4px", minHeight: 16 }}>
                  {hasPointChange
                    ? selectedExcludedFromScoring
                      ? "Preview before excluding this entry from scoring"
                      : currentExcludedFromScoring
                        ? "Preview before restoring this entry to scoring"
                        : "Preview before saving this classification change"
                    : "Calculated based on verified level/type points"}
                </Text>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "center", gap: "4px", minHeight: 58 }}>
                <HStack align="baseline" gap="6px" size="xl" weight="bold" color="brand" style={{ minHeight: 26 }}>
                  {hasPointChange ? (
                    <>
                      <Text as="span" color="muted" style={{ textDecoration: "line-through" }}>
                        +{currentPoints}
                      </Text>
                      <Text as="span" color={nextPointColor}>+{nextPoints}</Text>
                    </>
                  ) : (
                    <Text as="span" color={currentPoints === 0 ? "var(--color-danger)" : "var(--color-primary)"}>
                      +{currentPoints}
                    </Text>
                  )}
                </HStack>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: 92,
                    minHeight: 22,
                    whiteSpace: "nowrap",
                    padding: "3px 8px",
                    borderRadius: "var(--radius-full)",
                    backgroundColor: `color-mix(in srgb, ${deltaColor} 12%, transparent)`,
                    color: deltaColor,
                    fontSize: "var(--font-size-xs)",
                    fontWeight: "var(--font-weight-bold)",
                    visibility: hasPointChange ? "visible" : "hidden",
                  }}
                >
                  {pointsDelta === 0 ? "No score change" : `${formatSignedPoints(pointsDelta)} change`}
                </span>
              </div>
            </div>

            {/* Achievement Re-classification / Admin Evaluator */}
            <div style={{
              background: "var(--color-bg-secondary)",
              border: "1px solid var(--color-border-primary)",
              borderRadius: "var(--radius-card-sm)",
              padding: "var(--spacing-4)",
              boxShadow: "var(--shadow-sm)"
            }}>
              <label style={{ ...fieldLabelStyle, display: "flex", alignItems: "center", gap: "var(--spacing-2)", marginBottom: "var(--spacing-3)" }}>
                <Sparkles size={12} style={{ color: "var(--color-primary)" }} />
                Category Re-classification
              </label>
              {canEditType ? (
                <VStack gap={2}>
                  <Select
                    name="bestPerformerItemType"
                    value={selectedType}
                    onChange={(event) => setSelectedType(event.target.value)}
                    options={typeOptions}
                    placeholder="Select classification"
                    disabled={saving}
                  />
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "var(--spacing-3)",
                      padding: "10px 12px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--color-border-primary)",
                      backgroundColor: selectedExcludedFromScoring
                        ? "color-mix(in srgb, var(--color-danger) 8%, var(--color-bg-primary))"
                        : "var(--color-bg-primary)",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <Text as="div" size="sm" weight="semibold" color={selectedExcludedFromScoring ? "var(--color-danger)" : "var(--color-text-primary)"}>
                        {selectedExcludedFromScoring ? "Excluded from scoring" : "Included in scoring"}
                      </Text>
                      <Text as="div" size="xs" color="muted" style={{ marginTop: 2 }}>
                        {selectedExcludedFromScoring
                          ? "This entry will count as 0 points after saving."
                          : "This entry contributes points according to its classification."}
                      </Text>
                    </div>
                    <Button
                      size="sm"
                      variant={selectedExcludedFromScoring ? "secondary" : "danger"}
                      onClick={() => setSelectedExcludedFromScoring((current) => !current)}
                      disabled={saving}
                      style={{ flexShrink: 0 }}
                    >
                      {selectedExcludedFromScoring ? "Restore Scoring" : "Exclude from Scoring"}
                    </Button>
                  </div>
                  <Text as="div" size="xs" color="muted" leading={1.4}>
                    Admins can re-classify the category or exclude entries that should not count. Score changes are previewed above before saving.
                  </Text>
                </VStack>
              ) : (
                <div>
                  <Text as="div" size="sm" weight="semibold" color="primary">
                    {formatScoreTypeLabel(item.scoreType)}
                  </Text>
                  <Text as="div" size="xs" color="muted" style={{ marginTop: "4px" }}>
                    Verified category (Read-only view)
                  </Text>
                </div>
              )}
            </div>

            {/* Supporting Proofs Container */}
            <div style={{
              background: "var(--color-bg-secondary)",
              border: "1px solid var(--color-border-primary)",
              borderRadius: "var(--radius-card-sm)",
              padding: "var(--spacing-4)",
              boxShadow: "var(--shadow-sm)"
            }}>
              <HStack gap={2} align="center" style={{ marginBottom: "var(--spacing-3)" }}>
                <FileText size={14} style={{ color: "var(--color-primary)" }} />
                Supporting Proofs
              </HStack>
              {proofs.length ? (
                <VStack gap={2}>
                  {proofs.map((proof, index) => {
                    const isPor = proof?.sourceType === "por"
                    const ProofIcon = isPor ? BadgeCheck : FileText
                    const iconColor = isPor ? "var(--color-success)" : "var(--color-primary)"
                    return (
                      <div
                        key={proof?._id || proof?.id || `${item.title || "proof"}-${index}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "var(--spacing-3)",
                          padding: "10px 12px",
                          border: "1px solid var(--color-border-primary)",
                          borderRadius: "var(--radius-md)",
                          backgroundColor: "var(--color-bg-primary)",
                          transition: "all var(--transition-normal) ease",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2-5)", minWidth: 0 }}>
                          <span style={{
                            width: 32,
                            height: 32,
                            borderRadius: "var(--radius-sm)",
                            backgroundColor: `color-mix(in srgb, ${iconColor} 8%, transparent)`,
                            color: iconColor,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0
                          }}>
                            <ProofIcon size={16} />
                          </span>
                          <div style={{ minWidth: 0 }}>
                            <Text as="div" size="sm" weight="medium" color="primary" style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                              {proof?.label || `Proof ${index + 1}`}
                            </Text>
                            <Text as="div" size="xs" color="muted">
                              {isPor ? "Verified Gymkhana POR" : "Uploaded PDF Document"}
                            </Text>
                          </div>
                        </div>
                        <ProofActionButton proof={proof} onViewPor={onViewPor} onViewPdf={onViewPdf} />
                      </div>
                    )
                  })}
                </VStack>
              ) : (
                <Surface padding={6} radius="md" border="1px dashed var(--color-border-primary)" color="muted" align="center" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <XCircle size={24} style={{ color: "var(--color-text-muted)", marginBottom: "8px" }} />
                  <Text as="span" size="sm">No supporting proof attached.</Text>
                </Surface>
              )}
            </div>
          </VStack>
        </Grid>

        {/* Footer Actions */}
        <div style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "var(--spacing-2)",
          marginTop: "var(--spacing-4)",
          paddingTop: "var(--spacing-4)",
          borderTop: "1px solid var(--color-border-primary)"
        }}>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Close
          </Button>
          {canEditType ? (
            <Button
              onClick={() => onSaveType(selectedType, selectedExcludedFromScoring)}
              loading={saving}
              disabled={!canSave || saving}
            >
              <Save size={14} /> Save Classification
            </Button>
          ) : null}
        </div>
      </div>
    </Modal>
  )
}

const formatHodVerificationActionLabel = (action = "") =>
  action === "verified" ? "Verified" : "Commented"

const HodVerificationsCard = ({ verifications = [] }) => {
  const entries = Array.isArray(verifications) ? verifications : []

  return (
    <PorDetailCard
      icon={MessageSquare}
      title="HOD Verifications"
      accentColor="var(--color-info)"
    >
      {entries.length > 0 ? (
        <Grid cols={1} gap={3}>
          {entries.map((entry, index) => (
            <Grid cols={1} gap={2} style={{ padding: "var(--spacing-3)", border: "1px solid var(--color-border-primary)", borderRadius: "var(--radius-lg)", backgroundColor: "var(--color-bg-secondary)" }} key={entry?.id || `${entry?.verifiedBy || "hod"}-${entry?.verifiedAt || index}`}>
              <HStack gap={3} align="center" justify="between" wrap>
                <Grid cols={1} gap="2px" style={{ minWidth: 0 }}>
                  <Text as="div" size="sm" weight="semibold" color="primary">
                    {entry?.verifierName || "HOD"}
                  </Text>
                  <Text as="div" size="xs" color="muted">
                    {entry?.verifierEmail || "Email not available"}
                  </Text>
                </Grid>
                <Badge variant={entry?.action === "verified" ? "success" : "info"}>
                  {formatHodVerificationActionLabel(entry?.action)}
                </Badge>
              </HStack>
              <Text as="div" size="sm" color="body" leading={1.7}>
                {entry?.remarks || "No remarks provided."}
              </Text>
              <Text as="div" size="xs" color="muted">
                {entry?.verifiedAt ? new Date(entry.verifiedAt).toLocaleString() : "Timestamp unavailable"}
              </Text>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Text as="div" size="sm" color="muted" leading={1.7}>
          No HOD verification or comments have been recorded yet.
        </Text>
      )}
    </PorDetailCard>
  )
}

const EditCourseworkScoreModal = ({
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

const EditProjectThesisGradesModal = ({
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

const ReviewModal = ({
  application,
  open,
  onClose,
  onDecision,
  onApplicationUpdated,
  deciding,
  reviewMode = "readonly",
}) => {
  const [remarks, setRemarks] = useState("")
  const [activePorDetail, setActivePorDetail] = useState(null)
  const [activePdfDetail, setActivePdfDetail] = useState(null)
  const [activeItemDetail, setActiveItemDetail] = useState(null)
  const [savingItemType, setSavingItemType] = useState(false)
  const [showCourseworkScoreModal, setShowCourseworkScoreModal] = useState(false)
  const [savingCourseworkScore, setSavingCourseworkScore] = useState(false)
  const [showProjectThesisGradesModal, setShowProjectThesisGradesModal] = useState(false)
  const [savingProjectThesisGrades, setSavingProjectThesisGrades] = useState(false)
  const [downloadingAllPdfs, setDownloadingAllPdfs] = useState(false)
  const [showReviewMarkingSchemeModal, setShowReviewMarkingSchemeModal] = useState(false)
  const [studentProfileId, setStudentProfileId] = useState(null)
  const [showStudentDetailModal, setShowStudentDetailModal] = useState(false)
  const { toast } = useToast()
  const canAdminReview = reviewMode === "admin"
  const canHodVerify = reviewMode === "hod"
  const canTakeAction = canAdminReview || canHodVerify
  const applicationPdfDocuments = useMemo(
    () => collectApplicationPdfDocuments(application),
    [application]
  )

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setRemarks(canAdminReview ? application?.review?.remarks || "" : "")
        setActivePorDetail(null)
        setActivePdfDetail(null)
        setActiveItemDetail(null)
        setSavingItemType(false)
        setShowCourseworkScoreModal(false)
        setSavingCourseworkScore(false)
        setShowProjectThesisGradesModal(false)
        setSavingProjectThesisGrades(false)
        setDownloadingAllPdfs(false)
        setShowReviewMarkingSchemeModal(false)
        setShowStudentDetailModal(false)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [open, application, canAdminReview])

  useEffect(() => {
    let isSubscribed = true

    const loadStudentProfileId = async () => {
      if (!open || !application?.studentUserId) {
        if (isSubscribed) {
          setStudentProfileId(null)
        }
        return
      }

      if (application?.studentProfileId) {
        setStudentProfileId(application.studentProfileId)
        return
      }

      try {
        const resolvedStudentId = await studentApi.getStudentId(application.studentUserId)
        if (!isSubscribed) return
        setStudentProfileId(resolvedStudentId || null)
      } catch (error) {
        console.error("Failed to resolve Best Performer student profile id:", error)
        if (!isSubscribed) return
        setStudentProfileId(null)
      }
    }

    loadStudentProfileId()

    return () => {
      isSubscribed = false
    }
  }, [application?.studentProfileId, application?.studentUserId, open])

  if (!open || !application) return null

  const handleDownloadAllPdfs = async () => {
    if (!applicationPdfDocuments.length) {
      toast.error("No supporting PDFs are attached to this application.")
      return
    }

    try {
      setDownloadingAllPdfs(true)
      const mergedPdfBytes = await mergePdfDocuments(applicationPdfDocuments)
      const filename = `${slugifyFilePart(application.rollNumber || application.studentName, "best-performer")}-supporting-documents.pdf`
      downloadBlobFile(new Blob([mergedPdfBytes], { type: "application/pdf" }), filename)
      toast.success("Supporting PDFs downloaded.")
    } catch (error) {
      console.error("Failed to merge Best Performer PDFs:", error)
      toast.error(error?.message || "Failed to download supporting PDFs.")
    } finally {
      setDownloadingAllPdfs(false)
    }
  }

  const handleOpenItemDetail = (detail) => {
    const latestItems = getApplicationItemsForReviewSection(application, detail?.sectionKey)
    setActiveItemDetail({
      ...detail,
      item: latestItems?.[detail?.itemIndex] || detail?.item || {},
    })
  }

  const handleSaveItemType = async (scoreType, excludedFromScoring = false) => {
    if (!canAdminReview || !application?.id || !activeItemDetail?.sectionKey) return

    try {
      setSavingItemType(true)
      const response = await overallBestPerformerApi.updateApplicationItemType(application.id, {
        sectionKey: activeItemDetail.sectionKey,
        itemIndex: activeItemDetail.itemIndex,
        scoreType,
        excludedFromScoring,
      })
      const updatedApplication = response?.data?.application || response?.application || null
      toast.success(response?.message || "Application item type updated")
      setActiveItemDetail(null)
      if (updatedApplication) {
        await onApplicationUpdated?.(updatedApplication)
      } else {
        await onApplicationUpdated?.()
      }
    } catch (error) {
      toast.error(error?.message || "Failed to update item type")
    } finally {
      setSavingItemType(false)
    }
  }

  const handleSaveCourseworkScore = async (scoreValue) => {
    if (!canAdminReview || !application?.id) return

    try {
      setSavingCourseworkScore(true)
      const response = await overallBestPerformerApi.updateApplicationCourseworkScore(application.id, {
        scoreValue,
      })
      const updatedApplication = response?.data?.application || response?.application || null
      toast.success(response?.message || "CGPA / CPI updated")
      setShowCourseworkScoreModal(false)
      if (updatedApplication) {
        await onApplicationUpdated?.(updatedApplication)
      } else {
        await onApplicationUpdated?.()
      }
    } catch (error) {
      toast.error(error?.message || "Failed to update CGPA / CPI")
    } finally {
      setSavingCourseworkScore(false)
    }
  }

  const handleSaveProjectThesisGrades = async (payload) => {
    if (!canAdminReview || !application?.id) return

    try {
      setSavingProjectThesisGrades(true)
      const response = await overallBestPerformerApi.updateApplicationProjectThesisGrades(application.id, payload)
      const updatedApplication = response?.data?.application || response?.application || null
      toast.success(response?.message || "BTP grades updated")
      setShowProjectThesisGradesModal(false)
      if (updatedApplication) {
        await onApplicationUpdated?.(updatedApplication)
      } else {
        await onApplicationUpdated?.()
      }
    } catch (error) {
      toast.error(error?.message || "Failed to update BTP grades")
    } finally {
      setSavingProjectThesisGrades(false)
    }
  }

  return (
    <Modal title={`${canTakeAction ? "Review" : "View"} ${application.studentName}`} onClose={onClose} width={1800} fullHeight={true}>
      <VStack gap={4}>
        {/* Upper Meta Bar */}
        <HStack gap={3} align="center" justify="between" wrap style={{ marginBottom: "var(--spacing-2)" }}>
          <HStack gap={2} align="center" wrap>
            <span className="por-detail-meta-chip por-detail-meta-chip-id">
              {application.rollNumber}
            </span>
            <Badge variant={statusTone(application.review?.status)}>{application.review?.status || "submitted"}</Badge>
            <span className="por-detail-meta-chip">
              <Trophy size={12} />
              Calculated Score: {application.calculatedTotal || 0}
            </span>
            <span className="por-detail-meta-chip">
              <CheckCircle2 size={12} />
              Final Score: {application.finalScore || 0}
            </span>
          </HStack>
          <HStack gap={2} align="center" wrap>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowReviewMarkingSchemeModal(true)}
            >
              <FileText size={14} /> Show Marking Scheme
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleDownloadAllPdfs}
              loading={downloadingAllPdfs}
              disabled={downloadingAllPdfs || !applicationPdfDocuments.length}
            >
              <Download size={14} /> Download All PDFs
            </Button>
          </HStack>
        </HStack>

        {/* Main 3-Column Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3" style={{ gap: "var(--spacing-4)", alignItems: "start" }}>
          
          {/* Main content - col-span-2 */}
          <VStack gap={4} style={{ marginTop: "calc(-1 * var(--spacing-4))" }} className="xl:col-span-2">
            
            {/* Academic profile card */}
            <PorDetailCard
              icon={Users}
              title="Student Academic Profile"
              accentColor="var(--color-primary)"
            >
              <div className="por-student-profile-header">
                <ProfileAvatar
                  user={{
                    name: application.studentName,
                    profileImage: application.studentProfileImage,
                  }}
                  size="medium"
                />
                <div className="por-student-profile-info" style={{ minWidth: 0 }}>
                  <span className="por-student-profile-name">{application.studentName}</span>
                  <span className="por-student-profile-roll">{application.rollNumber}</span>
                </div>
                {canAdminReview && application?.studentUserId ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setShowStudentDetailModal(true)}
                    disabled={!studentProfileId}
                    style={{ marginLeft: "auto", flexShrink: 0 }}
                  >
                    <Eye size={14} /> View Student Profile
                  </Button>
                ) : null}
              </div>

              <div className="por-detail-info-grid">
                <PorDetailInfoRow label="Programme" value={application.personalAcademic?.programme || "—"} />
                <PorDetailInfoRow label="Department" value={application.personalAcademic?.department || application.department || "—"} />
                <PorDetailInfoRow
                  label="CGPA / CPI"
                  value={
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--spacing-2)", flexWrap: "wrap" }}>
                      <span>{application.coursework?.scoreValue || "—"}</span>
                      {application.coursework?.proofs?.length ? (
                        <ProofActionButton
                          proof={resolvePrimaryProof(application.coursework?.proofs)}
                          onViewPor={setActivePorDetail}
                          onViewPdf={setActivePdfDetail}
                        />
                      ) : null}
                      {canAdminReview ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setShowCourseworkScoreModal(true)}
                        >
                          <Pencil size={14} /> Edit
                        </Button>
                      ) : null}
                    </span>
                  }
                />
              </div>

              {/* Declarations (Yes/No fields) styled beautifully! */}
              <div style={{ marginTop: "var(--spacing-4)", borderTop: "1px solid var(--color-border-primary)", paddingTop: "var(--spacing-4)" }}>
                <Text as="div" size="xs" weight="semibold" color="secondary" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--spacing-3)" }}>
                  Disclosures & Declarations
                </Text>
                <Grid cols={4} gap={3}>
                  <Surface padding="10px 12px" className={application.personalAcademic?.isPassingOutStudent ? "por-detail-success-card" : "por-detail-alert-card"}>
                    <Text as="div" size="xs" color="muted">Passing Out Student</Text>
                    <HStack align="center" gap="4px" size="sm" weight="bold" style={{ marginTop: "4px" }}>
                      {application.personalAcademic?.isPassingOutStudent ? (
                        <><CheckCircle2 size={14} className="text-[var(--color-success)]" /> Yes</>
                      ) : (
                        <><XCircle size={14} className="text-[var(--color-danger)]" /> No</>
                      )}
                    </HStack>
                  </Surface>
                  <Surface padding="10px 12px" className={application.personalAcademic?.hasNoDisciplinaryAction ? "por-detail-success-card" : "por-detail-alert-card"}>
                    <Text as="div" size="xs" color="muted">No Disciplinary Action</Text>
                    <HStack align="center" gap="4px" size="sm" weight="bold" style={{ marginTop: "4px" }}>
                      {application.personalAcademic?.hasNoDisciplinaryAction ? (
                        <><CheckCircle2 size={14} className="text-[var(--color-success)]" /> Declared Clean</>
                      ) : (
                        <><XCircle size={14} className="text-[var(--color-danger)]" /> Action Disclosed</>
                      )}
                    </HStack>
                  </Surface>
                  <Surface padding="10px 12px" className={application.personalAcademic?.hasNoFrGrade ? "por-detail-success-card" : "por-detail-alert-card"}>
                    <Text as="div" size="xs" color="muted">No FR Grade</Text>
                    <HStack align="center" gap="4px" size="sm" weight="bold" style={{ marginTop: "4px" }}>
                      {application.personalAcademic?.hasNoFrGrade ? (
                        <><CheckCircle2 size={14} className="text-[var(--color-success)]" /> None</>
                      ) : (
                        <><XCircle size={14} className="text-[var(--color-danger)]" /> Has FR Grade</>
                      )}
                    </HStack>
                  </Surface>
                  <Surface padding="10px 12px" className={application.personalAcademic?.declarationAccepted ? "por-detail-success-card" : "por-detail-alert-card"}>
                    <Text as="div" size="xs" color="muted">Undertaking Accepted</Text>
                    <HStack align="center" gap="4px" size="sm" weight="bold" style={{ marginTop: "4px" }}>
                      {application.personalAcademic?.declarationAccepted ? (
                        <><CheckCircle2 size={14} className="text-[var(--color-success)]" /> Confirmed</>
                      ) : (
                        <><XCircle size={14} className="text-[var(--color-danger)]" /> Pending</>
                      )}
                    </HStack>
                  </Surface>
                </Grid>
              </div>
            </PorDetailCard>

            {/* BTP details card if applicable */}
            {application.projectThesis?.track === "btech_project" &&
            (canAdminReview || application.projectThesis?.btpAwardLevel !== "none" || application.projectThesis?.projectGrade !== "none") ? (
              <PorDetailCard
                icon={Trophy}
                title="BTP & Project Grade Details"
                accentColor="var(--color-warning)"
                headerAction={canAdminReview ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setShowProjectThesisGradesModal(true)}
                  >
                    <Pencil size={14} /> Edit
                  </Button>
                ) : null}
              >
                <Grid min={240} gap={4}>
                  {application.projectThesis?.btpAwardLevel !== "none" ? (
                    <div className="por-detail-hero-box" style={{ background: "var(--color-bg-secondary)", border: "1px solid var(--color-border-primary)", borderLeft: "4px solid var(--color-warning)" }}>
                      <Text as="div" size="xs" color="muted" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--spacing-2)" }}>
                        BTP Award
                      </Text>
                      <Text as="div" weight="bold" color="primary" size="md">
                        {BTP_AWARD_OPTIONS.find((option) => option.value === application.projectThesis?.btpAwardLevel)?.label || application.projectThesis?.btpAwardLevel}
                      </Text>
                      <Text as="div" color="body" size="sm" style={{ marginTop: "6px" }}>
                        {application.projectThesis?.btpAwardTitle || "—"}
                      </Text>
                      {application.projectThesis?.btpAwardNotes ? (
                        <Text as="div" color="muted" size="xs" style={{ marginTop: "6px", fontStyle: "italic" }}>
                          Notes: {application.projectThesis.btpAwardNotes}
                        </Text>
                      ) : null}
                      <div style={{ marginTop: "var(--spacing-3)" }}>
                        <ProofActionButton
                          proof={resolvePrimaryProof(application.projectThesis?.btpAwardProofs)}
                          onViewPor={setActivePorDetail}
                          onViewPdf={setActivePdfDetail}
                        />
                      </div>
                    </div>
                  ) : null}

                  {application.projectThesis?.projectGrade !== "none" ? (
                    <div className="por-detail-hero-box" style={{ background: "var(--color-bg-secondary)", border: "1px solid var(--color-border-primary)", borderLeft: "4px solid var(--color-primary)" }}>
                      <Text as="div" size="xs" color="muted" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--spacing-2)" }}>
                        Project Grade
                      </Text>
                      <Text as="div" weight="bold" color="primary" size="md">
                        {PROJECT_GRADE_OPTIONS.find((option) => option.value === application.projectThesis?.projectGrade)?.label || application.projectThesis?.projectGrade}
                      </Text>
                      <Text as="div" color="body" size="sm" style={{ marginTop: "6px" }}>
                        {application.projectThesis?.projectGradeTitle || "—"}
                      </Text>
                      {application.projectThesis?.projectGradeNotes ? (
                        <Text as="div" color="muted" size="xs" style={{ marginTop: "6px", fontStyle: "italic" }}>
                          Notes: {application.projectThesis.projectGradeNotes}
                        </Text>
                      ) : null}
                      <div style={{ marginTop: "var(--spacing-3)" }}>
                        <ProofActionButton
                          proof={resolvePrimaryProof(application.projectThesis?.projectGradeProofs)}
                          onViewPor={setActivePorDetail}
                          onViewPdf={setActivePdfDetail}
                        />
                      </div>
                    </div>
                  ) : null}
                </Grid>
              </PorDetailCard>
            ) : null}

            {/* List of achievements tables styled beautifully */}
            <ItemsReviewTable title="Project publications / patents" items={application.projectThesis?.publicationItems || []} onViewPor={setActivePorDetail} onViewPdf={setActivePdfDetail} onOpenMore={handleOpenItemDetail} />
            <ItemsReviewTable title="Technology transfer" items={application.projectThesis?.technologyTransferItems || []} onViewPor={setActivePorDetail} onViewPdf={setActivePdfDetail} onOpenMore={handleOpenItemDetail} />
            <ItemsReviewTable title="Responsibilities" items={application.responsibilityItems || []} onViewPor={setActivePorDetail} onViewPdf={setActivePdfDetail} onOpenMore={handleOpenItemDetail} />
            <ItemsReviewTable title="Awards" items={application.awardItems || []} onViewPor={setActivePorDetail} onViewPdf={setActivePdfDetail} onOpenMore={handleOpenItemDetail} />
            <ItemsReviewTable title="Cultural activities" items={application.culturalItems || []} onViewPor={setActivePorDetail} onViewPdf={setActivePdfDetail} onOpenMore={handleOpenItemDetail} />
            <ItemsReviewTable title="Science & Technology activities" items={application.scienceTechnologyItems || []} onViewPor={setActivePorDetail} onViewPdf={setActivePdfDetail} onOpenMore={handleOpenItemDetail} />
            <ItemsReviewTable title="Games & Sports activities" items={application.gamesSportsItems || []} onViewPor={setActivePorDetail} onViewPdf={setActivePdfDetail} onOpenMore={handleOpenItemDetail} />
            <ItemsReviewTable title="Co-curricular activities" items={application.coCurricularItems || []} onViewPor={setActivePorDetail} onViewPdf={setActivePdfDetail} onOpenMore={handleOpenItemDetail} />
          </VStack>

          {/* Right sidebar column */}
          <VStack gap={4}>
            
            {/* Scorecard */}
            <ScoreBreakdownCard breakdown={application.scoreBreakdown} />

            <HodVerificationsCard verifications={application.hodVerifications} />

            {/* Admin Decision card */}
            <PorDetailCard
              icon={canHodVerify ? BadgeCheck : CheckCircle2}
              title={canAdminReview ? "Application Review Decision" : canHodVerify ? "HOD Verification" : "Review Summary"}
              accentColor="var(--color-primary)"
            >
              {canAdminReview ? (
                <div>
                  <label style={{ ...fieldLabelStyle, marginBottom: "var(--spacing-2)" }}>Review Remarks / Notes</label>
                  <textarea
                    value={remarks}
                    onChange={(event) => setRemarks(event.target.value)}
                    className="por-decision-textarea"
                    placeholder="Add review feedback, notes, or justification for rejection..."
                  />
                  <div className="por-decision-actions">
                    <Button
                      onClick={() => onDecision("approved", remarks)}
                      loading={deciding}
                      disabled={deciding}
                    >
                      <CheckCircle2 size={16} /> Approve
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => onDecision("rejected", remarks)}
                      loading={deciding}
                      disabled={deciding}
                    >
                      <XCircle size={16} /> Reject
                    </Button>
                  </div>
                </div>
              ) : canHodVerify ? (
                <div>
                  <label style={{ ...fieldLabelStyle, marginBottom: "var(--spacing-2)" }}>Verification Comment</label>
                  <textarea
                    value={remarks}
                    onChange={(event) => setRemarks(event.target.value)}
                    className="por-decision-textarea"
                    placeholder="Add your verification note or comment..."
                  />
                  <div style={{ ...helperTextStyle, marginTop: "var(--spacing-2)" }}>
                    A comment is required for both actions.
                  </div>
                  <div className="por-decision-actions">
                    <Button
                      onClick={() => onDecision("verified", remarks)}
                      loading={deciding}
                      disabled={deciding || !String(remarks || "").trim()}
                    >
                      <BadgeCheck size={16} /> Verify
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => onDecision("commented", remarks)}
                      loading={deciding}
                      disabled={deciding || !String(remarks || "").trim()}
                    >
                      <MessageSquare size={16} /> Comment
                    </Button>
                  </div>
                </div>
              ) : (
                <Grid cols={1} gap={3}>
                  <div className="por-detail-info-grid">
                    <PorDetailInfoRow label="Review Status" value={application.review?.status || "submitted"} />
                    <PorDetailInfoRow label="Final Score" value={application.finalScore ?? "—"} />
                  </div>
                  <div style={fieldClusterStyle}>
                    <span style={sectionLabelStyle}>Review Remarks / Notes</span>
                    <Text as="div" color="body" size="sm" leading={1.7}>
                      {application.review?.remarks || "No review remarks have been added yet."}
                    </Text>
                  </div>
                </Grid>
              )}
            </PorDetailCard>
          </VStack>
        </div>

        {/* Support Modal portals */}
        <ReviewItemDetailModal
          detail={activeItemDetail}
          canEditType={canAdminReview}
          saving={savingItemType}
          onClose={() => setActiveItemDetail(null)}
          onSaveType={handleSaveItemType}
          onViewPor={setActivePorDetail}
          onViewPdf={setActivePdfDetail}
        />
        <MarkingSchemeModal
          open={showReviewMarkingSchemeModal}
          onClose={() => setShowReviewMarkingSchemeModal(false)}
        />
        <EditCourseworkScoreModal
          open={showCourseworkScoreModal}
          scoreValue={application.coursework?.scoreValue || ""}
          saving={savingCourseworkScore}
          onClose={() => setShowCourseworkScoreModal(false)}
          onSave={handleSaveCourseworkScore}
        />
        <EditProjectThesisGradesModal
          open={showProjectThesisGradesModal}
          projectThesis={application.projectThesis || {}}
          saving={savingProjectThesisGrades}
          onClose={() => setShowProjectThesisGradesModal(false)}
          onSave={handleSaveProjectThesisGrades}
        />
        <PorProofDetailModal
          open={Boolean(activePorDetail)}
          onClose={() => setActivePorDetail(null)}
          porRequest={activePorDetail}
        />
        <PdfViewerModal
          isOpen={Boolean(activePdfDetail?.url)}
          onClose={() => setActivePdfDetail(null)}
          documentUrl={activePdfDetail?.url}
          title={activePdfDetail?.title || "Supporting Document"}
          subtitle="Uploaded supporting PDF"
          downloadFileName={`${activePdfDetail?.title || "supporting-document"}.pdf`}
        />
        {showStudentDetailModal && studentProfileId ? (
          <StudentDetailModal
            selectedStudent={{ _id: studentProfileId, userId: application.studentUserId }}
            setShowStudentDetail={setShowStudentDetailModal}
            onUpdate={() => setShowStudentDetailModal(false)}
          />
        ) : null}
      </VStack>
    </Modal>
  )
}

const OverallBestPerformerPage = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const isAdminView = user?.role === "Admin" || user?.role === "Super Admin"
  const isAcademicsView = user?.role === "Academics"
  const isReviewerView = isAdminView || isAcademicsView
  const canManageOccurrence = isAdminView
  const canReviewApplications = isAdminView
  const canAddHodVerification = isAcademicsView

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectorData, setSelectorData] = useState(null)
  const [selectedOccurrenceId, setSelectedOccurrenceId] = useState("")
  const [occurrenceDetail, setOccurrenceDetail] = useState(null)
  const [portalState, setPortalState] = useState(null)
  const [verifiedPors, setVerifiedPors] = useState([])
  const [applicationForm, setApplicationForm] = useState(createInitialForm())
  const [applicationDraftReady, setApplicationDraftReady] = useState(false)
  const [savingApplication, setSavingApplication] = useState(false)
  const [savingOccurrence, setSavingOccurrence] = useState(false)
  const [reviewing, setReviewing] = useState(false)
  const [showOccurrenceModal, setShowOccurrenceModal] = useState(false)
  const [showEligibleStudentsModal, setShowEligibleStudentsModal] = useState(false)
  const [showMarkingSchemeModal, setShowMarkingSchemeModal] = useState(false)
  const [occurrenceModalMode, setOccurrenceModalMode] = useState("create")
  const [reviewApplication, setReviewApplication] = useState(null)
  const [occurrenceForm, setOccurrenceForm] = useState(createOccurrenceFormState())
  const [eligibleStudentSearch, setEligibleStudentSearch] = useState("")
  const [manualEligibleRollNumber, setManualEligibleRollNumber] = useState("")

  const currentOccurrence = isReviewerView ? occurrenceDetail?.occurrence : portalState?.data?.occurrence
  const currentApplication = portalState?.data?.application || null
  const canEditStudentForm = Boolean(portalState?.data?.canEdit)
  const applicationDraftKey = isReviewerView
    ? ""
    : buildOverallBestPerformerDraftKey(portalState?.data?.student, portalState?.data?.occurrence)
  const applicantStage = useMemo(() => getApplicantStage(applicationForm), [applicationForm])
  const studentScorePreview = useMemo(
    () => computeStudentScorePreview(applicationForm),
    [applicationForm]
  )
  const filteredEligibleStudents = useMemo(() => {
    const normalizedSearch = String(eligibleStudentSearch || "").trim().toLowerCase()
    const rows = Array.isArray(occurrenceForm.eligibleStudents) ? occurrenceForm.eligibleStudents : []

    if (!normalizedSearch) return rows

    return rows.filter((student) =>
      [
        student?.rollNumber,
        student?.name,
        student?.email,
        student?.department,
        student?.degree,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch)
    )
  }, [eligibleStudentSearch, occurrenceForm.eligibleStudents])
  const { clearDraft: clearApplicationDraft } = useLocalFormDraft({
    formKey: applicationDraftKey,
    value: applicationForm,
    enabled: Boolean(!isReviewerView && canEditStudentForm && applicationDraftKey),
    ready: applicationDraftReady,
  })

  const updatePersonalAcademicField = (field, value) => {
    setApplicationForm((current) => ({
      ...current,
      personalAcademic: {
        ...current.personalAcademic,
        [field]: value,
      },
    }))
  }

  const syncApplicantStage = (nextStage) => {
    setApplicationForm((current) => {
      const isPg = nextStage === "pg"

      return {
        ...current,
        coursework: {
          ...current.coursework,
          evaluationMode: isPg ? "pg_cpi" : "ug_cgpa",
        },
        projectThesis: {
          ...current.projectThesis,
          track: isPg ? "pg_thesis" : "btech_project",
          ...(isPg
            ? {
                btpAwardLevel: "none",
                btpAwardTitle: "",
                btpAwardNotes: "",
                btpAwardProofSourceType: "upload",
                btpAwardProofUrl: "",
                btpAwardProofPorId: "",
                projectGrade: "none",
                projectGradeTitle: "",
                projectGradeNotes: "",
                projectGradeProofSourceType: "upload",
                projectGradeProofUrl: "",
                projectGradeProofPorId: "",
              }
            : {
                technologyTransferItems: [],
              }),
        },
      }
    })
  }

  const loadAdminData = async () => {
    const selector = await overallBestPerformerApi.getOccurrenceSelector()
    const selectorPayload = selector?.data || {}
    setSelectorData(selectorPayload)

    const defaultOccurrenceId = getDefaultBestPerformerOccurrenceId(selectorPayload)
    if (defaultOccurrenceId && !selectedOccurrenceId) {
      setSelectedOccurrenceId(String(defaultOccurrenceId))
    }

    return selectorPayload
  }

  const loadAdminOccurrence = async (occurrenceId) => {
    if (!occurrenceId) {
      setOccurrenceDetail(null)
      return
    }
    const detail = await overallBestPerformerApi.getOccurrenceDetail(occurrenceId)
    setOccurrenceDetail(detail?.data || null)
  }

  const loadStudentData = async () => {
    const [state, porWorkspace] = await Promise.all([
      overallBestPerformerApi.getStudentPortalState(),
      porApi.getWorkspace().catch(() => null),
    ])
    const baseForm = createInitialForm(state?.data?.student, state?.data?.application)
    const draftKey = buildOverallBestPerformerDraftKey(
      state?.data?.student,
      state?.data?.occurrence
    )
    const savedDraft = state?.data?.canEdit ? readLocalFormDraft(draftKey) : null

    setPortalState(state)
    setApplicationForm(savedDraft?.data || baseForm)
    setApplicationDraftReady(true)

    if (savedDraft?.data) {
      toast.success("Restored your unsaved Best Performer draft from this browser.")
    }

    const approvedWorkspacePors = (porWorkspace?.requests || []).filter((request) => request.status === "approved")
    const linkedApplicationPors = collectLinkedPorsFromApplication(state?.data?.application)
    const mergedPors = new Map()

    for (const por of [...approvedWorkspacePors, ...linkedApplicationPors]) {
      if (por?.id) {
        mergedPors.set(por.id, por)
      }
    }

    setVerifiedPors(
      [...mergedPors.values()].sort(
        (left, right) => new Date(right.updatedAt || right.createdAt || 0) - new Date(left.updatedAt || left.createdAt || 0)
      )
    )
  }

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError("")
        setApplicationDraftReady(false)
        if (isReviewerView) {
          setVerifiedPors([])
          await loadAdminData()
        } else {
          await loadStudentData()
        }
      } catch (err) {
        setError(err.message || "Failed to load Overall Best Performer data")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [isReviewerView])

  useEffect(() => {
    const defaultOccurrenceId = getDefaultBestPerformerOccurrenceId(selectorData)
    if (isReviewerView && defaultOccurrenceId && !selectedOccurrenceId) {
      setSelectedOccurrenceId(String(defaultOccurrenceId))
    }
  }, [isReviewerView, selectorData, selectedOccurrenceId])

  useEffect(() => {
    if (!isReviewerView) return

    const loadDetail = async () => {
      try {
        if (selectedOccurrenceId) {
          await loadAdminOccurrence(selectedOccurrenceId)
        } else {
          setOccurrenceDetail(null)
        }
      } catch (err) {
        setError(err.message || "Failed to load occurrence detail")
      }
    }

    loadDetail()
  }, [isReviewerView, selectedOccurrenceId])

  const resetOccurrenceForm = (mode = "create") => {
    if (mode === "edit" && occurrenceDetail?.occurrence) {
      const eligibleRollNumbers = normalizeRollNumbers(occurrenceDetail.occurrence.eligibleRollNumbers)
      setOccurrenceForm(createOccurrenceFormState({
        title: occurrenceDetail.occurrence.title || "",
        awardYear: String(occurrenceDetail.occurrence.awardYear || new Date().getFullYear()),
        applyStartAt: formatDateTimeInput(occurrenceDetail.occurrence.applyStartAt),
        applyEndAt: formatDateTimeInput(occurrenceDetail.occurrence.applyEndAt),
        description: occurrenceDetail.occurrence.description || "",
        eligibleRows: [],
        eligibleRollNumbers,
        eligibleStudents: buildEligibleStudentRows(
          eligibleRollNumbers,
          occurrenceDetail.occurrence.eligibleStudents
        ),
        studentListTouched: false,
      }))
      setOccurrenceModalMode("edit")
      setEligibleStudentSearch("")
      setManualEligibleRollNumber("")
      setShowEligibleStudentsModal(false)
      return
    }

    setOccurrenceForm(createOccurrenceFormState())
    setOccurrenceModalMode("create")
    setEligibleStudentSearch("")
    setManualEligibleRollNumber("")
    setShowEligibleStudentsModal(false)
  }

  const handleOccurrenceRowsParsed = (rows) => {
    const nextRollNumbers = normalizeRollNumbers(
      (Array.isArray(rows) ? rows : []).map((row) => row?.rollNumber)
    )

    setOccurrenceForm((current) => ({
      ...current,
      eligibleRows: rows,
      eligibleRollNumbers: nextRollNumbers,
      eligibleStudents: buildEligibleStudentRows(nextRollNumbers, current.eligibleStudents),
      studentListTouched: true,
    }))
  }

  const handleAddEligibleStudent = () => {
    const nextRollNumber = String(manualEligibleRollNumber || "").trim().toUpperCase()
    if (!nextRollNumber) {
      toast.error("Enter a roll number to add.")
      return
    }

    setOccurrenceForm((current) => {
      const nextRollNumbers = normalizeRollNumbers([
        ...(current.eligibleRollNumbers || []),
        nextRollNumber,
      ])

      if (nextRollNumbers.length === (current.eligibleRollNumbers || []).length) {
        return current
      }

      return {
        ...current,
        eligibleRollNumbers: nextRollNumbers,
        eligibleStudents: buildEligibleStudentRows(nextRollNumbers, current.eligibleStudents),
        studentListTouched: true,
      }
    })

    setManualEligibleRollNumber("")
  }

  const handleRemoveEligibleStudent = (rollNumberToRemove) => {
    setOccurrenceForm((current) => {
      const nextRollNumbers = normalizeRollNumbers(current.eligibleRollNumbers).filter(
        (rollNumber) => rollNumber !== String(rollNumberToRemove || "").trim().toUpperCase()
      )

      return {
        ...current,
        eligibleRollNumbers: nextRollNumbers,
        eligibleStudents: buildEligibleStudentRows(nextRollNumbers, current.eligibleStudents),
        studentListTouched: true,
      }
    })
  }

  const handleSaveOccurrence = async () => {
    const rollNumbers = normalizeRollNumbers(occurrenceForm.eligibleRollNumbers)

    if (!occurrenceForm.title.trim()) {
      toast.error("Occurrence title is required")
      return
    }

    if (!occurrenceForm.applyStartAt) {
      toast.error("Application start date is required")
      return
    }

    if (!occurrenceForm.applyEndAt) {
      toast.error("Application end date is required")
      return
    }

    if (new Date(occurrenceForm.applyStartAt) >= new Date(occurrenceForm.applyEndAt)) {
      toast.error("Application start date must be before the end date")
      return
    }

    if (occurrenceModalMode === "create" && rollNumbers.length === 0) {
      toast.error("Upload eligible roll numbers before activating the occurrence")
      return
    }

    if (occurrenceModalMode === "edit" && occurrenceForm.studentListTouched && rollNumbers.length === 0) {
      toast.error("Keep at least one eligible student in the list.")
      return
    }

    try {
      setSavingOccurrence(true)
      const payload = {
        title: occurrenceForm.title.trim(),
        awardYear: Number(occurrenceForm.awardYear || new Date().getFullYear()),
        applyStartAt: new Date(occurrenceForm.applyStartAt).toISOString(),
        applyEndAt: new Date(occurrenceForm.applyEndAt).toISOString(),
        description: occurrenceForm.description.trim(),
        ...(
          occurrenceModalMode === "create" || occurrenceForm.studentListTouched
            ? { eligibleRollNumbers: rollNumbers }
            : {}
        ),
      }

      if (occurrenceModalMode === "edit" && occurrenceDetail?.occurrence?.id) {
        await overallBestPerformerApi.updateOccurrence(occurrenceDetail.occurrence.id, payload)
        toast.success("Occurrence updated")
      } else {
        await overallBestPerformerApi.createOccurrence(payload)
        toast.success("Occurrence activated")
      }

      setShowOccurrenceModal(false)
      setShowEligibleStudentsModal(false)
      const selectorPayload = await loadAdminData()
      const editedOccurrenceId = occurrenceModalMode === "edit" ? occurrenceDetail?.occurrence?.id || "" : ""
      const nextSelectedOccurrenceId = String(
        editedOccurrenceId || getDefaultBestPerformerOccurrenceId(selectorPayload) || selectedOccurrenceId || ""
      )
      setSelectedOccurrenceId(nextSelectedOccurrenceId)
      if (nextSelectedOccurrenceId) {
        await loadAdminOccurrence(nextSelectedOccurrenceId)
      }
    } catch (err) {
      toast.error(err.message || "Failed to save occurrence")
    } finally {
      setSavingOccurrence(false)
    }
  }

  const handleSaveStudentApplication = async () => {
    if (!portalState?.data?.occurrence?.id) {
      toast.error("No occurrence available")
      return
    }

    if (!applicationForm.personalAcademic.declarationAccepted) {
      toast.error("Please accept the undertaking before submitting")
      return
    }

    if (!applicationForm.personalAcademic.isPassingOutStudent) {
      toast.error("Only passing out students are eligible to apply")
      return
    }

    if (!applicationForm.personalAcademic.hasNoDisciplinaryAction) {
      toast.error("Applicants with disciplinary action are not eligible")
      return
    }

    if (!applicationForm.personalAcademic.hasNoFrGrade) {
      toast.error("Applicants must confirm that no FR grade is counted in academics")
      return
    }

    if (Number(applicationForm.coursework.scoreValue || 0) < 6.5) {
      toast.error("Minimum CGPA / CPI required is 6.50")
      return
    }

    if (!hasSelectedProof(applicationForm.coursework)) {
      toast.error("Academic transcript / coursework proof is required.")
      return
    }

    const sectionValidationError =
      validateScoredItems(applicationForm.projectThesis.publicationItems, "Project / thesis publication items") ||
      validateScoredItems(applicationForm.projectThesis.technologyTransferItems, "Technology transfer items") ||
      validateScoredItems(applicationForm.responsibilityItems, "Position of responsibility") ||
      validateScoredItems(applicationForm.awardItems, "Awards and entrepreneurship") ||
      validateScoredItems(applicationForm.culturalItems, "Cultural activities") ||
      validateScoredItems(applicationForm.scienceTechnologyItems, "Science and technology activities") ||
      validateScoredItems(applicationForm.gamesSportsItems, "Games and sports activities") ||
      validateScoredItems(applicationForm.coCurricularItems, "Co-curricular activities")

    if (sectionValidationError) {
      toast.error(sectionValidationError)
      return
    }

    if (applicationForm.projectThesis.track === "btech_project") {
      if (
        applicationForm.projectThesis.btpAwardLevel !== "none" &&
        !hasSelectedProof({
          proofSourceType: applicationForm.projectThesis.btpAwardProofSourceType,
          proofUrl: applicationForm.projectThesis.btpAwardProofUrl,
          proofPorId: applicationForm.projectThesis.btpAwardProofPorId,
        })
      ) {
        toast.error("BTP award proof is required when you add a BTP award entry.")
        return
      }

      if (
        applicationForm.projectThesis.btpAwardLevel !== "none" &&
        !String(applicationForm.projectThesis.btpAwardTitle || "").trim()
      ) {
        toast.error("BTP award title is required when you add a BTP award entry.")
        return
      }

      if (
        applicationForm.projectThesis.projectGrade !== "none" &&
        !hasSelectedProof({
          proofSourceType: applicationForm.projectThesis.projectGradeProofSourceType,
          proofUrl: applicationForm.projectThesis.projectGradeProofUrl,
          proofPorId: applicationForm.projectThesis.projectGradeProofPorId,
        })
      ) {
        toast.error("Project grade proof is required when you add a project grade entry.")
        return
      }

      if (
        applicationForm.projectThesis.projectGrade !== "none" &&
        !String(applicationForm.projectThesis.projectGradeTitle || "").trim()
      ) {
        toast.error("Project grade title is required when you add a project grade entry.")
        return
      }
    }

    try {
      setSavingApplication(true)
      const response = await overallBestPerformerApi.upsertApplication(
        portalState.data.occurrence.id,
        buildPayload(applicationForm)
      )
      clearApplicationDraft()
      toast.success(response?.message || "Application saved")
      await loadStudentData()
    } catch (err) {
      toast.error(err.message || "Failed to save application")
    } finally {
      setSavingApplication(false)
    }
  }

  const handleReviewDecision = async (decision, remarks) => {
    if (!reviewApplication?.id || !canReviewApplications) return

    try {
      setReviewing(true)
      await overallBestPerformerApi.reviewApplication(reviewApplication.id, {
        decision,
        remarks,
      })
      toast.success(decision === "approved" ? "Application approved" : "Application rejected")
      setReviewApplication(null)
      await loadAdminOccurrence(selectedOccurrenceId)
    } catch (err) {
      toast.error(err.message || "Failed to review application")
    } finally {
      setReviewing(false)
    }
  }

  const handleHodVerification = async (action, remarks) => {
    if (!reviewApplication?.id || !canAddHodVerification) return

    const trimmedRemarks = String(remarks || "").trim()
    if (!trimmedRemarks) {
      toast.error("Comments are required.")
      return
    }

    try {
      setReviewing(true)
      await overallBestPerformerApi.addHodVerification(reviewApplication.id, {
        action,
        remarks: trimmedRemarks,
      })
      toast.success(action === "verified" ? "Application verified" : "Comment added")
      setReviewApplication(null)
      await loadAdminOccurrence(selectedOccurrenceId)
    } catch (err) {
      toast.error(err.message || "Failed to save HOD verification")
    } finally {
      setReviewing(false)
    }
  }

  const handleReviewApplicationUpdated = async (updatedApplication = null) => {
    if (updatedApplication) {
      setReviewApplication(updatedApplication)
    }

    if (selectedOccurrenceId) {
      try {
        await loadAdminOccurrence(selectedOccurrenceId)
      } catch (error) {
        toast.error(error?.message || "Updated item, but failed to refresh occurrence data")
      }
    }
  }

  const handleExportOccurrenceCsv = () => {
    const applications = occurrenceDetail?.leaderboard || []
    if (!applications.length) {
      toast.error("No applications available to export.")
      return
    }

    const headers = [
      "rank",
      "occurrence_title",
      "award_year",
      "student_name",
      "student_email",
      "roll_number",
      "department",
      "degree",
      "programme",
      "personal_department",
      "is_passing_out_student",
      "has_no_disciplinary_action",
      "has_no_fr_grade",
      "undertaking_accepted",
      "coursework_mode",
      "coursework_score_value",
      "coursework_notes",
      "coursework_proofs",
      "project_track",
      "btp_award_level",
      "btp_award_title",
      "btp_award_notes",
      "btp_award_proofs",
      "project_grade",
      "project_grade_title",
      "project_grade_notes",
      "project_grade_proofs",
      "publication_items",
      "technology_transfer_items",
      "responsibility_items",
      "award_items",
      "cultural_items",
      "science_technology_items",
      "games_sports_items",
      "co_curricular_items",
      "coursework_points",
      "project_thesis_points",
      "responsibilities_points",
      "awards_points",
      "cultural_points",
      "science_technology_points",
      "games_sports_points",
      "co_curricular_points",
      "calculated_total",
      "review_status",
      "review_remarks",
      "reviewed_by",
      "reviewed_at",
      "final_score",
      "submitted_at",
      "created_at",
      "updated_at",
    ]

    const rows = applications.map((application, index) => {
      const personalAcademic = application?.personalAcademic || {}
      const coursework = application?.coursework || {}
      const projectThesis = application?.projectThesis || {}
      const review = application?.review || {}
      const scoreBreakdown = application?.scoreBreakdown || {}

      return [
        index + 1,
        currentOccurrence?.title || "",
        application?.awardYear || currentOccurrence?.awardYear || "",
        application?.studentName || "",
        application?.studentEmail || "",
        application?.rollNumber || "",
        application?.department || "",
        application?.degree || "",
        personalAcademic?.programme || "",
        personalAcademic?.department || "",
        personalAcademic?.isPassingOutStudent ? "Yes" : "No",
        personalAcademic?.hasNoDisciplinaryAction ? "Yes" : "No",
        personalAcademic?.hasNoFrGrade ? "Yes" : "No",
        personalAcademic?.declarationAccepted ? "Yes" : "No",
        coursework?.evaluationMode || "",
        coursework?.scoreValue ?? "",
        coursework?.notes || "",
        summarizeProofsForExport(coursework?.proofs),
        projectThesis?.track || "",
        projectThesis?.btpAwardLevel || "",
        projectThesis?.btpAwardTitle || "",
        projectThesis?.btpAwardNotes || "",
        summarizeProofsForExport(projectThesis?.btpAwardProofs),
        projectThesis?.projectGrade || "",
        projectThesis?.projectGradeTitle || "",
        projectThesis?.projectGradeNotes || "",
        summarizeProofsForExport(projectThesis?.projectGradeProofs),
        summarizeItemsForExport(projectThesis?.publicationItems),
        summarizeItemsForExport(projectThesis?.technologyTransferItems),
        summarizeItemsForExport(application?.responsibilityItems),
        summarizeItemsForExport(application?.awardItems),
        summarizeItemsForExport(application?.culturalItems),
        summarizeItemsForExport(application?.scienceTechnologyItems),
        summarizeItemsForExport(application?.gamesSportsItems),
        summarizeItemsForExport(application?.coCurricularItems),
        scoreBreakdown?.coursework ?? "",
        scoreBreakdown?.projectThesis ?? "",
        scoreBreakdown?.responsibilities ?? "",
        scoreBreakdown?.awards ?? "",
        scoreBreakdown?.cultural ?? "",
        scoreBreakdown?.scienceTechnology ?? "",
        scoreBreakdown?.gamesSports ?? "",
        scoreBreakdown?.coCurricular ?? "",
        application?.calculatedTotal ?? "",
        review?.status || "",
        review?.remarks || "",
        review?.reviewedBy || "",
        formatExportDateTime(review?.reviewedAt),
        application?.finalScore ?? "",
        formatExportDateTime(application?.submittedAt),
        formatExportDateTime(application?.createdAt),
        formatExportDateTime(application?.updatedAt),
      ]
    })

    const csvContent = [
      headers.map(escapeCsvValue).join(","),
      ...rows.map((row) => row.map(escapeCsvValue).join(",")),
    ].join("\n")

    const occurrenceSlug = String(currentOccurrence?.title || "best-performer")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")

    downloadCsvFile(
      csvContent,
      `${occurrenceSlug || "best-performer"}-${currentOccurrence?.awardYear || "occurrence"}-${new Date().toISOString().split("T")[0]}.csv`
    )
    toast.success("Best Performer export downloaded.")
  }

  const leaderboardRows = useMemo(
    () =>
      (occurrenceDetail?.leaderboard || []).map((application, index) => ({
        ...application,
        leaderboardRank: index + 1,
      })),
    [occurrenceDetail?.leaderboard]
  )

  const leaderboardColumns = useMemo(
    () => [
      {
        header: "Rank",
        key: "leaderboardRank",
        render: (application) => (
          <Badge variant="primary">#{application.leaderboardRank}</Badge>
        ),
      },
      {
        header: "Student",
        key: "studentName",
        render: (application) => (
          <Grid cols={1} gap="4px" style={{ minWidth: 0 }}>
            <Text as="div" color="primary" weight="medium" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {application.studentName || "—"}
            </Text>
            <Text as="div" size="sm" color="muted" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {application.rollNumber || "—"}
            </Text>
            <Text as="div" size="xs" color="light" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {application.department || "—"}{application.degree ? ` · ${application.degree}` : ""}
            </Text>
          </Grid>
        ),
      },
      {
        header: "Calculated",
        key: "calculatedTotal",
        render: (application) => (
          <Grid cols={1} gap="4px">
            <Text as="div" color="primary" weight="semibold" style={{ whiteSpace: "nowrap" }}>
              {application.calculatedTotal ?? "—"}
            </Text>
            <Text as="div" size="xs" color="muted" style={{ whiteSpace: "nowrap" }}>
              Auto score
            </Text>
          </Grid>
        ),
      },
      {
        header: "Final",
        key: "finalScore",
        render: (application) => (
          <Grid cols={1} gap="4px">
            <div>
              <Badge variant="info">{application.finalScore ?? "—"}</Badge>
            </div>
            <Text as="div" size="xs" color="muted" style={{ whiteSpace: "nowrap" }}>
              Reviewed score
            </Text>
          </Grid>
        ),
      },
      {
        header: "Status",
        key: "status",
        render: (application) => (
          <Badge variant={statusTone(application.review?.status)}>
            {application.review?.status || "submitted"}
          </Badge>
        ),
      },
      {
        header: "Updated",
        key: "updatedAt",
        render: (application) => {
          if (!application.updatedAt) return "—"
          const updatedAt = new Date(application.updatedAt)
          return (
            <Grid cols={1} gap="4px">
              <Text as="div" size="sm" color="primary" weight="medium" style={{ whiteSpace: "nowrap" }}>
                {updatedAt.toLocaleDateString()}
              </Text>
              <Text as="div" size="xs" color="muted" style={{ whiteSpace: "nowrap" }}>
                {updatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </Text>
            </Grid>
          )
        },
      },
    ],
    []
  )

  if (loading) {
    return <LoadingState message="Loading Overall Best Performer award..." />
  }

  if (error) {
    return <ErrorState title="Overall Best Performer unavailable" message={error} />
  }

  if (!isReviewerView && !portalState?.data?.canAccessPortal) {
    return (
      <VStack gap={4}>
        <PageHeader title="Overall Best Performer" subtitle="Student portal" showDate={false} />
        <Surface padding={6}>
          <EmptyState
            title={
              portalState?.data?.studentStatusAllowed === false
                ? "Best Performer unavailable"
                : portalState?.data?.applicationWindowStatus === "scheduled"
                  ? "Application window not started"
                  : portalState?.data?.applicationWindowStatus === "closed"
                    ? "Application window closed"
                : "No accessible occurrence"
            }
            description={
              portalState?.data?.studentStatusAllowed === false
                ? "Only students with Active or Graduated status can access the Best Performer portal."
                : portalState?.data?.applicationWindowStatus === "scheduled"
                  ? "The Best Performer portal will become visible only after the configured application start date."
                  : portalState?.data?.applicationWindowStatus === "closed"
                    ? "The Best Performer portal is visible to students only between the configured application start and end date."
                    : "There is no active Overall Best Performer occurrence for you right now."
            }
          />
        </Surface>
      </VStack>
    )
  }

  return (
    <div style={{ minHeight: "100%", backgroundColor: "var(--color-bg-page)" }}>
      <PageHeader
        title={isReviewerView ? "Overall Best Performer" : "Overall Best Performer Award"}
        subtitle={isReviewerView ? (canManageOccurrence ? "Annual occurrence control, review, and leaderboard" : "Occurrence leaderboard and application review") : "Apply, upload proofs, and track your score"}
        showDate={false}
      >
        {isReviewerView ? (
          <>
            <div style={{ minWidth: 260 }}>
              <Select
                name="bestPerformerOccurrence"
                value={selectedOccurrenceId}
                onChange={(event) => setSelectedOccurrenceId(event.target.value)}
                placeholder="Select an occurrence"
                options={(selectorData?.occurrences || []).map((occurrence) => ({
                  value: occurrence.id,
                  label: `${occurrence.awardYear} · ${occurrence.title} · ${occurrence.status}`,
                }))}
              />
            </div>
            {canManageOccurrence ? (
              <Button
                onClick={() => {
                  resetOccurrenceForm("create")
                  setShowOccurrenceModal(true)
                }}
              >
                <Plus size={16} /> Start occurrence
              </Button>
            ) : null}
            {canManageOccurrence && occurrenceDetail?.occurrence ? (
              <Button
                variant="secondary"
                onClick={() => {
                  resetOccurrenceForm("edit")
                  setShowOccurrenceModal(true)
                }}
              >
                <Save size={16} /> Edit
              </Button>
            ) : null}
            {canManageOccurrence ? (
              <Button
                variant="secondary"
                onClick={handleExportOccurrenceCsv}
                disabled={!occurrenceDetail?.leaderboard?.length}
              >
                <Download size={16} /> Export CSV
              </Button>
            ) : null}
          </>
        ) : (
          <div style={badgeStyle(currentOccurrence?.applicationWindowStatus === "open" ? "primary" : "default")}>
            <Trophy size={14} />
            {getApplicationWindowLabel(currentOccurrence?.applicationWindowStatus)}
          </div>
        )}
      </PageHeader>

      <div style={{ padding: "var(--spacing-4) var(--spacing-6) var(--spacing-8)", display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
        {currentOccurrence ? (
          <>
            {isReviewerView ? (
              <StatCards
                columns={5}
                stats={[
                  {
                    title: "Award Year",
                    value: currentOccurrence.awardYear,
                    subtitle: currentOccurrence.title || "Occurrence",
                    icon: <CalendarDays size={18} />,
                    color: "var(--color-primary)",
                  },
                  {
                    title: "Application Starts",
                    value: (
                      <Text as="span" size="sm" leading={1.4} style={{ display: "inline-block" }}>
                        {currentOccurrence.applyStartAt ? new Date(currentOccurrence.applyStartAt).toLocaleString() : "—"}
                      </Text>
                    ),
                    subtitle: "Opening time",
                    icon: <Clock3 size={18} />,
                    color: "var(--color-info)",
                  },
                  {
                    title: "Application Ends",
                    value: (
                      <Text as="span" size="sm" leading={1.4} style={{ display: "inline-block" }}>
                        {currentOccurrence.applyEndAt ? new Date(currentOccurrence.applyEndAt).toLocaleString() : "—"}
                      </Text>
                    ),
                    subtitle: "Closing time",
                    icon: <Clock3 size={18} />,
                    color: "var(--color-warning)",
                  },
                  {
                    title: "Eligible Students",
                    value: currentOccurrence.eligibleStudentCount || 0,
                    subtitle: "Configured list",
                    icon: <Users size={18} />,
                    color: "var(--color-success)",
                  },
                  {
                    title: "Window",
                    value: (
                      <Text as="span" size="sm" leading={1.35} style={{ display: "inline-block", maxWidth: "100%", wordBreak: "break-word" }}>
                        {getApplicationWindowLabel(currentOccurrence.applicationWindowStatus)}
                      </Text>
                    ),
                    subtitle: "Current status",
                    icon: <Trophy size={18} />,
                    color: "var(--color-primary)",
                  },
                ]}
              />
            ) : null}

            {!isReviewerView && currentOccurrence.description ? (
              <Surface bg="brand" padding={4} size="sm" color="body" style={{ whiteSpace: "pre-wrap" }}>
                {currentOccurrence.description}
              </Surface>
            ) : null}
          </>
        ) : null}

        {isReviewerView ? (
          occurrenceDetail ? (
            <>
              {leaderboardRows.length ? (
                <DataTable
                  columns={leaderboardColumns}
                  data={leaderboardRows}
                  loading={false}
                  emptyMessage="No applications yet."
                  onRowClick={setReviewApplication}
                />
              ) : (
                <EmptyState
                  title="No applications yet"
                  description="Students have not submitted applications for this occurrence."
                />
              )}
            </>
          ) : (
            <EmptyState
              title="No occurrence selected"
              description={canManageOccurrence ? "Pick an occurrence from history, or start a new annual round from the header." : "Pick an occurrence from the header to inspect applications and scores."}
            />
          )
        ) : (
          <>
            {/* Active Application Round Details Dashboard */}
            <Grid min={360} gap={4} style={{ marginBottom: "var(--spacing-4)" }}>
              {/* Left Card: Application Period & Eligibility */}
              <Surface
                bg="primary"
                padding={4}
                radius="card"
                border
                shadow
                accent="brand"
                style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)", overflow: "hidden" }}
              >
                <HStack align="center" gap={2} color="brand">
                  <CalendarDays size={18} />
                  <Text as="span" size="md" weight="bold" color="heading">
                    Active Application Round
                  </Text>
                </HStack>
                
                <Grid cols={1} gap={2}>
                  <InfoRow label="Submissions Open" value={currentOccurrence?.applyStartAt ? new Date(currentOccurrence.applyStartAt).toLocaleString() : "—"} style={{ padding: "8px 12px", background: "var(--color-bg-secondary)", borderRadius: "var(--radius-md)" }} />
                  <InfoRow label="Submissions Close" value={currentOccurrence?.applyEndAt ? new Date(currentOccurrence.applyEndAt).toLocaleString() : "—"} style={{ padding: "8px 12px", background: "var(--color-bg-secondary)", borderRadius: "var(--radius-md)" }} />
                </Grid>

                <HStack gap="6px" wrap style={{ marginTop: "var(--spacing-1)" }}>
                  <Surface as="span" bg="brand" padding="4px 8px" radius="999px" color="brand" size="xs" weight="semibold" style={{ display: "inline-flex" }}>
                    Min CGPA / CPI: 6.50
                  </Surface>
                  <Surface as="span" bg="brand" padding="4px 8px" radius="999px" color="brand" size="xs" weight="semibold" style={{ display: "inline-flex" }}>
                    Passing-out students only
                  </Surface>
                  <Surface as="span" bg="brand" padding="4px 8px" radius="999px" color="brand" size="xs" weight="semibold" style={{ display: "inline-flex" }}>
                    Status: Active / Graduated
                  </Surface>
                </HStack>
              </Surface>

              {/* Right Card: Reference Guide & Marking Scheme */}
              {/* The gradient this used to carry ended on a literal
                  rgba(91, 159, 232, 0.03) — a fixed light-mode blue that stayed
                  put in dark mode. The brand tint is the theme's version of the
                  same wash. */}
              <Surface
                bg="brand"
                padding={4}
                radius="card"
                border
                shadow
                accent="info"
                style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "var(--spacing-3)", overflow: "hidden" }}
              >
                <div>
                  <HStack align="center" gap={2} color="info">
                    <BookOpen size={18} />
                    <Text as="span" size="md" weight="bold" color="heading">
                      Reference & Evaluation
                    </Text>
                  </HStack>
                  <Text as="div" size="sm" color="body" leading={1.6} style={{ marginTop: "var(--spacing-2)" }}>
                    Achievements are mapped to specific point scales. Review the official marking scheme to ensure correct categories and supporting proof documents are uploaded.
                  </Text>
                </div>

                <Button variant="secondary" onClick={() => setShowMarkingSchemeModal(true)} style={{ width: "100%", justifyContent: "center" }}>
                  <FileText size={16} /> View Marking Scheme
                </Button>
              </Surface>
            </Grid>

            <VStack gap={4}>
              {/* Personalized Student Profile & Status card */}
              <Surface
                bg="primary"
                padding={4}
                radius="card"
                border
                shadow
                style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)", overflow: "hidden" }}
              >
                <HStack gap={3} align="center" wrap>
                  <ProfileAvatar
                    user={{
                      name: portalState?.data?.student?.name || "Student",
                      profileImage: portalState?.data?.student?.profileImage,
                    }}
                    size="medium"
                  />
                  <div style={{ minWidth: 0 }}>
                    <Text as="div" size="lg" weight="bold" color="heading">
                      {portalState?.data?.student?.name || "Student"}
                    </Text>
                    <HStack gap={2} wrap size="xs" color="muted" style={{ marginTop: "2px" }}>
                      <span>Roll Number: <strong>{portalState?.data?.student?.rollNumber || "—"}</strong></span>
                      <span>•</span>
                      <span>Department: <strong>{portalState?.data?.student?.department || "—"}</strong></span>
                    </HStack>
                  </div>

                  <HStack gap={2} align="center" style={{ marginLeft: "auto" }}>
                    <Text as="span" size="xs" color="muted">Status:</Text>
                    <Badge variant={statusTone(currentApplication?.review?.status)}>
                      {currentApplication?.review?.status || "draft"}
                    </Badge>
                  </HStack>
                </HStack>

                {currentApplication?.review?.status === "rejected" && currentApplication.review?.remarks ? (
                  <div style={{
                    background: "rgba(239, 68, 68, 0.04)",
                    border: "1px solid rgba(239, 68, 68, 0.15)",
                    borderLeft: "4px solid var(--color-danger)",
                    borderRadius: "var(--radius-md)",
                    padding: "var(--spacing-3) var(--spacing-4)",
                    marginTop: "var(--spacing-1)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--spacing-1)"
                  }}>
                    <HStack align="center" gap={2} size="xs" weight="bold" color="danger">
                      <XCircle size={14} />
                      Needs Attention / Revise Application
                    </HStack>
                    <Text as="div" size="sm" color="body" leading={1.6} style={{ paddingLeft: "20px" }}>
                      {currentApplication.review.remarks}
                    </Text>
                  </div>
                ) : null}
              </Surface>

              <Panel title="Score Preview">
                <Grid cols={1} gap={4}>
                  <Grid min={220} gap={3}>
                    <SummaryMetric icon={Trophy} label="Current Score" value={studentScorePreview.total} />
                    <SummaryMetric
                      icon={Save}
                      label="Saved Score"
                      value={currentApplication ? currentApplication.calculatedTotal || 0 : "Not saved"}
                    />
                    <SummaryMetric
                      icon={CheckCircle2}
                      label="Final Review Score"
                      value={
                        currentApplication?.review?.status === "approved" ||
                        currentApplication?.review?.status === "rejected"
                          ? currentApplication?.finalScore ?? 0
                          : "Pending review"
                      }
                    />
                  </Grid>

                  <div style={helperTextStyle}>
                    This score preview updates as you edit the form. The saved score is the last submitted calculation, and the final review score appears after admin review.
                  </div>

                  <ScoreBreakdownCard breakdown={studentScorePreview} />
                </Grid>
              </Panel>

              <Panel title="1. Academic achievements">
                <Grid cols={1} gap={4}>
                  <Grid cols={1} gap={2}>
                    <span style={sectionLabelStyle}>Programme Type</span>
                    <HStack gap={2} wrap>
                      {APPLICANT_STAGE_OPTIONS.map((option) => (
                        <Button
                          key={option.value}
                          variant={applicantStage === option.value ? undefined : "secondary"}
                          onClick={() => syncApplicantStage(option.value)}
                          disabled={!canEditStudentForm}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </HStack>
                  </Grid>
 
                  <Grid cols={1} gap={3}>
                    <div>
                      <label style={fieldLabelStyle}>
                        {applicantStage === "ug" ? "CGPA" : "CPI"}
                      </label>
                      <Input
                        type="number"
                        value={applicationForm.coursework.scoreValue}
                        onChange={(event) =>
                          setApplicationForm((current) => ({
                            ...current,
                            coursework: { ...current.coursework, scoreValue: event.target.value },
                          }))
                        }
                        disabled={!canEditStudentForm}
                      />
                      <div style={helperTextStyle}>Minimum eligible value is 6.50.</div>
                    </div>
 
                    <div>
                      <label style={fieldLabelStyle}>Brief note</label>
                      <textarea
                        value={applicationForm.coursework.notes}
                        disabled={!canEditStudentForm}
                        onChange={(event) =>
                          setApplicationForm((current) => ({
                            ...current,
                            coursework: { ...current.coursework, notes: event.target.value },
                          }))
                        }
                        style={textareaStyle}
                        placeholder="Mention any coursework context if needed."
                      />
                    </div>
 
                    <div>
                      <SupportingProofField
                        label="Supporting document"
                        proofSourceType={applicationForm.coursework.proofSourceType}
                        proofUrl={applicationForm.coursework.proofUrl}
                        proofPorId={applicationForm.coursework.proofPorId}
                        onChange={(proofState) =>
                          setApplicationForm((current) => ({
                            ...current,
                            coursework: { ...current.coursework, ...proofState },
                          }))
                        }
                        verifiedPors={verifiedPors}
                        disabled={!canEditStudentForm}
                        uploadedText="Academic proof uploaded"
                        viewerTitle="Academic transcript / coursework proof"
                      />
                    </div>
                  </Grid>
                </Grid>
              </Panel>
 
              <Panel title="2. Project / thesis work">
                <Grid cols={1} gap={4}>
                  <Grid cols={1} gap={2}>
                    <span style={sectionLabelStyle}>Project Track</span>
                    <HStack gap={2} wrap>
                      {APPLICANT_STAGE_OPTIONS.map((option) => (
                        <Button
                          key={`project-${option.value}`}
                          variant={applicantStage === option.value ? undefined : "secondary"}
                          onClick={() => syncApplicantStage(option.value)}
                          disabled={!canEditStudentForm}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </HStack>
                  </Grid>

                  {applicantStage === "ug" ? (
                    <>
                      <SingleSelectionAchievementEditor
                        heading="BTP award"
                        value={applicationForm.projectThesis.btpAwardLevel}
                        options={BTP_AWARD_OPTIONS}
                        titleValue={applicationForm.projectThesis.btpAwardTitle}
                        notesValue={applicationForm.projectThesis.btpAwardNotes}
                        proofSourceType={applicationForm.projectThesis.btpAwardProofSourceType}
                        proofUrl={applicationForm.projectThesis.btpAwardProofUrl}
                        proofPorId={applicationForm.projectThesis.btpAwardProofPorId}
                        onValueChange={(value) =>
                          setApplicationForm((current) => ({
                            ...current,
                            projectThesis: {
                              ...current.projectThesis,
                              btpAwardLevel: value,
                              ...(value === "none"
                                ? {
                                    btpAwardTitle: "",
                                    btpAwardNotes: "",
                                    btpAwardProofSourceType: "upload",
                                    btpAwardProofUrl: "",
                                    btpAwardProofPorId: "",
                                  }
                                : {}),
                            },
                          }))
                        }
                        onTitleChange={(value) =>
                          setApplicationForm((current) => ({
                            ...current,
                            projectThesis: { ...current.projectThesis, btpAwardTitle: value },
                          }))
                        }
                        onNotesChange={(value) =>
                          setApplicationForm((current) => ({
                            ...current,
                            projectThesis: { ...current.projectThesis, btpAwardNotes: value },
                          }))
                        }
                        onProofChange={(proofState) =>
                          setApplicationForm((current) => ({
                            ...current,
                            projectThesis: {
                              ...current.projectThesis,
                              btpAwardProofSourceType: proofState.proofSourceType,
                              btpAwardProofUrl: proofState.proofUrl,
                              btpAwardProofPorId: proofState.proofPorId,
                            },
                          }))
                        }
                        verifiedPors={verifiedPors}
                        disabled={!canEditStudentForm}
                        titleLabel="Project title"
                        titlePlaceholder="Enter the BTP title"
                        descriptionLabel="Short description"
                        descriptionPlaceholder="Add any necessary context for this BTP award."
                      />

                      <SingleSelectionAchievementEditor
                        heading="Project grade"
                        value={applicationForm.projectThesis.projectGrade}
                        options={PROJECT_GRADE_OPTIONS}
                        titleValue={applicationForm.projectThesis.projectGradeTitle}
                        notesValue={applicationForm.projectThesis.projectGradeNotes}
                        proofSourceType={applicationForm.projectThesis.projectGradeProofSourceType}
                        proofUrl={applicationForm.projectThesis.projectGradeProofUrl}
                        proofPorId={applicationForm.projectThesis.projectGradeProofPorId}
                        onValueChange={(value) =>
                          setApplicationForm((current) => ({
                            ...current,
                            projectThesis: {
                              ...current.projectThesis,
                              projectGrade: value,
                              ...(value === "none"
                                ? {
                                    projectGradeTitle: "",
                                    projectGradeNotes: "",
                                    projectGradeProofSourceType: "upload",
                                    projectGradeProofUrl: "",
                                    projectGradeProofPorId: "",
                                  }
                                : {}),
                            },
                          }))
                        }
                        onTitleChange={(value) =>
                          setApplicationForm((current) => ({
                            ...current,
                            projectThesis: { ...current.projectThesis, projectGradeTitle: value },
                          }))
                        }
                        onNotesChange={(value) =>
                          setApplicationForm((current) => ({
                            ...current,
                            projectThesis: { ...current.projectThesis, projectGradeNotes: value },
                          }))
                        }
                        onProofChange={(proofState) =>
                          setApplicationForm((current) => ({
                            ...current,
                            projectThesis: {
                              ...current.projectThesis,
                              projectGradeProofSourceType: proofState.proofSourceType,
                              projectGradeProofUrl: proofState.proofUrl,
                              projectGradeProofPorId: proofState.proofPorId,
                            },
                          }))
                        }
                        verifiedPors={verifiedPors}
                        disabled={!canEditStudentForm}
                        titleLabel="Project title"
                        titlePlaceholder="Enter the project title"
                        descriptionLabel="Short description"
                        descriptionPlaceholder="Add any necessary context for the awarded grade."
                      />
                    </>
                  ) : null}

                  <MinimalScoredItemsEditor
                    step={applicantStage === "ug" ? "2" : "2"}
                    title={applicantStage === "ug" ? "Project publications / patents" : "Thesis publications / patents"}
                    subtitle="Add only the relevant publications or patents and attach the required supporting proof."
                    items={applicationForm.projectThesis.publicationItems}
                    onChange={(items) =>
                      setApplicationForm((current) => ({
                        ...current,
                        projectThesis: { ...current.projectThesis, publicationItems: items },
                      }))
                    }
                    options={PUBLICATION_OPTIONS}
                    verifiedPors={verifiedPors}
                    disabled={!canEditStudentForm}
                    uploadLabel="Supporting document"
                    titleLabel="Achievement title"
                    titlePlaceholder="Enter publication / patent title"
                    descriptionLabel="Short description"
                    descriptionPlaceholder="Mention the publication, patent, or conference context."
                    embedded
                  />

                  {applicantStage === "pg" ? (
                    <MinimalScoredItemsEditor
                      step="2"
                      title="Technology transfer"
                      subtitle="Add only the relevant technology transfer achievements for the PG / PhD thesis track."
                      items={applicationForm.projectThesis.technologyTransferItems}
                      onChange={(items) =>
                        setApplicationForm((current) => ({
                          ...current,
                          projectThesis: { ...current.projectThesis, technologyTransferItems: items },
                        }))
                      }
                      options={TECH_TRANSFER_OPTIONS}
                      verifiedPors={verifiedPors}
                      disabled={!canEditStudentForm}
                      uploadLabel="Supporting document"
                      titleLabel="Transfer / work title"
                      titlePlaceholder="Enter the technology transfer title"
                      descriptionLabel="Short description"
                      descriptionPlaceholder="Mention the role, work, or transfer context."
                      embedded
                    />
                  ) : null}
                </Grid>
              </Panel>

              <MinimalScoredItemsEditor
                step="3"
                title="Position of responsibility"
                subtitle="Choose the exact POR marking category, add the title, a short description, and attach the supporting proof."
                items={applicationForm.responsibilityItems}
                onChange={(items) => setApplicationForm((current) => ({ ...current, responsibilityItems: items }))}
                options={RESPONSIBILITY_OPTIONS}
                verifiedPors={verifiedPors}
                disabled={!canEditStudentForm}
                uploadLabel="Supporting document"
                titleLabel="Position title"
                titlePlaceholder="Enter the POR title"
                descriptionLabel="Short description"
                descriptionPlaceholder="Describe the responsibility briefly."
              />

              <MinimalScoredItemsEditor
                step="4"
                title="Awards / entrepreneurship / social work"
                subtitle="Add only the relevant awards, incubation, entrepreneurship, or social-work achievements."
                items={applicationForm.awardItems}
                onChange={(items) => setApplicationForm((current) => ({ ...current, awardItems: items }))}
                options={AWARD_OPTIONS}
                verifiedPors={verifiedPors}
                disabled={!canEditStudentForm}
                uploadLabel="Supporting document"
                titleLabel="Achievement title"
                titlePlaceholder="Enter the award or achievement title"
                descriptionLabel="Short description"
                descriptionPlaceholder="Describe the achievement briefly."
              />

              <MinimalScoredItemsEditor
                step="5"
                title="Cultural activities"
                subtitle="Add only the relevant cultural achievements and select the correct marking category."
                items={applicationForm.culturalItems}
                onChange={(items) => setApplicationForm((current) => ({ ...current, culturalItems: items }))}
                options={ACTIVITY_LEVEL_OPTIONS}
                verifiedPors={verifiedPors}
                disabled={!canEditStudentForm}
                uploadLabel="Supporting document"
                titleLabel="Achievement title"
                titlePlaceholder="Enter the cultural activity title"
                descriptionLabel="Short description"
                descriptionPlaceholder="Describe the activity or result briefly."
              />

              <MinimalScoredItemsEditor
                step="6"
                title="Science and technology activities"
                subtitle="Add only the relevant science and technology activities with the correct scoring category."
                items={applicationForm.scienceTechnologyItems}
                onChange={(items) => setApplicationForm((current) => ({ ...current, scienceTechnologyItems: items }))}
                options={ACTIVITY_LEVEL_OPTIONS}
                verifiedPors={verifiedPors}
                disabled={!canEditStudentForm}
                uploadLabel="Supporting document"
                titleLabel="Achievement title"
                titlePlaceholder="Enter the science / technology activity title"
                descriptionLabel="Short description"
                descriptionPlaceholder="Describe the activity or result briefly."
              />

              <MinimalScoredItemsEditor
                step="7"
                title="Games and sports activities"
                subtitle="Add only the relevant sports achievements and match them to the correct marking category."
                items={applicationForm.gamesSportsItems}
                onChange={(items) => setApplicationForm((current) => ({ ...current, gamesSportsItems: items }))}
                options={ACTIVITY_LEVEL_OPTIONS}
                verifiedPors={verifiedPors}
                disabled={!canEditStudentForm}
                uploadLabel="Supporting document"
                titleLabel="Achievement title"
                titlePlaceholder="Enter the sports activity title"
                descriptionLabel="Short description"
                descriptionPlaceholder="Describe the activity or result briefly."
              />

              <MinimalScoredItemsEditor
                step="8"
                title="Co-curricular / extra-curricular activities"
                subtitle="Add only the relevant co-curricular or extra-curricular achievements."
                items={applicationForm.coCurricularItems}
                onChange={(items) => setApplicationForm((current) => ({ ...current, coCurricularItems: items }))}
                options={CO_CURRICULAR_OPTIONS}
                verifiedPors={verifiedPors}
                disabled={!canEditStudentForm}
                uploadLabel="Supporting document"
                titleLabel="Achievement title"
                titlePlaceholder="Enter the activity title"
                descriptionLabel="Short description"
                descriptionPlaceholder="Describe the activity briefly."
              />

              <Panel title="Final Declaration">
                <VStack gap={3} color="body">
                  <label style={checklistItemStyle}>
                    <input
                      type="checkbox"
                      checked={applicationForm.personalAcademic.isPassingOutStudent}
                      disabled={!canEditStudentForm}
                      onChange={(event) => updatePersonalAcademicField("isPassingOutStudent", event.target.checked)}
                      style={{ marginTop: 4 }}
                    />
                    <Text as="span" size="sm" leading={1.7}>
                      I confirm that I am a passing out student and eligible to apply for this award.
                    </Text>
                  </label>
                  <label style={checklistItemStyle}>
                    <input
                      type="checkbox"
                      checked={applicationForm.personalAcademic.hasNoDisciplinaryAction}
                      disabled={!canEditStudentForm}
                      onChange={(event) => updatePersonalAcademicField("hasNoDisciplinaryAction", event.target.checked)}
                      style={{ marginTop: 4 }}
                    />
                    <Text as="span" size="sm" leading={1.7}>
                      I confirm that I have not been subjected to any disciplinary action.
                    </Text>
                  </label>
                  <label style={checklistItemStyle}>
                    <input
                      type="checkbox"
                      checked={applicationForm.personalAcademic.hasNoFrGrade}
                      disabled={!canEditStudentForm}
                      onChange={(event) => updatePersonalAcademicField("hasNoFrGrade", event.target.checked)}
                      style={{ marginTop: 4 }}
                    />
                    <Text as="span" size="sm" leading={1.7}>
                      I confirm that no FR grade is accounted in my academics for this application.
                    </Text>
                  </label>
                  <label style={checklistItemStyle}>
                    <input
                      type="checkbox"
                      checked={applicationForm.personalAcademic.declarationAccepted}
                      disabled={!canEditStudentForm}
                      onChange={(event) => updatePersonalAcademicField("declarationAccepted", event.target.checked)}
                      style={{ marginTop: 4 }}
                    />
                    <Text as="span" size="sm" leading={1.7}>
                      I hereby declare that the information provided by me is true and correct to the best of my knowledge and belief. If any of the information is found to be false or misleading, I authorize the Institute to take appropriate action against me as deemed fit.
                    </Text>
                  </label>

                  <Grid cols={1} gap={3} style={{ ...infoBoxStyle }}>
                    <span style={sectionLabelStyle}>Submission Action</span>
                    <Button onClick={handleSaveStudentApplication} loading={savingApplication} disabled={!canEditStudentForm}>
                      <Save size={16} /> Save application
                    </Button>
                    {!canEditStudentForm ? (
                      <Text as="div" color="muted" size="sm" leading={1.6}>
                        This application is read-only because the deadline has passed or the submission has already been reviewed.
                      </Text>
                    ) : null}
                  </Grid>
                </VStack>
              </Panel>
            </VStack>
          </>
        )}
      </div>

      <MarkingSchemeModal
        open={showMarkingSchemeModal}
        onClose={() => setShowMarkingSchemeModal(false)}
      />

      {showOccurrenceModal ? (
        <Modal
          title={occurrenceModalMode === "edit" ? "Edit occurrence" : "Start Overall Best Performer occurrence"}
          onClose={() => {
            setShowOccurrenceModal(false)
            setShowEligibleStudentsModal(false)
          }}
          width={980}
          fullHeight={true}
        >
          <VStack gap={4}>
            <Grid cols={2} gap={3}>
              <div>
                <label style={fieldLabelStyle}>Occurrence title</label>
                <input value={occurrenceForm.title} onChange={(event) => setOccurrenceForm((current) => ({ ...current, title: event.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={fieldLabelStyle}>Award year</label>
                <input value={occurrenceForm.awardYear} onChange={(event) => setOccurrenceForm((current) => ({ ...current, awardYear: event.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={fieldLabelStyle}>Application start date</label>
                <input type="datetime-local" value={occurrenceForm.applyStartAt} onChange={(event) => setOccurrenceForm((current) => ({ ...current, applyStartAt: event.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={fieldLabelStyle}>Application end date</label>
                <input type="datetime-local" value={occurrenceForm.applyEndAt} onChange={(event) => setOccurrenceForm((current) => ({ ...current, applyEndAt: event.target.value }))} style={inputStyle} />
              </div>
              <HStack align="end" gap="none" color="muted">
                {occurrenceModalMode === "edit"
                  ? `${occurrenceForm.eligibleRollNumbers.length || 0} eligible students currently configured`
                  : (occurrenceForm.eligibleRows || []).length
                    ? `${occurrenceForm.eligibleRows.length} CSV rows loaded`
                    : "CSV upload required when activating a new occurrence"}
              </HStack>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={fieldLabelStyle}>Description / instructions</label>
                <textarea value={occurrenceForm.description} onChange={(event) => setOccurrenceForm((current) => ({ ...current, description: event.target.value }))} style={textareaStyle} />
              </div>
            </Grid>

            {occurrenceModalMode === "edit" ? (
              <Panel
                title="Eligible students"
                subtitle="Review and update the student list without reuploading unless you want to replace it."
                actions={(
                  <Button variant="secondary" onClick={() => setShowEligibleStudentsModal(true)}>
                    <Eye size={16} /> View Students
                  </Button>
                )}
              >
                <Grid cols={1} gap={3}>
                  <div style={fieldClusterStyle}>
                    <span style={sectionLabelStyle}>Current list</span>
                    <Grid cols={1} gap="6px" style={{ color: "var(--color-text-body)", fontSize: "var(--font-size-sm)" }}>
                      <div>{occurrenceForm.eligibleRollNumbers.length || 0} eligible students configured for this occurrence.</div>
                      <Text as="div" color="muted">
                        Editing this list will not remove or delete already submitted applications for this occurrence.
                      </Text>
                    </Grid>
                  </div>
                </Grid>
              </Panel>
            ) : (
              <Panel
                title="Eligible students CSV"
                subtitle="Upload a CSV with a single required column: rollNumber"
              >
                <CsvUploader
                  onDataParsed={handleOccurrenceRowsParsed}
                  requiredFields={["rollNumber"]}
                  templateFileName="overall_best_performer_eligible_students.csv"
                  templateHeaders={["rollNumber"]}
                  maxRecords={5000}
                  instructionText="Upload the exact roll numbers allowed to apply in this occurrence."
                />
              </Panel>
            )}

            <HStack gap={2} justify="end">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowOccurrenceModal(false)
                  setShowEligibleStudentsModal(false)
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveOccurrence} loading={savingOccurrence}>
                <Upload size={16} /> {occurrenceModalMode === "edit" ? "Save changes" : "Activate occurrence"}
              </Button>
            </HStack>
          </VStack>
        </Modal>
      ) : null}

      {showEligibleStudentsModal ? (
        <Modal
          title="Manage Eligible Students"
          onClose={() => setShowEligibleStudentsModal(false)}
          width={1080}
          minHeight="60vh"
        >
          <Grid cols={1} gap={4}>
            <div style={fieldClusterStyle}>
              <span style={sectionLabelStyle}>Important</span>
              <Text as="div" color="body" size="sm" leading={1.6}>
                Changing this list affects future eligibility for this occurrence, but it does not remove or delete already submitted applications.
              </Text>
            </div>

            <Grid cols="minmax(0,1fr) auto" gap={3} align="end">
              <div>
                <label style={fieldLabelStyle}>Search students</label>
                <Input
                  value={eligibleStudentSearch}
                  onChange={(event) => setEligibleStudentSearch(event.target.value)}
                  placeholder="Search by roll number, name, email, department..."
                />
              </div>
              <div style={{ minWidth: 220 }}>
                <label style={fieldLabelStyle}>Add by roll number</label>
                <Grid cols="minmax(0,1fr) auto" gap={2}>
                  <Input
                    value={manualEligibleRollNumber}
                    onChange={(event) => setManualEligibleRollNumber(event.target.value.toUpperCase())}
                    placeholder="e.g. 22CS10001"
                  />
                  <Button onClick={handleAddEligibleStudent}>
                    <Plus size={16} /> Add
                  </Button>
                </Grid>
              </div>
            </Grid>

            <Panel
              title="Replace entire list"
              subtitle="Upload a new CSV to overwrite the current eligible student list for this occurrence."
            >
              <CsvUploader
                onDataParsed={handleOccurrenceRowsParsed}
                requiredFields={["rollNumber"]}
                templateFileName="overall_best_performer_eligible_students.csv"
                templateHeaders={["rollNumber"]}
                maxRecords={5000}
                instructionText="Uploading here replaces the current list inside this edit session. Save the occurrence to apply the changes."
              />
            </Panel>

            <Panel
              title="Eligible students"
              subtitle={`${occurrenceForm.eligibleRollNumbers.length || 0} students currently in this edit list.`}
            >
              <Grid cols={1} gap={2} style={{ maxHeight: "42vh", overflowY: "auto" }}>
                {filteredEligibleStudents.length > 0 ? (
                  filteredEligibleStudents.map((student) => (
                    <Grid cols="minmax(0,1.2fr) minmax(0,1fr) auto" gap={3} align="center" style={{ padding: "var(--spacing-3)", border: "1px solid var(--color-border-primary)", borderRadius: "var(--radius-card-sm)", backgroundColor: "var(--color-bg-secondary)" }} key={student.rollNumber}>
                      <div style={{ minWidth: 0 }}>
                        <Text as="div" size="sm" weight="semibold" color="primary">
                          {student.name || "Student record will be validated on save"}
                        </Text>
                        <Text as="div" size="xs" color="muted" style={{ marginTop: "4px" }}>
                          {student.rollNumber}
                        </Text>
                      </div>
                      <Text as="div" size="xs" color="muted" leading={1.5} style={{ minWidth: 0 }}>
                        <div>{student.email || "Name/email not loaded yet"}</div>
                        <div>
                          {[student.department, student.degree].filter(Boolean).join(" · ") || "Profile details unavailable"}
                        </div>
                      </Text>
                      <Button
                        variant="secondary"
                        onClick={() => handleRemoveEligibleStudent(student.rollNumber)}
                      >
                        <XCircle size={16} /> Remove
                      </Button>
                    </Grid>
                  ))
                ) : (
                  <Text as="div" color="muted" size="sm">
                    No students match the current search.
                  </Text>
                )}
              </Grid>
            </Panel>

            <HStack gap={2} justify="end">
              <Button variant="ghost" onClick={() => setShowEligibleStudentsModal(false)}>
                Done
              </Button>
            </HStack>
          </Grid>
        </Modal>
      ) : null}

      <ReviewModal
        application={reviewApplication}
        open={Boolean(reviewApplication)}
        onClose={() => setReviewApplication(null)}
        onDecision={canReviewApplications ? handleReviewDecision : handleHodVerification}
        onApplicationUpdated={handleReviewApplicationUpdated}
        deciding={reviewing}
        reviewMode={canReviewApplications ? "admin" : canAddHodVerification ? "hod" : "readonly"}
      />
    </div>
  )
}

export default OverallBestPerformerPage
