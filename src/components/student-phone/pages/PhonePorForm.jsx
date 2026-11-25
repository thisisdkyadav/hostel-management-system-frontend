import { useState } from "react"
import { useToast } from "hzero"
import { CheckCircle2, FileText } from "lucide-react"
import { uploadApi, resolveUploadedFileRef } from "@/service"
import CertificateViewerModal from "@/components/common/students/CertificateViewerModal"
import PhoneSheet from "../kit/PhoneSheet"

const MAX_PDF_MB = 5

/**
 * New or edited POR request, laid out for the phone. Same fields and checks as
 * the desktop form; the PDF uploads as soon as it's picked.
 */
const PhonePorForm = ({ categories, data, onChange, onClose, onSubmit, onUploadingChange, saving, editing, missing }) => {
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)
  const [viewing, setViewing] = useState(false)
  const set = (name, value) => onChange({ target: { name, value, checked: value, type: typeof value === "boolean" ? "checkbox" : "text" } })

  const pickPdf = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    if (!(file.type === "application/pdf" || /\.pdf$/i.test(file.name))) return toast.error("Only PDF files can be attached")
    if (file.size > MAX_PDF_MB * 1024 * 1024) return toast.error(`The PDF must be ${MAX_PDF_MB} MB or smaller`)
    setUploading(true)
    onUploadingChange?.(true)
    try {
      const payload = new FormData()
      payload.append("porPdf", file)
      const url = resolveUploadedFileRef(await uploadApi.uploadPorDocumentPDF(payload))
      if (!url) throw new Error("The upload didn't return a file")
      set("supportingDocumentUrl", url)
      set("supportingDocumentName", file.name)
    } catch (error) {
      toast.error(error?.message || "Couldn't upload the PDF. Try again.")
    } finally {
      setUploading(false)
      onUploadingChange?.(false)
    }
  }

  const discipline = data.hasDisciplinaryAction === true ? "yes" : data.hasDisciplinaryAction === false ? "no" : null

  return (
    <PhoneSheet
      title={editing ? "Edit and resubmit" : "New POR request"}
      tall
      onClose={onClose}
      footer={
        <div className="mc-send">
          {missing && <p className="mk-sub mc-send__hint">{missing}</p>}
          <button type="submit" form="mq-form" className="mk-btn mk-btn--primary" disabled={Boolean(missing) || saving || uploading}>
            {saving ? "Sending…" : editing ? "Resubmit for review" : "Send for review"}
          </button>
        </div>
      }
    >
      <form
        id="mq-form"
        className="mc-form"
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit()
        }}
      >
        <p className="mk-sub mq-intro">You&apos;ll need one PDF (up to {MAX_PDF_MB} MB) with proof of your position and your other activities. Gymkhana and then Student Affairs review it.</p>

        <label className="mc-form__group">
          <span className="mk-label">Club or body</span>
          <select className="mk-input mk-select" data-empty={!data.porCategoryId || undefined} name="porCategoryId" value={data.porCategoryId} onChange={onChange} disabled={saving}>
            <option value="">Choose one</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name || "POR category"}
              </option>
            ))}
          </select>
        </label>

        <label className="mc-form__group">
          <span className="mk-label">Your position</span>
          <input className="mk-input" name="positionTitle" value={data.positionTitle} onChange={onChange} placeholder="e.g. Treasurer" disabled={saving} />
        </label>

        <label className="mc-form__group">
          <span className="mk-label">Tenure</span>
          <input className="mk-input" name="tenure" value={data.tenure} onChange={onChange} placeholder="e.g. Jul 2025 – Apr 2026" disabled={saving} />
        </label>

        <label className="mc-form__group">
          <span className="mk-label">What you did</span>
          <textarea className="mk-input mk-input--area" name="positionDetails" rows={4} value={data.positionDetails} onChange={onChange} placeholder="Your responsibilities and what you achieved in this role" disabled={saving} />
        </label>

        <section className="mc-form__group">
          <h3 className="mk-label">Supporting PDF</h3>
          <div className="mq-pdf-help">
            <p className="mq-pdf-help__title">The institute asks for the PDF in this order</p>
            <ol>
              <li>Academic achievements</li>
              <li>Clubs, Fluxus, Ingenium, RIC, MUN, E-Summit and similar</li>
              <li>Inter IIT meets</li>
              <li>Any other extra-curricular activities</li>
            </ol>
          </div>
          <div className="mn-doc mq-pdf">
            <span className="mn-doc__icon" data-done={data.supportingDocumentUrl ? "" : undefined} aria-hidden="true">
              {data.supportingDocumentUrl ? <CheckCircle2 size={20} /> : <FileText size={20} />}
            </span>
            <span className="mn-doc__main">
              <span className="mn-doc__label">{uploading ? "Uploading…" : data.supportingDocumentUrl ? data.supportingDocumentName || "PDF attached" : "No PDF yet"}</span>
              <span className="mk-sub">{data.supportingDocumentUrl ? "Attached" : `PDF only, up to ${MAX_PDF_MB} MB`}</span>
            </span>
            {data.supportingDocumentUrl && !uploading && (
              <button type="button" className="mk-btn mk-btn--ghost mk-btn--sm" onClick={() => setViewing(true)}>
                View
              </button>
            )}
            <label className="mk-btn mk-btn--soft mk-btn--sm mn-doc__pick" aria-busy={uploading || undefined}>
              <input type="file" accept=".pdf,application/pdf" onChange={pickPdf} disabled={uploading || saving} hidden />
              {data.supportingDocumentUrl ? "Replace" : "Choose PDF"}
            </label>
          </div>
        </section>

        <fieldset className="mc-form__group">
          <legend className="mk-label">Any disciplinary action against you?</legend>
          <div className="mq-yn" role="radiogroup">
            {[
              ["no", "No"],
              ["yes", "Yes"],
            ].map(([value, label]) => (
              <button key={value} type="button" role="radio" aria-checked={discipline === value} className="mq-yn__opt" data-on={discipline === value || undefined} onClick={() => set("hasDisciplinaryAction", value === "yes")} disabled={saving}>
                <span className="mq-yn__ring" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        {data.hasDisciplinaryAction === true && (
          <label className="mc-form__group">
            <span className="mk-label">What was the action?</span>
            <textarea className="mk-input mk-input--area" name="disciplinaryActionDetails" rows={3} value={data.disciplinaryActionDetails} onChange={onChange} placeholder="A short description" disabled={saving} />
          </label>
        )}

        <label className="mk-check mn-declare">
          <input type="checkbox" checked={Boolean(data.undertakingAccepted)} onChange={(event) => set("undertakingAccepted", event.target.checked)} disabled={saving} />
          <span>I hereby declare that the information provided by me is true and correct to the best of my knowledge and belief. If any of the information is found to be false or misleading, I authorize the Institute to take appropriate action against me as deemed fit.</span>
        </label>
      </form>

      <CertificateViewerModal isOpen={viewing} onClose={() => setViewing(false)} certificateUrl={data.supportingDocumentUrl} />
    </PhoneSheet>
  )
}

export default PhonePorForm
