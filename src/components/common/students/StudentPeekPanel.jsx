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
const StudentPeekPanel = ({ student, roomNumber, variant = "room", location }) => {
  if (!student) return null

  const stay = stayOf(student, location)
  const complaints = Number(student.activeComplaintCount)
  const gender = String(student.gender || "").trim()
  const facts =
    variant === "directory"
      ? [
          fact("Email", student.email),
          fact("Stay", stay || "—", { wrap: true }),
          fact("Dept", student.department || "—"),
          fact("Degree", student.degree || "—"),
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
            : fact("Gender", "—"),
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
      : [
          fact("Room", roomNumber),
          fact("Bed", student.bedNumber),
          fact("Dept", student.department),
          fact("Degree", student.degree),
          fact("Batch", student.batch),
          fact("Email", student.email),
          fact("Phone", student.phone),
        ].filter(Boolean)

  return (
    <div className="student-peek">
      <header className="student-peek__head">
        <Avatar
          src={student.profileImage ? getMediaUrl(student.profileImage) : undefined}
          name={student.name}
          size="md"
        />
        <div className="student-peek__id">
          <span className="student-peek__name">{student.name || "Student"}</span>
          {student.rollNumber ? <span className="student-peek__roll">{student.rollNumber}</span> : null}
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
    </div>
  )
}

export default StudentPeekPanel
