
import { FaRegCalendarAlt } from "react-icons/fa";

const Events = () => {
  return (
    <div className="bg-white shadow-sm rounded-md w-full">
      {/* Header */}
      <div className="flex items-center space-x-2 p-3 border-b border-gray-100">
        <FaRegCalendarAlt className="w-4 h-4" />
        <h3 className="font-medium text-sm">Upcoming Events</h3>
      </div>

      {/* Content */}
      <div className="p-3">
        <h4 className="font-medium text-sm">Hostel Day</h4>
        <p className="text-gray-600 text-xs mt-1">
          Games, Competitions, Music, Dance, Open Mic, Dinner, 
          and Social Time. Come dressed in your favorite casual wear.
        </p>

        <div className="flex space-x-2 mt-2">
          <span className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded">
            11th Feb
          </span>
          <span className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded">
            6pm - 11pm
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 flex justify-between items-center border-t border-gray-100">
        <button className="text-blue-600 text-xs font-medium">
          Show More
        </button>
        <span className="text-gray-500 text-xs">+2 Events</span>
      </div>
    </div>
  );
};

export default Events;
