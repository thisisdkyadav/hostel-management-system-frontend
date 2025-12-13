import React, { useState } from "react"
import ItemTypes from "../../components/admin/inventory/ItemTypes"
import HostelAllocation from "../../components/admin/inventory/HostelAllocation"
import InventoryReports from "../../components/admin/inventory/InventoryReports"

const Inventory = () => {
  const [activeTab, setActiveTab] = useState("itemTypes")

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 flex-1">
      <header className="bg-white shadow-sm border-b border-gray-100 -mx-4 sm:-mx-6 lg:-mx-8 -mt-6 mb-6">
        <div className="px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-[#0b57d0] tracking-tight">Inventory Management</h1>
              <p className="text-xs text-gray-500 mt-0.5">{new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
          </div>
        </div>
      </header>

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
