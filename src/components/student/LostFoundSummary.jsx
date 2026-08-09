import React from "react"
import { Link } from "react-router-dom"
import { PackageSearch, Search } from "lucide-react"
import { Card, Grid, HStack, Surface, Text } from "hzero"

const LostFoundSummary = ({ lostAndFoundStats }) => {
  return (
    <Card padding="p-4">
      <HStack gap="none" align="center" justify="between" style={{ marginBottom: 'var(--spacing-3)' }}>
        <h3 style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'center' }}>
          <Search size={14} style={{ marginRight: 'var(--spacing-1-5)' }} color="var(--color-primary)" /> Lost & Found
        </h3>
        <Link to="lost-and-found" className="no-underline hover:underline" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', transition: 'var(--transition-colors)' }}>
          View All
        </Link>
      </HStack>

      <Grid cols={2} gap="var(--gap-sm)">
        <Surface bg="var(--color-orange-bg)" padding="var(--spacing-2-5)" radius="lg" align="center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Surface bg="warning" padding="var(--spacing-1-5)" radius="full" style={{ marginBottom: 'var(--spacing-1)' }}>
            <PackageSearch size={20} style={{ color: 'var(--color-orange-text)' }} />
          </Surface>
          <Text as="span" size="2xl" weight="bold" color="var(--color-orange-text)">{lostAndFoundStats?.active || 0}</Text>
          <Text as="span" size="2xs" color="tertiary">Active Items</Text>
        </Surface>

        <Surface bg="success" padding="var(--spacing-2-5)" radius="lg" align="center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Surface bg="var(--color-success-light)" padding="var(--spacing-1-5)" radius="full" style={{ marginBottom: 'var(--spacing-1)' }}>
            <Search size={20} color="var(--color-success)" />
          </Surface>
          <Text as="span" size="2xl" weight="bold" color="success">{lostAndFoundStats?.claimed || 0}</Text>
          <Text as="span" size="2xs" color="tertiary">Claimed Items</Text>
        </Surface>
      </Grid>

      <div style={{ marginTop: 'var(--spacing-3)', paddingTop: 'var(--spacing-2)', borderTop: `var(--border-1) solid var(--color-border-light)` }}>
        {/* The fill/text swap on hover is two CSS rules, not two handlers
            reaching into style on every pointer crossing. */}
        <Link
          to="lost-and-found"
          className="block w-full text-center no-underline bg-[var(--color-primary-bg)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-[var(--color-on-accent)]"
          style={{ padding: 'var(--spacing-1-5)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', transition: 'var(--transition-all)' }}
        >
          Browse Active Items
        </Link>
      </div>
    </Card>
  )
}

export default LostFoundSummary
