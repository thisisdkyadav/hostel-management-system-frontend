import { useState, useEffect } from "react"
import { FaUserShield } from "react-icons/fa"
import { SearchInput } from "@/components/ui"
import NoResults from "../../components/common/NoResults"
import AdminCard from "../../components/admin/admins/AdminCard"
import AddAdminModal from "../../components/admin/admins/AddAdminModal"
import AdminStats from "../../components/admin/admins/AdminStats"
import AdminManagementHeader from "../../components/headers/AdminManagementHeader"
import { superAdminApi } from "../../service"
import { HCU_SUBROLE } from "../../constants/adminSubRoles"

const AdminManagementPage = () => {
  const [admins, setAdmins] = useState([])
  const [filteredAdmins, setFilteredAdmins] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await superAdminApi.getAllAdmins()
      const hcuAdmins = (data || []).filter((admin) => admin?.subRole === HCU_SUBROLE)
      setAdmins(hcuAdmins)
      setFilteredAdmins(hcuAdmins)
    } catch (err) {
      console.error("Error fetching admins:", err)
      setError(err.message || "Failed to load administrators")
      alert("Failed to load administrators")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdmins()
  }, [])

  useEffect(() => {
    let filtered = [...admins]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter((admin) =>
        admin.name.toLowerCase().includes(term) ||
        admin.email.toLowerCase().includes(term) ||
        (admin.phone && admin.phone.includes(term)) ||
        (admin.subRole && admin.subRole.toLowerCase().includes(term))
      )
    }

    setFilteredAdmins(filtered)
  }, [admins, searchTerm])

  const handleAddAdmin = () => {
    fetchAdmins()
    setShowAddModal(false)
  }

  return (
    <div className="flex flex-col h-full">
      <AdminManagementHeader
        title="HCU Staff Management"
        addButtonLabel="Add HCU Staff"
        onAddAdmin={() => setShowAddModal(true)}
      />

      <div className="flex-1 overflow-y-auto px-[var(--spacing-4)] sm:px-[var(--spacing-6)] lg:px-[var(--spacing-8)] py-[var(--spacing-6)]">

      <AdminStats admins={admins} />

      <div className="bg-[var(--color-bg-primary)] rounded-[var(--radius-xl)] shadow-[var(--shadow-md)] p-[var(--spacing-6)] mb-[var(--spacing-6)]">
        <div className="text-[var(--color-text-muted)] mb-[var(--spacing-4)]">Manage HCU staff accounts for admin operations. All users here are created with role Admin and sub-role HCU.</div>

        <div className="flex justify-end">
          <SearchInput value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search HCU staff by name or email" className="w-full sm:w-[var(--spacing-64)] md:w-[var(--spacing-72)]" />
        </div>
      </div>

      {error && (
        <div className="bg-[var(--color-danger-bg-light)] border-l-[var(--border-4)] border-[var(--color-danger)] p-[var(--spacing-4)] mb-[var(--spacing-6)]">
          <div className="flex">
            <div className="ml-[var(--spacing-3)]">
              <p className="text-[var(--font-size-sm)] text-[var(--color-danger-text)]">{error}</p>
            </div>
          </div>
        </div>
      )}

      {loading && admins.length === 0 ? (
        <div className="text-center py-[var(--spacing-10)]">
          <div className="inline-block animate-spin rounded-[var(--radius-full)] h-[var(--spacing-8)] w-[var(--spacing-8)] border-t-[var(--border-2)] border-b-[var(--border-2)] border-[var(--color-primary)] mb-[var(--spacing-4)]"></div>
          <p className="text-[var(--color-text-muted)]">Loading HCU staff...</p>
        </div>
      ) : filteredAdmins.length === 0 ? (
        <NoResults icon={<FaUserShield className="text-[var(--color-border-primary)] text-[var(--font-size-3xl)]" />} message="No HCU staff found" suggestion="Try changing your search criteria or add a new HCU staff member" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--spacing-4)] md:gap-[var(--spacing-6)]">
          {filteredAdmins.map((admin) => (
            <AdminCard key={admin.id} admin={admin} fixedSubRole={HCU_SUBROLE} onUpdate={() => fetchAdmins()} onDelete={() => fetchAdmins()} />
          ))}
        </div>
      )}

      <AddAdminModal show={showAddModal} fixedSubRole={HCU_SUBROLE} onClose={() => setShowAddModal(false)} onAdd={handleAddAdmin} />
      </div>
    </div>
  )
}

export default AdminManagementPage
