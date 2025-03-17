import { FaRegFileAlt } from "react-icons/fa"; 

const IssueNotice = () => {
  return (
    <div className="bg-white border border-red-200 rounded-xl shadow-sm w-full">
      {/* Header */}
      <div className="flex items-center space-x-2 p-3 border-b border-gray-100">
        <FaRegFileAlt className="w-4 h-4" />
        <h3 className="font-medium text-sm">Issue Notice</h3>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3">
        {[1, 2].map((_, index) => (
          <div key={index} className="bg-gray-100 p-3 rounded">
            <p className="text-gray-700 text-xs">
              Two line text string with two actions. One to two lines is preferable on mobile and tablet.
            </p>
            <div className="flex justify-end space-x-2 mt-2">
              <button className="bg-black text-white text-xs px-2 py-1 rounded">Issue</button>
              <button className="bg-black text-white text-xs px-2 py-1 rounded">Withdraw</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IssueNotice;
