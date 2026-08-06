import React from 'react'
import { Link } from 'react-router-dom'
import { FaHome, FaExclamationTriangle } from 'react-icons/fa'
import { Button } from 'czero/react'
import { HStack, Surface } from "@/components/ui"

const NotFoundPage = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 'var(--spacing-8)',
        backgroundColor: 'var(--color-bg-secondary)',
        textAlign: 'center'
      }}
    >
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
              style={{
                fontSize: 'var(--font-size-5xl)',
                color: 'var(--color-warning)'
              }}
            />
          </Surface>
        </HStack>

        <h1
          style={{
            fontSize: 'var(--font-size-6xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--spacing-2)'
          }}
        >
          404
        </h1>

        <h2
          style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-text-body)',
            marginBottom: 'var(--spacing-4)'
          }}
        >
          Page Not Found
        </h2>

        <p
          style={{
            color: 'var(--color-text-muted)',
            fontSize: 'var(--font-size-base)',
            marginBottom: 'var(--spacing-8)',
            lineHeight: 'var(--line-height-relaxed)'
          }}
        >
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <Link to="/">
          <Button variant="primary" size="lg">
            <FaHome /> Go to Homepage
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
