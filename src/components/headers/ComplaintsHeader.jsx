import Button from "../common/Button"
import PageHeader from "../common/PageHeader"
import { FaFilter, FaPlus, FaList, FaTh } from "react-icons/fa"
import { WHO_CAN_CREATE_COMPLAINT } from "../../constants/complaintConstants"
import { useAuth } from "../../contexts/AuthProvider"

const ComplaintsHeader = ({ showFilters, setShowFilters, viewMode, setViewMode, showCraftComplaint, setShowCraftComplaint, userRole, title = "Complaints Management" }) => {
  const { canAccess } = useAuth()

  return (
    <PageHeader title={title}>
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
    </PageHeader>
  )
}

export default ComplaintsHeader

