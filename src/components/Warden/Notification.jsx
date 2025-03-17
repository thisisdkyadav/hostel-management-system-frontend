
import { FaBell } from "react-icons/fa";

const Notifications = () => {
  return (
    <div className="bg-white shadow-sm rounded-md w-full">
      {/* Header */}
      <div className="flex items-center space-x-2 p-3 border-b border-gray-100">
        <FaBell className="w-4 h-4" />
        <h3 className="font-medium text-sm">Notifications</h3>
      </div>

      {/* Content */}
      <div className="p-3">
        <ul className="text-gray-700 text-xs space-y-2">
          <li className="flex items-start space-x-1">
            <span className="text-black mt-0.5">•</span>
            <span>Update on Electrician complaint.</span>
          </li>
          <li className="flex items-start space-x-1">
            <span className="text-black mt-0.5">•</span>
            <span>Complaint Registered from Room 207</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Notifications;
