import { FaClipboardList } from "react-icons/fa"
import NoResults from "../common/NoResults"
import ComplaintListView from "./ComplaintListView"
import ComplaintCardView from "./ComplaintCardView"
import Pagination from "../common/Pagination"
import FilterTabs from "../common/FilterTabs"

const ComplaintsContent = ({ loading, complaints, viewMode, filters, totalPages, COMPLAINT_FILTER_TABS, updateFilter, onViewDetails, paginate }) => {
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '16rem'
      }}>
        <div style={{
          position: 'relative',
          width: 'var(--icon-4xl)',
          height: 'var(--icon-4xl)'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: `var(--border-4) solid var(--color-border-primary)`,
            borderRadius: 'var(--radius-full)'
          }}></div>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: `var(--border-4) solid var(--color-primary)`,
            borderRadius: 'var(--radius-full)',
            borderTopColor: 'transparent'
          }} className="animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div style={{
        marginTop: 'var(--spacing-6)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }} className="sm:flex-row sm:items-center space-y-4 sm:space-y-0">
        <div style={{
          width: '100%',
          paddingBottom: 'var(--spacing-2)'
        }} className="sm:w-auto">
          <FilterTabs tabs={COMPLAINT_FILTER_TABS} activeTab={filters.status} setActiveTab={(status) => updateFilter("status", status)} />
        </div>
      </div>

      {complaints.length > 0 ? (
        <>
          <div style={{ marginTop: 'var(--spacing-6)' }}>{viewMode === "list" ? <ComplaintListView complaints={complaints} onViewDetails={onViewDetails} /> : <ComplaintCardView complaints={complaints} onViewDetails={onViewDetails} />}</div>

          {totalPages > 1 && <Pagination currentPage={filters.page} totalPages={totalPages} paginate={paginate} />}
        </>
      ) : (
        <div style={{ marginTop: 'var(--spacing-12)' }}>
          <NoResults icon={<FaClipboardList style={{
            color: 'var(--color-border-primary)',
            fontSize: 'var(--font-size-5xl)'
          }} />} message="No complaints found" suggestion="Try changing your search or filter criteria" />
        </div>
      )}
    </>
  )
}

export default ComplaintsContent
