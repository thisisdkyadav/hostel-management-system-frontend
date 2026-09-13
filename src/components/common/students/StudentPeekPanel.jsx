import { Avatar } from "hzero"
import { getMediaUrl } from "../../../utils/mediaUtils"
import "./StudentPeekPanel.css"

const fact = (label, value, extra) => {
  const text = value == null ? "" : String(value).trim()
  return text ? { label, value: text, ...extra } : null
}

const stayOf = (student, location) => {
  const explicit = location == null ? "" : String(location).trim()
  if (explicit) return explicit
  const hostel = student?.hostel && String(student.hostel).trim()
  const room = student?.displayRoom && String(student.displayRoom).trim()
  if (hostel && room) return `${hostel}-${room}`
  return hostel || room || ""
}

const genderTone = (gender) => {
  if (gender === "Male") return "male"
  if (gender === "Female") return "female"
  if (gender) return "other"
  return undefined
}

/**
 * Compact student hover card. `room` is the floor-map occupant peek;
 * `directory` is the students-table peek (stay path, gender, complaints).
 */
const StudentPeekPanel = ({ student, roomNumber, variant = "room", location, onOpen }) => {
  if (!student) return null

  const stay = stayOf(student, location)
  const complaints = Number(student.activeComplaintCount)
  const gender = String(student.gender || "").trim()
  const bed = student.bedNumber != null && String(student.bedNumber).trim()
  const room = roomNumber != null && String(roomNumber).trim()
  const isDirectory = variant === "directory"

  const place = isDirectory
    ? stay
    : [room ? `Room ${room}` : null, bed ? `Bed ${bed}` : null].filter(Boolean).join(" · ")

  const facts = isDirectory
    ? [
        fact("Dept", student.department),
        fact("Degree", student.degree),
        gender
          ? {
              label: "Gender",
              value: gender,
              node: (
                <span className="student-peek__gender" data-gender={genderTone(gender)}>
                  {gender}
                </span>
              ),
            }
          : null,
        {
          label: "Complaints",
          value: Number.isFinite(complaints) ? String(complaints) : "0",
          node: (
            <span className="student-peek__complaints" data-on={complaints > 0 ? "true" : "false"}>
              {Number.isFinite(complaints) ? complaints : 0} active
            </span>
          ),
        },
      ].filter(Boolean)
    : [fact("Dept", student.department), fact("Degree", student.degree), fact("Batch", student.batch)].filter(Boolean)

  const contacts = [fact("Email", student.email), fact("Phone", student.phone)].filter(Boolean)
  const openable = typeof onOpen === "function"

  return (
    <div
      className="student-peek"
      data-variant={variant}
      data-open={openable ? "true" : undefined}
      role={openable ? "button" : undefined}
      tabIndex={openable ? 0 : undefined}
      onClick={openable ? () => onOpen(student) : undefined}
      onKeyDown={
        openable
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                onOpen(student)
              }
            }
          : undefined
      }
    >
      <header className="student-peek__head">
        <span className="student-peek__photo">
          <Avatar
            src={student.profileImage ? getMediaUrl(student.profileImage) : undefined}
            name={student.name}
            size="lg"
          />
        </span>
        <div className="student-peek__id">
          <span className="student-peek__name">{student.name || "Student"}</span>
          {student.rollNumber ? <span className="student-peek__roll">{student.rollNumber}</span> : null}
          {place ? <span className="student-peek__place">{place}</span> : null}
        </div>
      </header>
      {facts.length > 0 ? (
        <dl className="student-peek__facts">
          {facts.map((row) => (
            <div key={row.label} className="student-peek__row" data-wrap={row.wrap ? "true" : undefined}>
              <dt>{row.label}</dt>
              <dd title={row.value}>{row.node || row.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {contacts.length > 0 ? (
        <ul className="student-peek__contact">
          {contacts.map((row) => (
            <li key={row.label} title={row.value}>
              <span>{row.label}</span>
              {row.value}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export default StudentPeekPanel
