import { GraduationCap } from "lucide-react"
import { Avatar, DetailSection, HStack, Text, VStack } from "hzero"
import { getMediaUrl } from "../../../../utils/mediaUtils"

const StudentDetails = ({ studentName, studentEmail, studentProfileImage }) => (
  <DetailSection title="Student" icon={GraduationCap}>
    <HStack gap="medium" align="center">
      <Avatar
        size="large"
        name={studentName || ""}
        src={studentProfileImage ? getMediaUrl(studentProfileImage) : undefined}
        alt={studentName || "Student"}
      />
      <VStack gap="none">
        <Text weight="medium" color="primary">{studentName || "Not provided"}</Text>
        <Text size="sm" color="muted">{studentEmail || "Email not provided"}</Text>
      </VStack>
    </HStack>
  </DetailSection>
)

export default StudentDetails
