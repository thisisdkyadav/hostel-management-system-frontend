import { useState } from "react"
import { FaBuilding } from "react-icons/fa"
import FilterTabs from "../../components/common/FilterTabs"
import InsuranceProviders from "../../components/admin/others/InsuranceProviders"
import HostelLogins from "../../components/admin/others/HostelLogins"
import Undertakings from "../../components/admin/others/Undertakings"
import OthersHeader from "../../components/headers/OthersHeader"

// this page is for the admin to manage the others like Insurance Providers, Hostel Logins, etc.
const OTHERS_TABS = [
  { label: "Insurance Providers", value: "insurance" },
  { label: "Hostel Logins", value: "logins" },
  { label: "Undertakings", value: "undertakings" },
]

const Others = () => {
  const [activeTab, setActiveTab] = useState("insurance")

  return (
    <div className="flex flex-col h-full">
      <OthersHeader />

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">

      <div className="mt-4 mb-6">
        <FilterTabs tabs={OTHERS_TABS} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {activeTab === "insurance" && <InsuranceProviders />}
      {activeTab === "logins" && <HostelLogins />}
      {activeTab === "undertakings" && <Undertakings />}
      </div>
    </div>
  )
}

export default Others
