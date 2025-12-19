import Button from "../common/Button"
import PageHeader from "../common/PageHeader"
import { FaFilter, FaPlus, FaList, FaTh, FaCalendarAlt } from "react-icons/fa"
import { useAuth } from "../../contexts/AuthProvider"

const LeavesHeader = ({ showFilters, setShowFilters, viewMode, setViewMode, onCreate, title = "Leave Management", isAdmin = false, viewSelfOnly, setViewSelfOnly }) => {
  const { user } = useAuth()
  const canCreate = ["Admin", "Hostel Supervisor", "Maintenance Staff"].includes(user?.role)

  return (
    <PageHeader title={title}>
      <Button onClick={() => setShowFilters(!showFilters)} 
        variant={showFilters ? "primary" : "white"} 
        size="small" 
        icon={<FaFilter />} 
        style={{ transition: 'var(--transition-all)' }}
      >
        Filters
      </Button>

      {isAdmin && (
        <div style={{ display: 'flex', border: `var(--border-1) solid var(--color-border-gray)`, borderRadius: 'var(--radius-full)', overflow: 'hidden', backgroundColor: 'var(--color-bg-primary)' }} >
          <Button onClick={() => setViewSelfOnly(false)} 
            variant={!viewSelfOnly ? "primary" : "white"} 
            size="small" 
            style={{
              borderRadius: 'var(--radius-none)',
              paddingLeft: 'var(--spacing-3)',
              paddingRight: 'var(--spacing-3)',
              paddingTop: 'var(--spacing-1-5)',
              paddingBottom: 'var(--spacing-1-5)',
              transition: 'var(--transition-colors)'
            }}
          >
            All
          </Button>
          <Button onClick={() => setViewSelfOnly(true)} 
            variant={viewSelfOnly ? "primary" : "white"} 
            size="small" 
            style={{
              borderRadius: 'var(--radius-none)',
              paddingLeft: 'var(--spacing-3)',
              paddingRight: 'var(--spacing-3)',
              paddingTop: 'var(--spacing-1-5)',
              paddingBottom: 'var(--spacing-1-5)',
              transition: 'var(--transition-colors)'
            }}
          >
            Mine
          </Button>
        </div>
      )}

      <div style={{ display: 'flex', border: `var(--border-1) solid var(--color-border-gray)`, borderRadius: 'var(--radius-full)', overflow: 'hidden', backgroundColor: 'var(--color-bg-primary)' }} >
        <Button onClick={() => setViewMode("list")} 
          variant={viewMode === "list" ? "primary" : "white"} 
          size="small" 
          style={{
            borderRadius: 'var(--radius-none)',
            paddingLeft: 'var(--spacing-3)',
            paddingRight: 'var(--spacing-3)',
            paddingTop: 'var(--spacing-1-5)',
            paddingBottom: 'var(--spacing-1-5)',
            transition: 'var(--transition-colors)'
          }}
          icon={<FaList />}
        >
          List
        </Button>
        <Button onClick={() => setViewMode("cards")} 
          variant={viewMode === "cards" ? "primary" : "white"} 
          size="small" 
          style={{
            borderRadius: 'var(--radius-none)',
            paddingLeft: 'var(--spacing-3)',
            paddingRight: 'var(--spacing-3)',
            paddingTop: 'var(--spacing-1-5)',
            paddingBottom: 'var(--spacing-1-5)',
            transition: 'var(--transition-colors)'
          }}
          icon={<FaTh />}
        >
          Grid
        </Button>
      </div>

      {canCreate && (
        <Button onClick={onCreate} variant="primary" size="small" icon={<FaPlus />} 
          style={{ transition: 'var(--transition-all)' }}
        >
          Create Leave
        </Button>
      )}
    </PageHeader>
  )
}

export default LeavesHeader
