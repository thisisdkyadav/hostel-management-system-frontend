import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { AlertTriangle, FileSignature, X } from "lucide-react"
import { undertakingApi } from "../../service"
import { Button, Heading, HStack, Surface, Text } from "hzero"

const UndertakingsBanner = () => {
  const [pendingCount, setPendingCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        setLoading(true)
        const response = await undertakingApi.pendingUndertakingsCount()
        console.log(response)

        setPendingCount(response.count || 0)
      } catch (error) {
        console.error("Error fetching pending undertakings count:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPendingCount()
  }, [])

  if (loading || pendingCount === 0 || dismissed) {
    return null
  }

  return (
    <Surface bg="var(--color-warning-bg-light)" padding={4} radius="lg" shadow="sm" style={{ borderLeft: `var(--border-4) solid var(--color-warning)`, marginBottom: 'var(--spacing-6)' }}>
      <HStack gap="none" align="center" justify="between">
        <HStack gap="none" align="center">
          <AlertTriangle size={24} style={{ marginRight: 'var(--spacing-3)' }} color="var(--color-warning)" />
          <div>
            <Heading as="h3" weight="medium" color="warning-text" size="lg">
              {pendingCount === 1 ? "You have 1 pending undertaking" : `You have ${pendingCount} pending undertakings`}
            </Heading>
            <Text size="sm" color="warning-text" style={{ opacity: 'var(--opacity-90)' }}>
              Please review and accept your pending undertakings.
            </Text>
          </div>
        </HStack>
        <HStack gap="none" align="center">
          <Link to="/student/undertakings" className="bg-[var(--color-warning)] hover:bg-[var(--color-warning-hover)]" style={{ color: 'var(--color-white)', padding: `var(--spacing-2) var(--spacing-4)`, borderRadius: 'var(--radius-lg)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginRight: 'var(--spacing-2)', display: 'flex', alignItems: 'center', textDecoration: 'none', transition: 'var(--transition-colors)', border: 'none', cursor: 'pointer' }}>
            <FileSignature size={14} style={{ marginRight: 'var(--spacing-2)' }} />
            View Undertakings
          </Link>
          <Button onClick={() => setDismissed(true)} variant="ghost" size="sm" aria-label="Dismiss">
            <X size="1em" />
          </Button>
        </HStack>
      </HStack>
    </Surface>
  )
}

export default UndertakingsBanner
