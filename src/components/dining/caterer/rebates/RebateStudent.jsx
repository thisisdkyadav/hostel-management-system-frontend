import { Avatar, Text } from "hzero"
import { getMediaUrl } from "@/utils/mediaUtils"
import { describeRoom } from "../catererHelpers"

/** Avatar, name and roll number (plus room when the payload carries one). */
const RebateStudent = ({ student }) => {
  const room = describeRoom(student)
  return (
    <div className="reb-student">
      <Avatar src={getMediaUrl(student?.profileImage)} name={student?.name || student?.rollNumber || "Student"} size="small" />
      <div className="reb-student-text">
        <Text as="div" color="heading" weight="medium" truncate>{student?.name || "Unknown student"}</Text>
        <div className="reb-student-sub">
          <Text size="xs" color="muted">{student?.rollNumber || "-"}</Text>
          {room && <Text size="xs" color="muted">{room}</Text>}
        </div>
      </div>
    </div>
  )
}

export default RebateStudent
