import React from "react"
import { FaTimes, FaUserCircle, FaDoorOpen, FaClock, FaCalendarAlt } from "react-icons/fa"
import { Button } from "czero/react"
import { Heading, HStack, Surface, Text, VStack } from "@/components/ui"

const EntryDetails = ({ entry, onClose }) => {
  if (!entry) return null

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'var(--modal-backdrop)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 'var(--z-modal)' }}>
      <div style={{ backgroundColor: 'var(--modal-bg)', borderRadius: 'var(--modal-radius)', boxShadow: 'var(--modal-shadow)', width: '100%', maxWidth: 'var(--container-md)', margin: '0 var(--spacing-4)', padding: 'var(--spacing-6)' }}>
        <HStack gap="none" align="center" justify="between" style={{ marginBottom: 'var(--spacing-4)' }}>
          <Heading as="h2" size="xl" weight="bold" color="var(--modal-title-color)">Entry Details</Heading>
          <Button onClick={onClose} variant="ghost" size="sm" aria-label="Close"><FaTimes /></Button>
        </HStack>

        <Surface bg="tertiary" padding={4} radius="lg" style={{ marginBottom: 'var(--spacing-4)' }}>
          <HStack gap="none" align="center" style={{ marginBottom: 'var(--spacing-4)' }}>
            <div style={{ backgroundColor: 'var(--button-primary-bg)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-full)', color: 'var(--color-white)', marginRight: 'var(--spacing-4)' }}>
              <FaUserCircle size={parseInt(getComputedStyle(document.documentElement).getPropertyValue('--icon-2xl'))} />
            </div>
            <div>
              <Heading as="h3" size="lg" weight="semibold" color="primary">{entry.name}</Heading>
              <Text color="muted" size="sm">{entry.id}</Text>
            </div>
          </HStack>

          <VStack gap={3}>
            <HStack gap="none" align="center">
              <FaDoorOpen style={{ color: 'var(--color-primary)', marginRight: 'var(--spacing-3)', width: 'var(--icon-lg)' }} />
              <div>
                <Text size="sm" color="muted">Room Number</Text>
                <Text weight="medium" color="primary">{entry.room}</Text>
              </div>
            </HStack>

            <HStack gap="none" align="center">
              <FaCalendarAlt style={{ color: 'var(--color-primary)', marginRight: 'var(--spacing-3)', width: 'var(--icon-lg)' }} />
              <div>
                <Text size="sm" color="muted">Date</Text>
                <Text weight="medium" color="primary">{entry.date}</Text>
              </div>
            </HStack>

            <HStack gap="none" align="center">
              <FaClock style={{ color: 'var(--color-primary)', marginRight: 'var(--spacing-3)', width: 'var(--icon-lg)' }} />
              <div>
                <Text size="sm" color="muted">Time</Text>
                <Text weight="medium" color="primary">{entry.time}</Text>
              </div>
            </HStack>

            <div style={{ paddingTop: 'var(--spacing-2)' }}>
              <Text size="sm" color="muted">Status</Text>
              <span style={{ marginTop: 'var(--spacing-1)', padding: 'var(--spacing-1) var(--spacing-3)', display: 'inline-flex', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', borderRadius: 'var(--radius-full)', backgroundColor: entry.status === "Checked In" ? 'var(--color-success-bg)' : 'var(--color-danger-bg)', color: entry.status === "Checked In" ? 'var(--color-success-text)' : 'var(--color-danger-text)' }}>{entry.status}</span>
            </div>
          </VStack>
        </Surface>

        <HStack gap="none" justify="end">
          <Button onClick={onClose} variant="secondary" size="md">
            Close
          </Button>
        </HStack>
      </div>
    </div>
  )
}

export default EntryDetails
