import React, { useState } from 'react';
import { FaFileExcel } from "react-icons/fa";

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    studentName: '',
    fatherName: '',
    contacts: '',
    emailId: '',
    bloodGroup: '',
    parentNumber: '',
    roomNumber: '',
    address: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleUpload = () => {
    console.log('Form data submitted:', formData);
  };

  const handleClear = () => {
    setFormData({
      studentName: '',
      fatherName: '',
      contacts: '',
      emailId: '',
      bloodGroup: '',
      parentNumber: '',
      roomNumber: '',
      address: ''
    });
  };

  return (
    <div className="w-[848px] h-[862px] bg-[#85AED6] rounded-[20px] flex flex-col items-center p-6">
      
      <div className="w-full bg-white rounded-[15px] p-8 mb-6 flex-1">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8">
          {/* Student Name */}
          <div>
            <label className="block text-[#1A1A1A] mb-2 text-sm" htmlFor="studentName">
              Student Name
            </label>
            <input
              type="text"
              id="studentName"
              name="studentName"
              value={formData.studentName}
              onChange={handleChange}
              placeholder="Input"
              className="w-full h-12 border-2 border-[#543FD3] rounded px-3 py-2 focus:outline-none focus:border-[#543FD3]"
            />
          </div>
          
          {/* Father's Name */}
          <div>
            <label className="block text-[#1A1A1A] mb-2 text-sm" htmlFor="fatherName">
              Father's Name
            </label>
            <input
              type="text"
              id="fatherName"
              name="fatherName"
              value={formData.fatherName}
              onChange={handleChange}
              placeholder="Input"
              className="w-full h-12 border-2 border-[#543FD3] rounded px-3 py-2 focus:outline-none focus:border-[#543FD3]"
            />
          </div>
          
          {/* Contacts */}
          <div>
            <label className="block text-[#1A1A1A] mb-2 text-sm" htmlFor="contacts">
              Contacts
            </label>
            <input
              type="text"
              id="contacts"
              name="contacts"
              value={formData.contacts}
              onChange={handleChange}
              placeholder="Input"
              className="w-full h-12 border-2 border-[#543FD3] rounded px-3 py-2 focus:outline-none focus:border-[#543FD3]"
            />
          </div>
          
          {/* Email Id */}
          <div>
            <label className="block text-[#1A1A1A] mb-2 text-sm" htmlFor="emailId">
              Email Id
            </label>
            <input
              type="email"
              id="emailId"
              name="emailId"
              value={formData.emailId}
              onChange={handleChange}
              placeholder="Input"
              className="w-full h-12 border-2 border-[#543FD3] rounded px-3 py-2 focus:outline-none focus:border-[#543FD3]"
            />
          </div>
          
          {/* Blood Group */}
          <div>
            <label className="block text-[#1A1A1A] mb-2 text-sm" htmlFor="bloodGroup">
              Blood Group
            </label>
            <input
              type="text"
              id="bloodGroup"
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              placeholder="Input"
              className="w-full h-12 border-2 border-[#543FD3] rounded px-3 py-2 focus:outline-none focus:border-[#543FD3]"
            />
          </div>
          
          {/* Parent's Number */}
          <div>
            <label className="block text-[#1A1A1A] mb-2 text-sm" htmlFor="parentNumber">
              Parent's Number
            </label>
            <input
              type="text"
              id="parentNumber"
              name="parentNumber"
              value={formData.parentNumber}
              onChange={handleChange}
              placeholder="Input"
              className="w-full h-12 border-2 border-[#543FD3] rounded px-3 py-2 focus:outline-none focus:border-[#543FD3]"
            />
          </div>
          
          {/* Room Number */}
          <div>
            <label className="block text-[#1A1A1A] mb-2 text-sm" htmlFor="roomNumber">
              Room Number
            </label>
            <input
              type="text"
              id="roomNumber"
              name="roomNumber"
              value={formData.roomNumber}
              onChange={handleChange}
              placeholder="Input"
              className="w-full h-12 border-2 border-[#543FD3] rounded px-3 py-2 focus:outline-none focus:border-[#543FD3]"
            />
          </div>
          
          {/* Address */}
          <div>
            <label className="block text-[#1A1A1A] mb-2 text-sm" htmlFor="address">
              Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Input"
              className="w-full h-12 border-2 border-[#543FD3] rounded px-3 py-2 focus:outline-none focus:border-[#543FD3]"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-12">
          <button 
            onClick={handleUpload}
            className="bg-[#1360AB] text-white px-10 py-2.5 rounded-full shadow-[0px_8px_8px_rgba(0,0,0,0.25)]"

          >
            Upload
          </button>
          <button 
            onClick={handleClear}
            className="bg-white text-black border border-gray-200 px-10 py-2.5 rounded-full shadow-[0px_8px_8px_rgba(0,0,0,0.25)]"
          >
            Clear
          </button>
        </div>
      </div>

      {/* CSV Upload Button */}
      <div className="w-full">
        <label htmlFor="csvFile" className="bg-[#1360AB] text-white w-full py-4 rounded-md flex items-center justify-center cursor-pointer">
          <FaFileExcel className="text-xl mr-3" />
          <span>Upload CSV File</span>
          <input 
            type="file"
            id="csvFile"
            className="hidden"
            accept=".csv"
          />
        </label>
      </div>
    </div>
  );
};

export default RegistrationForm;
