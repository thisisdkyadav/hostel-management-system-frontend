import { useState } from "react"
import { Alert, Button, Checkbox, Field, Grid, HStack, Input, Surface, Text, Textarea, VStack } from "hzero"
import { Search, TriangleAlert, CircleCheck } from "lucide-react"
import { h4Api } from "@/service/modules/intern-accommodation.api"
import { dateTime } from "./h4.format"

export default function H4RoomCheck({ request, amendment = false, onReady, onSaved }) {
  const [roomNumber, setRoom] = useState(amendment ? request.room?.roomNumber || "" : "")
  const [unitNumber, setUnit] = useState(amendment ? request.room?.unitId?.unitNumber || "" : "")
  const [preview, setPreview] = useState(null)
  const [ack, setAck] = useState(false)
  const [reason, setReason] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const data = {
    roomNumber,
    unitNumber,
    amendment,
    fingerprint: preview?.fingerprint,
    acknowledged: ack,
    overrideReason: reason,
  }
  const ready =
    !!preview && (!preview.warnings.length || (ack && reason.trim())) && (amendment || !request.room || !!reason.trim())
  const invalidate = () => {
    setPreview(null)
    setAck(false)
    onReady?.(null)
  }
  const check = async () => {
    setError("")
    setBusy(true)
    try {
      const res = await h4Api.action(request._id, "room-check", { roomNumber, unitNumber, amendment })
      setPreview(res.data)
      setAck(false)
      setReason("")
      onReady?.(res.data.warnings.length ? null : { ...data, fingerprint: res.data.fingerprint })
    } catch (e) {
      setError(e.message)
      invalidate()
    } finally {
      setBusy(false)
    }
  }
  const assign = async () => {
    setBusy(true)
    setError("")
    try {
      await h4Api.action(request._id, "assign", { ...data, revision: request.h4.revision })
      await onSaved()
      invalidate()
    } catch (e) {
      setError(e.message)
      invalidate()
      await onSaved()
    } finally {
      setBusy(false)
    }
  }
  const setAcknowledgment = (value) => {
    setAck(value)
    onReady?.(value && reason.trim() ? { ...data, acknowledged: value } : null)
  }
  const setOverride = (value) => {
    setReason(value)
    onReady?.(preview && (!preview.warnings.length || ack) && value.trim() ? { ...data, overrideReason: value } : null)
  }
  return (
    <VStack gap={3}>
      {error && <Alert tone="danger">{error}</Alert>}
      <Grid columns={2} gap={3}>
        <Field label="Unit / block">
          <Input
            value={unitNumber}
            placeholder="If applicable"
            disabled={amendment}
            onChange={(e) => {
              setUnit(e.target.value)
              invalidate()
            }}
          />
        </Field>
        <Field label="Room number" required>
          <Input
            value={roomNumber}
            placeholder="e.g. 401"
            disabled={amendment}
            onChange={(e) => {
              setRoom(e.target.value)
              invalidate()
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                check()
              }
            }}
          />
        </Field>
      </Grid>
      <Button variant="secondary" onClick={check} loading={busy} disabled={!roomNumber || busy}>
        <Search size={16} /> {amendment ? "Check room for proposed dates" : "Check room"}
      </Button>
      {preview && (
        <VStack gap={3}>
          <Surface bg="secondary" padding={3} radius="md">
            <HStack gap={2}>
              <CircleCheck size={16} />
              <Text weight="semibold">
                {preview.room.hostelName} ·{" "}
                {[preview.room.unitNumber, preview.room.roomNumber].filter(Boolean).join(" / ")}
              </Text>
            </HStack>
            <Text size="xs" color="muted">
              {preview.room.capacity} bed(s) · {preview.room.status} · {dateTime(preview.from)} – {dateTime(preview.to)}
            </Text>
          </Surface>
          {preview.warnings.length ? (
            <>
              <Alert tone="warning">
                <VStack gap={2}>
                  <Text weight="semibold">
                    <TriangleAlert size={16} /> {preview.warnings.length} warning
                    {preview.warnings.length > 1 ? "s" : ""}
                  </Text>
                  {preview.warnings.map((w) => (
                    <div key={`${w.kind}:${w.id}`}>
                      <Text size="sm" weight="semibold">
                        {w.name || w.kind}
                        {w.rollNumber ? ` · ${w.rollNumber}` : ""}
                      </Text>
                      <Text size="sm">{w.message}</Text>
                      {w.from && (
                        <Text size="xs">
                          {dateTime(w.from)} – {dateTime(w.to)}
                        </Text>
                      )}
                    </div>
                  ))}
                </VStack>
              </Alert>
              <Checkbox
                checked={ack}
                onChange={(e) => setAcknowledgment(e.target.checked)}
                label="I have checked these conflicts and confirm this room can be used"
              />
            </>
          ) : (
            <Alert tone="success">No recorded conflicts for these dates.</Alert>
          )}
          {(preview.warnings.length > 0 || request.room) && (
            <Field label={request.room && !amendment ? "Reason for room move" : "Override reason"} required>
              <Textarea
                rows={2}
                value={reason}
                onChange={(e) => setOverride(e.target.value)}
                placeholder="e.g. Resident is away; available bed confirmed"
              />
            </Field>
          )}
          {!amendment && (
            <Button onClick={assign} disabled={!ready || busy} loading={busy}>
              {request.room ? "Move to this room" : "Assign this room"}
            </Button>
          )}
        </VStack>
      )}
    </VStack>
  )
}
