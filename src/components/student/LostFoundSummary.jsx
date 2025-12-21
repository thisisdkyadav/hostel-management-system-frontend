import React from "react"
import { Link } from "react-router-dom"
import { FiSearch } from "react-icons/fi"
import { CgSearchFound } from "react-icons/cg"

const LostFoundSummary = ({ lostAndFoundStats }) => {
  return (
    <div style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', padding: 'var(--spacing-4)', border: `var(--border-1) solid var(--color-border-light)` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-3)' }}>
        <h3 style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'center' }}>
          <FiSearch style={{ marginRight: 'var(--spacing-1-5)', color: 'var(--color-primary)', fontSize: 'var(--icon-sm)' }} /> Lost & Found
        </h3>
        <Link to="lost-and-found" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', textDecoration: 'none', transition: 'var(--transition-colors)' }} onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}>
          View All
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--gap-sm)' }}>
        <div style={{ backgroundColor: 'var(--color-orange-bg)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-2-5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ backgroundColor: 'var(--color-warning-bg)', padding: 'var(--spacing-1-5)', borderRadius: 'var(--radius-full)', marginBottom: 'var(--spacing-1)' }}>
            <CgSearchFound style={{ color: 'var(--color-orange-text)', fontSize: 'var(--icon-lg)' }} />
          </div>
          <span style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-orange-text)' }}>{lostAndFoundStats?.active || 0}</span>
          <span style={{ fontSize: 'var(--font-size-2xs)', color: 'var(--color-text-tertiary)' }}>Active Items</span>
        </div>

        <div style={{ backgroundColor: 'var(--color-success-bg)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-2-5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ backgroundColor: 'var(--color-success-light)', padding: 'var(--spacing-1-5)', borderRadius: 'var(--radius-full)', marginBottom: 'var(--spacing-1)' }}>
            <FiSearch style={{ color: 'var(--color-success)', fontSize: 'var(--icon-lg)' }} />
          </div>
          <span style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-success)' }}>{lostAndFoundStats?.claimed || 0}</span>
          <span style={{ fontSize: 'var(--font-size-2xs)', color: 'var(--color-text-tertiary)' }}>Claimed Items</span>
        </div>
      </div>

      <div style={{ marginTop: 'var(--spacing-3)', paddingTop: 'var(--spacing-2)', borderTop: `var(--border-1) solid var(--color-border-light)` }}>
        <Link to="lost-and-found" style={{ display: 'block', width: '100%', textAlign: 'center', padding: 'var(--spacing-1-5)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', transition: 'var(--transition-all)', backgroundColor: 'var(--color-primary-bg)', color: 'var(--color-primary)', textDecoration: 'none' }} onMouseEnter={(e) => { 
          e.currentTarget.style.backgroundColor = 'var(--color-primary)'; 
          e.currentTarget.style.color = 'var(--color-white)' 
        }} onMouseLeave={(e) => { 
          e.currentTarget.style.backgroundColor = 'var(--color-primary-bg)'; 
          e.currentTarget.style.color = 'var(--color-primary)' 
        }}>
          Browse Active Items
        </Link>
      </div>
    </div>
  )
}

export default LostFoundSummary
