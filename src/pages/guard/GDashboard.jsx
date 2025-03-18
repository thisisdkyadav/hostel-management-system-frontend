import React from "react";
import Sidebar from "../../components/guard/Sidebar";
import { FaSearch , FaPlus, FaTrash , FaUserCircle , FaCheck , FaTimes} from "react-icons/fa";


const Dashboard = () => {
    const data = [
        { id: 1, name: "XYZ BDDD", room: "106 E1", time: "10:00 PM", status: "Checked Out" },
        { id: 2, name: "XYZ BDDD", room: "106 E1", time: "10:00 PM", status: "Checked Out" },
        { id: 3, name: "XYZ BDDD", room: "106 E1", time: "10:00 PM", status: "Checked Out" },
        { id: 4, name: "XYZ BDDD", room: "106 E1", time: "10:00 PM", status: "Checked Out" },
        { id: 5, name: "XYZ BDDD", room: "106 E1", time: "10:00 PM", status: "Checked Out" },
      ];

    return (
      <div className="flex bg-[#EFF3F4] min-h-screen">
        {/* Sidebar */}
        <Sidebar />
  
        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Header */}
        <header className="flex flex-col md:flex-row md:justify-between items-center mb-6">
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-gray-500">6th Feb 2025</p>
          </div>
          
          <div className="relative w-full max-w-md mt-4 md:mt-0">
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-white px-4 py-2 border rounded-md shadow-sm"
            />
            <FaSearch className="absolute right-3 top-3 text-gray-500" />
          </div>

          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <button className=" px-4 py-2 rounded-md  flex items-center gap-1">
               <FaUserCircle className="mr-3" size={25} />
            <span className="font-medium text-gray-700">
                Vaibhav Oja</span>
            </button>
           
          </div>
        </header>
  
        

{/* Enter Room No. Input */}
<div className="flex justify-center mt-14">
  <input
    type="text"
    placeholder="Enter Room No."
    className="px-4 py-2 bg-white border rounded-md shadow-sm"
    
  />
   
</div>

          {/* Table */}
          <div className="p-4 rounded-xl mt-2">
      {/* Header */}
      <div className="grid grid-cols-6 bg-[#1360AB] text-white font-bold p-2 rounded-xl border">
        <div className="text-center">S.NO</div>
        <div className="text-center">Name</div>
        <div className="text-center">Room No.</div>
        <div className="text-center">Time</div>
        <div className="text-center">Status</div>
        <div className="text-center">Action</div>
      </div>

      {/* Data Rows */}
      {data.map((item, index) => (
        <div
          key={index}
          className="grid grid-cols-6 text-center  border  my-1 rounded-xl py-2"
        >
          <div>{item.id}.</div>
          <div>{item.name}</div>
          <div>{item.room}</div>
          <div>{item.time}</div>
          <div className="text-red-500">{item.status}</div>
          <div className="flex justify-center gap-2">
            {/* Check Button */}
            <button className="bg-green-500 text-white p-2 rounded-full shadow-md hover:bg-green-600 hover:cursor-pointer transition">
              <FaCheck />
            </button>
            {/* Cross Button */}
            <button className="bg-red-500 text-white p-2 rounded-full shadow-md hover:bg-red-600 hover:cursor-pointer transition">
              <FaTimes />
            </button>
          </div>
        </div>
      ))}
    </div>
   <div>
      {/* Floating Buttons */}
      <button className="fixed bottom-6 left-66 bg-green-500 text-white p-4 rounded-full shadow-lg hover:cursor-pointer transition">
            <FaPlus size={20} />
          </button>
          <button className="fixed bottom-6 right-6 bg-red-500 text-white p-4 rounded-full shadow-lg hover:cursor-pointer transition">
            <FaTrash size={20} />
          </button>
   </div>
         
        </div>
      </div>
    );
  };
  
  export default Dashboard;
  