import { useState } from "react"
import { FaBuilding } from "react-icons/fa"
import FilterTabs from "../../components/common/FilterTabs"
import InsuranceProviders from "../../components/admin/others/InsuranceProviders"
import HostelLogins from "../../components/admin/others/HostelLogins"

// this page is for the admin to manage the others like Insurance Providers, Hostel Logins, etc.
const OTHERS_TABS = [
  { label: "Insurance Providers", value: "insurance" },
  { label: "Hostel Logins", value: "logins" },
]

const Others = () => {
  const [activeTab, setActiveTab] = useState("insurance")

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 flex-1">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">Others Management</h1>
      </header>

      <div className="mt-4 mb-6">
        <FilterTabs tabs={OTHERS_TABS} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {activeTab === "insurance" && <InsuranceProviders />}
      {activeTab === "logins" && <HostelLogins />}
    </div>
  )
}

export default Others
