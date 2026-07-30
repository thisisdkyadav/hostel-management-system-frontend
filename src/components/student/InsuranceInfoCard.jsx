import React from "react"
import { MdHealthAndSafety } from "react-icons/md"
import { FaRegCalendarAlt, FaHashtag } from "react-icons/fa"
import { formatDateTime } from "../../utils/dateUtils"

const getValidity = (endDate) => {
  if (!endDate) return null

  const end = new Date(endDate)
  if (Number.isNaN(end.getTime())) return null

  return end.getTime() >= Date.now()
    ? { label: "Active", bg: "var(--color-success-bg)", color: "var(--color-success-text)" }
    : { label: "Expired", bg: "var(--color-danger-bg)", color: "var(--color-danger-text)" }
}

const InsuranceInfoCard = ({ insurance }) => {
  if (!insurance) return null

  const provider = insurance.provider
  const periodLabel =
    provider?.startDate && provider?.endDate ? `${formatDateTime(provider.startDate).date} - ${formatDateTime(provider.endDate).date}` : null
  const validity = getValidity(provider?.endDate)

  return (
    <div style={{ backgroundColor: 'var(--color-bg-primary)', boxShadow: 'var(--shadow-sm)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-xl)', width: '100%', border: `var(--border-1) solid var(--color-border-light)` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--gap-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-sm)' }}>
          <MdHealthAndSafety style={{ fontSize: 'var(--icon-lg)', color: 'var(--color-primary)' }} />
          <h3 style={{ color: 'var(--color-text-tertiary)', fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-lg)' }}>Insurance</h3>
        </div>
        {validity && (
          <span style={{ fontSize: 'var(--font-size-xs)', padding: `var(--spacing-0-5) var(--spacing-2)`, borderRadius: 'var(--radius-full)', backgroundColor: validity.bg, color: validity.color, whiteSpace: 'nowrap' }}>{validity.label}</span>
        )}
      </div>

      {provider?.name && (
        <p style={{ marginTop: 'var(--spacing-3)', fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{provider.name}</p>
      )}

      <div style={{ marginTop: 'var(--spacing-2)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1-5)' }}>
        {insurance.insuranceNumber && (
          <div style={{ display: 'flex', alignItems: 'center', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>
            <FaHashtag style={{ color: 'var(--color-text-muted)', marginRight: 'var(--spacing-1-5)', fontSize: 'var(--icon-sm)', flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{insurance.insuranceNumber}</span>
          </div>
        )}
        {periodLabel && (
          <div style={{ display: 'flex', alignItems: 'center', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>
            <FaRegCalendarAlt style={{ color: 'var(--color-text-muted)', marginRight: 'var(--spacing-1-5)', fontSize: 'var(--icon-sm)', flexShrink: 0 }} />
            <span>{periodLabel}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default InsuranceInfoCard
