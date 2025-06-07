import { useState, useEffect } from "react"
import { FaBuilding, FaPlus } from "react-icons/fa"
import FilterTabs from "../../common/FilterTabs"
import SearchBar from "../../common/SearchBar"
import NoResults from "../../common/NoResults"
import InsuranceProviderCard from "./InsuranceProviderCard"
import AddInsuranceProviderModal from "./AddInsuranceProviderModal"
import { insuranceProviderApi } from "../../../services/insuranceProviderApi"

const INSURANCE_FILTER_TABS = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
]

const filterInsuranceProviders = (providers, filterStatus, searchTerm) => {
  return providers
    .filter((provider) => {
      if (filterStatus === "all") return true
      return provider.status === filterStatus
    })
    .filter((provider) => {
      if (!searchTerm) return true
      const term = searchTerm.toLowerCase()
      return provider.name.toLowerCase().includes(term) || provider.email.toLowerCase().includes(term) || provider.phone.toLowerCase().includes(term) || provider.address.toLowerCase().includes(term)
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
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full mb-6">
        <h2 className="text-xl font-semibold text-gray-700">Insurance Providers</h2>
        <button onClick={() => setShowAddModal(true)} className="bg-[#1360AB] text-white flex items-center px-4 py-2.5 rounded-xl hover:bg-[#0F4C81] transition-all duration-300 shadow-sm hover:shadow-md">
          <FaPlus className="mr-2" /> Add Provider
        </button>
      </header>

      <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        {/* <div className="w-full sm:w-auto overflow-x-auto pb-2">
          <FilterTabs tabs={INSURANCE_FILTER_TABS} activeTab={filterStatus} setActiveTab={setFilterStatus} />
        </div> */}
        <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search providers by name, email, or phone" className="w-full sm:w-64 md:w-72" />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1360AB]"></div>
        </div>
      ) : error ? (
        <div className="text-center p-8 text-red-600">{error}</div>
      ) : filteredProviders.length === 0 ? (
        <NoResults icon={<FaBuilding className="text-gray-300 text-3xl" />} message="No insurance providers found" suggestion="Try changing your search or filter criteria" />
      ) : (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
