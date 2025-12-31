import { Outlet } from "react-router-dom"
import Sidebar from "../components/Sidebar"

/**
 * BaseLayout Component
 * 
 * Shared layout structure used by all role-specific layouts.
 * Eliminates code duplication by providing a consistent container structure.
 * 
 * @param {Object} props
 * @param {Array} props.navItems - Navigation items for the sidebar
 * @param {boolean} props.showBottomBar - Whether to show bottom bar instead of sidebar (PWA mode)
 * @param {React.ReactNode} props.bottomBarComponent - Custom bottom bar component (for StudentLayout)
 */
const BaseLayout = ({ navItems, showBottomBar = false, bottomBarComponent = null }) => {
  return (
    <div className={`layout-container ${showBottomBar ? "pwa-container" : ""}`}>
      {!showBottomBar && <Sidebar navItems={navItems} />}
      
      <div className={`layout-content ${showBottomBar ? "pwa-bottom-padding" : ""}`}>
        <Outlet />
      </div>
      
      {showBottomBar && bottomBarComponent}
    </div>
  )
}

export default BaseLayout
