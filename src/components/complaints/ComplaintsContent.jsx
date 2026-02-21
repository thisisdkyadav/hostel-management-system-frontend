import { Tabs } from "czero/react"
import { FaClipboardList } from "react-icons/fa"
import NoResults from "../common/NoResults"
import ComplaintListView from "./ComplaintListView"
import ComplaintCardView from "./ComplaintCardView"
const ComplaintsContent = ({ loading, complaints, viewMode, filters, COMPLAINT_FILTER_TABS, updateFilter, onViewDetails, showFilters }) => {
  return (
    <>
      {/* Tabs */}
      {!showFilters && COMPLAINT_FILTER_TABS.length > 0 && (
        <div style={{ marginTop: "var(--spacing-6)", marginBottom: "var(--spacing-4)" }}>
          <Tabs variant="pills" tabs={COMPLAINT_FILTER_TABS} activeTab={filters.status} setActiveTab={(status) => updateFilter("status", status)} />
        </div>
      )}

      {/* Content - Uses DataTable built-in loading state to avoid standalone spinners */}
      <div style={{ marginTop: "var(--spacing-6)" }}>
        {viewMode === "list" || loading ? (
          <ComplaintListView complaints={complaints} onViewDetails={onViewDetails} loading={loading} />
        ) : complaints.length > 0 ? (
          <ComplaintCardView complaints={complaints} onViewDetails={onViewDetails} />
        ) : (
          <NoResults icon={<FaClipboardList style={{ color: "var(--color-border-primary)", fontSize: "var(--font-size-5xl)" }} />} message="No complaints found" suggestion="Try changing your search or filter criteria" />
        )}
      </div>
    </>
  )
}

export default ComplaintsContent

