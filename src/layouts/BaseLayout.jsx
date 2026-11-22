import { Outlet } from "react-router-dom"
import Sidebar from "../components/Sidebar"

/**
 * Shared layout for role dashboards: sidebar + page. (Students on phones use
 * StudentPhoneShell instead; see StudentLayout.)
 */
const BaseLayout = ({ navItems }) => (
  <div className="layout-container">
    <Sidebar navItems={navItems} />
    <div className="layout-content">
      <Outlet />
    </div>
  </div>
)

export default BaseLayout
