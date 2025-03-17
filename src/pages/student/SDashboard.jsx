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
       
      <div className="bg-white shadow-[0px_1px_20px_rgba(0,0,0,0.06)] p-6 rounded-[20px] mt-12 w-full h-[220px]">
  {/* Title */}
  <div className="flex items-center space-x-2">
    <BsDoorOpenFill className="text-[#1360AB] text-xl" />
    <h3 className="text-gray-600">Your Room</h3>
  </div>

  
  <div className="flex items-center gap-6 mt-5">
   
    <div className="bg-[#E4F1FF] shadow-[0px_1px_20px_rgba(0,0,0,0.05)] p-4 rounded-2xl flex flex-wrap justify-end items-start gap-2 w-[142px]">
      <div className="bed bg-green-700 text-white w-9 h-[72px] flex justify-center items-center rounded-md text-sm font-bold">
        E1
      </div>
      <div className="table w-[22px] h-[20px] bg-green-700 rounded-md"></div>
      <div className="bed bg-[#1360AB] text-white w-9 h-[72px] flex justify-center items-center rounded-md text-sm font-bold shadow-lg">
        E2
      </div>
      <div className="table w-[22px] h-[20px] bg-[#1360AB] rounded-md shadow-lg"></div>
    </div>

    <p className="text-6xl font-medium text-[#1360AB]">
  207 <span className="text-2xl font-bold">E2</span>
</p>
  </div>
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
