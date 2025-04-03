import { FaClipboardList } from "react-icons/fa"
import NoResults from "../common/NoResults"
import ComplaintListView from "./ComplaintListView"
import ComplaintCardView from "./ComplaintCardView"
import Pagination from "../common/Pagination"
import FilterTabs from "../common/FilterTabs"

const ComplaintsContent = ({ loading, complaints, viewMode, filters, totalPages, COMPLAINT_FILTER_TABS, updateFilter, onViewDetails, paginate }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-[#1360AB] rounded-full animate-spin border-t-transparent"></div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="w-full sm:w-auto overflow-x-auto pb-2">
          <FilterTabs tabs={COMPLAINT_FILTER_TABS} activeTab={filters.status} setActiveTab={(status) => updateFilter("status", status)} />
        </div>
      </div>

      {complaints.length > 0 ? (
        <>
          <div className="mt-6">{viewMode === "list" ? <ComplaintListView complaints={complaints} onViewDetails={onViewDetails} /> : <ComplaintCardView complaints={complaints} onViewDetails={onViewDetails} />}</div>

          {totalPages > 1 && <Pagination currentPage={filters.page} totalPages={totalPages} paginate={paginate} />}
        </>
      ) : (
        <div className="mt-12">
          <NoResults icon={<FaClipboardList className="text-gray-300 text-5xl" />} message="No complaints found" suggestion="Try changing your search or filter criteria" />
        </div>
      )}
    </>
  )
}

export default ComplaintsContent
