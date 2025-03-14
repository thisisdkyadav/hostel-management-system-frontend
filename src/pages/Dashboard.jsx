import Sidebar from "../components/Sidebar";
import Card from "../components/Card";
import Notification from "../components/Notification";
import Events from "../components/Events";
import NoticeBoard from "../components/Noticeboard";
import { FaDoorOpen, FaExclamationCircle } from "react-icons/fa";

const Dashboard = () => {
  return (
    <div className="flex bg-[#EFF3F4] min-h-screen">
      
      <Sidebar />

      <div className="flex-1 p-6">
      <header className="flex justify-between items-center w-full px-6 py-4 rounded-[12px]">
  <h1 className="text-2xl font-bold flex-1">Dashboard</h1>
  <div className="flex items-center space-x-6">
    <button className="bg-red-500 text-white px-5 py-2 rounded-[12px]">⚠ Alert</button>
    <button className="bg-white text-black px-8 py-2 rounded-[12px] border border-gray-300">
      Profile
    </button>
  </div>
</header>

<div className="bg-white shadow-md p-6 rounded-lg flex justify-between items-center mt-6">
  <div>
    <h3 className="text-gray-600">Your Room</h3>
    <p className="text-3xl font-bold">207 E2</p>
  </div>
  
</div>

        <div className="mt-4 flex space-x-4">
          <Card title="Pending Complaints" value="5" icon={<FaExclamationCircle />} bgColor="bg-[#1360AB]" />
          <Card title="Lost & Found" value="0" icon={<FaDoorOpen />} bgColor="bg-[#1360AB]" />
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <Events />
          <Notification />
          <NoticeBoard />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
