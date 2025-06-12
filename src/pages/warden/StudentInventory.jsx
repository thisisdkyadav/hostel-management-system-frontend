import React, { useState } from "react"
import AvailableInventory from "../../components/warden/inventory/AvailableInventory"
import StudentAssignments from "../../components/warden/inventory/StudentAssignments"
// import InventoryManagement from "../../components/warden/inventory/InventoryManagement"

const StudentInventory = () => {
  const [activeTab, setActiveTab] = useState("available")

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Student Inventory Management</h1>
        <p className="text-sm text-gray-600 mt-1">Manage and assign inventory items to students</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button onClick={() => setActiveTab("available")} className={`py-4 px-1 flex items-center font-medium text-sm border-b-2 ${activeTab === "available" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
            Available Inventory
          </button>
          <button onClick={() => setActiveTab("assignments")} className={`py-4 px-1 flex items-center font-medium text-sm border-b-2 ${activeTab === "assignments" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
            Student Assignments
          </button>
          {/* <button onClick={() => setActiveTab("management")} className={`py-4 px-1 flex items-center font-medium text-sm border-b-2 ${activeTab === "management" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
            Item Management
          </button> */}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "available" && <AvailableInventory />}
        {activeTab === "assignments" && <StudentAssignments />}
        {/* {activeTab === "management" && <InventoryManagement />} */}
      </div>
    </div>
  )
}

export default StudentInventory
