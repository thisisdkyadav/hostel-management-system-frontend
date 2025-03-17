import Sidebar from "../../components/student/Sidebar";
import Card from "../../components/student/Card";
import Notification from "../../components/student/Notification";
import Events from "../../components/student/Events";
import NoticeBoard from "../../components/student/Noticeboard";
import { FaDoorOpen, FaExclamationCircle ,FaUser} from "react-icons/fa";
import { CgSearchFound } from "react-icons/cg";
import { BsDoorOpen,BsDoorOpenFill } from "react-icons/bs";
const Dashboard = () => {
  return (
    <div className="flex bg-[#EFF3F4] min-h-screen">
  <Sidebar />

  <div className="px-10 py-6 flex-1">
    <header className="flex justify-between items-center w-full px-3 py-4 rounded-[12px]">
      <h1 className="text-2xl px-3 font-bold">Dashboard</h1>
      <div className="flex items-center space-x-6">
        <button className="bg-white text-red-600 px-5 py-2 shadow--[0px_1px_20px_rgba(0,0,0,0.06)] rounded-[12px]">⚠ Alert</button>
        <button className="flex items-center space-x-2 text-black text-base px-5 py-2 rounded-[12px] hover:text-gray-600">
          <FaUser className="w-5 h-5" /> 
          <span>Profile</span>
        </button>
      </div>
    </header>

    
    <div className="flex gap-6 items-start">
      <div className=" px-6 py-2 w-1/2">
        <div className="bg-white shadow-[0px_1px_20px_rgba(0,0,0,0.06)] p-6 rounded-[20px] mt-6 w-100 h-[200px]">
        <div className="flex items-center space-x-2">
        <BsDoorOpenFill className="text-[#1360AB] text-xl"/>
          <h3 className="text-gray-600">Your Room</h3>
          </div>
          <p className="text-3xl font-bold">207 E2</p>
        </div>

        <div className="mt-13 flex space-x-4">
          <Card title="Pending Complaints" value="5" icon={<FaExclamationCircle />} />
          <Card title="Lost & Found" value="0" icon={<CgSearchFound />} />
        </div>
      </div>

      <div className="w-1/2 py-8 h-[600px] flex flex-col">

  <div className="flex gap-4 items-start">
    <div className="w-[300px] ">
      <Events />
    </div>
    <div className="w-[200px]">
      <Notification />
    </div>
  </div>

  <div className="mt-auto py-4 w-full">
    <NoticeBoard />
  </div>

</div>






    </div>
  </div>
</div>

  
  );
};

export default Dashboard;
