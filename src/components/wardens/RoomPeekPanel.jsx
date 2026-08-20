import { useMemo, useState } from "react"
import { Avatar, Button, useToast } from "hzero"
import { isRoomActive } from "@/constants/roomStatus"
import { useHoverPanel } from "../common/HoverPanel"
import { hostelApi } from "../../service"
import { getMediaUrl } from "../../utils/mediaUtils"
import "./floor-map.css"

const CAPACITY_MIN = 1
const CAPACITY_MAX_DEFAULT = 3

const studentKey = (student) => student.allocationId || student.id

const buildSlots = (students, capacity) => {
  const list = Array.isArray(students) ? [...students] : []
  const byBed = new Map()
  const unmatched = []
  list.forEach((student) => {
    const bed = Number(student.bedNumber)
    if (bed >= 1 && !byBed.has(bed)) byBed.set(bed, student)
    else unmatched.push(student)
  })

  const slots = []
  for (let bed = 1; bed <= capacity; bed += 1) {
    if (byBed.has(bed)) {
      slots.push({ bed, student: byBed.get(bed), risk: false })
      byBed.delete(bed)
    } else if (unmatched.length) {
      slots.push({ bed, student: unmatched.shift(), risk: false })
    } else {
      slots.push({ bed, student: null, risk: false })
    }
  }

  ;[...byBed.values(), ...unmatched].forEach((student) => {
    slots.push({ bed: student.bedNumber || slots.length + 1, student, risk: true })
  })

  return slots
}

const RoomPeekPanel = ({ room, hostelId, canEdit = false, onViewMore, onSaved }) => {
  const { toast } = useToast()
  const hover = useHoverPanel()
  const isActive = isRoomActive(room.status)
  const isGuest = room.status === "Guest"
  const occupancy = room.currentOccupancy ?? room.occupancy ?? 0
  const savedCapacity =
    (Number(room.capacity) > 0 ? Number(room.capacity) : Number(room.originalCapacity) || 0) || CAPACITY_MIN
  const maxCapacity = Math.max(CAPACITY_MAX_DEFAULT, savedCapacity)
  const students = Array.isArray(room.students) ? room.students : []

  const [draftActive, setDraftActive] = useState(isActive)
  const [draftCapacity, setDraftCapacity] = useState(savedCapacity)
  const [saving, setSaving] = useState(false)

  const dirty =
    canEdit &&
    !isGuest &&
    (draftActive !== isActive || (draftActive && draftCapacity !== savedCapacity))

  const vacateCount = draftActive && draftCapacity < occupancy ? occupancy - draftCapacity : 0
  const vacateAll = !draftActive && isActive && occupancy > 0
  const displayCapacity = draftActive ? draftCapacity : 0
  const slots = useMemo(() => buildSlots(students, displayCapacity), [students, displayCapacity])

  const viewRoom = (
    <Button
      className="floor-map__view-room"
      variant="primary"
      size="sm"
      onClick={() => {
        onViewMore?.(room)
        hover?.closeAll?.()
      }}
    >
      View room
    </Button>
  )

  const confirm = async () => {
    if (!dirty || !hostelId) return
    setSaving(true)
    try {
      await hostelApi.updateRoom(hostelId, room.id, {
        status: draftActive ? "Active" : "Inactive",
        ...(draftActive ? { capacity: draftCapacity } : {}),
      })
      toast.success(draftActive ? "Room updated." : "Room marked inactive.")
      onSaved?.()
    } catch (error) {
      toast.error(error.message || "The room could not be updated.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="floor-map__peek" data-state={draftActive ? "live" : "off"}>
      <header className="floor-map__peek-head">
        <span className="floor-map__peek-num">{room.roomNumber}</span>

        {isGuest ? (
          <span className="floor-map__peek-meta">Guest hold</span>
        ) : (
          <div className="floor-map__console">
            <div
              className="floor-map__switch"
              role="radiogroup"
              aria-label="Room status"
              data-on={draftActive ? "true" : "false"}
              data-static={canEdit ? "false" : "true"}
            >
              <span className="floor-map__switch-thumb" aria-hidden="true" />
              {canEdit ? (
                <>
                  <button type="button" role="radio" aria-checked={draftActive} onClick={() => setDraftActive(true)}>
                    Active
                  </button>
                  <button type="button" role="radio" aria-checked={!draftActive} onClick={() => setDraftActive(false)}>
                    Off
                  </button>
                </>
              ) : (
                <>
                  <span data-on={draftActive ? "true" : undefined}>Active</span>
                  <span data-on={!draftActive ? "true" : undefined}>Off</span>
                </>
              )}
            </div>

            {draftActive && (
              <div
                className="floor-map__stepper"
                data-static={canEdit ? "false" : "true"}
                style={{ "--floor-cap": draftCapacity, "--floor-cap-max": maxCapacity }}
              >
                <div className="floor-map__stepper-track" role="radiogroup" aria-label="Beds">
                  <span className="floor-map__stepper-fill" aria-hidden="true" />
                  {Array.from({ length: maxCapacity }, (_, i) => {
                    const value = CAPACITY_MIN + i
                    return canEdit ? (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={draftCapacity === value}
                        aria-label={`${value} bed${value === 1 ? "" : "s"}`}
                        data-on={value <= draftCapacity ? "true" : "false"}
                        onClick={() => setDraftCapacity(value)}
                      >
                        {value}
                      </button>
                    ) : (
                      <span key={value} data-on={value <= draftCapacity ? "true" : "false"}>
                        {value}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
        {viewRoom}
      </header>

      {isGuest ? (
        <p className="floor-map__guest-note">Held for a guest booking. Status is set automatically.</p>
      ) : draftActive ? (
        <div className="floor-map__people">
          {slots.map((slot) =>
            slot.student ? (
              <div
                key={studentKey(slot.student)}
                className="floor-map__person"
                data-risk={slot.risk ? "true" : "false"}
                title={slot.student.name}
              >
                <span className="floor-map__person-avatar">
                  <Avatar
                    src={slot.student.profileImage ? getMediaUrl(slot.student.profileImage) : undefined}
                    name={slot.student.name}
                    size="small"
                  />
                </span>
                <span className="floor-map__person-name">{slot.student.name}</span>
                {slot.student.rollNumber && <span className="floor-map__person-roll">{slot.student.rollNumber}</span>}
              </div>
            ) : (
              <div key={`open-${slot.bed}`} className="floor-map__person" data-empty="true">
                <span className="floor-map__person-dot" />
                <span className="floor-map__person-name">Open bed</span>
              </div>
            )
          )}
        </div>
      ) : (
        <p className="floor-map__idle-plate">Out of service</p>
      )}

      {vacateCount > 0 && (
        <p className="floor-map__warn">
          Confirming removes {vacateCount} student{vacateCount === 1 ? "" : "s"} from the highest beds.
        </p>
      )}
      {vacateAll && (
        <p className="floor-map__warn">
          Confirming marks the room inactive and removes {occupancy} student{occupancy === 1 ? "" : "s"}.
        </p>
      )}

      {dirty && (
        <footer className="floor-map__actions">
          <Button variant="primary" size="sm" loading={saving} onClick={confirm}>
            Confirm
          </Button>
        </footer>
      )}
    </div>
  )
}

export default RoomPeekPanel
