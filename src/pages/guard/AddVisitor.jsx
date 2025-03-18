import React from "react";
import { FaUserCircle, FaCamera } from "react-icons/fa";
import { MdGroups } from "react-icons/md";
import { FiAlertCircle } from "react-icons/fi";
import Sidebar from "../../components/guard/Sidebar";

const Dashboard = () => {
  return (
    <div className="flex bg-[#EFF3F4] min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-gray-500">6th Feb 2025</p>
          </div>

          <div className="flex items-center space-x-4">
            <button className="flex items-center text-red-500 font-semibold shadow bg-white p-2  rounded-xl">
              <FiAlertCircle className="mr-2" /> Alert
            </button>
            <div className="flex items-center gap-2">
              <FaUserCircle className="text-gray-500" size={25} />
              <span className="font-medium text-gray-700">Vaibhav Oja</span>
            </div>
          </div>
        </header>

        {/* Visitor Section */}
        <div className="flex justify-center gap-18 mt-6">
          <button className="bg-white  rounded-md shadow text-gray-700 font-medium text-xl py-2 px-6">
            CVR
          </button>
          <div className="bg-white px-6 py-2 rounded-md shadow text-center">
            <p className="text-gray-500 flex">VISITORS
            <MdGroups className="text-gray-500 ml-2" size={25} />  
            </p>
            <p className="text-xl font-bold">100</p>
          </div>
        </div>

        {/* Visitor Form */}
        <div className="flex justify-start mt-6 space-x-8">
 {/* Image Section */}
 <div className="relative mx-8">
    <img
      src="/path-to-avatar.png" // Change to actual image path
      alt="Visitor Avatar"
      className="w-36 h-36 rounded-full border-4 border-gray-400"
    />
     <button className="absolute left-23 top-25 bg-black text-white p-1.5 w-12 h-12 flex items-center justify-center rounded-full shadow-md hover:cursor-pointer">
    <FaCamera size={18} /> {/* Reduce size if needed */}
  </button>
  </div>

           {/* Form Section */}
           <div>
          <div className="bg-[#1360AB] text-white p-6 rounded-xl w-full max-w-2xl ml-15">
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Name -"
                className="w-full bg-[#EFF3F4] text-gray-800 px-4 py-2 rounded-md"
              />
              <input
                type="text"
                placeholder="Contact No.-"
                className="w-full bg-[#EFF3F4] text-gray-800 px-4 py-2 rounded-md"
              />
              <input
                type="text"
                placeholder="PURPOSE OF VISIT -"
                className="w-full bg-[#EFF3F4] text-gray-800 px-4 py-2 rounded-md"
              />
              <input
                type="text"
                placeholder="EXPECTED DURATION OF STAY"
                className="w-full bg-[#EFF3F4] text-gray-800 px-4 py-2 rounded-md"
              />
              <input
                type="text"
                placeholder="RELATIONSHIP WITH STUDENT"
                className="w-full bg-[#EFF3F4] text-gray-800 px-4 py-2 rounded-md"
              />
              <input
                type="text"
                placeholder="ALLOTED ROOM -"
                className="w-full bg-[#EFF3F4] text-gray-800 px-4 py-2 rounded-md"
              />
            </div>
          </div>
           {/* Add Button */}
        <div className="flex justify-end mt-4">
          <button className="bg-green-500  px-6 py-2 rounded-md font-bold text-xl">
            ADD
          </button>
        </div>
          </div>
        </div>

       

        
      </div>
    </div>
  );
};

export default Dashboard;
