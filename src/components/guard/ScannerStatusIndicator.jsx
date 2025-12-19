import React from "react"
import { FaKeyboard, FaArrowDown, FaArrowRight, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa"
import { useQRScanner } from "../../contexts/QRScannerProvider"

const ScannerStatusIndicator = () => {
  const { pendingCrossHostelEntries, error } = useQRScanner()

  return (
    <div style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-4)', boxShadow: 'var(--shadow-sm)', border: `var(--border-1) solid var(--color-border-primary)` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-3)' }}>
        <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)' }}>External Scanner Status</h3>
        <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-success)' }}>
          <div style={{ width: 'var(--spacing-2)', height: 'var(--spacing-2)', backgroundColor: 'var(--color-success)', borderRadius: 'var(--radius-full)', marginRight: 'var(--spacing-2)', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
          <span style={{ fontSize: 'var(--font-size-xs)' }}>Active</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FaKeyboard style={{ marginRight: 'var(--spacing-2)', color: 'var(--color-info)' }} />
            <span>Check-in Scanner</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FaArrowDown style={{ color: 'var(--color-success)' }} />
            <span style={{ marginLeft: 'var(--spacing-1)' }}>Down Arrow</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FaKeyboard style={{ marginRight: 'var(--spacing-2)', color: 'var(--color-info)' }} />
            <span>Check-out Scanner</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FaArrowRight style={{ color: 'var(--color-warning)', transform: 'rotate(90deg)' }} />
            <span style={{ marginLeft: 'var(--spacing-1)' }}>Tab Key</span>
          </div>
        </div>
      </div>

      {pendingCrossHostelEntries.length > 0 && (
        <div style={{ marginTop: 'var(--spacing-3)', paddingTop: 'var(--spacing-3)', borderTop: `var(--border-1) solid var(--color-border-primary)` }}>
          <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-warning)' }}>
            <FaExclamationTriangle style={{ marginRight: 'var(--spacing-2)' }} />
            <span style={{ fontSize: 'var(--font-size-xs)' }}>
              {pendingCrossHostelEntries.length} cross-hostel check-in {pendingCrossHostelEntries.length === 1 ? "entry" : "entries"} pending reason
            </span>
          </div>
        </div>
      )}

      {error && (
        <div style={{ marginTop: 'var(--spacing-3)', paddingTop: 'var(--spacing-3)', borderTop: `var(--border-1) solid var(--color-border-primary)` }}>
          <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-danger)' }}>
            <FaExclamationTriangle style={{ marginRight: 'var(--spacing-2)' }} />
            <span style={{ fontSize: 'var(--font-size-xs)' }}>Scanner Error</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default ScannerStatusIndicator
