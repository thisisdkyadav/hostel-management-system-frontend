import React from "react";

const ComplaintForm = ({ isOpen, setIsOpen }) => {
  if (!isOpen) return null; // If modal is not open, don't render anything

  return (
    <div className="fixed inset-0  bg-opacity-20 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-[#1360AB] w-[40%] h-[70vh] p-6 rounded-lg shadow-lg relative">
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-white text-2xl"
          onClick={() => setIsOpen(false)}
        >
          &times;
        </button>

        {/* Form Title */}
        <h2 className="text-white text-xl font-bold">FILL THE FORM</h2>

        {/* Form Fields */}
        <div className="flex flex-col gap-3 mt-4">
          <input type="text" placeholder="Complaint Type" className="p-2 rounded-lg w-full" />
          <textarea placeholder="Complaint Description-" className="p-2 rounded-lg w-full h-[100px]" />
          <input type="text" placeholder="Hostel" className="p-2 rounded-lg w-full" />
          <input type="text" placeholder="ROOM NO.-" className="p-2 rounded-lg w-full bg-gray-200" />
          <input type="file" className="p-2 rounded-lg w-full bg-gray-200" />
          <input type="text" placeholder="SEVERITY-" className="p-2 rounded-lg w-full bg-gray-200" />

          {/* Submit Button */}
          <button className="bg-green-500 text-white px-6 py-2 rounded-md mt-2 hover:bg-green-600">
            SUBMIT
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplaintForm;
