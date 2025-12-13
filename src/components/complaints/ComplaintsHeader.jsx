import Button from "../common/Button"
import { FaFilter, FaPlus, FaList, FaTh, FaClipboardList } from "react-icons/fa"
import { WHO_CAN_CREATE_COMPLAINT } from "../../constants/complaintConstants"
import { useAuth } from "../../contexts/AuthProvider"

const ComplaintsHeader = ({ showFilters, setShowFilters, viewMode, setViewMode, showCraftComplaint, setShowCraftComplaint, userRole, title = "Complaints Management" }) => {
  const { canAccess } = useAuth()

  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left Section - Title & Date */}
          <div className="flex items-center">
            <div>
              <h1 className="text-xl font-semibold text-[#0b57d0] tracking-tight">{title}</h1>
              <p className="text-xs text-gray-500 mt-0.5">{new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-full p-1">
              <button 
                onClick={() => setViewMode("list")} 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  viewMode === "list" 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <FaList className="text-xs" />
                <span className="hidden sm:inline">List</span>
              </button>
              <button 
                onClick={() => setViewMode("cards")} 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  viewMode === "cards" 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <FaTh className="text-xs" />
                <span className="hidden sm:inline">Grid</span>
              </button>
            </div>

            {/* Filter Button */}
            <Button 
              onClick={() => setShowFilters(!showFilters)} 
              variant={showFilters ? "primary" : "white"} 
              size="small" 
              icon={<FaFilter className="text-xs" />}
              className={showFilters ? "ring-2 ring-blue-400/50" : ""}
            >
              <span className="hidden sm:inline">Filters</span>
            </Button>

            {/* Create Button */}
            {canAccess("complaints", "create") && WHO_CAN_CREATE_COMPLAINT.includes(userRole) && (
              <Button 
                onClick={() => setShowCraftComplaint(true)} 
                variant="primary" 
                size="small" 
                icon={<FaPlus className="text-xs" />}
                animation="slideIn"
              >
                <span className="hidden sm:inline">New Complaint</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default ComplaintsHeader
