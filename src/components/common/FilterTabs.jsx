import React from "react"
import Button from "./Button"

const FilterTabs = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="flex space-x-2 md:space-x-3 text-gray-600 whitespace-nowrap">
      {tabs.map((tab) => (
        <Button key={tab.value} onClick={() => setActiveTab(tab.value)} variant={activeTab === tab.value ? "primary" : "white"} size="small" animation="ripple">
          {tab.label}
        </Button>
      ))}
    </div>
  )
}

export default FilterTabs
