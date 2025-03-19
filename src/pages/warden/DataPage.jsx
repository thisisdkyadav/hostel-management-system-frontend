import React, { useState, useEffect } from "react";
import Sidebar from "../../components/warden/Sidebar"; 
import RegistrationForm from "../../components/Warden/RegistrationForm";
import { FaDownload, FaUpload, FaBuilding } from "react-icons/fa";

const DataPage = () => {
  const [showModal, setShowModal] = useState(false);
  
  // Toggle body scroll when modal opens/closes
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showModal]);

  // Open the modal
  const handleUploadClick = () => {
    setShowModal(true);
  };

  // Close the modal when clicking outside the form
  const handleOverlayClick = () => {
    setShowModal(false);
  };

  // Prevent closing the modal when clicking inside the form
  const handleFormClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="flex bg-[#EFF3F4] min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Warden</h1>
            <p className="text-sm text-gray-500">13 Feb 2025</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="bg-white text-red-500 px-4 py-2 rounded-md shadow">
              Alert
            </button>
            <span className="font-medium text-gray-700">Warden</span>
          </div>
        </div>

        {/* Top Section: Card + Search Bar */}
        <div className="mt-6 flex items-center space-x-4">
          {/*  C.V. RAMAN with icon */}
          <div className="bg-white w-64 h-26 rounded-[20px] shadow flex items-center justify-center space-x-2">
            <FaBuilding className="w-7 h-7" />
            <span className="text-lg font-semibold">C.V. RAMAN</span>
          </div>

          {/* Search Bar */}
          <div className="flex items-center space-x-2 bg-[#E9E5EE] px-4 py-2 rounded-[20px] ml-6">
            <input
              type="text"
              placeholder="Search"
              className="bg-transparent focus:outline-none text-sm w-32"
            />
            {/* Search icon */}
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6a6 6 0 105.464 9.036l4.292 4.292a1 1 0 001.414-1.414l-4.292-4.292A6 6 0 0010 6z"
              />
            </svg>
          </div>
        </div>

        {/* Bottom Buttons */}
        <div className="mt-auto flex space-x-4">
          <button className="bg-[#1360AB] text-white px-6 py-3 rounded-[20px] shadow flex items-center space-x-2">
            <FaDownload className="w-7 h-7" />
            <span>Download Student Data</span>
          </button>
          <button
            className="bg-[#1360AB] text-white px-6 py-3 rounded-[20px] shadow flex items-center space-x-2"
            onClick={handleUploadClick}
          >
            <FaUpload className="w-7 h-7" />
            <span>Upload Student Data</span>
          </button>
        </div>
      </div>

      {/*blurred background */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={handleOverlayClick}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)'
          }}
        >
          <div 
            onClick={handleFormClick}
            className="transform scale-[0.95] transition-transform duration-200"
          >
            <RegistrationForm />
          </div>
        </div>
      )}
    </div>
  );
};

export default DataPage;