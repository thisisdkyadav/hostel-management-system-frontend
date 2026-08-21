import { useState } from "react"
import { Button, Grid, HStack, Select, Text } from "hzero"
import PdfUploadField from "@/components/common/pdf/PdfUploadField"
import { PROOF_SOURCE_OPTIONS } from "../scoring"
import { fieldClusterStyle, helperTextStyle } from "../styles"
import { getPorOptionLabel, uploadBestPerformerProof } from "../documents"
import { PorProofDetailModal } from "./PorProofDetailModal"
import { Eye } from "lucide-react"
import { sectionLabelStyle } from "@/components/gymkhana/events-page/sharedPrimitives"

export const SupportingProofField = ({
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

