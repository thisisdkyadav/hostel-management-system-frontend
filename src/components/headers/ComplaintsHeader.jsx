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
      <div 
        className="flex rounded-[var(--radius-full)]"
        style={{
          backgroundColor: 'var(--color-bg-muted)',
          padding: 'var(--spacing-1)'
        }}
      >
        <button 
          onClick={() => setViewMode("list")} 
          className="flex items-center rounded-[var(--radius-full)] font-medium"
          style={{
            gap: 'var(--spacing-2)',
            padding: 'var(--spacing-1-5) var(--spacing-3)',
            fontSize: 'var(--font-size-sm)',
            transition: 'var(--transition-all)',
            backgroundColor: viewMode === "list" ? 'var(--color-bg-primary)' : 'transparent',
            color: viewMode === "list" ? 'var(--color-primary)' : 'var(--color-text-muted)',
            boxShadow: viewMode === "list" ? 'var(--shadow-sm)' : 'none'
          }}
          onMouseEnter={(e) => {
            if (viewMode !== "list") {
              e.currentTarget.style.color = 'var(--color-text-primary)'
            }
          }}
          onMouseLeave={(e) => {
            if (viewMode !== "list") {
              e.currentTarget.style.color = 'var(--color-text-muted)'
            }
          }}
        >
          <FaList style={{ fontSize: 'var(--font-size-xs)' }} />
          <span className="hidden sm:inline">List</span>
        </button>
        <button 
          onClick={() => setViewMode("cards")} 
          className="flex items-center rounded-[var(--radius-full)] font-medium"
          style={{
            gap: 'var(--spacing-2)',
            padding: 'var(--spacing-1-5) var(--spacing-3)',
            fontSize: 'var(--font-size-sm)',
            transition: 'var(--transition-all)',
            backgroundColor: viewMode === "cards" ? 'var(--color-bg-primary)' : 'transparent',
            color: viewMode === "cards" ? 'var(--color-primary)' : 'var(--color-text-muted)',
            boxShadow: viewMode === "cards" ? 'var(--shadow-sm)' : 'none'
          }}
          onMouseEnter={(e) => {
            if (viewMode !== "cards") {
              e.currentTarget.style.color = 'var(--color-text-primary)'
            }
          }}
          onMouseLeave={(e) => {
            if (viewMode !== "cards") {
              e.currentTarget.style.color = 'var(--color-text-muted)'
            }
          }}
        >
          <FaTh style={{ fontSize: 'var(--font-size-xs)' }} />
          <span className="hidden sm:inline">Grid</span>
        </button>
      </div>

      {/* Filter Button */}
      <Button 
        onClick={() => setShowFilters(!showFilters)} 
        variant={showFilters ? "primary" : "white"} 
        size="small" 
        icon={<FaFilter style={{ fontSize: 'var(--font-size-xs)' }} />}
        className={showFilters ? "" : ""}
        style={showFilters ? { boxShadow: 'var(--ring-primary)' } : {}}
      >
        <span className="hidden sm:inline">Filters</span>
      </Button>

      {/* Create Button */}
      {canAccess("complaints", "create") && WHO_CAN_CREATE_COMPLAINT.includes(userRole) && (
        <Button 
          onClick={() => setShowCraftComplaint(true)} 
          variant="primary" 
          size="small" 
          icon={<FaPlus style={{ fontSize: 'var(--font-size-xs)' }} />}
          animation="slideIn"
        >
          <span className="hidden sm:inline">New Complaint</span>
        </Button>
      )}
    </PageHeader>
  )
}

export default ComplaintsHeader

