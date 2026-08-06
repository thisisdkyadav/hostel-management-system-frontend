import React from "react"
import { Grid, Heading, HStack, Modal, Surface, Text, VStack } from "@/components/ui"
import { Button } from "czero/react"
import { FaRegClock, FaUserAlt, FaBuilding, FaGraduationCap, FaVenusMars } from "react-icons/fa"
import { format } from "date-fns"

const ViewNotificationModal = ({ isOpen, onClose, notification }) => {
  if (!notification) return null

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMMM dd, yyyy")
    } catch (error) {
      return "Invalid date"
    }
  }

  const isExpired = new Date(notification.expiryDate) < new Date()

  return (
    <Modal title="Notification Details" onClose={onClose} width={700} isOpen={isOpen}>
      <VStack gap={5}>
        <header style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginBottom: 'var(--spacing-4)' }}>
          <Heading as="h2" size="xl" weight="semibold" color="secondary" style={{ marginBottom: 'var(--spacing-2)' }}>{notification.title}</Heading>
          <div>{isExpired ? <Surface as="span" bg="danger" padding="var(--badge-padding-sm)" radius="full" color="danger-text" size="var(--badge-font-xs)" weight="medium" style={{ display: 'inline-flex', alignItems: 'center' }}>Expired</Surface> : <Surface as="span" bg="success" padding="var(--badge-padding-sm)" radius="full" color="success-text" size="var(--badge-font-xs)" weight="medium" style={{ display: 'inline-flex', alignItems: 'center' }}>Active</Surface>}</div>
        </header>

        <Surface bg="tertiary" padding={4} radius="xl">
          <Text color="body" style={{ whiteSpace: 'pre-line' }}>{notification.message}</Text>
        </Surface>

        <Grid min={250} gap={4}>
          <HStack gap="none" align="start">
            <Text as="div" color="success" style={{ marginRight: 'var(--spacing-3)', marginTop: 'var(--spacing-0-5)' }}>
              <FaRegClock />
            </Text>
            <div>
              <Heading as="h4" size="sm" weight="medium" color="body">Created</Heading>
              <Text color="muted">{formatDate(notification.createdAt)}</Text>
            </div>
          </HStack>

          <HStack gap="none" align="start">
            <Text as="div" color="warning" style={{ marginRight: 'var(--spacing-3)', marginTop: 'var(--spacing-0-5)' }}>
              <FaRegClock />
            </Text>
            <div>
              <Heading as="h4" size="sm" weight="medium" color="body">Expires</Heading>
              <Text color="muted">{formatDate(notification.expiryDate)}</Text>
            </div>
          </HStack>
        </Grid>

        <div style={{ borderTop: `var(--border-1) solid var(--color-border-light)`, paddingTop: 'var(--spacing-4)' }}>
          <Heading as="h3" size="sm" weight="medium" color="body" style={{ marginBottom: 'var(--spacing-3)' }}>Target Audience</Heading>
          <VStack gap={3}>
            {notification.hostelId && notification.hostelId.length > 0 ? (
              <div style={{ display: 'flex', alignItems: 'flex-start', backgroundColor: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-3)' }}>
                <FaBuilding style={{ color: 'var(--color-info)', marginRight: 'var(--spacing-3)', marginTop: 'var(--spacing-1)', flexShrink: 0 }} />
                <div>
                  <Text as="span" size="sm" weight="medium">Hostels:</Text>
                  <Text as="span" size="sm" style={{ marginLeft: 'var(--spacing-1)' }}>{notification.hostelId.map((h) => h.name).join(", ")}</Text>
                </div>
              </div>
            ) : null}

            {notification.department && notification.department.length > 0 ? (
              <div style={{ display: 'flex', alignItems: 'flex-start', backgroundColor: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-3)' }}>
                <FaGraduationCap style={{ color: 'var(--color-purple-text)', marginRight: 'var(--spacing-3)', marginTop: 'var(--spacing-1)', flexShrink: 0 }} />
                <div>
                  <Text as="span" size="sm" weight="medium">Departments:</Text>
                  <Text as="span" size="sm" style={{ marginLeft: 'var(--spacing-1)' }}>{notification.department.join(", ")}</Text>
                </div>
              </div>
            ) : null}

            {notification.degree && notification.degree.length > 0 ? (
              <div style={{ display: 'flex', alignItems: 'flex-start', backgroundColor: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-3)' }}>
                <FaUserAlt style={{ color: 'var(--color-purple-text)', marginRight: 'var(--spacing-3)', marginTop: 'var(--spacing-1)', flexShrink: 0 }} />
                <div>
                  <Text as="span" size="sm" weight="medium">Degrees:</Text>
                  <Text as="span" size="sm" style={{ marginLeft: 'var(--spacing-1)' }}>{notification.degree.join(", ")}</Text>
                </div>
              </div>
            ) : null}

            {notification.gender ? (
              <div style={{ display: 'flex', alignItems: 'flex-start', backgroundColor: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-3)' }}>
                <FaVenusMars style={{ color: 'var(--color-girls-text)', marginRight: 'var(--spacing-3)', marginTop: 'var(--spacing-1)', flexShrink: 0 }} />
                <div>
                  <Text as="span" size="sm" weight="medium">Gender:</Text>
                  <Text as="span" size="sm" style={{ marginLeft: 'var(--spacing-1)' }}>{notification.gender}</Text>
                </div>
              </div>
            ) : null}

            {!notification.hostelId?.length && !notification.department?.length && !notification.degree?.length && !notification.gender && (
              <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-3)' }}>
                <FaUserAlt style={{ color: 'var(--color-text-muted)', marginRight: 'var(--spacing-2)' }} />
                <Text as="span" size="sm">All Students</Text>
              </div>
            )}
          </VStack>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--spacing-4)', borderTop: `var(--border-1) solid var(--color-border-light)` }}>
          <Button onClick={onClose} variant="secondary" size="md">
            Close
          </Button>
        </div>
      </VStack>
    </Modal>
  )
}

export default ViewNotificationModal
