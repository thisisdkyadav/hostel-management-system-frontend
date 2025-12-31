import React, { useState } from "react"
import ItemTypes from "../../components/admin/inventory/ItemTypes"
import HostelAllocation from "../../components/admin/inventory/HostelAllocation"
import InventoryReports from "../../components/admin/inventory/InventoryReports"
import InventoryHeader from "../../components/headers/InventoryHeader"

const InventoryPage = () => {
  const [activeTab, setActiveTab] = useState("itemTypes")

  return (
    <div className="flex flex-col h-full">
      <InventoryHeader />

      <div className="flex-1 overflow-y-auto px-[var(--spacing-4)] sm:px-[var(--spacing-6)] lg:px-[var(--spacing-8)] py-[var(--spacing-6)]">

        {/* Tabs */}
        <div className="border-b border-[var(--color-border-primary)] mb-[var(--spacing-6)]">
          <nav className="flex space-x-[var(--spacing-8)]">
            <button onClick={() => setActiveTab("itemTypes")} className={`py-[var(--spacing-4)] px-[var(--spacing-1)] flex items-center font-[var(--font-weight-medium)] text-[var(--font-size-sm)] border-b-[var(--border-2)] transition-[var(--transition-all)] ${activeTab === "itemTypes" ? "border-[var(--color-primary)] text-[var(--color-primary)]" : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:border-[var(--color-border-dark)]"}`}>
              Item Types
            </button>
            <button onClick={() => setActiveTab("hostelAllocation")} className={`py-[var(--spacing-4)] px-[var(--spacing-1)] flex items-center font-[var(--font-weight-medium)] text-[var(--font-size-sm)] border-b-[var(--border-2)] transition-[var(--transition-all)] ${activeTab === "hostelAllocation" ? "border-[var(--color-primary)] text-[var(--color-primary)]" : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:border-[var(--color-border-dark)]"}`}>
              Hostel Allocation
            </button>
            <button onClick={() => setActiveTab("reports")} className={`py-[var(--spacing-4)] px-[var(--spacing-1)] flex items-center font-[var(--font-weight-medium)] text-[var(--font-size-sm)] border-b-[var(--border-2)] transition-[var(--transition-all)] ${activeTab === "reports" ? "border-[var(--color-primary)] text-[var(--color-primary)]" : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:border-[var(--color-border-dark)]"}`}>
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

export default InventoryPage

