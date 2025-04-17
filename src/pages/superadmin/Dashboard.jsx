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
    <div className="px-4 sm:px-6 lg:px-8 py-6 flex-1">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Super Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to the system admin control panel</p>
      </header>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading dashboard statistics...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="px-6 py-5 flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <FaUserCog className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Admins</p>
                <p className="text-xl font-semibold text-gray-800">{stats.totalAdmins}</p>
              </div>
            </div>
            <div className="px-6 py-2 bg-gray-50">
              <Link to="/super-admin/admins" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Manage admins →
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="px-6 py-5 flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <FaKey className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total API Keys</p>
                <p className="text-xl font-semibold text-gray-800">{stats.totalApiKeys}</p>
              </div>
            </div>
            <div className="px-6 py-2 bg-gray-50">
              <Link to="/super-admin/api-keys" className="text-sm text-purple-600 hover:text-purple-800 font-medium">
                Manage API keys →
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="px-6 py-5 flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <FaKey className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active API Keys</p>
                <p className="text-xl font-semibold text-gray-800">{stats.activeApiKeys}</p>
              </div>
            </div>
            <div className="px-6 py-2 bg-gray-50">
              <Link to="/super-admin/api-keys" className="text-sm text-green-600 hover:text-green-800 font-medium">
                View active keys →
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="mt-10 bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">System Overview</h2>
        <p className="text-gray-600">Welcome to the Super Admin portal. From here, you can manage system administrators and API keys. This dashboard provides a high-level overview of your system configuration.</p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-2">Admin Management</h3>
            <p className="text-gray-600 text-sm">Create, view, update, and delete system administrators. Each admin has access to the admin portal to manage hostels, wardens, and other system resources.</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-2">API Key Management</h3>
            <p className="text-gray-600 text-sm">Generate and manage API keys for external integrations. You can activate or deactivate keys as needed to control system access.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
