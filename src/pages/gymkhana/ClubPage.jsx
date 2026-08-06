import { useEffect, useMemo, useState } from "react"
import { Building2, Mail, ShieldCheck, Users } from "lucide-react"
import PageHeader from "../../components/common/PageHeader"
import { Card, CardBody, CardHeader, Heading, StatCards, Surface, Text } from "@/components/ui"
import { clubApi } from "../../service"
import { useAuth } from "../../contexts/AuthProvider"

const ClubPage = () => {
  const { user } = useAuth()
  const [club, setClub] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadClub = async () => {
      try {
        setLoading(true)
        setError("")
        const response = await clubApi.getMine()
        setClub(response?.club || null)
      } catch (err) {
        console.error("Failed to load club workspace:", err)
        setError(err?.message || "Failed to load club details.")
      } finally {
        setLoading(false)
      }
    }

    loadClub()
  }, [])

  const stats = useMemo(() => {
    const clubName = club?.name || user?.name || "Club"
    return [
      {
        title: "Club",
        value: clubName,
        subtitle: "Linked login account",
        icon: <Users />,
        color: "var(--color-primary)",
      },
      {
        title: "GS Category",
        value: club?.gymkhanaCategoryLabel || "—",
        subtitle: "Current mapped category",
        icon: <Building2 />,
        color: "var(--color-success)",
      },
      {
        title: "Login Email",
        value: club?.email || user?.email || "—",
        subtitle: "Use this for sign-in",
        icon: <Mail />,
        color: "var(--color-info)",
      },
    ]
  }, [club, user])

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title={club?.name || "Club Workspace"}
        subtitle="Your club account is active. Additional club tools can be added here as the workflow grows."
      />

      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
        <div style={{ marginBottom: "var(--spacing-6)" }}>
          <StatCards stats={stats} columns={3} loading={loading} loadingCount={3} />
        </div>

        <Card>
          <CardHeader className="mb-0">
            <div className="flex items-center gap-3">
              <div
                style={{
                  width: "2.75rem",
                  height: "2.75rem",
                  borderRadius: "var(--radius-xl)",
                  backgroundColor: "var(--color-primary-bg)",
                  color: "var(--color-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShieldCheck size={18} />
              </div>
              <div>
                <Heading as="h2" size="xl" weight="semibold" color="secondary">
                  Club Login
                </Heading>
                <Text size="sm" color="muted" style={{ marginTop: "var(--spacing-1)" }}>
                  This account is tied to the club record created by the admin. If you ever need to set or reset your password, use the Forgot Password option on the login page.
                </Text>
              </div>
            </div>
          </CardHeader>

          <CardBody style={{ display: "grid", gap: "var(--spacing-4)" }}>
            {error ? (
              <div
                style={{
                  borderRadius: "var(--radius-lg)",
                  border: "var(--border-1) solid var(--color-danger)",
                  backgroundColor: "var(--color-danger-bg)",
                  color: "var(--color-danger-text)",
                  padding: "var(--spacing-4)",
                }}
              >
                {error}
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Surface bg="secondary" padding={4} radius="lg" border="var(--border-1) solid var(--color-border-primary)">
                <Text as="div" size="sm" color="muted">Club Name</Text>
                <Text as="div" color="secondary" weight="semibold" style={{ marginTop: "var(--spacing-1)" }}>
                  {club?.name || user?.name || "—"}
                </Text>
              </Surface>

              <Surface bg="secondary" padding={4} radius="lg" border="var(--border-1) solid var(--color-border-primary)">
                <Text as="div" size="sm" color="muted">GS Category</Text>
                <Text as="div" color="secondary" weight="semibold" style={{ marginTop: "var(--spacing-1)" }}>
                  {club?.gymkhanaCategoryLabel || "—"}
                </Text>
              </Surface>

              <Surface bg="secondary" padding={4} radius="lg" border="var(--border-1) solid var(--color-border-primary)">
                <Text as="div" size="sm" color="muted">Login Email</Text>
                <Text as="div" color="secondary" weight="semibold" style={{ marginTop: "var(--spacing-1)", wordBreak: "break-word" }}>
                  {club?.email || user?.email || "—"}
                </Text>
              </Surface>

              <Surface bg="secondary" padding={4} radius="lg" border="var(--border-1) solid var(--color-border-primary)">
                <Text as="div" size="sm" color="muted">Account Type</Text>
                <Text as="div" color="secondary" weight="semibold" style={{ marginTop: "var(--spacing-1)" }}>
                  Gymkhana / Club
                </Text>
              </Surface>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default ClubPage
