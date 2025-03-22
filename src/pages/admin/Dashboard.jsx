import Card from "../../components/student/Card"
import { FaExclamationCircle, FaUser, FaUsers, FaBuilding, FaUserTie, FaPercent, FaChartLine, FaCheckCircle, FaHourglassHalf } from "react-icons/fa"
import { MdMeetingRoom, MdSecurity, MdOutlineWarning } from "react-icons/md"
import { RiDoorOpenFill } from "react-icons/ri"
import DashboardSection from "../../components/admin/dashboard/DashboardSection"
import StatCard from "../../components/common/StatCard"
import ProgressItem from "../../components/admin/dashboard/ProgressItem"
import ActivityItem from "../../components/admin/dashboard/ActivityItem"
import { useAuth } from "../../contexts/AuthProvider"

const Dashboard = () => {
  const { user } = useAuth()
  return (
    <div className="px-10 py-6 flex-1">
      <header className="flex justify-between items-center w-full px-3 py-4 rounded-[12px]">
        <h1 className="text-2xl px-3 font-bold">Admin Dashboard</h1>
        <div className="flex items-center space-x-6">
          <button className="bg-white text-red-600 px-5 py-2 shadow-[0px_1px_20px_rgba(0,0,0,0.06)] rounded-[12px] flex items-center">
            <MdOutlineWarning className="mr-2" /> 3 Urgent Alerts
          </button>
          <button className="flex items-center space-x-2 text-black text-base px-5 py-2 rounded-[12px] hover:text-gray-600">
            <FaUser className="w-5 h-5" />
            <span>{user?.name}</span>
          </button>
        </div>
      </header>

      <div className="flex gap-6 items-start">
        <div className="px-6 py-2 w-1/2">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <Card title="Vacant Rooms" value="68" icon={<MdMeetingRoom />} />
            <Card title="Pending Complaints" value="27" icon={<FaExclamationCircle />} />
            <Card title="Active Wardens" value="16" icon={<FaUserTie />} />
            <Card title="Maintenance Issues" value="12" icon={<FaBuilding />} />
          </div>

          {/* Complaint Resolution Tracker */}
          <DashboardSection icon={<FaChartLine />} title="Complaint Resolution" rightContent={<span className="text-sm text-gray-500">Last 30 days</span>} className="mt-6">
            <div className="grid grid-cols-3 gap-3">
              <StatCard icon={<FaCheckCircle />} iconColor="text-green-600" bgColor="bg-green-50" title="Resolved" value="43" />
              <StatCard icon={<FaHourglassHalf />} iconColor="text-yellow-600" bgColor="bg-yellow-50" title="In Progress" value="18" />
              <StatCard bgColor="bg-blue-50" iconColor="text-blue-600" title="Resolution Rate" value="92%" />
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Avg. Resolution Time:</span>
                <span className="font-semibold">1.8 days</span>
              </div>
            </div>
          </DashboardSection>

          {/* Upcoming Events */}
          <DashboardSection title="Upcoming Events" rightContent={<button className="text-xs text-blue-600">View All</button>} className="mt-6">
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="bg-[#E4F1FF] text-[#1360AB] rounded-lg p-2 mr-3">
                  <span className="block text-center font-bold">23</span>
                  <span className="text-xs">MAR</span>
                </div>
                <div>
                  <h4 className="font-medium">Warden Meeting</h4>
                  <p className="text-xs text-gray-500">10:00 AM - Conference Room</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-[#E4F1FF] text-[#1360AB] rounded-lg p-2 mr-3">
                  <span className="block text-center font-bold">27</span>
                  <span className="text-xs">MAR</span>
                </div>
                <div>
                  <h4 className="font-medium">Hostel Inspection</h4>
                  <p className="text-xs text-gray-500">9:30 AM - Block C</p>
                </div>
              </li>
            </ul>
          </DashboardSection>
        </div>

        <div className="w-1/2 py-2 flex flex-col gap-6">
          {/* Maintenance Status */}
          <DashboardSection icon={<FaBuilding />} title="Maintenance Status">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <ProgressItem title="Plumbing" pending="4" color="blue" percentage={70} />
              <ProgressItem title="Electrical" pending="2" color="green" percentage={85} />
              <ProgressItem title="Furniture" pending="6" color="yellow" percentage={45} />
              <ProgressItem title="Cleaning" pending="0" color="purple" percentage={100} />
            </div>
          </DashboardSection>

          {/* Recent Student Activity */}
          <DashboardSection icon={<RiDoorOpenFill />} title="Recent Student Activity" rightContent={<span className="text-xs text-gray-500">Last 24 hours</span>}>
            <ul className="space-y-2">
              <ActivityItem icon={<FaUser className="text-xs" />} iconBgColor="bg-green-100" iconColor="text-green-600" name="Rahul Singh" status="Check-in" statusColor="text-green-600" additionalInfo="Room 302" time="2 hours ago" />
              <ActivityItem icon={<FaUser className="text-xs" />} iconBgColor="bg-red-100" iconColor="text-red-600" name="Priya Sharma" status="Check-out" statusColor="text-red-600" additionalInfo="Room 115" time="5 hours ago" />
              <ActivityItem icon={<MdSecurity />} iconBgColor="bg-yellow-100" iconColor="text-yellow-600" name="Late Entry" status="4 students" statusColor="text-gray-600" additionalInfo="Block C" time="Yesterday" />
            </ul>
            <button className="w-full mt-3 text-blue-600 text-sm">View All Activity</button>
          </DashboardSection>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
