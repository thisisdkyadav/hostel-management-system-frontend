import { useState } from "react"
import { FaBuilding } from "react-icons/fa"
import FilterTabs from "../../components/common/FilterTabs"
import InsuranceProviders from "../../components/admin/others/InsuranceProviders"
import HostelLogins from "../../components/admin/others/HostelLogins"
import Undertakings from "../../components/admin/others/Undertakings"

// this page is for the admin to manage the others like Insurance Providers, Hostel Logins, etc.
const OTHERS_TABS = [
  { label: "Insurance Providers", value: "insurance" },
  { label: "Hostel Logins", value: "logins" },
  { label: "Undertakings", value: "undertakings" },
]

const Others = () => {
  const [activeTab, setActiveTab] = useState("insurance")

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 flex-1">
      <header className="bg-white shadow-sm border-b border-gray-100 -mx-4 sm:-mx-6 lg:-mx-8 -mt-6 mb-6">
        <div className="px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-[#0b57d0] tracking-tight">Others Management</h1>
              <p className="text-xs text-gray-500 mt-0.5">{new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mt-4 mb-6">
        <FilterTabs tabs={OTHERS_TABS} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {activeTab === "insurance" && <InsuranceProviders />}
      {activeTab === "logins" && <HostelLogins />}
      {activeTab === "undertakings" && <Undertakings />}
    </div>
  )
}

export default Others
