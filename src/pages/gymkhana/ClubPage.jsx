import { useEffect, useMemo, useState } from "react"
import { Building2, Mail, ShieldCheck, Users } from "lucide-react"
import PageHeader from "../../components/common/PageHeader"
import { Card, CardBody, CardHeader, StatCards } from "@/components/ui"
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
                <h2
                  style={{
                    fontSize: "var(--font-size-xl)",
                    fontWeight: "var(--font-weight-semibold)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  Club Login
                </h2>
                <p
                  style={{
                    marginTop: "var(--spacing-1)",
                    fontSize: "var(--font-size-sm)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  This account is tied to the club record created by the admin. If you ever need to set or reset your password, use the Forgot Password option on the login page.
                </p>
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
              <div
                style={{
                  borderRadius: "var(--radius-lg)",
                  border: "var(--border-1) solid var(--color-border-primary)",
                  backgroundColor: "var(--color-bg-secondary)",
                  padding: "var(--spacing-4)",
                }}
              >
                <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>Club Name</div>
                <div style={{ marginTop: "var(--spacing-1)", color: "var(--color-text-secondary)", fontWeight: "var(--font-weight-semibold)" }}>
                  {club?.name || user?.name || "—"}
                </div>
              </div>

              <div
                style={{
                  borderRadius: "var(--radius-lg)",
                  border: "var(--border-1) solid var(--color-border-primary)",
                  backgroundColor: "var(--color-bg-secondary)",
                  padding: "var(--spacing-4)",
                }}
              >
                <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>GS Category</div>
                <div style={{ marginTop: "var(--spacing-1)", color: "var(--color-text-secondary)", fontWeight: "var(--font-weight-semibold)" }}>
                  {club?.gymkhanaCategoryLabel || "—"}
                </div>
              </div>

              <div
                style={{
                  borderRadius: "var(--radius-lg)",
                  border: "var(--border-1) solid var(--color-border-primary)",
                  backgroundColor: "var(--color-bg-secondary)",
                  padding: "var(--spacing-4)",
                }}
              >
                <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>Login Email</div>
                <div style={{ marginTop: "var(--spacing-1)", color: "var(--color-text-secondary)", fontWeight: "var(--font-weight-semibold)", wordBreak: "break-word" }}>
                  {club?.email || user?.email || "—"}
                </div>
              </div>

              <div
                style={{
                  borderRadius: "var(--radius-lg)",
                  border: "var(--border-1) solid var(--color-border-primary)",
                  backgroundColor: "var(--color-bg-secondary)",
                  padding: "var(--spacing-4)",
                }}
              >
                <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>Account Type</div>
                <div style={{ marginTop: "var(--spacing-1)", color: "var(--color-text-secondary)", fontWeight: "var(--font-weight-semibold)" }}>
                  Gymkhana / Club
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default ClubPage
