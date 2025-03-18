import React, { useState } from "react";
import IITI from "../../assets/IITI.jpg";
import { Menu } from "lucide-react";
import { FaUser, FaCog, FaExclamationTriangle, FaClipboardList, FaSearch, FaLightbulb  } from "react-icons/fa";
import { MdSpaceDashboard } from "react-icons/md";

const SideBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className=" z-10 [@media(min-width:900px)]:bg-white [@media(min-width:900px)]:inline-block [@media(max-width:900px)]:bg-neutral-200">
        <div className=" [@media(max-width:900px)]:hidden flex flex-col h-screen w-[15vw] items-center !p-4">
                {/* image */}
                <div className="w-[12vw] [@media(max-height:500px)]:w-[7vw] !pb-2">
                    <img src={IITI} alt="IITI Logo" className="w-full h-auto" />
                </div>
                
                {/* text */}
                <div className="flex flex-col items-center justify-center gap-1.5 w-full cursor-pointer">
                    <div className="bg-white text-gray-700 flex items-center gap-3 w-[90%] rounded-lg [@media(min-width:1100px)]:h-[6vh] 
                        [@media(max-height:500px)]:w-[70%] [@media(max-width:1100px)]:!p-1
                        transition-colors duration-300 ease-in hover:bg-[#1360AB] hover:text-white
                    ">
                        <div></div>
                        <MdSpaceDashboard  className=""/> 
                        <p className="[@media(min-width:1100px)]:text-[16px] [@media(max-width:1100px)]:text-sm 
                            [@media(max-width:950px)]:text-[12px]
                        ">Dashboard</p>
                    </div>
                    <div className="bg-white text-gray-700 flex items-center gap-3 w-[90%] rounded-lg [@media(min-width:1100px)]:h-[6vh] 
                        [@media(max-height:500px)]:w-[70%] [@media(max-width:1100px)]:!p-1
                        transition-colors duration-300 ease-in hover:bg-[#1360AB] hover:text-white
                    ">
                        <div></div>
                        <FaClipboardList className="mr-3" />
                        <p className="[@media(min-width:1100px)]:text-[16px] [@media(max-width:1100px)]:text-sm 
                            [@media(max-width:950px)]:text-[12px]
                        ">Complaints</p>
                    </div>
                    <div className="bg-white text-gray-700 flex items-center gap-3 w-[90%] rounded-lg [@media(min-width:1100px)]:h-[6vh] 
                        [@media(max-height:500px)]:w-[70%] [@media(max-width:1100px)]:!p-1
                        transition-colors duration-300 ease-in hover:bg-[#1360AB] hover:text-white
                    ">
                        <div></div>
                        <FaSearch className="mr-3" /> 
                        <p className="[@media(min-width:1100px)]:text-[16px] [@media(max-width:1100px)]:text-sm 
                            [@media(max-width:950px)]:text-[12px]
                        ">Lost & Found</p>
                    </div>
                    <div className="bg-white text-gray-700 flex items-center gap-3 w-[90%] rounded-lg [@media(min-width:1100px)]:h-[6vh] 
                        [@media(max-height:500px)]:w-[70%] [@media(max-width:1100px)]:!p-1
                        transition-colors duration-300 ease-in hover:bg-[#1360AB] hover:text-white
                    ">
                        <div></div>
                        <FaUser className="mr-3" /> 
                        <p className="[@media(min-width:1100px)]:text-[16px] [@media(max-width:1100px)]:text-sm 
                            [@media(max-width:950px)]:text-[12px]
                        ">Profile</p>
                    </div>
                    
                    <div className="!py-4 w-[90%]">
                        <div className="w-36 h-0.5 bg-neutral-300 rounded-md !mb-3"></div>
                        <div className="flex items-center gap-3 w-[85%] rounded-lg [@media(min-width:1100px)]:h-[7vh] 
                            [@media(max-height:500px)]:w-[70%] [@media(max-width:1100px)]:!p-1 text-[#FF0000] 
                            transition-colors duration-300 ease-in hover:bg-[#FF0000] hover:text-white
                        ">
                            <div></div>
                            <FaExclamationTriangle className="mr-3" />

                            <p className="[@media(min-width:1100px)]:text-[17px] [@media(max-width:1100px)]:text-sm 
                                [@media(max-width:950px)]:text-[12px]
                            ">Alert</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center gap-1.5 w-full !pt-30 cursor-pointer"  >
                    <div className="bg-white text-gray-700 flex items-center gap-3 w-[90%] rounded-lg [@media(min-width:1100px)]:h-[6vh] 
                        [@media(max-height:500px)]:w-[70%] [@media(max-width:1100px)]:!p-1
                        transition-colors duration-300 ease-in hover:bg-[#1360AB] hover:text-white
                    ">
                        <div></div>
                        <FaCog className="mr-3" /> 
                        <p className="[@media(min-width:1100px)]:text-[16px] [@media(max-width:1100px)]:text-sm 
                            [@media(max-width:950px)]:text-[12px]
                        ">Settings</p>
                    </div>
                    <div className="bg-white text-gray-500 flex items-center gap-3 w-[90%] rounded-lg [@media(min-width:1100px)]:h-[6vh] 
                        [@media(max-height:500px)]:w-[70%] [@media(max-width:1100px)]:!p-1
                        transition-colors duration-300 ease-in hover:bg-[#1360AB] hover:text-white
                    ">
                        <div></div>
                        <FaLightbulb className="mr-3" /> 
                        <p className="[@media(min-width:1100px)]:text-[16px] [@media(max-width:1100px)]:text-sm 
                            [@media(max-width:950px)]:text-[12px]
                        ">Help</p>
                    </div>
                    
                </div>
        </div>
            {/* Navbar for Small Screens */}
        <div className="[@media(min-width:900px)]:hidden flex items-center justify-between text-black p-4">
            <button onClick={() => setIsOpen(!isOpen)}>
                <Menu className="w-8 h-8" />
            </button>
            <h1 className="text-xl font-bold">Dashboard</h1>
        </div>

        {/* Sidebar for Small Screens */}
        <div
            className={`[@media(min-width:900px)]:hidden z-10 fixed top-0 left-0 h-screen w-[50vw] sm:w-[60vw]  transform ${
            isOpen ? "translate-x-0" : "-translate-x-full"
            } transition-transform duration-300 ease-in-out`}
        >
            {/* Close Button */}
            <button
            onClick={() => setIsOpen(false)}
            className="absolute top-0 right-4 text-white text-2xl"
            >
            ✖
            </button>

            {/* Logo Section */}
            <div className="w-[40vw] !mx-auto !my-7">
                <img src={IITI} alt="IITI Logo" className="w-full h-auto" />
            </div>

            {/* Navigation */}
            <div className="flex flex-col items-center space-y-4">
                <div className="bg-[#1360AB] flex items-center justify-center gap-2 h-[6vh] w-[60%] rounded-lg p-2">
                    <svg className="w-6 h-6" viewBox="0 0 28 28" fill="none">
                    <path
                        d="M10.4995 25.6667L10.2071 21.573C10.0499 19.372 11.793 17.5 13.9995 17.5C16.206 17.5 17.9492 19.372 17.7919 21.573L17.4995 25.6667"
                        stroke="white"
                        strokeWidth="1.75"
                    />
                    <path
                        d="M2.74345 15.4157C2.33159 12.7356 2.12567 11.3956 2.63236 10.2076C3.13904 9.01963 4.2632 8.20683 6.51149 6.58123L8.19132 5.36666C10.9882 3.34444 12.3866 2.33333 14.0002 2.33333C15.6137 2.33333 17.0122 3.34444 19.809 5.36666L21.4888 6.58123C23.7372 8.20683 24.8613 9.01963 25.368 10.2076C25.8746 11.3956 25.6687 12.7356 25.2569 15.4157L24.9057 17.7011C24.3218 21.5004 24.0299 23.4001 22.6674 24.5334C21.3048 25.6667 19.3127 25.6667 15.3288 25.6667H12.6716C8.68756 25.6667 6.69556 25.6667 5.333 24.5334C3.97043 23.4001 3.67851 21.5004 3.09466 17.7011L2.74345 15.4157Z"
                        stroke="white"
                        strokeWidth="1.75"
                        strokeLinejoin="round"
                    />
                    </svg>
                    <p className="text-white text-lg [@media(max-width:25   0px)]:text-[12px]">Dashboard</p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default SideBar;
