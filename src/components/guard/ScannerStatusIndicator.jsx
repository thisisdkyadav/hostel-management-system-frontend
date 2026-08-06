import React from "react"
import { FaKeyboard, FaArrowDown, FaArrowRight, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa"
import { useQRScanner } from "../../contexts/QRScannerProvider"
import { Heading, HStack, Surface, Text } from "@/components/ui"

const ScannerStatusIndicator = () => {
  const { pendingCrossHostelEntries, error } = useQRScanner()

  return (
    <Surface bg="primary" padding={4} radius="lg" shadow="sm" border="var(--border-1) solid var(--color-border-primary)">
      <HStack gap="none" align="center" justify="between" style={{ marginBottom: 'var(--spacing-3)' }}>
        <Heading as="h3" size="sm" weight="medium" color="body">External Scanner Status</Heading>
        <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-success)' }}>
          <div style={{ width: 'var(--spacing-2)', height: 'var(--spacing-2)', backgroundColor: 'var(--color-success)', borderRadius: 'var(--radius-full)', marginRight: 'var(--spacing-2)', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
          <Text as="span" size="xs">Active</Text>
        </div>
      </HStack>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
        <HStack gap="none" align="center" justify="between">
          <HStack gap="none" align="center">
            <FaKeyboard style={{ marginRight: 'var(--spacing-2)', color: 'var(--color-info)' }} />
            <span>Check-in Scanner</span>
          </HStack>
          <HStack gap="none" align="center">
            <FaArrowDown style={{ color: 'var(--color-success)' }} />
            <span style={{ marginLeft: 'var(--spacing-1)' }}>Down Arrow</span>
          </HStack>
        </HStack>

        <HStack gap="none" align="center" justify="between">
          <HStack gap="none" align="center">
            <FaKeyboard style={{ marginRight: 'var(--spacing-2)', color: 'var(--color-info)' }} />
            <span>Check-out Scanner</span>
          </HStack>
          <HStack gap="none" align="center">
            <FaArrowRight style={{ color: 'var(--color-warning)', transform: 'rotate(90deg)' }} />
            <span style={{ marginLeft: 'var(--spacing-1)' }}>Tab Key</span>
          </HStack>
        </HStack>
      </div>

      {pendingCrossHostelEntries.length > 0 && (
        <div style={{ marginTop: 'var(--spacing-3)', paddingTop: 'var(--spacing-3)', borderTop: `var(--border-1) solid var(--color-border-primary)` }}>
          <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-warning)' }}>
            <FaExclamationTriangle style={{ marginRight: 'var(--spacing-2)' }} />
            <Text as="span" size="xs">
              {pendingCrossHostelEntries.length} cross-hostel check-in {pendingCrossHostelEntries.length === 1 ? "entry" : "entries"} pending reason
            </Text>
          </div>
        </div>
      )}

      {error && (
        <div style={{ marginTop: 'var(--spacing-3)', paddingTop: 'var(--spacing-3)', borderTop: `var(--border-1) solid var(--color-border-primary)` }}>
          <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-danger)' }}>
            <FaExclamationTriangle style={{ marginRight: 'var(--spacing-2)' }} />
            <Text as="span" size="xs">Scanner Error</Text>
          </div>
        </div>
      )}
    </Surface>
  )
}

export default ScannerStatusIndicator
