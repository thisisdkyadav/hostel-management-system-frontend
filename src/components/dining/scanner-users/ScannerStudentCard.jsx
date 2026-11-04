import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Button } from "hzero"
import { ImageUp, RefreshCw, ScanFace, X } from "lucide-react"
import { queryKeys } from "@/lib/query"
import { diningScannerUsersApi } from "@/service"
import { formatDateTime, getErrorMessage } from "@/components/dining/diningPeriodHelpers"
import { getMediaUrl } from "@/utils/mediaUtils"
import { REASONS, initials, isChecking } from "./scannerUsersHelpers"

/** One machine's answer for this student, in a word or two. */
const machineLine = (machine) => {
  if (machine.state === "refused") return { text: "Refused", tone: "bad" }
  // A face scan here since the photo was saved: proof, whatever the photo check said.
  if (machine.scannedAt) return { text: "Face scanned", tone: "ok", note: `Last ${formatDateTime(machine.scannedAt)}` }
  const check = machine.check?.status
  if (check === "noPhoto" && machine.check.face) return { text: "Face on machine", tone: "ok", note: "Enrolled there, no photo stored" }
  if (check === "noFace" || check === "noPhoto") return { text: "No face", tone: "bad" }
  if (check === "checking") return { text: "Checking…", tone: "warn" }
  if (machine.state === "waiting") return { text: "Waiting", tone: "warn" }
  if (check === "match" || check === "different") return { text: "Face made", tone: "ok" }
  if (machine.state === "ok") return { text: "Took the photo", tone: "ok", note: "Not checked yet" }
  return { text: "Nothing yet", tone: "none" }
}

const aliases = (machines) => machines.map((m) => m.alias).join(", ")

/** The headline for the card: does the face work, and what to do if not. */
const verdict = (row) => {
  const refused = row.machines.filter((m) => m.state === "refused")
  const noFace = row.machines.filter((m) => m.check?.status === "noFace" || (m.check?.status === "noPhoto" && !m.check.face))
  switch (row.reason) {
    case "working":
      return row.lastScan
        ? { tone: "ok", title: "Face works", text: `Scanned at ${row.lastScan.machine} on ${formatDateTime(row.lastScan.at)} with this photo.` }
        : { tone: "ok", title: "Scans at every machine", text: "Every machine took the photo and made a face from it." }
    case "noPhoto":
      return {
        tone: "none",
        title: "No scanner photo",
        text: row.profileImage ? "Use the HMS profile photo, or ask the student to send one from their Dining page." : "The student can send one from their Dining page.",
      }
    case "refused":
      return { tone: "bad", title: `Refused by ${aliases(refused)}`, text: "Needs a new photo: clear, front-facing, one face, good light." }
    case "noFace":
      return { tone: "bad", title: `No face on ${aliases(noFace)}`, text: "The machine has no usable face for this student. Check again, or ask for a new photo." }
    case "sending":
      return { tone: "warn", title: "On its way to the machines", text: "A machine that's off gets it when it's back." }
    default:
      return { tone: "warn", title: "Sent, not checked yet", text: "The machines are checked every night, or check them now." }
  }
}

const Shot = ({ url, label, fallback, dashed }) => {
  const [broken, setBroken] = useState(false)
  const shown = url && !broken
  return (
    <figure className="sc-shot">
      <a className="sc-shot__frame" data-dashed={dashed || undefined} href={shown ? url : undefined} target="_blank" rel="noreferrer" aria-label={shown ? `Open ${label}` : undefined}>
        {shown ? <img src={url} alt="" onError={() => setBroken(true)} /> : <span>{fallback}</span>}
      </a>
      <figcaption title={label}>{label}</figcaption>
    </figure>
  )
}

/** The HMS profile photo (when there is one) next to the photo on the scanner. */
const Photos = ({ row }) => {
  // The photo a machine sent back (an exact match first), else the one HMS sends.
  const fetched = row.machines.filter((m) => m.check?.photo).sort((a, b) => (b.check.status === "match") - (a.check.status === "match"))[0]
  const scannerUrl = fetched
    ? diningScannerUsersApi.machinePhotoUrl(row.rollNumber, fetched.sn, String(fetched.check.at || ""))
    : row.photo.present
      ? diningScannerUsersApi.photoUrl(row.rollNumber, row.photo.version)
      : ""
  return (
    <div className="sc-photos">
      <Shot url={row.profileImage ? getMediaUrl(row.profileImage) : ""} label={row.profileImage ? "HMS profile" : "No HMS profile photo"} fallback={initials(row.name)} dashed={!row.profileImage} />
      <Shot
        url={scannerUrl}
        label={fetched ? `On the scanner · ${fetched.alias}` : row.photo.present ? "Sent to the scanners" : "No scanner photo"}
        fallback="No photo"
        dashed={!fetched}
      />
    </div>
  )
}

/**
 * The selected student: their scanner photo, whether it works at each machine,
 * and what staff can do about it.
 */
const ScannerStudentCard = ({ row: initial }) => {
  const queryClient = useQueryClient()
  const [feedback, setFeedback] = useState(null)
  const detail = useQuery({
    queryKey: [...queryKeys.diningScannerUsers.all, "one", initial.rollNumber],
    queryFn: () => diningScannerUsersApi.get(initial.rollNumber),
    initialData: { item: initial },
    staleTime: 0,
    refetchOnMount: "always",
    refetchInterval: (current) => (current.state.data?.item && isChecking(current.state.data.item) ? 4000 : false),
  })
  const row = detail.data?.item || initial
  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.diningScannerUsers.all })

  const useProfile = useMutation({
    mutationFn: () => diningScannerUsersApi.useProfilePhoto(row.rollNumber, { replace: row.photo.present }),
    onSuccess: ({ item, outcome }) =>
      setFeedback(
        outcome === "sent"
          ? { type: "success", message: "Profile photo saved. The machines get it within a couple of minutes." }
          : { type: "error", message: item.profileAttempt?.message || "The profile photo can't be used." },
      ),
    onError: (error) => setFeedback({ type: "error", message: getErrorMessage(error, "Couldn't use the profile photo.") }),
    onSettled: refresh,
  })
  const checkAgain = useMutation({
    mutationFn: () => diningScannerUsersApi.checkOnMachines(row.rollNumber),
    onSuccess: () => setFeedback({ type: "info", message: "Asked the machines. Answers show here within a minute or two." }),
    onError: (error) => setFeedback({ type: "error", message: getErrorMessage(error, "Couldn't ask the machines.") }),
    onSettled: refresh,
  })

  const head = verdict(row)
  const checking = isChecking(row)
  const offerProfile = row.profileImage && ["noPhoto", "refused", "noFace"].includes(row.reason)
  const tried = row.profileAttempt && row.profileAttempt.outcome !== "sent"
  const reason = REASONS[row.reason] || REASONS.unchecked
  const profileState = tried
    ? { text: row.profileAttempt.message, tone: "bad" }
    : row.photo.source === "profile"
      ? { text: "In use on the scanners" }
      : { text: row.profileImage ? "Available, not used" : "None in HMS" }
  const facts = [
    { label: "Photo from", text: row.photo.present ? row.photo.sourceLabel || "Uploaded" : "—" },
    { label: "Saved", text: row.photo.present && row.photo.storedAt ? formatDateTime(row.photo.storedAt) : "—" },
    {
      label: "Last face scan",
      text: row.lastScan ? `${formatDateTime(row.lastScan.at)} · ${row.lastScan.machine}` : row.photo.present ? "None since this photo" : "—",
      tone: row.lastScan ? "ok" : undefined,
    },
    { label: "Profile photo", ...profileState },
  ]

  return (
    <article className="sc" aria-label={`${row.name || row.rollNumber}`}>
      <header className="sc-head">
        <div className="sc-who">
          <h2 title={row.name || undefined}>{row.name || "-"}</h2>
          <p className="sc-roll">
            <span>{row.rollNumber}</span>
            <span className="sc-tag" data-tone={reason.tone}>
              {reason.label}
            </span>
          </p>
        </div>
        <div className="sc-verdict" data-tone={head.tone}>
          <strong title={head.title}>{head.title}</strong>
          <span title={head.text}>{head.text}</span>
        </div>
      </header>

      <div className="sc-body">
        <Photos row={row} />
        <ol className="sc-machines" aria-label="Machines">
          {row.machines.map((machine) => {
            const line = row.photo.present ? machineLine(machine) : { text: "No photo to send", tone: "none" }
            const note = machine.refusal?.message || line.note
            return (
              <li key={machine.sn} data-tone={line.tone}>
                <ScanFace size={18} aria-hidden="true" />
                <strong>{machine.alias}</strong>
                <span className="sc-machines__state">{line.text}</span>
                <small className="sc-machines__note" data-error={machine.refusal ? true : undefined} title={note || undefined}>
                  {note || " "}
                </small>
              </li>
            )
          })}
        </ol>
      </div>

      <dl className="sc-facts">
        {facts.map((fact) => (
          <div key={fact.label}>
            <dt>{fact.label}</dt>
            <dd data-tone={fact.tone} title={fact.text}>
              {fact.text}
            </dd>
          </div>
        ))}
      </dl>

      <footer className="sc-actions">
        {feedback && (
          <p className="sc-feedback" data-tone={feedback.type === "error" ? "bad" : feedback.type === "success" ? "ok" : undefined} title={feedback.message}>
            <span>{feedback.message}</span>
            <button type="button" onClick={() => setFeedback(null)} aria-label="Dismiss">
              <X size={14} />
            </button>
          </p>
        )}
        <div className="sc-actions__buttons">
          {offerProfile && (
            <Button variant="primary" size="sm" loading={useProfile.isPending} disabled={useProfile.isPending} onClick={() => useProfile.mutate()}>
              <ImageUp size={15} /> Use profile photo
            </Button>
          )}
          {row.photo.present && row.machines.length > 0 && (
            <Button variant="secondary" size="sm" loading={checkAgain.isPending} disabled={checkAgain.isPending || checking} onClick={() => checkAgain.mutate()}>
              <RefreshCw size={15} /> {checking ? "Checking machines…" : "Check machines now"}
            </Button>
          )}
        </div>
      </footer>
    </article>
  )
}

export default ScannerStudentCard
