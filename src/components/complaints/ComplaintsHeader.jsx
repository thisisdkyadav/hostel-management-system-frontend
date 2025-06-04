import Button from "../common/Button"
import { FaFilter, FaPlus, FaList, FaTh, FaClipboardList } from "react-icons/fa"
import { WHO_CAN_CREATE_COMPLAINT } from "../../constants/complaintConstants"
const ComplaintsHeader = ({ showFilters, setShowFilters, viewMode, setViewMode, showCraftComplaint, setShowCraftComplaint, userRole }) => {
  return (
    <header className="mb-6 transition-all duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center">
          <div className="p-2.5 mr-3 rounded-xl bg-blue-100 text-[#1360AB] flex-shrink-0">
            <FaClipboardList size={22} />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Complaints Management</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => setShowFilters(!showFilters)} variant={showFilters ? "primary" : "white"} size="small" icon={<FaFilter className="mr-2" />} className={`hover:shadow-sm transition-all duration-300 ${showFilters ? "ring-2 ring-blue-400 ring-opacity-50" : ""}`}>
            Filters
          </Button>

          <div className="flex border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white">
            <Button onClick={() => setViewMode("list")} variant={viewMode === "list" ? "primary" : "white"} size="small" className={`rounded-none px-3 py-1.5 transition-colors duration-200 ${viewMode === "list" ? "shadow-sm" : "hover:bg-gray-50"}`} icon={<FaList className="mr-2" />}>
              List
            </Button>
            <Button onClick={() => setViewMode("cards")} variant={viewMode === "cards" ? "primary" : "white"} size="small" className={`rounded-none px-3 py-1.5 transition-colors duration-200 ${viewMode === "cards" ? "shadow-sm" : "hover:bg-gray-50"}`} icon={<FaTh className="mr-2" />}>
              Grid
            </Button>
          </div>

          {WHO_CAN_CREATE_COMPLAINT.includes(userRole) && (
            <Button onClick={() => setShowCraftComplaint(true)} variant="primary" size="small" icon={<FaPlus className="mr-2 transform transition-transform group-hover:rotate-90 duration-200" />} className="hover:shadow-md transition-all duration-300 group">
              Create Complaint
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

export default ComplaintsHeader
