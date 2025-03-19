import { IoNotificationsOutline } from "react-icons/io5";

const Notification = () => {
  return (
    <div className="bg-white shadow-[0px_1px_20px_rgba(0,0,0,0.06)] p-4 rounded-[20px] w-full">
     
      <div className="flex items-center space-x-2">
        <IoNotificationsOutline className="text-[#1360AB] text-xl" />
        <h3 className="font-semibold text-lg">Notifications</h3>
      </div>

      <ul className="mt-2 space-y-2 text-sm text-gray-600">
        <li>🔧 Electrician complaint.</li>
      </ul>
    </div>
  );
};

export default Notification;
