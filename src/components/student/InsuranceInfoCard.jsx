import React from "react"
import { MdHealthAndSafety } from "react-icons/md"
import { FaRegCalendarAlt, FaHashtag } from "react-icons/fa"
import { formatDateTime } from "../../utils/dateUtils"
import { Heading, HStack, Surface, VStack } from "@/components/ui"

const getValidity = (endDate) => {
  if (!endDate) return null

  const end = new Date(endDate)
  if (Number.isNaN(end.getTime())) return null

  return end.getTime() >= Date.now()
    ? { label: "Active", bg: "var(--color-success-bg)", color: "var(--color-success-text)" }
    : { label: "Expired", bg: "var(--color-danger-bg)", color: "var(--color-danger-text)" }
}

const InsuranceInfoCard = ({ insurance }) => {
  if (!insurance) return null

  const provider = insurance.provider
  const periodLabel =
    provider?.startDate && provider?.endDate ? `${formatDateTime(provider.startDate).date} - ${formatDateTime(provider.endDate).date}` : null
  const validity = getValidity(provider?.endDate)

  return (
    <div style={{ backgroundColor: 'var(--color-bg-primary)', boxShadow: 'var(--shadow-sm)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-xl)', width: '100%', border: `var(--border-1) solid var(--color-border-light)` }}>
      <HStack gap="var(--gap-sm)" align="center" justify="between">
        <HStack gap="var(--gap-sm)" align="center">
          <MdHealthAndSafety style={{ fontSize: 'var(--icon-lg)' }} color="var(--color-primary)" />
          <Heading as="h3" color="tertiary" weight="medium" size="lg">Insurance</Heading>
        </HStack>
        {validity && (
          <Surface as="span" bg={validity.bg} padding={`var(--spacing-0-5) var(--spacing-2)`} radius="full" color={validity.color} size="xs" style={{ whiteSpace: 'nowrap' }}>{validity.label}</Surface>
        )}
      </HStack>

      {provider?.name && (
        <p style={{ marginTop: 'var(--spacing-3)', fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{provider.name}</p>
      )}

      <VStack gap="var(--spacing-1-5)" style={{ marginTop: 'var(--spacing-2)' }}>
        {insurance.insuranceNumber && (
          <HStack align="center" gap="none" size="xs" color="tertiary">
            <FaHashtag style={{ marginRight: 'var(--spacing-1-5)', fontSize: 'var(--icon-sm)', flexShrink: 0 }} color="var(--color-text-muted)" />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{insurance.insuranceNumber}</span>
          </HStack>
        )}
        {periodLabel && (
          <HStack align="center" gap="none" size="xs" color="tertiary">
            <FaRegCalendarAlt style={{ marginRight: 'var(--spacing-1-5)', fontSize: 'var(--icon-sm)', flexShrink: 0 }} color="var(--color-text-muted)" />
            <span>{periodLabel}</span>
          </HStack>
        )}
      </VStack>
    </div>
  )
}

export default InsuranceInfoCard
