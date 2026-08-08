import { CircleCheck, MessageSquare } from "lucide-react"
import { DetailSection, Text, VStack } from "hzero"

const VisitReason = ({ reason, approvalInformation, isApproved }) => (
  <VStack gap="medium">
    <DetailSection title="Reason for visit" icon={MessageSquare}>
      <Text color="body">{reason}</Text>
    </DetailSection>

    {isApproved && approvalInformation && (
      <DetailSection title="Approval information" icon={CircleCheck} tone="success">
        <Text color="body" style={{ whiteSpace: "pre-line" }}>{approvalInformation}</Text>
      </DetailSection>
    )}
  </VStack>
)

export default VisitReason
