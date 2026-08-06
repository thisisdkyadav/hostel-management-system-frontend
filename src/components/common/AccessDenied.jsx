import React from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "czero/react"
import { Heading, HStack, IconCircle, Surface, Text } from "@/components/ui"

const AccessDenied = ({ title = "Access Denied", message = "You do not have permission to access this page.", icon, suggestion, buttonText = "Return to Home", to = "/" }) => {
  const navigate = useNavigate()

  const handleNavigate = () => {
    navigate(to)
  }

  // Default icon if none provided
  const defaultIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" style={{ height: 'var(--icon-xl)', width: 'var(--icon-xl)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-10v4m6 6a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'var(--color-bg-secondary)', padding: '0 var(--spacing-4)' }}>
      <div style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-md)', padding: 'var(--spacing-6)', maxWidth: '28rem', width: '100%', border: 'var(--border-1) solid var(--color-danger-light)' }}>
        <IconCircle size="var(--spacing-14)" bg="var(--color-danger-bg-light)" color="danger" style={{ marginBottom: 'var(--spacing-6)', margin: '0 auto var(--spacing-6)' }}>{icon || defaultIcon}</IconCircle>
        <Heading as="h2" size="2xl" weight="bold" align="center" color="secondary" style={{ marginBottom: 'var(--spacing-2)' }}>{title}</Heading>
        <Text color="muted" align="center" style={{ marginBottom: 'var(--spacing-3)' }}>{message}</Text>

        {/* Render suggestion if available */}
        {suggestion && (
          <Surface bg="brand" padding={3} radius="lg" border="var(--border-1) solid var(--color-primary-light)" style={{ marginBottom: 'var(--spacing-6)' }}>
            <p style={{ color: 'var(--color-primary-dark)', fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" style={{ height: 'var(--icon-sm)', width: 'var(--icon-sm)', marginRight: 'var(--spacing-2)', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{suggestion}</span>
            </p>
          </Surface>
        )}

        {!suggestion && <div style={{ marginBottom: 'var(--spacing-3)' }}></div>}

        <HStack gap="none" justify="center">
          <Button onClick={handleNavigate} variant="primary" size="md">
            {buttonText}
          </Button>
        </HStack>
      </div>
    </div>
  )
}

export default AccessDenied
