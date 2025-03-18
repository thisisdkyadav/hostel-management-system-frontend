import Sidebar from "../../components/warden/Sidebar";
import Navbar from "../../components/warden/Navbar";
import { FaBars, FaSearch } from "react-icons/fa";

const Complaint = () => {
  const complaints = [
    {
      title: "Title of the complaint",
      description: "Door handle broken..........",
      category: "Maintenance",
      location: "207 E",
      status: "Resolved",
    },
    {
      title: "Title of the complaint",
      description: "Door handle broken..........",
      category: "Maintenance",
      location: "207 E",
      status: "Resolved",
    },
    {
      title: "Title of the complaint",
      description: "Door handle broken..........",
      category: "Maintenance",
      location: "207 E",
      status: "Resolved",
    },
    {
      title: "Title of the complaint",
      description: "Door handle broken..........",
      category: "Maintenance",
      location: "207 E",
      status: "Resolved",
    },
  ];

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-6 bg-[#EFF3F4] min-h-screen">
        {/* Navbar */}
        <Navbar />

        {/* Search & Filter */}
        <div className="flex items-center space-x-4 bg-white p-3 rounded-lg shadow-md">
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-200 rounded-md">
            <FaBars />
            <span>Filter by categories</span>
          </button>
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search complaints..."
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-1 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        {/* Complaints Table */}
        <div className="mt-6  rounded-lg overflow-hidden">
          <div className="grid grid-cols-5  px-4 mx-4 rounded-[12px] bg-[#1360AB] text-white p-3 ">
            <span>Title</span>
            <span>Description</span>
            <span>Category</span>
            <span>Location</span>
            <span>Status</span>
          </div>
          {complaints.map((complaint, index) => (
    <div
      key={index}
      className="relative grid grid-cols-5 items-center p-4 m-4 bg-white rounded-[12px] shadow-[0px_1px_20px_rgba(0,0,0,0.06)]"
    >
      <span>{complaint.title}</span>
      <span className="truncate">{complaint.description}</span>
      <span>{complaint.category}</span>
      <span>{complaint.location}</span>
      <div className="flex flex-col justify-between h-full">
        <span>{complaint.status}</span>
        <button className="absolute bottom-3 right-3 px-4 py-1 bg-[#1360AB] text-white rounded-md text-sm">
          Details
        </button>
      </div>
    </div>
  ))}
</div>
      </div>
    </div>
  );
};

export default Complaint;
