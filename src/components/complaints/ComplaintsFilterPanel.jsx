import { FaFilter } from "react-icons/fa"
import { MdClearAll } from "react-icons/md"
import { Button, Select } from "@/components/ui"

const ComplaintsFilterPanel = ({ filters, updateFilter, resetFilters, hostels, categories, priorities }) => {
  return (
    <div className="border" style={{ marginTop: 'var(--spacing-4)', backgroundColor: 'var(--color-bg-primary)', padding: 'var(--spacing-5)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', borderColor: 'var(--color-border-light)' }} >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b" style={{ marginBottom: 'var(--spacing-4)', paddingBottom: 'var(--spacing-3)', borderColor: 'var(--color-border-light)' }} >
        <h3 className="flex items-center mb-2 sm:mb-0" style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-secondary)' }} >
          <FaFilter className="mr-2" style={{ color: 'var(--color-primary)' }} />
          Advanced Filters
        </h3>
        <Button onClick={resetFilters} variant="outline" size="small" icon={<MdClearAll />}>
          Reset Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: 'var(--spacing-4)' }}>
        {hostels.length > 0 && (
          <div>
            <label className="block" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--spacing-1-5)' }} >
              Hostel
            </label>
            <Select value={filters.hostelId} onChange={(e) => updateFilter("hostelId", e.target.value)} options={[
              { value: "all", label: "All Hostels" },
              ...hostels.map((hostel) => ({ value: hostel._id, label: hostel.name }))
            ]} />
          </div>
        )}

        <div>
          <label className="block" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--spacing-1-5)' }} >
            Category
          </label>
          <Select value={filters.category} onChange={(e) => updateFilter("category", e.target.value)} options={[
            { value: "all", label: "All Categories" },
            ...categories.map((category) => ({ value: category, label: category }))
          ]} />
        </div>

        <div>
          <label className="block" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--spacing-1-5)' }} >
            Priority
          </label>
          <Select value={filters.priority} onChange={(e) => updateFilter("priority", e.target.value)} options={[
            { value: "all", label: "All Priorities" },
            ...priorities.map((priority) => ({ value: priority, label: priority }))
          ]} />
        </div>

        <div>
          <label className="block" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--spacing-1-5)' }} >
            Items Per Page
          </label>
          <Select value={filters.limit} onChange={(e) => updateFilter("limit", Number(e.target.value))} options={[
            { value: 5, label: "5" },
            { value: 10, label: "10" },
            { value: 20, label: "20" },
            { value: 50, label: "50" }
          ]} />
        </div>
      </div>
    </div>
  )
}

export default ComplaintsFilterPanel
