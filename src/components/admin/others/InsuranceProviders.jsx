import { useState, useEffect } from "react"
import { FaBuilding, FaPlus } from "react-icons/fa"
import SearchBar from "../../common/SearchBar"
import NoResults from "../../common/NoResults"
import InsuranceProviderCard from "./InsuranceProviderCard"
import AddInsuranceProviderModal from "./AddInsuranceProviderModal"
import { insuranceProviderApi } from "../../../services/insuranceProviderApi"

const filterInsuranceProviders = (providers, filterStatus, searchTerm) => {
  return providers
    .filter((provider) => {
      if (filterStatus === "all") return true
      return provider.status === filterStatus
    })
    .filter((provider) => {
      if (!searchTerm) return true
      const term = searchTerm.toLowerCase()
      return (
        provider.name.toLowerCase().includes(term) ||
        provider.email.toLowerCase().includes(term) ||
        provider.phone.toLowerCase().includes(term) ||
        provider.address.toLowerCase().includes(term) ||
        (provider.startDate && provider.startDate.includes(term)) ||
        (provider.endDate && provider.endDate.includes(term))
      )
    })
}

const InsuranceProviders = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const filteredProviders = filterInsuranceProviders(providers, filterStatus, searchTerm)

  const fetchInsuranceProviders = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await insuranceProviderApi.getInsuranceProviders()
      setProviders(response.insuranceProviders || [])
    } catch (error) {
      console.error("Error fetching insurance providers:", error)
      setError("Failed to fetch insurance providers. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInsuranceProviders()
  }, [])

  return (
    <div>
      <header style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 'var(--spacing-6)' }}>
        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-body)' }}>Insurance Providers</h2>
        <button onClick={() => setShowAddModal(true)} style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-white)', display: 'flex', alignItems: 'center', padding: 'var(--spacing-2-5) var(--spacing-4)', borderRadius: 'var(--radius-xl)', transition: 'var(--transition-all)', boxShadow: 'var(--shadow-sm)', border: 'none', cursor: 'pointer' }} onMouseEnter={(e) => { e.target.style.backgroundColor = 'var(--color-primary-hover)'; e.target.style.boxShadow = 'var(--shadow-md)'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = 'var(--color-primary)'; e.target.style.boxShadow = 'var(--shadow-sm)'; }}>
          <FaPlus style={{ marginRight: 'var(--spacing-2)' }} /> Add Provider
        </button>
      </header>

      <div style={{ marginTop: 'var(--spacing-6)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--spacing-4)' }} className="sm:flex-row sm:items-center sm:space-y-0">
        {/* <div className="w-full sm:w-auto pb-2">
          <FilterTabs tabs={INSURANCE_FILTER_TABS} activeTab={filterStatus} setActiveTab={setFilterStatus} />
        </div> */}
        <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search providers by name, email, phone or dates" className="w-full sm:w-64 md:w-72" />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '16rem' }}>
          <div style={{ width: 'var(--icon-3xl)', height: 'var(--icon-3xl)', border: 'var(--border-2) solid transparent', borderTopColor: 'var(--color-primary)', borderBottomColor: 'var(--color-primary)', borderRadius: 'var(--radius-full)', animation: 'spin 1s linear infinite' }}></div>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-8)', color: 'var(--color-danger)' }}>{error}</div>
      ) : filteredProviders.length === 0 ? (
        <NoResults icon={<FaBuilding style={{ color: 'var(--color-border-primary)', fontSize: 'var(--icon-3xl)' }} />} message="No insurance providers found" suggestion="Try changing your search or filter criteria" />
      ) : (
        <div style={{ marginTop: 'var(--spacing-6)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-6)' }}>
          {filteredProviders.map((provider) => (
            <InsuranceProviderCard key={provider.id} provider={provider} onUpdate={fetchInsuranceProviders} onDelete={fetchInsuranceProviders} />
          ))}
        </div>
      )}

      <AddInsuranceProviderModal show={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={fetchInsuranceProviders} />
    </div>
  )
}

export default InsuranceProviders
