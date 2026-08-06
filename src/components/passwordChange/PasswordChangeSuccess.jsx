import React from "react"
import { Heading, HStack, IconCircle, Modal, Text } from "@/components/ui"
import { Button } from "czero/react"
import { FaCheck } from "react-icons/fa"

const PasswordChangeSuccess = ({ email, onClose }) => {
  return (
    <Modal title="Password Updated" onClose={onClose} width={500}>
      <div style={{ textAlign: 'center', paddingTop: 'var(--spacing-4)', paddingBottom: 'var(--spacing-4)' }}>
        <IconCircle size="var(--avatar-xl)" bg="success" color="success" style={{ margin: '0 auto', marginBottom: 'var(--spacing-6)' }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{ height: 'var(--icon-2xl)', width: 'var(--icon-2xl)' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </IconCircle>

        <Heading as="h3" size="xl" weight="bold" color="primary" style={{ marginBottom: 'var(--spacing-2)' }}>
          Password Changed Successfully
        </Heading>

        <div style={{ backgroundColor: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-4)', marginBottom: 'var(--spacing-6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', maxWidth: 'var(--container-md)' }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{
              height: 'var(--icon-lg)',
              width: 'var(--icon-lg)',
              color: 'var(--color-text-placeholder)',
              marginRight: 'var(--spacing-2)',
              flexShrink: 0
            }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <Text as="span" color="primary" weight="medium" style={{ wordBreak: 'break-all' }}>
            {email}
          </Text>
        </div>

        <Text color="body" style={{ marginBottom: 'var(--spacing-8)', maxWidth: 'var(--container-md)', margin: '0 auto var(--spacing-8) auto' }}>
          Your password has been successfully updated. You will use this new password the next time you log in.
        </Text>

        <HStack gap="none" justify="center">
          <Button onClick={onClose} variant="primary" size="md">
            <FaCheck /> Done
          </Button>
        </HStack>
      </div>
    </Modal>
  )
}

export default PasswordChangeSuccess
