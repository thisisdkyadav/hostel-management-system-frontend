import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Alert, Button, Modal, StatusBadge } from "hzero"
import { ImageUp, RefreshCw } from "lucide-react"
import { queryKeys } from "@/lib/query"
import { diningScannerUsersApi } from "@/service"
import { formatDateTime, getErrorMessage } from "@/components/dining/diningPeriodHelpers"
import { getMediaUrl } from "@/utils/mediaUtils"
import { useState } from "react"
import { STATUS, isChecking } from "./scannerUsersHelpers"


const MACHINE = {
  ok: { text: "Has this photo", tone: "ok" },
  waiting: {
    text: "Not there yet. A machine that's off gets it when it's back.",
    tone: "warn",
  },
  refused: { text: "Refused this photo", tone: "bad" },
}

/** What a machine sent back when HMS asked it for the student. */
const CHECK = {
  match: {
    text: "Sent back the same photo and made a face from it",
    tone: "ok",
  },
  noFace: { text: "Has the photo but made no face from it", tone: "bad" },
  different: { text: "Holds a different photo than HMS", tone: "bad" },
  noPhoto: { text: "Sent back no photo", tone: "bad" },
  noAnswer: { text: "Didn't answer", tone: "warn" },
  checking: { text: "Checking…", tone: "warn" },
  none: { text: "Not checked yet", tone: "none" },
}

const ATTEMPT = { sent: "Used", unusable: "Can't use", failed: "Failed" }


/** The machine whose photo to show: one that sent a photo, preferring an exact match. */
const shownMachine = (row) => row.machines.find((m) => m.check?.status === "match") || row.machines.find((m) => m.check?.photo) || null

const Photo = ({ url, alt, caption, dashed, title }) => (
  <figure className="sm-photo">
    {url ? (
      <a className="sm-photo__frame" data-dashed={dashed || undefined} href={url} target="_blank" rel="noreferrer" title={title}>
        <img src={url} alt={alt} />
      </a>
    ) : (
      <span className="sm-photo__frame sm-photo__frame--empty">No photo</span>
    )}
    <figcaption>{caption}</figcaption>
  </figure>
)

/** The student's HMS profile photo next to what a machine holds. */
const PhotoPair = ({ row }) => {
  const machine = shownMachine(row)
  const who = row.name || row.rollNumber
  const profileUrl = row.profileImage ? getMediaUrl(row.profileImage) : ""
  const machineUrl = machine ? diningScannerUsersApi.machinePhotoUrl(row.rollNumber, machine.sn, String(machine.check.at || "")) : ""
  const sentUrl = row.photo.present ? diningScannerUsersApi.photoUrl(row.rollNumber, row.photo.version) : ""
  return (
    <div className="sm-pair">
      <Photo url={profileUrl} alt={`Profile photo of ${who}`} caption="HMS profile" title="Open profile photo" />
      {machineUrl ? (
        <Photo url={machineUrl} alt={`Photo on ${machine.alias} for ${who}`} caption={`On ${machine.alias}`} title={`Open the photo ${machine.alias} holds`} />
      ) : (
        <Photo
          url={sentUrl}
          dashed
          alt={`Scanner photo of ${who}`}
          caption={sentUrl ? "Sent, not fetched back yet" : "No scanner photo"}
          title="The photo HMS sends. Not fetched back from a machine yet."
        />
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
            ? `${row.photo.sourceLabel || "Scanner photo"}${row.photo.storedAt ? `, saved ${formatDateTime(row.photo.storedAt)}` : ""}${row.photo.width ? `. ${row.photo.width}×${row.photo.height}` : ""}`
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
                <li key={machine.sn} className="sm-machine">
                  <span className="sm-machine__name" data-tone={state.tone}>
                    {machine.alias}
                  </span>
                  <div className="sm-machine__lines">
                    <span data-tone={state.tone}>{state.text}</span>
                    <span className="sm-machine__check" data-tone={check.tone}>
                      {check.text}
                      {machine.check?.at && check.tone !== "warn" ? `, ${formatDateTime(machine.check.at)}` : ""}
                    </span>
                    {machine.refusal && (
                      <span className="sm-machine__error">
                        {machine.refusal.message}
                        {machine.refusal.code ? ` (${machine.refusal.code})` : ""}
                      </span>
                    )}
                  </div>
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
