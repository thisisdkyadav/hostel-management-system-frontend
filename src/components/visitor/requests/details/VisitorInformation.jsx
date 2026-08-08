import { Users } from "lucide-react"
import { DetailSection, HStack, Text, VStack } from "hzero"

const VisitorInformation = ({ visitors }) => (
  <DetailSection title="Visitors" icon={Users}>
    {visitors.map((visitor, index) => (
      <HStack key={index} gap="medium" align="start" justify="between" wrap>
        <VStack gap="none">
          <Text weight="medium" color="primary">{visitor.name}</Text>
          <Text size="sm" color="muted">{visitor.relation}</Text>
        </VStack>
        <VStack gap="none" align="end">
          <Text size="sm" color="muted">{visitor.phone}</Text>
          <Text size="sm" color="muted">{visitor.email}</Text>
        </VStack>
      </HStack>
    ))}
  </DetailSection>
)

export default VisitorInformation
