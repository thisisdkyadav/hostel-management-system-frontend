import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Alert, Button, ConfirmDialog, Field, Modal, StatusBadge, Textarea } from "hzero"
import { Camera, ImagePlus } from "lucide-react"
import { studentApi, uploadApi } from "@/service"
import { queryKeys } from "@/lib/query"
import { getMediaUrl } from "@/utils/mediaUtils"
import { getErrorMessage } from "../diningPeriodHelpers"
import { formatDayMonth } from "../caterer/catererHelpers"
import { BIO_PHOTO_LINK_PARAM, BIO_PHOTO_LINK_VALUE } from "./studentDiningHelpers"

const DEFAULT_RULES = { formats: ["JPG", "PNG"], maxSizeMb: 5, minSidePx: 300 }
const ACCEPT = ".jpg,.jpeg,.png,image/jpeg,image/png"

const STATUS = {
  pending: { label: "Waiting for approval", tone: "warning" },
  approved: { label: "Updated", tone: "success" },
  rejected: { label: "Not accepted", tone: "danger" },
  cancelled: { label: "Cancelled", tone: "neutral" },
}


const PRIVACY_NOTE = "This photo is used only by the mess face scanners. It won't be shown on your profile or anywhere else."

const GUIDELINES = [
  "Take a new photo now. A recent photo matches best.",
  "Only your face: fill most of the photo with it, looking straight at the camera",
  "Eyes open, whole face visible: no cap, mask or sunglasses",
  "Plain, light background, even lighting, in focus",
  "Only you in the photo",
]

/** "image/jpeg" | "image/png" | "" from the file's first bytes (the name and type can lie). */
const sniffType = async (file) => {
  const bytes = new Uint8Array(await file.slice(0, 8).arrayBuffer())
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg"
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
  if (png.every((byte, index) => bytes[index] === byte)) return "image/png"
  return ""
}

const imageSize = (url) =>
  new Promise((resolve) => {
    const image = new Image()
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight })
    image.onerror = () => resolve(null)
    image.src = url
  })

/** The same rules the server applies; returns an error message or "". */
const checkPhoto = async (file, url, rules) => {
  const formats = rules.formats.join(" or ")
  if (!(await sniffType(file))) return `Only ${formats} photos are accepted.`
  if (file.size > rules.maxSizeMb * 1024 * 1024) return `The photo must be ${rules.maxSizeMb} MB or smaller.`
  const size = await imageSize(url)
  if (!size) return `This photo couldn't be read. Please choose another ${formats}.`
  if (Math.min(size.width, size.height) < rules.minSidePx) {
    return `The photo is too small (${size.width}×${size.height}). Use one at least ${rules.minSidePx} pixels on each side.`
  }
  return ""
}

const UpdatePhotoModal = ({ rules, onClose, onSent }) => {
  const queryClient = useQueryClient()
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState("")
  const [fileError, setFileError] = useState("")
  const [note, setNote] = useState("")
  const [checking, setChecking] = useState(false)

  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl])

  const send = useMutation({
    mutationFn: async () => {
      const formData = new FormData()
      formData.append("file", file)
      const uploaded = await uploadApi.uploadDiningBioPhoto(formData)
      return studentApi.requestDiningBioPhoto({ photoRef: uploaded.fileRef, note: note.trim() })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dining.bioPhoto() })
      onSent()
    },
  })

  const choose = async (event) => {
    const next = event.target.files?.[0]
    event.target.value = ""
    if (!next) return
    const url = URL.createObjectURL(next)
    setChecking(true)
    const problem = await checkPhoto(next, url, rules)
    setChecking(false)
    if (problem) {
      URL.revokeObjectURL(url)
      setFile(null)
      setPreviewUrl("")
      setFileError(problem)
      return
    }
    setFileError("")
    setFile(next)
    setPreviewUrl(url)
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Update face scanner photo"
      width={520}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={send.isPending}>
            Cancel
          </Button>
          <Button type="button" variant="primary" loading={send.isPending} disabled={!file || send.isPending} onClick={() => send.mutate()}>
            Send for approval
          </Button>
        </>
      }
    >
      <div className="sd-form">
        <Alert type="info" icon>
          {PRIVACY_NOTE}
        </Alert>
        <p className="sd-form__note">
          The dining office checks your photo first. Once they approve it, the face scanners at the mess use it within a few minutes.
        </p>
        <ul className="sd-bio__rules">
          {GUIDELINES.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>

        <input ref={inputRef} type="file" accept={ACCEPT} className="sd-bio__input" onChange={choose} aria-label="Choose a photo" />
        {previewUrl ? (
          <div className="sd-bio__chosen">
            <img src={previewUrl} alt="Your new photo" className="sd-bio__preview" />
            <Button type="button" variant="secondary" size="sm" onClick={() => inputRef.current?.click()} disabled={send.isPending}>
              Choose another
            </Button>
          </div>
        ) : (
          <button type="button" className="sd-bio__drop" onClick={() => inputRef.current?.click()} disabled={checking}>
            <ImagePlus size={22} aria-hidden="true" />
            <span>{checking ? "Checking photo…" : "Choose a photo"}</span>
            <small>
              {rules.formats.join(" or ")} only · up to {rules.maxSizeMb} MB · at least {rules.minSidePx}×{rules.minSidePx} pixels
            </small>
          </button>
        )}
        {fileError && (
          <Alert type="error" icon>
            {fileError}
          </Alert>
        )}

        <Field label="Note for the dining office (optional)" htmlFor="sd-bio-note">
          <Textarea id="sd-bio-note" rows={2} maxLength={300} value={note} onChange={(event) => setNote(event.target.value)} placeholder="e.g. The scanner doesn't recognise me since I got glasses" />
        </Field>
        {send.isError && (
          <Alert type="error" icon>
            {getErrorMessage(send.error, "Couldn't send your photo. Please try again.")}
          </Alert>
        )}
      </div>
    </Modal>
  )
}

/** Side card on the student Dining page: the face-scanner photo and its update request. */
const BioPhotoCard = () => {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const cardRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [message, setMessage] = useState("")

  const query = useQuery({
    queryKey: queryKeys.dining.bioPhoto(),
    queryFn: () => studentApi.getDiningBioPhoto(),
    retry: false,
  })
  const cancel = useMutation({
    mutationFn: (id) => studentApi.cancelDiningBioPhoto(id),
    onSuccess: () => {
      setConfirmCancel(false)
      setMessage("")
      queryClient.invalidateQueries({ queryKey: queryKeys.dining.bioPhoto() })
    },
    onError: (error) => {
      setConfirmCancel(false)
      setMessage(getErrorMessage(error, "Couldn't cancel the request."))
    },
  })

  // Opened from the shared link: open the upload (unless a photo is already
  // waiting) and highlight the card once; then scroll to it and drop the parameter.
  const [linkHandled, setLinkHandled] = useState(false)
  const fromLink = searchParams.get(BIO_PHOTO_LINK_PARAM) === BIO_PHOTO_LINK_VALUE
  if (fromLink && query.isSuccess && !linkHandled) {
    setLinkHandled(true)
    setHighlight(true)
    if (query.data?.current?.status !== "pending") setOpen(true)
  }
  useEffect(() => {
    if (!linkHandled) return
    cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
    setSearchParams(
      (params) => {
        const next = new URLSearchParams(params)
        next.delete(BIO_PHOTO_LINK_PARAM)
        return next
      },
      { replace: true }
    )
  }, [linkHandled, setSearchParams])

  // The card is a side feature: if it can't load, it stays hidden.
  if (query.isLoading || query.isError) return null

  const rules = { ...DEFAULT_RULES, ...(query.data?.rules || {}) }
  const current = query.data?.current || null
  const pending = current?.status === "pending"
  const status = current ? STATUS[current.status] : null

  return (
    <section className="sd-card" ref={cardRef} id="face-scanner-photo" data-highlight={highlight || undefined} onAnimationEnd={() => setHighlight(false)}>
      <header className="sd-card__head">
        <h2 className="sd-card__title">Face scanner photo</h2>
        {!pending && (
          <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
            <Camera size={15} /> Update photo
          </Button>
        )}
      </header>

      {!current && <p className="sd-card__note">If the mess scanner doesn&apos;t recognise you, send a new photo of your face here.</p>}
      <p className="sd-card__note">{PRIVACY_NOTE}</p>

      {current && (
        <div className="sd-bio__row">
          {current.photo?.ref && <img src={getMediaUrl(current.photo.ref)} alt="" className="sd-bio__thumb" />}
          <div className="sd-bio__text">
            <StatusBadge status={status.label} tone={status.tone} />
            <span className="sd-card__note">
              {current.status === "pending" && `Sent ${formatDayMonth(current.createdAt)}. The dining office will check it.`}
              {current.status === "approved" && `Updated ${formatDayMonth(current.pushedAt || current.reviewedAt)}. The scanners use it within a few minutes.`}
              {current.status === "rejected" && (current.reviewComment ? `Reason: ${current.reviewComment}` : "Please send a different photo.")}
              {current.status === "cancelled" && "You cancelled this request."}
            </span>
            {pending && (
              <button type="button" className="sd-link" onClick={() => setConfirmCancel(true)} disabled={cancel.isPending}>
                Cancel request
              </button>
            )}
          </div>
        </div>
      )}

      {message && (
        <Alert type="error" icon dismissible onDismiss={() => setMessage("")}>
          {message}
        </Alert>
      )}

      {open && (
        <UpdatePhotoModal
          rules={rules}
          onClose={() => setOpen(false)}
          onSent={() => {
            setOpen(false)
            setMessage("")
          }}
        />
      )}
      {confirmCancel && current && (
        <ConfirmDialog
          isOpen
          onClose={() => setConfirmCancel(false)}
          onConfirm={() => cancel.mutate(current.id)}
          title="Cancel this request?"
          message="Your current scanner photo stays as it is. You can send a new photo afterwards."
          confirmText="Cancel request"
          cancelText="Keep it"
          isDestructive
        />
      )}
    </section>
  )
}

export default BioPhotoCard
