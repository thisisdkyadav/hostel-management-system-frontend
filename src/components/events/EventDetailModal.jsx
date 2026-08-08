import { CalendarClock, FileText, Users } from "lucide-react"
import { Badge, DetailSection, Heading, HStack, InfoRow, Modal, Text, VStack } from "hzero"
import { formatDateTime, isUpcoming } from "../../utils/dateUtils"

const EventDetailModal = ({ selectedEvent, setShowDetailModal }) => {
  if (!selectedEvent) return null

  const isEventUpcoming = isUpcoming(selectedEvent.dateAndTime)
  const { date, time } = formatDateTime(selectedEvent.dateAndTime)

  return (
    <Modal title="Event details" onClose={() => setShowDetailModal(false)} width={700}>
      <VStack gap="large">
        <HStack gap={3} align="start" justify="between">
          <Heading as="h2" size="xl" weight="bold" color="heading">
            {selectedEvent.eventName}
          </Heading>
          <Badge variant={isEventUpcoming ? "success" : "purple"} size="medium">
            {isEventUpcoming ? "Upcoming" : "Past"}
          </Badge>
        </HStack>

        <DetailSection title="When and where" icon={CalendarClock} columns={2}>
          <InfoRow label="Date" value={date} />
          <InfoRow label="Time" value={time} />
          {selectedEvent.venue && <InfoRow label="Venue" value={selectedEvent.venue} />}
          <InfoRow label="Hostel" value={selectedEvent.hostel?.name || "All hostels"} />
          {selectedEvent.gender && (
            <InfoRow label="Open to" value={`${selectedEvent.gender.charAt(0).toUpperCase() + selectedEvent.gender.slice(1)} only`} />
          )}
        </DetailSection>

        <DetailSection title="Description" icon={FileText}>
          <Text as="p" leading="var(--line-height-relaxed)">
            {selectedEvent.description}
          </Text>
        </DetailSection>

        {selectedEvent.organizer && (
          <DetailSection title="Organizer" icon={Users}>
            <Text as="p">{selectedEvent.organizer}</Text>
          </DetailSection>
        )}
      </VStack>
    </Modal>
  )
}

export default EventDetailModal
