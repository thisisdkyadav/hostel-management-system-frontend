import React from "react"
import { getMediaUrl } from "../../../../utils/mediaUtils"

const PaymentInfoViewer = ({ paymentInfo, onViewScreenshot }) => {
  if (!paymentInfo) {
    return (
      <div style={{
        backgroundColor: 'var(--color-warning-bg-light)',
        border: `var(--border-1) solid var(--color-warning-bg)`,
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--spacing-4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
          <div style={{
            width: 'var(--avatar-sm)',
            height: 'var(--avatar-sm)',
            backgroundColor: 'var(--color-warning-bg)',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg style={{ width: 'var(--icon-md)', height: 'var(--icon-md)', color: 'var(--color-warning)' }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 style={{
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-warning-text)',
              fontSize: 'var(--font-size-base)'
            }}>Payment Information Not Submitted</h4>
            <p style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-warning)',
              marginTop: 'var(--spacing-0-5)'
            }}>Student has not yet submitted payment information</p>
          </div>
        </div>
      </div>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <div style={{
      backgroundColor: 'var(--color-success-bg-light)',
      border: `var(--border-1) solid var(--color-success-bg)`,
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--spacing-6)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-3)',
        marginBottom: 'var(--spacing-4)'
      }}>
        <div style={{
          width: 'var(--avatar-sm)',
          height: 'var(--avatar-sm)',
          backgroundColor: 'var(--color-success-bg)',
          borderRadius: 'var(--radius-full)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg style={{ width: 'var(--icon-md)', height: 'var(--icon-md)', color: 'var(--color-success)' }} fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zM14 6a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h8zM6 8a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4a2 2 0 012-2h2z" />
          </svg>
        </div>
        <div>
          <h4 style={{
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-success-text)',
            fontSize: 'var(--font-size-base)'
          }}>Payment Information</h4>
          <p style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-success)',
            marginTop: 'var(--spacing-0-5)'
          }}>Student payment details and verification</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
        {/* Payment Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-4)' }}>
          <div style={{
            backgroundColor: 'var(--color-bg-primary)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-4)',
            border: `var(--border-1) solid var(--color-success-bg)`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-2)' }}>
              <svg style={{ width: 'var(--icon-md)', height: 'var(--icon-md)', color: 'var(--color-success)' }} fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.51-1.31c-.562-.649-1.413-1.076-2.353-1.253V5z"
                  clipRule="evenodd"
                />
              </svg>
              <span style={{
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-body)'
              }}>Payment Amount</span>
            </div>
            <p style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)'
            }}>{formatAmount(paymentInfo.amount)}</p>
          </div>

          <div style={{
            backgroundColor: 'var(--color-bg-primary)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-4)',
            border: `var(--border-1) solid var(--color-success-bg)`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-2)' }}>
              <svg style={{ width: 'var(--icon-md)', height: 'var(--icon-md)', color: 'var(--color-success)' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span style={{
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-body)'
              }}>Payment Date</span>
            </div>
            <p style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)'
            }}>{formatDate(paymentInfo.dateOfPayment)}</p>
          </div>
        </div>

        {/* Transaction ID */}
        <div style={{
          backgroundColor: 'var(--color-bg-primary)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-4)',
          border: `var(--border-1) solid var(--color-success-bg)`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-2)' }}>
            <svg style={{ width: 'var(--icon-md)', height: 'var(--icon-md)', color: 'var(--color-success)' }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <span style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-body)'
            }}>Transaction ID</span>
          </div>
          <p style={{
            fontSize: 'var(--font-size-xl)',
            fontFamily: 'monospace',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-text-primary)',
            backgroundColor: 'var(--color-bg-tertiary)',
            padding: 'var(--spacing-2) var(--spacing-3)',
            borderRadius: 'var(--radius-md)',
            border: `var(--border-1) solid var(--color-border-primary)`
          }}>{paymentInfo.transactionId}</p>
        </div>

        {/* Payment Screenshot */}
        <div style={{
          backgroundColor: 'var(--color-bg-primary)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-4)',
          border: `var(--border-1) solid var(--color-success-bg)`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
              <svg style={{ width: 'var(--icon-md)', height: 'var(--icon-md)', color: 'var(--color-success)' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              <span style={{
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-body)'
              }}>Payment Screenshot</span>
            </div>
            <button onClick={onViewScreenshot} style={{
              padding: 'var(--spacing-1) var(--spacing-3)',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-white)',
              fontSize: 'var(--font-size-sm)',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              cursor: 'pointer',
              transition: 'var(--transition-colors)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-1)',
              fontWeight: 'var(--font-weight-medium)'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-primary-hover)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-primary)'}>
              <svg style={{ width: 'var(--icon-md)', height: 'var(--icon-md)' }} fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              <span>View Screenshot</span>
            </button>
          </div>
          <div style={{
            backgroundColor: 'var(--color-bg-tertiary)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--spacing-3)',
            textAlign: 'center'
          }}>
            <div style={{
              width: 'var(--icon-3xl)',
              height: 'var(--icon-3xl)',
              backgroundColor: 'var(--color-bg-muted)',
              borderRadius: 'var(--radius-lg)',
              margin: '0 auto var(--spacing-2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg style={{ width: 'var(--icon-xl)', height: 'var(--icon-xl)', color: 'var(--color-text-light)' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
            <p style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-muted)'
            }}>Payment screenshot available</p>
          </div>
        </div>

        {/* Additional Information */}
        {paymentInfo.additionalInfo && (
          <div style={{
            backgroundColor: 'var(--color-bg-primary)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-4)',
            border: `var(--border-1) solid var(--color-success-bg)`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-2)' }}>
              <svg style={{ width: 'var(--icon-md)', height: 'var(--icon-md)', color: 'var(--color-success)' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span style={{
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-body)'
              }}>Additional Information</span>
            </div>
            <p style={{
              color: 'var(--color-text-primary)',
              backgroundColor: 'var(--color-bg-tertiary)',
              padding: 'var(--spacing-3)',
              borderRadius: 'var(--radius-md)',
              border: `var(--border-1) solid var(--color-border-primary)`,
              fontSize: 'var(--font-size-base)'
            }}>{paymentInfo.additionalInfo}</p>
          </div>
        )}

        {/* Submission Timestamp */}
        {paymentInfo.submittedAt && (
          <div style={{
            textAlign: 'center',
            paddingTop: 'var(--spacing-2)',
            borderTop: `var(--border-1) solid var(--color-success-bg)`
          }}>
            <p style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-light)'
            }}>
              Submitted on {formatDate(paymentInfo.submittedAt)} at{" "}
              {new Date(paymentInfo.submittedAt).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default PaymentInfoViewer
