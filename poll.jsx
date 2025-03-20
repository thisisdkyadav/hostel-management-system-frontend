import React from "react";
import Sidebar from "../../components/warden/Sidebar";
import Navbar from "../../components/warden/Navbar";
import IssueNotice from "../../components/warden/Issuenotice";
import { FaBuilding } from "react-icons/fa";

const Dashboard = () => {
  // Sample data for poll cards
  const pollCards = [
    {
      id: 1,
      title: "Poll Title",
      description: "Poll description: Regarding the item size at occurrences of sales ratio designated denotes",
      options: [
        { id: 1, text: "OPTION 1", percentage: 60 },
        { id: 2, text: "OPTION 2", percentage: 40 },
        { id: 3, text: "OPTION 3", percentage: 75 },
        { id: 4, text: "OPTION 4", percentage: 25 }
      ]
    },
    {
      id: 2,
      title: "Poll Title",
      description: "Poll description: Regarding the item size at occurrences of sales ratio designated denotes",
      options: [
        { id: 1, text: "OPTION 1", percentage: 70 },
        { id: 2, text: "OPTION 2", percentage: 30 },
        { id: 3, text: "OPTION 3", percentage: 55 },
        { id: 4, text: "OPTION 4", percentage: 45 }
      ]
    },
    {
      id: 3,
      title: "Poll Title",
      description: "Poll description: Regarding the item size at occurrences of sales ratio designated denotes",
      options: [
        { id: 1, text: "OPTION 1", percentage: 80 },
        { id: 2, text: "OPTION 2", percentage: 20 },
        { id: 3, text: "OPTION 3", percentage: 65 },
        { id: 4, text: "OPTION 4", percentage: 35 }
      ]
    },
    {
      id: 4,
      title: "Poll Title",
      description: "Poll description: Regarding the item size at occurrences of sales ratio designated denotes",
      options: [
        { id: 1, text: "OPTION 1", percentage: 50 },
        { id: 2, text: "OPTION 2", percentage: 50 },
        { id: 3, text: "OPTION 3", percentage: 40 },
        { id: 4, text: "OPTION 4", percentage: 60 }
      ]
    },
    {
      id: 5,
      title: "Poll Title",
      description: "Poll description: Regarding the item size at occurrences of sales ratio designated denotes",
      options: [
        { id: 1, text: "OPTION 1", percentage: 45 },
        { id: 2, text: "OPTION 2", percentage: 55 },
        { id: 3, text: "OPTION 3", percentage: 30 },
        { id: 4, text: "OPTION 4", percentage: 70 }
      ]
    },
    {
      id: 6,
      title: "Poll Title",
      description: "Poll description: Regarding the item size at occurrences of sales ratio designated denotes",
      options: [
        { id: 1, text: "OPTION 1", percentage: 25 },
        { id: 2, text: "OPTION 2", percentage: 75 },
        { id: 3, text: "OPTION 3", percentage: 60 },
        { id: 4, text: "OPTION 4", percentage: 40 }
      ]
    }
  ];

  // Poll Card Component
  const PollCard = ({ poll }) => (
    <div className="bg-white rounded-lg shadow p-4 relative">
      <div className="mb-4">
        <h3 className="text-lg font-medium bg-gray-100 p-2 rounded mb-2">{poll.title}</h3>
        <p className="text-xs text-gray-500">{poll.description}</p>
      </div>
      
      <div className="space-y-3">
        {poll.options.map(option => (
          <div key={option.id} className="space-y-1">
            <p className="text-xs text-black-600">{option.text}</p>
            <div className="h-1 bg-gray-200 rounded">
              <div 
                className="h-full bg-blue-800 rounded" 
                style={{ width: `${option.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-4">
        <button className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded">Details</button>
      </div>
    </div>
  );

  return (
    <div className="flex bg-[#EFF3F4] min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Navbar */}
        <Navbar />

        {/* Content */}
        <div className="mb-6">
          {/* Top Section */}
          <div className="grid grid-cols-12 gap-4 mb-6">
            {/* Left Column */}
            
            {/* Right Column */}
            <div className="col-span-4">
              {/* Create Poll Button */}
              <div className="bg-gray-800 text-white p-4 rounded-xl shadow mb-4">
                <button className="w-full py-full font-large">Create Poll</button>
              </div>
              
              {/* More components could go here */}
            </div>
          </div>
          
          {/* Poll Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pollCards.map(poll => (
              <PollCard key={poll.id} poll={poll} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
