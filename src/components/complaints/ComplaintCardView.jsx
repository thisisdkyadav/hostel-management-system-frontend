import { FaBuilding } from "react-icons/fa"
import { BiSolidCategory } from "react-icons/bi"
import { getStatusColor, getTimeSince } from "../../utils/adminUtils"
import { getMediaUrl } from "../../utils/mediaUtils"
import { Card, Heading, HStack, IconCircle, Surface, Text, VStack } from "@/components/ui"

const ComplaintCardView = ({ complaints, onViewDetails }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 'var(--spacing-4)' }} >
      {complaints.map((complaint) => (
        <Card key={complaint.id} className="cursor-pointer" onClick={() => onViewDetails(complaint)}
        >
          <Card.Header style={{ marginBottom: 0 }}>
            <HStack gap="none" align="start" justify="between">
              <VStack gap="none">
                <Text as="span" size="xs" color="muted">{complaint.id?.substring(0, 8)}</Text>
                <Heading as="h3" weight="bold" size="xl" color="secondary" style={{ marginTop: 'var(--spacing-1)' }} className="line-clamp-1">{complaint.title}</Heading>
              </VStack>
              <Text as="span" size="var(--badge-font-sm)" weight="medium" style={{ padding: 'var(--badge-padding-sm)', borderRadius: 'var(--radius-full)' }} className={`${getStatusColor(complaint.status)}`}>{complaint.status}</Text>
            </HStack>
          </Card.Header>

          <Card.Body>
            <HStack gap="none" align="center" style={{ marginTop: 'var(--spacing-3)' }}>
              <FaBuilding style={{ opacity: 'var(--opacity-70)', fontSize: 'var(--font-size-sm)', marginRight: 'var(--spacing-2)', flexShrink: 0 }} color="var(--color-primary)" />
              <Text as="span" size="sm" color="body" className="truncate max-w-[150px]">
                {complaint.hostel}, Room {complaint.roomNumber}
              </Text>
            </HStack>

            <div style={{ marginTop: 'var(--spacing-4)' }}>
              <Surface bg="tertiary" padding={3} radius="lg" color="body" size="sm" className="line-clamp-3">{complaint.description}</Surface>
            </div>

            <HStack gap="none" align="center" justify="between" style={{ marginTop: 'var(--spacing-4)' }}>
              <HStack gap="none" align="center">
                <BiSolidCategory style={{ opacity: 'var(--opacity-70)', marginRight: 'var(--spacing-2)', flexShrink: 0 }} color="var(--color-primary)" />
                <Text as="span" size="sm" color="body">{complaint.category}</Text>
              </HStack>
              <Text as="span" size="xs" color="muted">{getTimeSince(complaint.createdDate)}</Text>
            </HStack>
          </Card.Body>

          <Card.Footer style={{ marginTop: 'var(--spacing-4)', paddingTop: 'var(--spacing-4)', borderTop: `var(--border-1) solid var(--color-border-light)`, display: 'flex', alignItems: 'center' }}>
            <HStack gap="none" align="center">
              {complaint.reportedBy?.profileImage ? (
                <img src={getMediaUrl(complaint.reportedBy.profileImage)} alt={complaint.reportedBy.name} style={{ height: 'var(--avatar-sm)', width: 'var(--avatar-sm)', borderRadius: 'var(--radius-full)', objectFit: 'cover', marginRight: 'var(--spacing-2)' }} />
              ) : (
                <IconCircle size="var(--avatar-sm)" bg="brand" color="brand" style={{ fontWeight: 'var(--font-weight-medium)', marginRight: 'var(--spacing-2)' }}>{complaint.reportedBy?.name?.charAt(0) || "U"}</IconCircle>
              )}
              <div>
                <Text as="div" size="xs" weight="medium" className="line-clamp-1">{complaint.reportedBy?.name}</Text>
                <Text as="div" size="xs" color="muted">Reporter</Text>
              </div>
            </HStack>
          </Card.Footer>
        </Card>
      ))}
    </div>
  )
}

export default ComplaintCardView
