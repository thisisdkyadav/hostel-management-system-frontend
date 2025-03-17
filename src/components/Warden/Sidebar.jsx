import { useState } from "react";
import { 
  FaUser, 
  FaCog, 
  FaExclamationTriangle, 
  FaClipboardList, 
  FaPollH, 
  FaDatabase, 
  FaChartLine, 
  FaUsers, 
  FaQuestionCircle 
} from "react-icons/fa";
import { MdSpaceDashboard } from "react-icons/md";
import IITI_Logo from "../../assets/logos/IITILogo.png";

const Sidebar = () => {
  const [active, setActive] = useState("Dashboard");

  // Helper to apply active vs. default styles
  const linkStyle = (itemName, isAlert = false) => {
    // If it's the currently active link, highlight it
    if (active === itemName) {
      return "bg-[#1360AB] text-white";
    }
    // Otherwise, use normal or alert styles
    if (isAlert) {
      return "bg-white text-red-600 hover:bg-red-500 hover:text-white";
    }
    return "bg-white text-gray-700 hover:bg-[#1360AB] hover:text-white";
  };

  return (
    <div className="w-60 h-screen bg-white shadow-md flex flex-col p-5">
      {/* Logo at the top */}
      <img
        src={IITI_Logo}
        alt="IIT Indore Logo"
        className="h-24 w-auto mx-auto mb-3 object-contain"
      />

      {/* Main Navigation */}
      <nav className="flex-1 mt-2">
        <ul className="space-y-2">
          {/* Dashboard */}
          <li
            className={`p-3 rounded-[12px] flex items-center cursor-pointer transition-colors ${linkStyle("Dashboard")}`}
            onClick={() => setActive("Dashboard")}
          >
            <MdSpaceDashboard className="mr-3" />
            <span>Dashboard</span>
          </li>

          {/* Complaints (with badge) */}
          <li
            className={`p-3 rounded-[12px] flex items-center justify-between cursor-pointer transition-colors ${linkStyle("Complaints")}`}
            onClick={() => setActive("Complaints")}
          >
            <div className="flex items-center">
              <FaClipboardList className="mr-3" />
              <span>Complaints</span>
            </div>
            {/* Red badge for the count */}
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              3
            </span>
          </li>

          {/* Polls */}
          <li
            className={`p-3 rounded-[12px] flex items-center cursor-pointer transition-colors ${linkStyle("Polls")}`}
            onClick={() => setActive("Polls")}
          >
            <FaPollH className="mr-3" />
            <span>Polls</span>
          </li>

          {/* Profile */}
          <li
            className={`p-3 rounded-[12px] flex items-center cursor-pointer transition-colors ${linkStyle("Profile")}`}
            onClick={() => setActive("Profile")}
          >
            <FaUser className="mr-3" />
            <span>Profile</span>
          </li>

          {/* Data */}
          <li
            className={`p-3 rounded-[12px] flex items-center cursor-pointer transition-colors ${linkStyle("Data")}`}
            onClick={() => setActive("Data")}
          >
            <FaDatabase className="mr-3" />
            <span>Data</span>
          </li>

          {/* Analytics */}
          <li
            className={`p-3 rounded-[12px] flex items-center cursor-pointer transition-colors ${linkStyle("Analytics")}`}
            onClick={() => setActive("Analytics")}
          >
            <FaChartLine className="mr-3" />
            <span>Analytics</span>
          </li>

          {/* Staff */}
          <li
            className={`p-3 rounded-[12px] flex items-center cursor-pointer transition-colors ${linkStyle("Staff")}`}
            onClick={() => setActive("Staff")}
          >
            <FaUsers className="mr-3" />
            <span>Staff</span>
          </li>
        </ul>

        {/* Divider before bottom items */}
        <hr className="my-4" />

        <ul className="space-y-2">
          {/* Alert (in red) */}
          <li
            className={`p-3 rounded-[12px] flex items-center cursor-pointer transition-colors ${linkStyle("Alert", true)}`}
            onClick={() => setActive("Alert")}
          >
            <FaExclamationTriangle className="mr-3" />
            <span>Alert</span>
          </li>
        </ul>
      </nav>

      {/* Bottom items */}
      <div className="mt-auto">
        <ul className="space-y-2">
          {/* Settings */}
          <li
            className={`p-3 rounded-[12px] flex items-center cursor-pointer transition-colors ${linkStyle("Settings")}`}
            onClick={() => setActive("Settings")}
          >
            <FaCog className="mr-3" />
            <span>Settings</span>
          </li>

          {/* Help */}
          <li
            className={`p-3 rounded-[12px] flex items-center cursor-pointer transition-colors ${linkStyle("Help")}`}
            onClick={() => setActive("Help")}
          >
            <FaQuestionCircle className="mr-3" />
            <span>Help</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;

