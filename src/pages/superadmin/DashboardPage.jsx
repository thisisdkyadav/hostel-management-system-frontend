import { useState, useEffect } from "react"
import { FaUserCog, FaKey } from "react-icons/fa"
import { superAdminApi } from "../../service"
import { Link } from "react-router-dom"
import { Heading, Spinner, Surface, Text } from "@/components/ui"

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalAdmins: 0,
    totalApiKeys: 0,
    activeApiKeys: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await superAdminApi.getDashboardStats()
      setStats({
        totalAdmins: data.totalAdmins || 0,
        totalApiKeys: data.totalApiKeys || 0,
        activeApiKeys: data.activeApiKeys || 0,
      })
    } catch (err) {
      console.error("Error fetching dashboard stats:", err)
      setError(err.message || "Failed to load dashboard statistics")
      alert(err.message || "Failed to load dashboard statistics")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  return (
    <div style={{ padding: 'var(--spacing-6) var(--spacing-4)', flex: 1 }}>
      <header className="mb-8">
        <Heading as="h1" size="2xl" weight="bold" color="primary">Super Admin Dashboard</Heading>
        <Text color="muted" style={{ marginTop: 'var(--spacing-1)' }}>Welcome to the system admin control panel</Text>
      </header>

      {error && (
        <Surface bg="danger" padding={4} style={{ borderLeft: '4px solid var(--color-danger)', marginBottom: 'var(--spacing-6)' }}>
          <div className="flex">
            <div style={{ marginLeft: 'var(--spacing-3)' }}>
              <Text size="sm" color="danger-text">{error}</Text>
            </div>
          </div>
        </Surface>
      )}

      {loading ? (
        <Surface padding="var(--spacing-10) 0" align="center">
          <Spinner size="2rem" thickness="thin" style={{ display: 'inline-block', marginBottom: 'var(--spacing-4)' }} />
          <Text color="muted">Loading dashboard statistics...</Text>
        </Surface>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: 'var(--spacing-6)' }}>
          <div style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-md)', overflow: 'hidden', transition: 'var(--transition-shadow)' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-lg)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}>
            <Surface padding="var(--spacing-5) var(--spacing-6)" className="flex items-center">
              <Surface bg="brand" padding={3} radius="full">
                <FaUserCog style={{ height: '1.5rem', width: '1.5rem' }} color="var(--color-primary)" />
              </Surface>
              <div style={{ marginLeft: 'var(--spacing-4)' }}>
                <Text size="sm" weight="medium" color="muted">Total Admins</Text>
                <Text size="xl" weight="semibold" color="primary">{stats.totalAdmins}</Text>
              </div>
            </Surface>
            <Surface bg="secondary" padding="var(--spacing-2) var(--spacing-6)">
              <Link to="/super-admin/admins" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', fontWeight: 'var(--font-weight-medium)' }}>
                Manage admins →
              </Link>
            </Surface>
          </div>

          <div style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-md)', overflow: 'hidden', transition: 'var(--transition-shadow)' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-lg)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}>
            <Surface padding="var(--spacing-5) var(--spacing-6)" className="flex items-center">
              <Surface bg="var(--color-coed-bg)" padding={3} radius="full">
                <FaKey style={{ height: '1.5rem', width: '1.5rem' }} color="var(--color-coed-text)" />
              </Surface>
              <div style={{ marginLeft: 'var(--spacing-4)' }}>
                <Text size="sm" weight="medium" color="muted">Total API Keys</Text>
                <Text size="xl" weight="semibold" color="primary">{stats.totalApiKeys}</Text>
              </div>
            </Surface>
            <Surface bg="secondary" padding="var(--spacing-2) var(--spacing-6)">
              <Link to="/super-admin/api-keys" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-coed-text)', fontWeight: 'var(--font-weight-medium)' }}>
                Manage API keys →
              </Link>
            </Surface>
          </div>

          <div style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-md)', overflow: 'hidden', transition: 'var(--transition-shadow)' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-lg)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}>
            <Surface padding="var(--spacing-5) var(--spacing-6)" className="flex items-center">
              <Surface bg="success" padding={3} radius="full">
                <FaKey style={{ height: '1.5rem', width: '1.5rem' }} color="var(--color-success)" />
              </Surface>
              <div style={{ marginLeft: 'var(--spacing-4)' }}>
                <Text size="sm" weight="medium" color="muted">Active API Keys</Text>
                <Text size="xl" weight="semibold" color="primary">{stats.activeApiKeys}</Text>
              </div>
            </Surface>
            <Surface bg="secondary" padding="var(--spacing-2) var(--spacing-6)">
              <Link to="/super-admin/api-keys" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-success)', fontWeight: 'var(--font-weight-medium)' }}>
                View active keys →
              </Link>
            </Surface>
          </div>
        </div>
      )}

      <Surface bg="primary" padding={6} radius="xl" shadow="md" style={{ marginTop: 'var(--spacing-10)' }}>
        <Heading as="h2" size="xl" weight="semibold" color="primary" style={{ marginBottom: 'var(--spacing-4)' }}>System Overview</Heading>
        <Text color="muted">Welcome to the Super Admin portal. From here, you can manage system administrators and API keys. This dashboard provides a high-level overview of your system configuration.</Text>
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ marginTop: 'var(--spacing-4)', gap: 'var(--spacing-4)' }}>
          <Surface padding={4} radius="lg" border="1px solid var(--color-border-primary)">
            <Heading as="h3" weight="medium" color="primary" style={{ marginBottom: 'var(--spacing-2)' }}>Admin Management</Heading>
            <Text color="muted" size="sm">Create, view, update, and delete system administrators. Each admin has access to the admin portal to manage hostels, wardens, and other system resources.</Text>
          </Surface>
          <Surface padding={4} radius="lg" border="1px solid var(--color-border-primary)">
            <Heading as="h3" weight="medium" color="primary" style={{ marginBottom: 'var(--spacing-2)' }}>API Key Management</Heading>
            <Text color="muted" size="sm">Generate and manage API keys for external integrations. You can activate or deactivate keys as needed to control system access.</Text>
          </Surface>
        </div>
      </Surface>
    </div>
  )
}

export default DashboardPage
