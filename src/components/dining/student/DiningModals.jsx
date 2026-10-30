import { useRef, useState } from "react"
import { Alert, Button, ConfirmDialog, Field, Input, Modal, StatusBadge, Textarea, ToggleButtonGroup } from "hzero"
import { Download } from "lucide-react"
import CapacityBar from "@/components/dining/CapacityBar"
import PdfUploadField from "@/components/common/pdf/PdfUploadField"
import { uploadApi } from "@/service"
import { getMediaDownloadUrl } from "@/utils/mediaUtils"
import { catererInitials, formatRange, getErrorMessage, localTodayKey } from "../caterer/catererHelpers"
import useRebatePreview from "./useRebatePreview"

const uploadFilledForm = (file) => {
  const formData = new FormData()
  formData.append("file", file)
  return uploadApi.uploadDiningRebateForm(formData)
}

const isPdfOrImage = (file) =>
  file.type === "application/pdf" || file.type?.startsWith("image/") || file.name.toLowerCase().endsWith(".pdf")

const plural = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`

const segmentLabel = (segment) => {
  const days = plural(Number(segment.dayCount) || 0, "day")
  return segment.type === "long-term" ? `Long-term · ${days} · needs approval` : `Short-term · ${days} · approved straight away`
}

/**
 * "I'll be away": a date range and an optional reason. Once both dates are
 * set the server previews the request; long-term stretches that need a form
 * show a download (blank form) + upload (filled form) step.
 * `longTermForm` is the blank template `{ ref, name }` (or null).
 */
export const AwayModal = ({ onClose, onSubmit, isSubmitting, longTermForm = null }) => {
  const [form, setForm] = useState({ startDate: "", endDate: "", reason: "" })
  const [error, setError] = useState("")
  const [filled, setFilled] = useState({ ref: "", name: "" })
  const [pendingFile, setPendingFile] = useState(null)
  const uploadedNameRef = useRef("")
  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))

  const { ready, isPending: previewPending, preview, error: previewError } = useRebatePreview(form.startDate, form.endDate)
  const formRequired = Boolean(preview?.formRequired)
  const segments = Array.isArray(preview?.segments) ? preview.segments : []
  const previewMessage = previewError ? getErrorMessage(previewError, "Couldn't check those dates. Please try again.") : ""
  const canSubmit = ready && !previewPending && !previewError && Boolean(preview) && (!formRequired || Boolean(filled.ref))

  const handleUploadForm = async (file) => {
    const result = await uploadFilledForm(file)
    uploadedNameRef.current = file.name
    return result
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.startDate || !form.endDate) return setError("Pick the first and last day you'll be away.")
    if (form.startDate > form.endDate) return setError("The last day can't be before the first day.")
    if (!preview || previewError) return setError(previewMessage || "Please wait while we check those dates.")
    if (formRequired && !filled.ref) return setError("Please upload the filled long-term rebate form.")
    setError("")
    try {
      await onSubmit({ ...form, ...(formRequired ? { form: { ref: filled.ref, name: filled.name } } : {}) })
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Couldn't save that. Please check the dates."))
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="I'll be away"
      width={520}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="sd-away-form" variant="primary" loading={isSubmitting} disabled={isSubmitting || !canSubmit}>
            Send
          </Button>
        </>
      }
    >
      <form id="sd-away-form" className="sd-form" onSubmit={handleSubmit}>
        <p className="sd-form__note">
          You won&apos;t be charged for these days. Short trips are approved straight away; longer ones go to the dining office.
        </p>
        {(error || previewMessage) && (
          <Alert type="error" icon>
            {error || previewMessage}
          </Alert>
        )}
        <div className="sd-form__dates">
          <Field label="First day away" htmlFor="sd-away-start" required>
            <Input id="sd-away-start" type="date" min={localTodayKey()} value={form.startDate} onChange={set("startDate")} required />
          </Field>
          <Field label="Last day away" htmlFor="sd-away-end" required>
            <Input
              id="sd-away-end"
              type="date"
              min={form.startDate || localTodayKey()}
              value={form.endDate}
              onChange={set("endDate")}
              required
            />
          </Field>
        </div>
        {ready && previewPending && <p className="sd-form__note">Checking your dates…</p>}
        {segments.length > 0 && (
          <ul className="sd-preview">
            {segments.map((segment, index) => (
              <li key={`${segment.periodId}-${index}`} className="sd-preview__row" data-type={segment.type}>
                <span className="sd-preview__dates">{formatRange(segment.startDate, segment.endDate)}</span>
                <span className="sd-preview__type">{segmentLabel(segment)}</span>
              </li>
            ))}
          </ul>
        )}
        <Field label="Reason (optional)" htmlFor="sd-away-reason">
          <Textarea id="sd-away-reason" rows={2} value={form.reason} onChange={set("reason")} placeholder="e.g. Going home for Diwali" />
        </Field>
        {formRequired && (
          <div className="sd-formstep">
            <h3 className="sd-formstep__title">Long-term rebate form</h3>
            <p className="sd-form__note">
              Long-term rebates need a form. Download it, fill it in, then upload it here (PDF or photo). The dining office checks it before approving.
            </p>
            {longTermForm?.ref && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => window.open(getMediaDownloadUrl(longTermForm.ref), "_blank", "noopener")}
              >
                <Download size={15} /> Download form
              </Button>
            )}
            <PdfUploadField
              label="Filled form"
              value={filled.ref}
              onChange={(ref) => setFilled({ ref: ref || "", name: ref ? uploadedNameRef.current || "Filled rebate form" : "" })}
              onUpload={handleUploadForm}
              onPendingFileChange={setPendingFile}
              required
              maxSizeMb={10}
              accept=".pdf,image/*"
              acceptHint="PDF or image"
              validateType={isPdfOrImage}
              uploadedText={filled.name ? `${filled.name} uploaded` : "Form uploaded"}
              viewerTitle="Filled rebate form"
              viewerSubtitle="The form you will submit"
              downloadFileName={filled.name || "rebate-form.pdf"}
            />
            {pendingFile && !filled.ref && <p className="sd-form__note">Press Upload to attach the selected file.</p>}
          </div>
        )}
      </form>
    </Modal>
  )
}

const SERIES_COUNT = 8
// "Filling fast" once a caterer is down to its last 15% of seats.
const LOW_SEATS_RATIO = 0.15

const seatState = ({ isSelected, remaining, max }) => {
  if (isSelected) return { key: "selected", label: "Your caterer", tone: "success" }
  if (remaining <= 0) return { key: "full", label: "Full", tone: "danger" }
  if (max > 0 && remaining / max <= LOW_SEATS_RATIO) return { key: "low", label: "Filling fast", tone: "warning" }
  return { key: "open", label: "", tone: "" }
}

/** One card per caterer with live seats; `onSelect(option)` asks to choose it. */
export const CatererOptions = ({ period, selectedCatererId, selectingCatererId, onSelect }) => {
  const options = Array.isArray(period?.catererCapacities) ? period.catererCapacities : []

  return (
    <ul className="sd-choose">
      {options.map((option, index) => {
        const isSelected = selectedCatererId === String(option.catererId)
        const remaining = Math.max(0, Number(option.remainingSeats || 0))
        const max = Number(option.maxStudentCount || 0)
        const state = seatState({ isSelected, remaining, max })
        const isFull = state.key === "full"
        const isSelecting = selectingCatererId === option.catererId
        const name = option.caterer?.name || "Caterer"
        return (
          <li
            key={option.catererId}
            className="sd-choose__option"
            data-state={state.key}
            style={{ "--sd-hue": `var(--color-series-${(index % SERIES_COUNT) + 1})` }}
          >
            <div className="sd-choose__top">
              <span className="sd-choose__avatar" aria-hidden="true">
                {catererInitials(name)}
              </span>
              <div className="sd-choose__id">
                <span className="sd-choose__name">{name}</span>
                <span className="sd-choose__meta">
                  {isFull ? "No seats left" : `${remaining.toLocaleString()} of ${max.toLocaleString()} seats left`}
                </span>
              </div>
              {state.label && <StatusBadge status={state.label} tone={state.tone} />}
            </div>
            <CapacityBar allocated={max - remaining} total={max} size="sm" showLabel={false} />
            <Button
              variant={isSelected ? "secondary" : "primary"}
              fullWidth
              disabled={isFull || isSelecting || isSelected || Boolean(selectingCatererId)}
              loading={isSelecting}
              onClick={() => onSelect(option)}
            >
              {isSelected ? "Chosen" : isFull ? "Full" : "Choose"}
            </Button>
          </li>
        )
      })}
    </ul>
  )
}

/** Pick a caterer for the open period; seats refresh while it is open. */
export const ChooseCatererModal = ({ period, selectedCatererId, selectingCatererId, onClose, onSelect }) => (
  <Modal isOpen onClose={onClose} title="Choose your caterer" width={760}>
    <p className="sd-form__note">
      For {formatRange(period.startDate, period.endDate)}. Seats update live, so pick soon if one is filling up.
    </p>
    <CatererOptions period={period} selectedCatererId={selectedCatererId} selectingCatererId={selectingCatererId} onSelect={onSelect} />
  </Modal>
)

const YES_NO_OPTIONS = [
  { value: true, label: "Yes" },
  { value: false, label: "No" },
]

/** Yes / No answer; `value` null/undefined shows neither selected. */
export const YesNoToggle = ({ value, onChange, disabled = false, size = "small" }) => (
  <ToggleButtonGroup
    options={YES_NO_OPTIONS}
    value={value}
    onChange={onChange}
    shape="rounded"
    size={size}
    hideLabelsOnMobile={false}
    disabled={disabled}
  />
)

/**
 * "Choose this caterer?" confirmation shared by the Dining page and the
 * allocation screen. When the period asks allocation-tag questions, each needs
 * a Yes / No answer (nothing preselected) before the choice can be confirmed.
 * `onConfirm(tagAnswers)` gets `[{ tagId, value }]`. Mount it only while a
 * caterer is pending so the answers start blank each time.
 */
export const ConfirmCatererDialog = ({ target, tags, onClose, onConfirm }) => {
  const [answers, setAnswers] = useState({})
  const questions = Array.isArray(tags) ? tags : []
  const name = target?.caterer?.name || "this caterer"
  const message = `You'll eat at ${name} for the whole period. You can't change it after confirming.`

  if (questions.length === 0) {
    return (
      <ConfirmDialog
        isOpen
        onClose={onClose}
        onConfirm={() => onConfirm([])}
        title="Choose this caterer?"
        message={message}
        confirmText="Yes, choose"
      />
    )
  }

  const unanswered = questions.filter((tag) => typeof answers[tag.id] !== "boolean")
  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Choose this caterer?"
      width={520}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={unanswered.length > 0}
            onClick={() => onConfirm(questions.map((tag) => ({ tagId: tag.id, value: answers[tag.id] })))}
          >
            Yes, choose
          </Button>
        </>
      }
    >
      <div className="sd-form">
        <p className="sd-form__note">{message}</p>
        <ul className="sd-tagq">
          {questions.map((tag) => (
            <li key={tag.id} className="sd-tagq__row">
              <span id={`sd-tagq-${tag.id}`} className="sd-tagq__label">
                {tag.question || tag.name}
              </span>
              <YesNoToggle value={answers[tag.id]} onChange={(value) => setAnswers((prev) => ({ ...prev, [tag.id]: value }))} />
            </li>
          ))}
        </ul>
        <p className="sd-form__note">
          {unanswered.length > 0
            ? `Answer ${unanswered.length === 1 ? "this question" : "all questions"} to continue. `
            : ""}
          Your caterer is final, but you can change these answers until the period starts.
        </p>
      </div>
    </Modal>
  )
}
