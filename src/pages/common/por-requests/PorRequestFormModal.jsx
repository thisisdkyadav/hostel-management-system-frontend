import PdfUploadField from "@/components/common/pdf/PdfUploadField"
import { Building2, Clock3, FilePenLine, FileText, ShieldAlert, ShieldCheck } from "lucide-react"
import { Button, Input } from "hzero"
import { Checkbox, Field, HStack, Label, Modal, Select, Textarea, ToggleButtonGroup } from "@/components/ui"
import { buildPorCategoryOptions } from "./listView"
import { getFilenameFromUrl } from "./documents"
import { uploadApi } from "@/service"

export const PorRequestFormModal = ({
  isOpen,
  isSaving,
  porCategories,
  formData,
  onChange,
  onClose,
  onSubmit,
  onSupportingDocPendingChange,
  isEdit = false,
}) => {
  if (!isOpen) return null

  const categoryOptions = buildPorCategoryOptions(porCategories)
  const updateSupportingDocument = (url, name = "") => {
    onChange?.({
      target: {
        name: "supportingDocumentUrl",
        value: url,
      },
    })
    onChange?.({
      target: {
        name: "supportingDocumentName",
        value: url ? name : "",
      },
    })
  }

  const uploadSupportingDocument = (file) => {
    updateSupportingDocument(formData.supportingDocumentUrl, file.name)
    const uploadPayload = new FormData()
    uploadPayload.append("porPdf", file)
    return uploadApi.uploadPorDocumentPDF(uploadPayload)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <HStack align="center" gap={2}>
          <FilePenLine className="text-[var(--color-primary)] shrink-0" size={20} />
          <span>{isEdit ? "Edit & Resubmit POR Request" : "Create POR Request"}</span>
        </HStack>
      }
      width={880}
      minHeight="50vh"
    >
      <form
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit?.()
        }}
        className="por-modal-container"
      >
        <div className="por-form-grid">
          {/* Left Column: Position Details */}
          <div className="por-form-section">
            <div className="por-section-header">
              <Building2 className="por-section-icon" size={18} />
              <h3 className="por-section-title">Position Information</h3>
            </div>

            <div className="space-y-4">
              <Field label="POR Category" htmlFor="por-category" required>
                <Select
                  id="por-category"
                  name="porCategoryId"
                  value={formData.porCategoryId}
                  onChange={onChange}
                  options={categoryOptions}
                  placeholder="Select POR category"
                  required
                  disabled={isSaving}
                />
              </Field>

              <Field label="Position of Responsibility" htmlFor="por-position-title" required>
                <Input
                  id="por-position-title"
                  name="positionTitle"
                  value={formData.positionTitle}
                  onChange={onChange}
                  placeholder="e.g. Treasurer"
                  disabled={isSaving}
                  required
                />
              </Field>

              <Field label="Tenure" htmlFor="por-tenure" required>
                <Input
                  id="por-tenure"
                  name="tenure"
                  value={formData.tenure}
                  onChange={onChange}
                  placeholder="e.g. Jul 2024 - Apr 2025"
                  disabled={isSaving}
                  required
                />
              </Field>

              <Field label="POR Details" htmlFor="por-position-details" required>
                <Textarea
                  id="por-position-details"
                  name="positionDetails"
                  value={formData.positionDetails}
                  onChange={onChange}
                  placeholder="Describe the position and your responsibilities in detail..."
                  rows={5}
                  required
                  disabled={isSaving}
                />
              </Field>
            </div>
          </div>

          {/* Right Column: Documentation & Safety */}
          <div className="por-form-section">
            <div className="por-section-header">
              <FileText className="por-section-icon" size={18} />
              <h3 className="por-section-title">Documentation & Safety</h3>
            </div>

            <div className="space-y-4">
              <div className="por-instruction-box">
                <span className="por-instruction-title">
                  <Clock3 size={14} />
                  Order of Attachment in PDF
                </span>
                <ol className="por-instruction-list">
                  <li className="por-instruction-item">Academic Achievements</li>
                  <li className="por-instruction-item">Part of any Club/Fluxus/Ingenium/RIC/MUN/E-Summit etc.</li>
                  <li className="por-instruction-item">Participation in any Inter IIT Meets</li>
                  <li className="por-instruction-item">Any other extra-curricular activities</li>
                </ol>
              </div>

              <div className="por-upload-container">
                <PdfUploadField
                  label="Supporting PDF"
                  value={formData.supportingDocumentUrl}
                  onChange={(url) =>
                    updateSupportingDocument(
                      url,
                      url ? formData.supportingDocumentName || getFilenameFromUrl(url, "por-document.pdf") : ""
                    )
                  }
                  onUpload={uploadSupportingDocument}
                  onPendingFileChange={(file) => onSupportingDocPendingChange?.(Boolean(file))}
                  disabled={isSaving}
                  required
                  uploadedText={formData.supportingDocumentName || "Supporting PDF uploaded"}
                  viewerTitle="POR Supporting Document"
                  viewerSubtitle="Uploaded supporting PDF"
                  downloadFileName={formData.supportingDocumentName || "por-document.pdf"}
                />
              </div>

              <div className="por-disciplinary-container">
                <Label required>Do you have any disciplinary action?</Label>
                <div style={{ marginTop: "var(--spacing-2)" }}>
                  <ToggleButtonGroup
                    options={[
                      {
                        value: "no",
                        label: "No",
                        icon: <ShieldCheck size={16} />,
                        ariaLabel: "No disciplinary action",
                      },
                      {
                        value: "yes",
                        label: "Yes",
                        icon: <ShieldAlert size={16} />,
                        ariaLabel: "Yes disciplinary action",
                      },
                    ]}
                    value={
                      formData.hasDisciplinaryAction === true
                        ? "yes"
                        : formData.hasDisciplinaryAction === false
                          ? "no"
                          : null
                    }
                    onChange={(selectedValue) =>
                      onChange?.({
                        target: {
                          name: "hasDisciplinaryAction",
                          value: selectedValue === "yes",
                          checked: selectedValue === "yes",
                          type: "checkbox",
                        },
                      })
                    }
                    variant="outline"
                    size="medium"
                    fullWidth
                    hideLabelsOnMobile={false}
                    disabled={isSaving}
                  />
                </div>
                <div className="por-toggle-desc">
                  Select one option to continue with the POR request.
                </div>
              </div>

              {formData.hasDisciplinaryAction ? (
                <div className="por-warning-box animate-fadeIn">
                  <HStack align="center" gap={2} className="text-[var(--color-danger)] font-semibold text-sm">
                    <ShieldAlert className="shrink-0 animate-bounce" size={16} />
                    <span>Action Details Required</span>
                  </HStack>
                  <Field label="Disciplinary Action Details" htmlFor="por-disciplinary-details" required>
                    <Textarea
                      id="por-disciplinary-details"
                      name="disciplinaryActionDetails"
                      value={formData.disciplinaryActionDetails}
                      onChange={onChange}
                      placeholder="Briefly describe the disciplinary action..."
                      rows={3}
                      required
                      disabled={isSaving}
                    />
                  </Field>
                </div>
              ) : null}
            </div>
          </div>

          {/* Undertaking accepted - Full Width */}
          <div className="por-undertaking-container">
            <Checkbox
              id="por-undertaking-accepted"
              name="undertakingAccepted"
              checked={Boolean(formData.undertakingAccepted)}
              onChange={(event) =>
                onChange?.({
                  target: {
                    name: "undertakingAccepted",
                    value: event?.target?.checked,
                    checked: event?.target?.checked,
                    type: "checkbox",
                  },
                })
              }
              label="I hereby declare that the information provided by me is true and correct to the best of my knowledge and belief. If any of the information is found to be false or misleading, I authorize the Institute to take appropriate action against me as deemed fit."
            />
          </div>
        </div>

        <div className="por-modal-footer">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="button" onClick={() => onSubmit?.()} loading={isSaving} disabled={isSaving}>
            {isEdit ? "Resubmit Request" : "Create Request"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
