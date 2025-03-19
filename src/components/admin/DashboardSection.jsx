import React from "react"
import SectionHeader from "./SectionHeader"

const DashboardSection = ({ icon, title, rightContent, children, className = "" }) => {
  return (
    <div className={`bg-white shadow-[0px_1px_20px_rgba(0,0,0,0.06)] p-6 rounded-[20px] ${className}`}>
      <SectionHeader icon={icon} title={title} rightContent={rightContent} />
      {children}
    </div>
  )
}

export default DashboardSection
