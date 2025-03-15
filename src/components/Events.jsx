import { FaRegCalendarAlt } from "react-icons/fa";

const Events = () => {
  return (
    <div className="bg-white shadow-[0px_1px_20px_rgba(0,0,0,0.06)] p-4 rounded-[20px] w-full">
      
      {/* Title with Icon */}
      <div className="flex items-center space-x-2">
        <FaRegCalendarAlt className="text-[#1360AB] text-xl" />
        <h3 className="font-semibold text-lg">Upcoming Events</h3>
      </div>

      <p className="text-gray-700 text-sm mt-2">
        <strong>Hostel Day</strong> - Games, Music, Open Mic, Dinner, and Social Time.
      </p>
      <p className="text-blue-500 text-xs mt-1">📅 11th Feb | 🕕 6 PM - 11 PM</p>
      <button className="mt-2 text-sm text-blue-500">Show More</button>
    </div>
  );
};

export default Events;
