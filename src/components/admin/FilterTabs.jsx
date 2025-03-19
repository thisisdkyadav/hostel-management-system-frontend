import React from "react"

const FilterTabs = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="flex space-x-4 text-gray-600">
      {tabs.map((tab) => (
        <button key={tab.value} onClick={() => setActiveTab(tab.value)} className={`px-4 py-2 rounded-xl ${activeTab === tab.value ? `bg-${tab.color} text-white` : "bg-white"}`}>
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export default FilterTabs
