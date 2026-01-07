import { useState } from "react"
import { FaBuilding } from "react-icons/fa"
import { Tabs } from "@/components/ui"
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

const OthersPage = () => {
  const [activeTab, setActiveTab] = useState("insurance")

  return (
    <div className="flex flex-col h-full">
      <OthersHeader />

      <div className="flex-1 overflow-y-auto px-[var(--spacing-4)] sm:px-[var(--spacing-6)] lg:px-[var(--spacing-8)] py-[var(--spacing-6)]">

        <div className="mt-[var(--spacing-4)] mb-[var(--spacing-6)]">
          <Tabs tabs={OTHERS_TABS} activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {activeTab === "insurance" && <InsuranceProviders />}
        {activeTab === "logins" && <HostelLogins />}
        {activeTab === "undertakings" && <Undertakings />}
      </div>
    </div>
  )
}

export default OthersPage

