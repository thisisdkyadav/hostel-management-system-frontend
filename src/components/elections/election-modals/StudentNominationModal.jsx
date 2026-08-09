import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Alert, Button, Grid, HStack, Input, Modal, Surface, Text } from "hzero"
import { FileText, Plus } from "lucide-react"
import CertificateViewerModal from "@/components/common/students/CertificateViewerModal"
import { idCardApi } from "@/service"
import { getMediaUrl } from "@/utils/mediaUtils"
import { DocumentUploadField, StatusPill } from "@/components/elections/ElectionShared"

export const StudentNominationModal = ({
  election,
  post,
  form,
  setForm,
  onSupporterChange,
  onLookupSupporter,
  onAddSupporter,
  onRemoveSupporter,
  supportLookupKey,
  onClose,
  onSave,
  saving,
  currentUserId,
  modalBodyStyle,
  badgeRowStyle,
  detailGridStyle,
  detailPanelStyle,
  labelStyle,
  mutedTextStyle,
  textareaStyle,
  pillBaseStyle,
  statusToneStyles,
}) => {
  const navigate = useNavigate()
  const [idCard, setIdCard] = useState({ front: "", back: "" })
  const [loadingIdCard, setLoadingIdCard] = useState(false)
  const [viewerUrl, setViewerUrl] = useState("")

  useEffect(() => {
    let isActive = true

    const loadIdCard = async () => {
      if (!currentUserId || !post) {
        if (isActive) {
          setIdCard({ front: "", back: "" })
        }
        return
      }

      try {
        setLoadingIdCard(true)
        const response = await idCardApi.getIDcard(currentUserId)
        if (!isActive) return
        setIdCard({
          front: response?.front || "",
          back: response?.back || "",
        })
      } catch (_error) {
        if (!isActive) return
        setIdCard({ front: "", back: "" })
      } finally {
        if (isActive) {
          setLoadingIdCard(false)
        }
      }
    }

    loadIdCard()

    return () => {
      isActive = false
    }
  }, [currentUserId, post?.id])

  const updateForm = (patch) => {
    setForm((current) => ({
      ...current,
      ...patch,
    }))
  }

  const hasUploadedIdCard = Boolean(idCard.front || idCard.back)
  const reviewNote = String(post?.myNomination?.review?.notes || "").trim()
  const hasReviewNote = reviewNote.length > 0
  const proposerRequired = Math.max(1, Number(post?.requirements?.proposersRequired || 1))
  const seconderRequired = Math.max(1, Number(post?.requirements?.secondersRequired || 1))

  if (!post) return null

  return (
    <>
      <Modal
        isOpen={Boolean(post)}
        onClose={onClose}
        title={`Nomination · ${post.title}`}
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
                {election?.title}
              </StatusPill>
              <StatusPill tone="primary" pillBaseStyle={pillBaseStyle} statusToneStyles={statusToneStyles}>
                P {proposerRequired}
              </StatusPill>
              <StatusPill tone="primary" pillBaseStyle={pillBaseStyle} statusToneStyles={statusToneStyles}>
                S {seconderRequired}
              </StatusPill>
            </div>
            <HStack gap="8px">
              <Button size="sm" variant="secondary" onClick={onClose}>
                Close
              </Button>
              <Button
                size="sm"
                onClick={onSave}
                loading={saving}
                disabled={saving || loadingIdCard || !hasUploadedIdCard}
              >
                <FileText size={14} /> Save
              </Button>
            </HStack>
          </div>
        }
      >
        <div style={modalBodyStyle}>
          {hasReviewNote ? (
            <Alert
              type={post?.myNomination?.status === "modification_requested" ? "warning" : "info"}
              title={
                post?.myNomination?.status === "modification_requested"
                  ? "Modification requested"
                  : "Review comment"
              }
            >
              {reviewNote}
            </Alert>
          ) : null}

          {loadingIdCard ? (
            <Alert type="info">Checking your student ID card...</Alert>
          ) : !hasUploadedIdCard ? (
            <Alert type="warning" title="Student ID card required">
              Upload your student ID card from the Student ID Card page before submitting nomination.
              <div style={{ marginTop: "var(--spacing-3)" }}>
                <Button size="sm" variant="secondary" onClick={() => navigate("/student/id-card")}>
                  Open ID Card Page
                </Button>
              </div>
            </Alert>
          ) : (
            <div style={detailPanelStyle}>
              <div style={labelStyle}>Student ID card</div>
              <Grid cols={2} gap={3}>
                {[
                  { label: "Front", value: idCard.front },
                  { label: "Back", value: idCard.back },
                ].map((item) => (
                  <Surface key={item.label} bg="secondary" padding={3} radius="card-sm" border>
                    <div style={{ ...labelStyle, marginBottom: "8px" }}>{item.label}</div>
                    {item.value ? (
                      <Grid cols={1} gap="10px">
                        <div
                          style={{
                            border: "1px solid var(--color-border-primary)",
                            borderRadius: "var(--radius-lg)",
                            minHeight: "120px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                            backgroundColor: "var(--color-bg-primary)",
                          }}
                        >
                          <img
                            src={getMediaUrl(item.value)}
                            alt={`Student ID ${item.label}`}
                            style={{ width: "100%", maxHeight: "140px", objectFit: "contain" }}
                          />
                        </div>
                        <HStack gap="8px" wrap>
                          <Button size="sm" variant="secondary" onClick={() => setViewerUrl(item.value)}>
                            View
                          </Button>
                          <Text as="a" color="brand" style={{ textDecoration: "none", alignSelf: "center" }} href={getMediaUrl(item.value)}
                            target="_blank"
                            rel="noreferrer">
                            Open
                          </Text>
                        </HStack>
                      </Grid>
                    ) : (
                      <span style={mutedTextStyle}>Not uploaded</span>
                    )}
                  </Surface>
                ))}
              </Grid>
            </div>
          )}

          <Grid cols="minmax(0, 1fr)" gap={3}>
            <Surface bg="primary" padding={3} radius="card-sm" border>
              <label style={labelStyle}>CGPA</label>
              <Input type="number" value={form.cgpa} onChange={(event) => updateForm({ cgpa: event.target.value })} />
            </Surface>
          </Grid>

          <Surface bg="secondary" padding={3} radius="card-sm" border>
            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                color: "var(--color-text-body)",
                fontWeight: "var(--font-weight-medium)",
              }}
            >
              <input
                type="checkbox"
                checked={Boolean(form.hasNoActiveBacklogs)}
                onChange={(event) => updateForm({ hasNoActiveBacklogs: event.target.checked })}
                style={{ marginTop: "2px" }}
              />
              <span>
                I confirm that I do not have any active backlog and that I understand I can keep only one active
                nomination in this election at a time.
              </span>
            </label>
          </Surface>

          <div style={detailGridStyle}>
            {[
              {
                supportType: "proposer",
                label: "Proposers",
                entries: form.proposerEntries || [],
                requiredCount: proposerRequired,
              },
              {
                supportType: "seconder",
                label: "Seconders",
                entries: form.seconderEntries || [],
                requiredCount: seconderRequired,
              },
            ].map((section) => (
              <Surface key={section.supportType} bg="secondary" padding={3} radius="card-sm" border>
                <HStack gap="8px" align="center" justify="between" style={{ marginBottom: "var(--spacing-2)" }}>
                  <div>
                    <div style={labelStyle}>{section.label}</div>
                    <div style={mutedTextStyle}>
                      Required: {section.requiredCount}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onAddSupporter?.(section.supportType)}
                  >
                    <Plus size={14} /> Add
                  </Button>
                </HStack>

                <Grid cols={1} gap="10px">
                  {section.entries.map((entry, index) => {
                    const rowKey = `${election?.id}:${post?.id}:${section.supportType}:${index}`
                    const isLookingUp = supportLookupKey === rowKey
                    return (
                      <Grid cols={1} gap="8px" style={{ border: "1px solid var(--color-border-primary)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-3)" }} key={rowKey}>
                        <HStack gap="8px" align="center">
                          <Input
                            value={entry.rollNumber || ""}
                            placeholder={`Roll number ${index + 1}`}
                            onChange={(event) =>
                              onSupporterChange?.(section.supportType, index, {
                                rollNumber: String(event.target.value || "").toUpperCase(),
                                userId: "",
                                name: "",
                                email: "",
                                profileImage: "",
                                lookupStatus: "idle",
                                lookupMessage: "",
                                supportStatus: "",
                                supportRole: "",
                              })
                            }
                            onBlur={(event) => onLookupSupporter?.(section.supportType, index, event.target.value)}
                          />
                          {section.entries.length > section.requiredCount ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onRemoveSupporter?.(section.supportType, index)}
                            >
                              Remove
                            </Button>
                          ) : null}
                        </HStack>

                        {isLookingUp ? (
                          <div style={mutedTextStyle}>Checking roll number...</div>
                        ) : null}

                        {entry.name ? (
                          <Grid cols={1} gap="2px">
                            <Text as="div" weight="medium">{entry.name}</Text>
                            <div style={mutedTextStyle}>
                              {entry.lookupMessage || "Verified"}
                            </div>
                          </Grid>
                        ) : null}

                        {!entry.name && entry.lookupStatus === "invalid" ? (
                          <Text as="div" color="danger-text" size="sm">
                            {entry.lookupMessage || "Unable to verify this roll number"}
                          </Text>
                        ) : null}
                      </Grid>
                    )
                  })}
                </Grid>
              </Surface>
            ))}
          </div>

          <div style={detailGridStyle}>
            <DocumentUploadField
              label="Grade Card (Optional)"
              value={form.gradeCardUrl}
              onChange={(nextValue) => updateForm({ gradeCardUrl: nextValue })}
              labelStyle={labelStyle}
              mutedTextStyle={mutedTextStyle}
            />
            <DocumentUploadField
              label="Manifesto (Optional)"
              value={form.manifestoUrl}
              onChange={(nextValue) => updateForm({ manifestoUrl: nextValue })}
              labelStyle={labelStyle}
              mutedTextStyle={mutedTextStyle}
            />
            <DocumentUploadField
              label="POR Documents (Optional)"
              value={form.porDocumentUrl}
              onChange={(nextValue) => updateForm({ porDocumentUrl: nextValue })}
              labelStyle={labelStyle}
              mutedTextStyle={mutedTextStyle}
            />
          </div>
        </div>
      </Modal>

      <CertificateViewerModal
        isOpen={Boolean(viewerUrl)}
        onClose={() => setViewerUrl("")}
        certificateUrl={viewerUrl}
      />
    </>
  )
}
