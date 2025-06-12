import React, { useState } from "react"
import ItemTypes from "../../components/admin/inventory/ItemTypes"
import HostelAllocation from "../../components/admin/inventory/HostelAllocation"
import InventoryReports from "../../components/admin/inventory/InventoryReports"

const Inventory = () => {
  const [activeTab, setActiveTab] = useState("itemTypes")

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
        <p className="text-sm text-gray-600 mt-1">Manage inventory items, allocate to hostels, and view reports</p>
      </div>

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
  )
}

export default Inventory
