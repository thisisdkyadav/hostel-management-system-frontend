import { useState, useEffect } from "react"
import { FaUserCog, FaKey } from "react-icons/fa"
import superAdminService from "../../services/superAdminService"
import { Link } from "react-router-dom"

const Dashboard = () => {
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
      const data = await superAdminService.getDashboardStats()
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
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)' }}>Super Admin Dashboard</h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>Welcome to the system admin control panel</p>
      </header>

      {error && (
        <div style={{ backgroundColor: 'var(--color-danger-bg)', borderLeft: '4px solid var(--color-danger)', padding: 'var(--spacing-4)', marginBottom: 'var(--spacing-6)' }}>
          <div className="flex">
            <div style={{ marginLeft: 'var(--spacing-3)' }}>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-danger-text)' }}>{error}</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-10) 0' }}>
          <div style={{ display: 'inline-block', animation: 'spin 1s linear infinite', borderRadius: 'var(--radius-full)', height: '2rem', width: '2rem', borderTop: '2px solid var(--color-primary)', borderBottom: '2px solid var(--color-primary)', marginBottom: 'var(--spacing-4)' }}></div>
          <p style={{ color: 'var(--color-text-muted)' }}>Loading dashboard statistics...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: 'var(--spacing-6)' }}>
          <div style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-md)', overflow: 'hidden', transition: 'var(--transition-shadow)' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-lg)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}>
            <div className="flex items-center" style={{ padding: 'var(--spacing-5) var(--spacing-6)' }}>
              <div style={{ backgroundColor: 'var(--color-primary-bg)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-full)' }}>
                <FaUserCog style={{ height: '1.5rem', width: '1.5rem', color: 'var(--color-primary)' }} />
              </div>
              <div style={{ marginLeft: 'var(--spacing-4)' }}>
                <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)' }}>Total Admins</p>
                <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>{stats.totalAdmins}</p>
              </div>
            </div>
            <div style={{ padding: 'var(--spacing-2) var(--spacing-6)', backgroundColor: 'var(--color-bg-secondary)' }}>
              <Link to="/super-admin/admins" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', fontWeight: 'var(--font-weight-medium)' }}>
                Manage admins →
              </Link>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-md)', overflow: 'hidden', transition: 'var(--transition-shadow)' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-lg)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}>
            <div className="flex items-center" style={{ padding: 'var(--spacing-5) var(--spacing-6)' }}>
              <div style={{ backgroundColor: 'var(--color-coed-light-bg)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-full)' }}>
                <FaKey style={{ height: '1.5rem', width: '1.5rem', color: 'var(--color-coed-text)' }} />
              </div>
              <div style={{ marginLeft: 'var(--spacing-4)' }}>
                <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)' }}>Total API Keys</p>
                <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>{stats.totalApiKeys}</p>
              </div>
            </div>
            <div style={{ padding: 'var(--spacing-2) var(--spacing-6)', backgroundColor: 'var(--color-bg-secondary)' }}>
              <Link to="/super-admin/api-keys" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-coed-text)', fontWeight: 'var(--font-weight-medium)' }}>
                Manage API keys →
              </Link>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-md)', overflow: 'hidden', transition: 'var(--transition-shadow)' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-lg)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}>
            <div className="flex items-center" style={{ padding: 'var(--spacing-5) var(--spacing-6)' }}>
              <div style={{ backgroundColor: 'var(--color-success-bg)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-full)' }}>
                <FaKey style={{ height: '1.5rem', width: '1.5rem', color: 'var(--color-success)' }} />
              </div>
              <div style={{ marginLeft: 'var(--spacing-4)' }}>
                <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)' }}>Active API Keys</p>
                <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>{stats.activeApiKeys}</p>
              </div>
            </div>
            <div style={{ padding: 'var(--spacing-2) var(--spacing-6)', backgroundColor: 'var(--color-bg-secondary)' }}>
              <Link to="/super-admin/api-keys" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-success)', fontWeight: 'var(--font-weight-medium)' }}>
                View active keys →
              </Link>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 'var(--spacing-10)', backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-md)', padding: 'var(--spacing-6)' }}>
        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-4)' }}>System Overview</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>Welcome to the Super Admin portal. From here, you can manage system administrators and API keys. This dashboard provides a high-level overview of your system configuration.</p>
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ marginTop: 'var(--spacing-4)', gap: 'var(--spacing-4)' }}>
          <div style={{ border: '1px solid var(--color-border-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-4)' }}>
            <h3 style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-2)' }}>Admin Management</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>Create, view, update, and delete system administrators. Each admin has access to the admin portal to manage hostels, wardens, and other system resources.</p>
          </div>
          <div style={{ border: '1px solid var(--color-border-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-4)' }}>
            <h3 style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-2)' }}>API Key Management</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>Generate and manage API keys for external integrations. You can activate or deactivate keys as needed to control system access.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
