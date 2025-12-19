import React from "react"
import Modal from "../../common/Modal"
import { getMediaUrl } from "../../../utils/mediaUtils"

const PaymentInfoModal = ({ isOpen, onClose, paymentScreenshot }) => {
  if (!isOpen) return null

  return (
    <Modal title="Payment Screenshot" onClose={onClose} width={800}>
      <div style={{ padding: 'var(--spacing-4)' }}>
        {paymentScreenshot ? (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <img src={getMediaUrl(paymentScreenshot)} alt="Payment Screenshot" style={{ maxWidth: '100%', maxHeight: '24rem', objectFit: 'contain', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)' }} />
          </div>
        ) : (
          <div style={{ textAlign: 'center', paddingTop: 'var(--spacing-8)', paddingBottom: 'var(--spacing-8)' }}>
            <div style={{ width: 'var(--avatar-4xl)', height: 'var(--avatar-4xl)', backgroundColor: 'var(--color-bg-muted)', borderRadius: 'var(--radius-full)', margin: '0 auto var(--spacing-4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ width: 'var(--icon-2xl)', height: 'var(--icon-2xl)', color: 'var(--color-text-placeholder)' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-base)' }}>No payment screenshot available</p>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default PaymentInfoModal
