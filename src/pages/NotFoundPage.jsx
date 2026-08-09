import React from 'react'
import { Link } from 'react-router-dom'
import { FaHome, FaExclamationTriangle } from 'react-icons/fa'
import { Button, Heading, HStack, Surface, Text } from "hzero"

const NotFoundPage = () => {
  return (
    <Surface bg="secondary" padding={8} align="center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div
        style={{
          backgroundColor: 'var(--color-bg-primary)',
          borderRadius: 'var(--radius-2xl)',
          boxShadow: 'var(--shadow-lg)',
          padding: 'var(--spacing-12)',
          maxWidth: '500px',
          width: '100%'
        }}
      >
        <HStack gap="none" justify="center" style={{ marginBottom: 'var(--spacing-6)' }}>
          <Surface bg="warning" padding={6} radius="full">
            <FaExclamationTriangle
              style={{ fontSize: 'var(--font-size-5xl)' }} color="var(--color-warning)" />
          </Surface>
        </HStack>

        <Heading as="h1" size="6xl" weight="bold" color="secondary" style={{ marginBottom: 'var(--spacing-2)' }}>
          404
        </Heading>

        <Heading as="h2" size="2xl" weight="semibold" color="body" style={{ marginBottom: 'var(--spacing-4)' }}>
          Page Not Found
        </Heading>

        <Text color="muted" size="base" leading="var(--line-height-relaxed)" style={{ marginBottom: 'var(--spacing-8)' }}>
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </Text>

        <Link to="/">
          <Button variant="primary" size="lg">
            <FaHome /> Go to Homepage
          </Button>
        </Link>
      </div>
    </Surface>
  )
}

export default NotFoundPage
