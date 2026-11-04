import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Alert, Button, Modal, StatusBadge } from "hzero"
import { ImageOff, ImageUp, RefreshCw } from "lucide-react"
import { queryKeys } from "@/lib/query"
import { diningScannerUsersApi } from "@/service"
import { formatDateTime, getErrorMessage } from "@/components/dining/diningPeriodHelpers"
import { getMediaUrl } from "@/utils/mediaUtils"
import { useState } from "react"
import { STATUS, isChecking } from "./scannerUsersHelpers"


const MACHINE = {
  ok: { text: "Has this photo", tone: "ok" },
  waiting: { text: "Not there yet", tone: "warn" },
  refused: { text: "Refused this photo", tone: "bad" },
}

/** What a machine sent back when HMS asked it for the student. */
const CHECK = {
  match: { text: "Same photo as HMS, face made", short: "Same as HMS", tone: "ok" },
  noFace: { text: "Has the photo, made no face", short: "No face made", tone: "bad" },
  different: { text: "Holds a different photo", short: "Different photo", tone: "bad" },
  noPhoto: { text: "Sent back no photo", short: "No photo", tone: "bad" },
  noAnswer: { text: "Didn't answer", short: "No answer", tone: "warn" },
  checking: { text: "Checking…", short: "Checking…", tone: "warn" },
  none: { text: "Not checked yet", short: "Not checked", tone: "none" },
}

const ATTEMPT = { sent: "Used", unusable: "Can't use", failed: "Failed" }


/** Machines that sent a photo back, exact matches first. */
const machinesWithPhoto = (row) =>
  row.machines.filter((m) => m.check?.photo).sort((a, b) => (b.check.status === "match") - (a.check.status === "match"))

const Photo = ({ url, alt, label, note, dashed }) => {
  const [broken, setBroken] = useState(false)
  return (
    <figure className="sm-photo">
      <figcaption>
        <strong>{label}</strong>
        {note && <span>{note}</span>}
      </figcaption>
      {url && !broken ? (
        <a className="sm-photo__frame" data-dashed={dashed || undefined} href={url} target="_blank" rel="noreferrer" title="Open full size">
          <img src={url} alt={alt} onError={() => setBroken(true)} />
        </a>
      ) : (
        <span className="sm-photo__frame sm-photo__frame--empty">
          <ImageOff size={22} aria-hidden="true" />
          No photo
        </span>
      )}
    </figure>
  )
}

/** The HMS profile photo next to what a machine holds (pick the machine). */
const PhotoPair = ({ row }) => {
  const fetched = machinesWithPhoto(row)
  const [picked, setPicked] = useState(null)
  const machine = fetched.find((m) => m.sn === picked) || fetched[0] || null
  const who = row.name || row.rollNumber
  const profileUrl = row.profileImage ? getMediaUrl(row.profileImage) : ""
  const sentUrl = row.photo.present ? diningScannerUsersApi.photoUrl(row.rollNumber, row.photo.version) : ""
  const machineUrl = machine ? diningScannerUsersApi.machinePhotoUrl(row.rollNumber, machine.sn, String(machine.check.at || "")) : ""
  const verdict = machine ? CHECK[machine.check.status] : null
  return (
    <div className="sm-pair">
      <Photo url={profileUrl} alt={`Profile photo of ${who}`} label="HMS profile" />
      {machine ? (
        <Photo
          url={machineUrl}
          alt={`Photo on ${machine.alias} for ${who}`}
          label={
            fetched.length > 1 ? (
              <span className="sm-tabs" role="group" aria-label="Machine">
                {fetched.map((m) => (
                  <button key={m.sn} type="button" aria-pressed={m.sn === machine.sn} onClick={() => setPicked(m.sn)}>
                    {m.alias}
                  </button>
                ))}
              </span>
            ) : (
              `On ${machine.alias}`
            )
          }
          note={verdict ? <span data-tone={verdict.tone}>{verdict.short}</span> : null}
        />
      ) : (
        <Photo url={sentUrl} dashed alt={`Scanner photo of ${who}`} label="Scanner photo" note={sentUrl ? "Sent, not fetched back yet" : null} />
      )}
    </div>
  )
}

/**
 * Everything about one student's scanner photo: the two photos, each machine's
 * state and what it sent back, its errors, and the two things staff can do.
 */
const ScannerStudentModal = ({ row: initial, onClose }) => {
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
  const refresh = () =>
    queryClient.invalidateQueries({
      queryKey: queryKeys.diningScannerUsers.all,
    })

  const useProfile = useMutation({
    mutationFn: () =>
      diningScannerUsersApi.useProfilePhoto(row.rollNumber, {
        replace: row.photoStatus === "valid",
      }),
    onSuccess: ({ item, outcome }) =>
      setFeedback(
        outcome === "sent"
          ? {
              type: "success",
              message: "Profile photo saved. The machines get it within a couple of minutes.",
            }
          : {
              type: "error",
              message: item.profileAttempt?.message || "The profile photo can't be used.",
            },
      ),
    onError: (error) =>
      setFeedback({
        type: "error",
        message: getErrorMessage(error, "Couldn't use the profile photo."),
      }),
    onSettled: refresh,
  })
  const fetchBack = useMutation({
    mutationFn: () => diningScannerUsersApi.checkOnMachines(row.rollNumber),
    onSuccess: () =>
      setFeedback({
        type: "info",
        message: "Asked the machines. Their photos show here within a minute or two.",
      }),
    onError: (error) =>
      setFeedback({
        type: "error",
        message: getErrorMessage(error, "Couldn't ask the machines."),
      }),
    onSettled: refresh,
  })

  const badge = STATUS[row.photoStatus] || STATUS.missing
  const checking = isChecking(row)
  const tried = row.profileAttempt && row.profileAttempt.outcome !== "sent"
  const refused = row.machines.some((m) => m.refusal)

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={row.name || row.rollNumber}
      width={640}
      footer={
        <>
          {row.photo.present && row.machines.length > 0 && (
            <Button
              variant="secondary"
              loading={fetchBack.isPending}
              disabled={fetchBack.isPending || checking}
              onClick={() => fetchBack.mutate()}
              title="Ask every machine for the photo it holds for this student"
            >
              <RefreshCw size={15} /> {checking ? "Checking machines…" : "Fetch from machines"}
            </Button>
          )}
          {row.profileImage && (
            <Button
              variant={row.photoStatus === "valid" ? "secondary" : "primary"}
              loading={useProfile.isPending}
              disabled={useProfile.isPending}
              onClick={() => useProfile.mutate()}
            >
              <ImageUp size={15} /> {row.photoStatus === "valid" ? "Replace with profile photo" : "Use profile photo"}
            </Button>
          )}
        </>
      }
    >
      <div className="sm">
        <div className="sm-head">
          <span className="sm-roll">{row.rollNumber}</span>
          <StatusBadge status={badge.label} tone={badge.tone} />
        </div>

        {feedback && (
          <Alert type={feedback.type} icon dismissible onDismiss={() => setFeedback(null)}>
            {feedback.message}
          </Alert>
        )}

        <PhotoPair row={row} />

        <p className="sm-source">
          {row.photo.present
            ? `Scanner photo: ${row.photo.sourceLabel || "uploaded"}${row.photo.storedAt ? `, ${formatDateTime(row.photo.storedAt)}` : ""}${row.photo.width ? ` · ${row.photo.width}×${row.photo.height}` : ""}`
            : row.profileImage
              ? "No scanner photo yet. The HMS profile photo can be used."
              : "No scanner photo and no HMS profile photo. The student can send one from their Dining page."}
        </p>
        {tried && (
          <p className="sm-source" data-tone="bad">
            {ATTEMPT[row.profileAttempt.outcome] || "Tried"} {formatDateTime(row.profileAttempt.at)}: {row.profileAttempt.message}
          </p>
        )}

        {row.photo.present && row.machines.length > 0 && (
          <ul className="sm-machines">
            {row.machines.map((machine) => {
              const state = MACHINE[machine.state] || MACHINE.waiting
              const check = CHECK[machine.check?.status] || CHECK.none
              return (
                <li key={machine.sn} className="sm-machine" data-tone={machine.refusal ? "bad" : state.tone}>
                  <strong className="sm-machine__name">{machine.alias}</strong>
                  <span data-tone={state.tone}>{state.text}</span>
                  <span className="sm-machine__check" data-tone={check.tone}>
                    {check.text}
                    {machine.check?.at && check.tone !== "warn" ? <small>{formatDateTime(machine.check.at)}</small> : null}
                  </span>
                  {machine.refusal && (
                    <span className="sm-machine__error">
                      {machine.refusal.message}
                      {machine.refusal.code ? ` (${machine.refusal.code})` : ""}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        )}
        {refused && <p className="sm-hint">Needs a new photo: clear, front-facing, one face, good light.</p>}
      </div>
    </Modal>
  )
}

export default ScannerStudentModal
