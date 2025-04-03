import { FaFilter } from "react-icons/fa"
import { MdClearAll } from "react-icons/md"
import Button from "../common/Button"

const ComplaintsFilterPanel = ({ filters, updateFilter, resetFilters, hostels, categories, priorities }) => {
  return (
    <div className="mt-4 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 pb-3 border-b border-gray-100">
        <h3 className="font-bold text-gray-700 flex items-center mb-2 sm:mb-0">
          <FaFilter className="mr-2 text-[#1360AB]" /> Advanced Filters
        </h3>
        <Button onClick={resetFilters} variant="outline" size="small" className="text-gray-500 hover:text-[#1360AB]" icon={<MdClearAll />}>
          Reset Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {hostels.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Hostel</label>
            <select className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] bg-white" value={filters.hostelId} onChange={(e) => updateFilter("hostelId", e.target.value)}>
              <option value="all">All Hostels</option>
              {hostels.map((hostel, index) => (
                <option key={index} value={hostel._id}>
                  {hostel.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">Category</label>
          <select className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] bg-white" value={filters.category} onChange={(e) => updateFilter("category", e.target.value)}>
            <option value="all">All Categories</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">Priority</label>
          <select className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] bg-white" value={filters.priority} onChange={(e) => updateFilter("priority", e.target.value)}>
            <option value="all">All Priorities</option>
            {priorities.map((priority, index) => (
              <option key={index} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">Items Per Page</label>
          <select className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] bg-white" value={filters.limit} onChange={(e) => updateFilter("limit", Number(e.target.value))}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default ComplaintsFilterPanel
