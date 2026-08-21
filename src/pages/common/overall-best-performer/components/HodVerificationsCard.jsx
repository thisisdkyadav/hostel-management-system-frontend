import { Badge, Grid, HStack, Text } from "hzero"
import { PorDetailCard } from "./PorDetailCard"
import { MessageSquare } from "lucide-react"

export const formatHodVerificationActionLabel = (action = "") =>
  action === "verified" ? "Verified" : "Commented"

export const HodVerificationsCard = ({ verifications = [] }) => {
  const entries = Array.isArray(verifications) ? verifications : []

  return (
    <PorDetailCard
      icon={MessageSquare}
      title="HOD Verifications"
      accentColor="var(--color-info)"
    >
      {entries.length > 0 ? (
        <Grid cols={1} gap={3}>
          {entries.map((entry, index) => (
            <Grid cols={1} gap={2} style={{ padding: "var(--spacing-3)", border: "1px solid var(--color-border-primary)", borderRadius: "var(--radius-lg)", backgroundColor: "var(--color-bg-secondary)" }} key={entry?.id || `${entry?.verifiedBy || "hod"}-${entry?.verifiedAt || index}`}>
              <HStack gap={3} align="center" justify="between" wrap>
                <Grid cols={1} gap="2px" style={{ minWidth: 0 }}>
                  <Text as="div" size="sm" weight="semibold" color="primary">
                    {entry?.verifierName || "HOD"}
                  </Text>
                  <Text as="div" size="xs" color="muted">
                    {entry?.verifierEmail || "Email not available"}
                  </Text>
                </Grid>
                <Badge variant={entry?.action === "verified" ? "success" : "info"}>
                  {formatHodVerificationActionLabel(entry?.action)}
                </Badge>
              </HStack>
              <Text as="div" size="sm" color="body" leading={1.7}>
                {entry?.remarks || "No remarks provided."}
              </Text>
              <Text as="div" size="xs" color="muted">
                {entry?.verifiedAt ? new Date(entry.verifiedAt).toLocaleString() : "Timestamp unavailable"}
              </Text>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Text as="div" size="sm" color="muted" leading={1.7}>
          No HOD verification or comments have been recorded yet.
        </Text>
      )}
    </PorDetailCard>
  )
}

