import IITI_Logo from "../assets/logos/IITILogo.png"
import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"

const Sidebar = ({ navItems }) => {
  const [active, setActive] = useState("")
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const currentItem = navItems.find((item) => location.pathname === item.path || (location.pathname === "/admin" && item.name === "Dashboard"))

    if (currentItem) {
      setActive(currentItem.name)
    }
  }, [location.pathname])

  const mainNavItems = navItems.filter((item) => item.section === "main")
  const bottomNavItems = navItems.filter((item) => item.section === "bottom")

  const handleNavigation = (item) => {
    setActive(item.name)
    navigate(item.path)
  }

  const renderNavItem = (item) => {
    const getItemColorClass = () => {
      if (active === item.name) {
        return item.isAlert ? "bg-red-600 text-white" : "bg-[#1360AB] text-white"
      }
      return item.isAlert ? "bg-white text-red-600 hover:bg-red-600 hover:text-white" : "bg-white text-gray-700 hover:bg-[#1360AB] hover:text-white"
    }

    return (
      <li key={item.name} className={`p-3 rounded-[12px] flex items-center cursor-pointer transition-colors ${getItemColorClass()}`} onClick={() => handleNavigation(item)}>
        <item.icon className="mr-3" /> {item.name}
      </li>
    )
  }

  return (
    <div className="w-60 h-screen bg-white shadow-md flex flex-col p-5">
      <img src={IITI_Logo} alt="IIT Indore Logo" className="h-24 w-auto mx-auto mb-3 object-contain" />

      <nav className="mt-2 flex-1">
        <ul className="space-y-2">{mainNavItems.map(renderNavItem)}</ul>
      </nav>

      <div className="mb-5 mt-3">
        <ul className="space-y-2">{bottomNavItems.map(renderNavItem)}</ul>
      </div>
    </div>
  )
}

export default Sidebar
