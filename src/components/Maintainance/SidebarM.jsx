import { FaUser, FaCog, FaTimes } from "react-icons/fa";
import IITI_Logo from "../../assets/logos/IITILogo.png";
import { useState } from "react";
import { MdSpaceDashboard } from "react-icons/md";
import { Link } from "react-router-dom";

const Sidebar = ({ onClose }) => {
  const [active, setActive] = useState("Dashboard");

  return (
    <div className="fixed top-0 left-0 w-60 h-screen bg-white shadow-md flex flex-col p-5 z-10 overflow-y-auto">
      {/* Mobile close button - only shown on small screens */}
      <div className="md:hidden absolute top-4 right-4">
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <FaTimes className="text-lg" />
        </button>
      </div>

      <img src={IITI_Logo} alt="IIT Indore Logo" className="h-24 w-auto mx-auto mb-3 object-contain" />

      <nav className="mt-6 flex-1">
        <ul className="space-y-2">
          <li
            className={`p-3 rounded-[12px] flex items-center cursor-pointer transition-colors
              ${active === "Dashboard" ? "bg-[#1360AB] text-white" : "bg-white text-gray-700 hover:bg-[#1360AB] hover:text-white"}`}
            onClick={() => setActive("Dashboard")}
          >
            <Link to="/maintainance/dashboard" className="flex items-center w-full">
              <MdSpaceDashboard className="mr-3" /> Dashboard
            </Link>
          </li>

          <li
            className={`p-3 rounded-[12px] flex items-center cursor-pointer transition-colors
              ${active === "Profile" ? "bg-[#1360AB] text-white" : "bg-white text-gray-700 hover:bg-[#1360AB] hover:text-white"}`}
            onClick={() => setActive("Profile")}
          >
            <Link to="/maintainance/profile" className="flex items-center w-full">
              <FaUser className="mr-3" /> Profile
            </Link>
          </li>
        </ul>
      </nav>

      <div className="mb-5">
        <li
          className={`p-3 rounded-[12px] flex items-center cursor-pointer transition-colors list-none
            ${active === "Settings" ? "bg-[#1360AB] text-white" : "bg-white text-gray-700 hover:bg-[#1360AB] hover:text-white"}`}
          onClick={() => setActive("Settings")}
        >
          <Link to="/maintainance/settings" className="flex items-center w-full">
            <FaCog className="mr-3" /> Settings
          </Link>
        </li>
      </div>
    </div>
  );
};

export default Sidebar;