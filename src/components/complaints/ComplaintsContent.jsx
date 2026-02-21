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

      {/* Content - Uses DataTable internal loading for list view */}
      <div style={{ marginTop: "var(--spacing-6)" }}>
        {viewMode === "list" ? (
          <ComplaintListView complaints={complaints} onViewDetails={onViewDetails} loading={loading} />
        ) : loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "16rem" }}>
            <div style={{ position: "relative", width: "var(--icon-4xl)", height: "var(--icon-4xl)" }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: `var(--border-4) solid var(--color-border-primary)`, borderRadius: "var(--radius-full)" }}></div>
              <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: `var(--border-4) solid var(--color-primary)`, borderRadius: "var(--radius-full)", borderTopColor: "transparent" }} className="animate-spin"></div>
            </div>
          </div>
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

