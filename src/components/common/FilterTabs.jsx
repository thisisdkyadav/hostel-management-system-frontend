import React from "react"

const FilterTabs = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="flex space-x-2 md:space-x-3 text-gray-600 whitespace-nowrap">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => setActiveTab(tab.value)}
          className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-sm transition-all duration-300
            ${activeTab === tab.value ? `bg-${tab.color || "[#1360AB]"} text-white shadow-sm` : "bg-white text-gray-600 hover:bg-gray-50"}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export default FilterTabs
