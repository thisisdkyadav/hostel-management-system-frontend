import React from "react"
import { FaSearch, FaTimes } from "react-icons/fa"

const NotificationFilterSection = ({ filters, updateFilter, resetFilters }) => {
  const handleChange = (e) => {
    const { name, value } = e.target
    updateFilter(name, value)
  }

  return (
    <div style={{ backgroundColor: 'var(--color-bg-primary)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', marginBottom: 'var(--spacing-6)', border: `var(--border-1) solid var(--color-border-light)` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
        <h3 style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)' }}>Filter Notifications</h3>
        <button onClick={resetFilters} style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-info)', display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', transition: 'var(--transition-colors)' }} onMouseEnter={(e) => e.target.style.color = 'var(--color-info-hover)'} onMouseLeave={(e) => e.target.style.color = 'var(--color-info)'}>
          <FaTimes style={{ marginRight: 'var(--spacing-1)' }} /> Reset Filters
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-4)' }}>
        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Search</label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, paddingLeft: 'var(--spacing-3)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
              <FaSearch style={{ color: 'var(--color-text-placeholder)' }} />
            </div>
            <input type="text" name="searchTerm" value={filters.searchTerm} onChange={handleChange} placeholder="Search by title or content..." style={{ paddingLeft: 'var(--spacing-10)', width: '100%', padding: 'var(--input-padding)', border: `var(--border-1) solid var(--input-border)`, borderRadius: 'var(--radius-lg)', outline: 'none', transition: 'var(--transition-colors)' }} onFocus={(e) => { e.target.style.borderColor = 'var(--input-border-focus)'; e.target.style.boxShadow = 'var(--input-focus-ring)' }} onBlur={(e) => { e.target.style.borderColor = 'var(--input-border)'; e.target.style.boxShadow = 'none' }} />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Hostel</label>
          <select name="hostelId" value={filters.hostelId} onChange={handleChange} style={{ width: '100%', padding: 'var(--input-padding)', border: `var(--border-1) solid var(--input-border)`, borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-primary)', outline: 'none', transition: 'var(--transition-colors)' }} onFocus={(e) => { e.target.style.borderColor = 'var(--input-border-focus)'; e.target.style.boxShadow = 'var(--input-focus-ring)' }} onBlur={(e) => { e.target.style.borderColor = 'var(--input-border)'; e.target.style.boxShadow = 'none' }}>
            <option value="all">All Hostels</option>
            <option value="hostel1">Hostel 1</option>
            <option value="hostel2">Hostel 2</option>
            {/* Add more hostels as needed */}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Department</label>
          <select name="department" value={filters.department} onChange={handleChange} style={{ width: '100%', padding: 'var(--input-padding)', border: `var(--border-1) solid var(--input-border)`, borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-primary)', outline: 'none', transition: 'var(--transition-colors)' }} onFocus={(e) => { e.target.style.borderColor = 'var(--input-border-focus)'; e.target.style.boxShadow = 'var(--input-focus-ring)' }} onBlur={(e) => { e.target.style.borderColor = 'var(--input-border)'; e.target.style.boxShadow = 'none' }}>
            <option value="all">All Departments</option>
            <option value="CSE">Computer Science</option>
            <option value="ECE">Electronics</option>
            <option value="ME">Mechanical</option>
            {/* Add more departments as needed */}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Degree</label>
          <select name="degree" value={filters.degree} onChange={handleChange} style={{ width: '100%', padding: 'var(--input-padding)', border: `var(--border-1) solid var(--input-border)`, borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-primary)', outline: 'none', transition: 'var(--transition-colors)' }} onFocus={(e) => { e.target.style.borderColor = 'var(--input-border-focus)'; e.target.style.boxShadow = 'var(--input-focus-ring)' }} onBlur={(e) => { e.target.style.borderColor = 'var(--input-border)'; e.target.style.boxShadow = 'none' }}>
            <option value="all">All Degrees</option>
            <option value="BTech">BTech</option>
            <option value="MTech">MTech</option>
            <option value="PhD">PhD</option>
            {/* Add more degrees as needed */}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Gender</label>
          <select name="gender" value={filters.gender} onChange={handleChange} style={{ width: '100%', padding: 'var(--input-padding)', border: `var(--border-1) solid var(--input-border)`, borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-primary)', outline: 'none', transition: 'var(--transition-colors)' }} onFocus={(e) => { e.target.style.borderColor = 'var(--input-border-focus)'; e.target.style.boxShadow = 'var(--input-focus-ring)' }} onBlur={(e) => { e.target.style.borderColor = 'var(--input-border)'; e.target.style.boxShadow = 'none' }}>
            <option value="all">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default NotificationFilterSection
