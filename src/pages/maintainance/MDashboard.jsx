import React, { useState } from "react"
import Sidebar from "../../components/Maintainance/SidebarM"
import ComplaintsM from "../../components/Maintainance/ComplaintsM"
import { FaUser, FaBars } from "react-icons/fa"

const MDashboard = () => {
  // Only keep the sidebar state in this component
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Toggle sidebar for mobile
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="flex flex-col md:flex-row bg-[#EFF3F4] min-h-screen">
      {/* Mobile sidebar toggle - only visible on small screens */}
      <div className="md:hidden fixed top-4 left-4 z-20">
        <button onClick={toggleSidebar} className="bg-[#1360AB] text-white p-2 rounded-md">
          <FaBars />
        </button>
      </div>

      {/* Sidebar - hidden on mobile, shown when toggled or on larger screens */}
      <div className={`${sidebarOpen ? "block" : "hidden"} md:block`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && <div className="fixed inset-0 bg-black opacity-50 z-[5] md:hidden" onClick={() => setSidebarOpen(false)}></div>}

      <div className="w-full md:ml-60 flex-1 p-4 md:p-6 mt-12 md:mt-0">
        <header className="flex justify-between items-center w-full px-3 py-4 rounded-[12px]">
          <h1 className="text-xl md:text-2xl px-3 font-bold">Dashboard</h1>
          <button className="flex items-center space-x-2 text-black text-base px-3 md:px-5 py-2 rounded-[12px] hover:text-gray-600">
            <FaUser className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Profile</span>
          </button>
        </header>

        <div className="pr-0 md:pr-6">
          {/* ComplaintsM now handles its own loading, error states, and data fetching */}
          <ComplaintsM />
        </div>
      </div>
    </div>
  )
}

export default MDashboard
