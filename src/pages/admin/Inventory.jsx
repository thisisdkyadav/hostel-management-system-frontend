import React, { useState } from "react"
import ItemTypes from "../../components/admin/inventory/ItemTypes"
import HostelAllocation from "../../components/admin/inventory/HostelAllocation"
import InventoryReports from "../../components/admin/inventory/InventoryReports"
import PageHeader from "../../components/common/PageHeader"

const Inventory = () => {
  const [activeTab, setActiveTab] = useState("itemTypes")

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Inventory Management" />

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button onClick={() => setActiveTab("itemTypes")} className={`py-4 px-1 flex items-center font-medium text-sm border-b-2 ${activeTab === "itemTypes" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
            Item Types
          </button>
          <button onClick={() => setActiveTab("hostelAllocation")} className={`py-4 px-1 flex items-center font-medium text-sm border-b-2 ${activeTab === "hostelAllocation" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
            Hostel Allocation
          </button>
          <button onClick={() => setActiveTab("reports")} className={`py-4 px-1 flex items-center font-medium text-sm border-b-2 ${activeTab === "reports" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
            Reports
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "itemTypes" && <ItemTypes />}
        {activeTab === "hostelAllocation" && <HostelAllocation />}
        {activeTab === "reports" && <InventoryReports />}
      </div>
      </div>
    </div>
  )
}

export default Inventory
