import React from "react"
import { Link } from "react-router-dom"
import { FiSearch } from "react-icons/fi"
import { CgSearchFound } from "react-icons/cg"
import { HStack, Surface, Text } from "@/components/ui"

const LostFoundSummary = ({ lostAndFoundStats }) => {
  return (
    <Surface bg="primary" padding={4} radius="xl" shadow="sm" border="var(--border-1) solid var(--color-border-light)">
      <HStack gap="none" align="center" justify="between" style={{ marginBottom: 'var(--spacing-3)' }}>
        <h3 style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'center' }}>
          <FiSearch style={{ marginRight: 'var(--spacing-1-5)', color: 'var(--color-primary)', fontSize: 'var(--icon-sm)' }} /> Lost & Found
        </h3>
        <Link to="lost-and-found" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', textDecoration: 'none', transition: 'var(--transition-colors)' }} onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}>
          View All
        </Link>
      </HStack>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--gap-sm)' }}>
        <div style={{ backgroundColor: 'var(--color-orange-bg)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-2-5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <Surface bg="warning" padding="var(--spacing-1-5)" radius="full" style={{ marginBottom: 'var(--spacing-1)' }}>
            <CgSearchFound style={{ color: 'var(--color-orange-text)', fontSize: 'var(--icon-lg)' }} />
          </Surface>
          <Text as="span" size="2xl" weight="bold" color="var(--color-orange-text)">{lostAndFoundStats?.active || 0}</Text>
          <Text as="span" size="2xs" color="tertiary">Active Items</Text>
        </div>

        <div style={{ backgroundColor: 'var(--color-success-bg)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-2-5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <Surface bg="var(--color-success-light)" padding="var(--spacing-1-5)" radius="full" style={{ marginBottom: 'var(--spacing-1)' }}>
            <FiSearch style={{ color: 'var(--color-success)', fontSize: 'var(--icon-lg)' }} />
          </Surface>
          <Text as="span" size="2xl" weight="bold" color="success">{lostAndFoundStats?.claimed || 0}</Text>
          <Text as="span" size="2xs" color="tertiary">Claimed Items</Text>
        </div>
      </div>

      <div style={{ marginTop: 'var(--spacing-3)', paddingTop: 'var(--spacing-2)', borderTop: `var(--border-1) solid var(--color-border-light)` }}>
        <Link to="lost-and-found" style={{ display: 'block', width: '100%', textAlign: 'center', padding: 'var(--spacing-1-5)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', transition: 'var(--transition-all)', backgroundColor: 'var(--color-primary-bg)', color: 'var(--color-primary)', textDecoration: 'none' }} onMouseEnter={(e) => { 
          e.currentTarget.style.backgroundColor = 'var(--color-primary)'; 
          e.currentTarget.style.color = 'var(--color-white)' 
        }} onMouseLeave={(e) => { 
          e.currentTarget.style.backgroundColor = 'var(--color-primary-bg)'; 
          e.currentTarget.style.color = 'var(--color-primary)' 
        }}>
          Browse Active Items
        </Link>
      </div>
    </Surface>
  )
}

export default LostFoundSummary
