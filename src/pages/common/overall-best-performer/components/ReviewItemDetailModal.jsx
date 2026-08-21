import { useEffect, useMemo, useState } from "react"
import { Button, Grid, HStack, Modal, Select, Surface, Text, VStack } from "hzero"
import { REVIEW_SECTION_META, formatScoreTypeLabel, formatSignedPoints } from "../scoring"
import { fieldLabelStyle } from "../styles"
import { ProofActionButton } from "./ProofActionButton"
import { PorDetailCard, PorDetailInfoRow } from "./PorDetailCard"
import { FileText, BadgeCheck, MessageSquare, Save, XCircle, Sparkles } from "lucide-react"

export const ReviewItemDetailModal = ({
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

