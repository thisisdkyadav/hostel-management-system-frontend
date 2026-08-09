import React from "react"
import { HiCheckCircle } from "react-icons/hi"
import { Button, Heading, HStack, IconCircle, Modal, Surface, Text } from "hzero"

const CommonSuccessModal = ({ show, onClose, title = "Success", message = "Operation completed successfully.", buttonText = "Done", infoText = "", infoIcon = null, width = 500 }) => {
  if (!show) return null

  const InfoIcon = infoIcon

  return (
    <Modal title={title} onClose={onClose} width={width}>
      <Surface padding="var(--spacing-4) 0" align="center">
        <IconCircle size="var(--spacing-16)" bg="var(--color-success-bg-light)" color="success" style={{ margin: '0 auto', marginBottom: 'var(--spacing-6)' }}>
          <HiCheckCircle size={40} />
        </IconCircle>

        <Heading as="h3" size="xl" weight="bold" color="secondary" style={{ marginBottom: 'var(--spacing-3)' }}>{title}</Heading>

        {infoText && (
          <div style={{ backgroundColor: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-4)', marginBottom: 'var(--spacing-6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--spacing-6)', maxWidth: '28rem' }}>
            {InfoIcon && <InfoIcon style={{ color: 'var(--color-text-disabled)', marginRight: 'var(--spacing-2)', flexShrink: 0 }} size={20} />}
            <Text as="span" color="secondary" weight="medium" style={{ wordBreak: 'break-all' }}>{infoText}</Text>
          </div>
        )}

        <Text color="muted" style={{ marginBottom: 'var(--spacing-8)', maxWidth: '28rem', margin: '0 auto var(--spacing-8)' }}>{message}</Text>

        <HStack gap="none" justify="center">
          <Button onClick={onClose} variant="primary" size="md">
            {buttonText}
          </Button>
        </HStack>
      </Surface>
    </Modal>
  )
}

export default CommonSuccessModal
