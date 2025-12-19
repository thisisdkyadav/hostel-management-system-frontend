import { FaFilter } from "react-icons/fa"
import { MdClearAll } from "react-icons/md"
import Button from "../common/Button"

const ComplaintsFilterPanel = ({ filters, updateFilter, resetFilters, hostels, categories, priorities }) => {
  return (
    <div className="border" style={{ marginTop: 'var(--spacing-4)', backgroundColor: 'var(--color-bg-primary)', padding: 'var(--spacing-5)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', borderColor: 'var(--color-border-light)' }} >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b" style={{ marginBottom: 'var(--spacing-4)', paddingBottom: 'var(--spacing-3)', borderColor: 'var(--color-border-light)' }} >
        <h3 className="flex items-center mb-2 sm:mb-0" style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-secondary)' }} >
          <FaFilter className="mr-2" style={{ color: 'var(--color-primary)' }} /> 
          Advanced Filters
        </h3>
        <Button onClick={resetFilters} variant="outline" size="small" className="hover:text-[var(--color-primary)]" style={{ color: 'var(--color-text-muted)' }} icon={<MdClearAll />}
        >
          Reset Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: 'var(--spacing-4)' }}>
        {hostels.length > 0 && (
          <div>
            <label className="block" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--spacing-1-5)' }} >
              Hostel
            </label>
            <select className="w-full focus:outline-none" style={{ paddingLeft: 'var(--spacing-2-5)', paddingRight: 'var(--spacing-2-5)', paddingTop: 'var(--spacing-2-5)', paddingBottom: 'var(--spacing-2-5)', border: `var(--border-1) solid var(--color-border-input)`, borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-primary)' }} onFocus={(e) => {
                e.target.style.boxShadow = 'var(--input-focus-ring)';
                e.target.style.borderColor = 'var(--color-primary)';
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = 'none';
                e.target.style.borderColor = 'var(--color-border-input)';
              }}
              value={filters.hostelId} 
              onChange={(e) => updateFilter("hostelId", e.target.value)}
            >
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
          <label className="block" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--spacing-1-5)' }} >
            Category
          </label>
          <select className="w-full focus:outline-none" style={{ paddingLeft: 'var(--spacing-2-5)', paddingRight: 'var(--spacing-2-5)', paddingTop: 'var(--spacing-2-5)', paddingBottom: 'var(--spacing-2-5)', border: `var(--border-1) solid var(--color-border-input)`, borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-primary)' }} onFocus={(e) => {
              e.target.style.boxShadow = 'var(--input-focus-ring)';
              e.target.style.borderColor = 'var(--color-primary)';
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = 'none';
              e.target.style.borderColor = 'var(--color-border-input)';
            }}
            value={filters.category} 
            onChange={(e) => updateFilter("category", e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--spacing-1-5)' }} >
            Priority
          </label>
          <select className="w-full focus:outline-none" style={{ paddingLeft: 'var(--spacing-2-5)', paddingRight: 'var(--spacing-2-5)', paddingTop: 'var(--spacing-2-5)', paddingBottom: 'var(--spacing-2-5)', border: `var(--border-1) solid var(--color-border-input)`, borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-primary)' }} onFocus={(e) => {
              e.target.style.boxShadow = 'var(--input-focus-ring)';
              e.target.style.borderColor = 'var(--color-primary)';
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = 'none';
              e.target.style.borderColor = 'var(--color-border-input)';
            }}
            value={filters.priority} 
            onChange={(e) => updateFilter("priority", e.target.value)}
          >
            <option value="all">All Priorities</option>
            {priorities.map((priority, index) => (
              <option key={index} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--spacing-1-5)' }} >
            Items Per Page
          </label>
          <select className="w-full focus:outline-none" style={{ paddingLeft: 'var(--spacing-2-5)', paddingRight: 'var(--spacing-2-5)', paddingTop: 'var(--spacing-2-5)', paddingBottom: 'var(--spacing-2-5)', border: `var(--border-1) solid var(--color-border-input)`, borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-primary)' }} onFocus={(e) => {
              e.target.style.boxShadow = 'var(--input-focus-ring)';
              e.target.style.borderColor = 'var(--color-primary)';
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = 'none';
              e.target.style.borderColor = 'var(--color-border-input)';
            }}
            value={filters.limit} 
            onChange={(e) => updateFilter("limit", Number(e.target.value))}
          >
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
