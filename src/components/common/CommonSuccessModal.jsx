import React from "react"
import { HiCheckCircle } from "react-icons/hi"
import { Modal } from "@/components/ui"
import { Button } from "czero/react"

const CommonSuccessModal = ({ show, onClose, title = "Success", message = "Operation completed successfully.", buttonText = "Done", infoText = "", infoIcon = null, width = 500 }) => {
  if (!show) return null

  const InfoIcon = infoIcon

  return (
    <Modal title={title} onClose={onClose} width={width}>
      <div style={{ textAlign: 'center', padding: 'var(--spacing-4) 0' }}>
        <div style={{ margin: '0 auto', backgroundColor: 'var(--color-success-bg-light)', color: 'var(--color-success)', width: 'var(--spacing-16)', height: 'var(--spacing-16)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-full)', marginBottom: 'var(--spacing-6)' }}>
          <HiCheckCircle size={40} />
        </div>

        <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-3)' }}>{title}</h3>

        {infoText && (
          <div style={{ backgroundColor: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-4)', marginBottom: 'var(--spacing-6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--spacing-6)', maxWidth: '28rem' }}>
            {InfoIcon && <InfoIcon style={{ color: 'var(--color-text-disabled)', marginRight: 'var(--spacing-2)', flexShrink: 0 }} size={20} />}
            <span style={{ color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-medium)', wordBreak: 'break-all' }}>{infoText}</span>
          </div>
        )}

        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-8)', maxWidth: '28rem', margin: '0 auto var(--spacing-8)' }}>{message}</p>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button onClick={onClose} variant="primary" size="md">
            {buttonText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default CommonSuccessModal
