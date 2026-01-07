import React from "react"
import { Button, Modal } from "@/components/ui"
import { FaCheck } from "react-icons/fa"

const PasswordChangeSuccess = ({ email, onClose }) => {
  return (
    <Modal title="Password Updated" onClose={onClose} width={500}>
      <div style={{ textAlign: 'center', paddingTop: 'var(--spacing-4)', paddingBottom: 'var(--spacing-4)' }}>
        <div style={{ margin: '0 auto', backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)', width: 'var(--avatar-xl)', height: 'var(--avatar-xl)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-full)', marginBottom: 'var(--spacing-6)' }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{ height: 'var(--icon-2xl)', width: 'var(--icon-2xl)' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-2)' }}>
          Password Changed Successfully
        </h3>

        <div style={{ backgroundColor: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-4)', marginBottom: 'var(--spacing-6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', maxWidth: 'var(--container-md)' }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{
              height: 'var(--icon-lg)',
              width: 'var(--icon-lg)',
              color: 'var(--color-text-placeholder)',
              marginRight: 'var(--spacing-2)',
              flexShrink: 0
            }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span style={{ color: 'var(--color-text-primary)', fontWeight: 'var(--font-weight-medium)', wordBreak: 'break-all' }}>
            {email}
          </span>
        </div>

        <p style={{ color: 'var(--color-text-body)', marginBottom: 'var(--spacing-8)', maxWidth: 'var(--container-md)', margin: '0 auto var(--spacing-8) auto' }}>
          Your password has been successfully updated. You will use this new password the next time you log in.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button onClick={onClose} variant="primary" size="medium" icon={<FaCheck />}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default PasswordChangeSuccess
