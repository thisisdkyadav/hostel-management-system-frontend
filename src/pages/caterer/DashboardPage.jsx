import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/layout"
import { EmptyState } from "@/components/ui/feedback"
import { useAuth } from "@/contexts/AuthProvider"
import { UtensilsCrossed } from "lucide-react"

const DashboardPage = () => {
  const { user } = useAuth()

  return (
    <div style={{ padding: "var(--spacing-6)" }}>
      <div style={{ marginBottom: "var(--spacing-6)" }}>
        <h1
          style={{
            fontSize: "var(--font-size-2xl)",
            fontWeight: "var(--font-weight-semibold)",
            color: "var(--color-text-heading)",
            marginBottom: "var(--spacing-2)",
          }}
        >
          Welcome, {user?.name || "Caterer"}
        </h1>
        <p style={{ color: "var(--color-text-secondary)" }}>
          Caterer dining operations will appear here.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dining Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={UtensilsCrossed}
            title="Caterer dashboard is ready"
            message="Student allocation lists and meal verification views will be connected in the next step."
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardPage
