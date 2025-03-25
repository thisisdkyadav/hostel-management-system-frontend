import { FaUser, FaCog, FaExclamationTriangle, FaClipboardList, FaSearch } from "react-icons/fa";
import IITI_Logo from "../../assets/logos/IITILogo.png";  
import { useState } from "react";
import { MdSpaceDashboard } from "react-icons/md";

const Sidebar = () => {
  const [active, setActive] = useState("Dashboard");

  return (
    <div className="w-60 h-screen bg-white shadow-md flex flex-col p-5">
      <img src={IITI_Logo} alt="IIT Indore Logo" className="h-24 w-auto mx-auto mb-3 object-contain" />
      
      <nav className="mt-6 flex-1">
        <ul className="space-y-2">
          <li 
            className={`p-3 rounded-[12px] flex items-center cursor-pointer transition-colors
              ${active === "Dashboard" ? "bg-[#1360AB] text-white" : "bg-white text-gray-700 hover:bg-[#1360AB] hover:text-white"}`}
            onClick={() => setActive("Dashboard")}
          >
            <MdSpaceDashboard  className="mr-3 "/> Dashboard
          </li>

          <li 
            className={`p-3 rounded-[12px] flex items-center cursor-pointer transition-colors
              ${active === "Complaints" ? "bg-[#1360AB] text-white" : "bg-white text-gray-700 hover:bg-[#1360AB] hover:text-white"}`}
            onClick={() => setActive("Complaints")}
          >
            <FaClipboardList className="mr-3" /> Complaints
          </li>

          <li 
            className={`p-3 rounded-[12px] flex items-center cursor-pointer transition-colors
              ${active === "Lost & Found" ? "bg-[#1360AB] text-white" : "bg-white text-gray-700 hover:bg-[#1360AB] hover:text-white"}`}
            onClick={() => setActive("Lost & Found")}
          >
            <FaSearch className="mr-3" /> Lost & Found
          </li>

          <li 
            className={`p-3 rounded-[12px] flex items-center cursor-pointer transition-colors
              ${active === "Profile" ? "bg-[#1360AB] text-white" : "bg-white text-gray-700 hover:bg-[#1360AB] hover:text-white"}`}
            onClick={() => setActive("Profile")}
          >
            <FaUser className="mr-3" /> Profile
          </li>

          <li 
            className={`p-3 rounded-[12px] flex items-center cursor-pointer transition-colors
              ${active === "Alert" ? "bg-[#1360AB] text-white" : "bg-white text-red-600 hover:bg-red-500 hover:text-white"}`}
            onClick={() => setActive("Alert")}
          >
            <FaExclamationTriangle className="mr-3" /> Alert
          </li>
        </ul>
      </nav>

      <div className="mb-5">
        <li 
          className={`p-3 rounded-[12px] flex items-center cursor-pointer transition-colors
            ${active === "Settings" ? "bg-[#1360AB] text-white" : "bg-white text-gray-700 hover:bg-[#1360AB] hover:text-white"}`}
          onClick={() => setActive("Settings")}
        >
          <FaCog className="mr-3" /> Settings
        </li>
      </div>
    </div>
  );
};

export default Sidebar;
