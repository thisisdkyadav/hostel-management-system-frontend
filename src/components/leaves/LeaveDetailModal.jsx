import { useState } from "react"
import Modal from "../common/Modal"
import { leaveApi } from "../../services/leaveApi"

const LeaveDetailModal = ({ leave, onClose, onUpdated, isAdmin, isSelfView }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [showDecisionModal, setShowDecisionModal] = useState(false)
  const [decisionType, setDecisionType] = useState("approve")
  const [decisionText, setDecisionText] = useState("")
  const [decisionLoading, setDecisionLoading] = useState(false)
  const [decisionError, setDecisionError] = useState(null)

  // Join leave states
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [joinInfo, setJoinInfo] = useState("")
  const [joinLoading, setJoinLoading] = useState(false)
  const [joinError, setJoinError] = useState(null)

  const isPending = leave.status === "Pending" || !leave.status
  const isApproved = leave.status === "Approved"
  const isJoined = leave.joinStatus === "Joined"
  const canModifyStatus = isAdmin && isPending && !isSelfView
  const canJoinLeave = isSelfView && isApproved && !isJoined

  const openDecisionModal = (type) => {
    setDecisionType(type)
    setDecisionText("")
    setDecisionError(null)
    setShowDecisionModal(true)
  }

  const submitDecision = async () => {
    if (!decisionText.trim()) {
      setDecisionError(decisionType === "approve" ? "Please provide approval info" : "Please provide a reason for rejection")
      return
    }
    try {
      setDecisionLoading(true)
      setDecisionError(null)
      const id = leave.id || leave._id
      if (decisionType === "approve") {
        await leaveApi.approveLeave(id, { approvalInfo: decisionText.trim() })
      } else {
        await leaveApi.rejectLeave(id, { reasonForRejection: decisionText.trim() })
      }
      setShowDecisionModal(false)
      onUpdated?.()
    } catch (e) {
      setDecisionError(e.message || (decisionType === "approve" ? "Failed to approve" : "Failed to reject"))
    } finally {
      setDecisionLoading(false)
    }
  }

  const submitJoinLeave = async () => {
    if (!joinInfo.trim()) {
      setJoinError("Please provide join information")
      return
    }
    try {
      setJoinLoading(true)
      setJoinError(null)
      const id = leave.id || leave._id
      await leaveApi.joinLeave(id, { joinInfo: joinInfo.trim() })
      setShowJoinModal(false)
      onUpdated?.()
    } catch (e) {
      setJoinError(e.message || "Failed to join leave")
    } finally {
      setJoinLoading(false)
    }
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case "Approved":
        return {
          backgroundColor: 'var(--color-success-bg)',
          color: 'var(--color-success-text)',
          border: `var(--border-1) solid var(--color-success-border, var(--color-success-bg))`
        }
      case "Rejected":
        return {
          backgroundColor: 'var(--color-danger-bg)',
          color: 'var(--color-danger-text)',
          border: `var(--border-1) solid var(--color-danger-border)`
        }
      default:
        return {
          backgroundColor: 'var(--color-warning-bg)',
          color: 'var(--color-warning-text)',
          border: `var(--border-1) solid var(--color-warning-bg)`
        }
    }
  }

  const iconSize = { width: 'var(--icon-md)', height: 'var(--icon-md)' }
  const iconSizeLg = { width: 'var(--icon-lg)', height: 'var(--icon-lg)' }

  return (
    <>
      <Modal title="Leave Request Details" onClose={onClose} width={800}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
          {error && (
            <div style={{ backgroundColor: 'var(--color-danger-bg-light)', border: `var(--border-1) solid var(--color-danger-border)`, padding: 'var(--spacing-4)', borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'flex-start' }}>
              <div style={{ flexShrink: 0 }}>
                <svg style={{ ...iconSizeLg, color: 'var(--color-danger)' }} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div style={{ marginLeft: 'var(--spacing-3)' }}>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-danger-text)' }}>{error}</p>
              </div>
            </div>
          )}

          {/* Header with status */}
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 'var(--spacing-4)', borderBottom: `var(--border-1) solid var(--color-border-primary)`, gap: 'var(--gap-md)', flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', margin: 0 }}>Leave Request</h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)', marginBottom: 0 }}>Submitted on {new Date(leave.createdAt || Date.now()).toLocaleDateString()}</p>
            </div>
            <div>
              <span style={{ display: 'inline-flex', alignItems: 'center', padding: 'var(--badge-padding-md)', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', ...getStatusStyle(leave.status || "Pending") }}>{leave.status || "Pending"}</span>
            </div>
          </div>

          {/* User Info */}
          <div style={{ background: 'linear-gradient(to right, var(--color-primary-bg), var(--color-primary-bg-light))', padding: 'var(--spacing-5)', borderRadius: 'var(--radius-xl)', border: `var(--border-1) solid var(--color-primary-pale)` }}>
            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-primary)', marginBottom: 'var(--spacing-3)', marginTop: 0, display: 'flex', alignItems: 'center' }}>
              <svg style={{ ...iconSize, marginRight: 'var(--spacing-2)' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Requested By
            </h4>
            <div style={{ color: 'var(--color-text-primary)', fontWeight: 'var(--font-weight-medium)' }}>{leave.requestedBy?.name || leave.user?.name || leave.userId?.name || "Me"}</div>
            {leave.userId?.email && <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)', marginTop: 'var(--spacing-1)' }}>{leave.userId.email}</div>}
          </div>

          {/* Leave Details */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-5)' }}>
            <div style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: 'var(--spacing-5)', borderRadius: 'var(--radius-xl)', border: `var(--border-1) solid var(--color-border-light)` }}>
              <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-3)', marginTop: 0, display: 'flex', alignItems: 'center' }}>
                <svg style={{ ...iconSize, marginRight: 'var(--spacing-2)', color: 'var(--color-success)' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                Start Date
              </h4>
              <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>
                {new Date(leave.startDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: 'var(--spacing-5)', borderRadius: 'var(--radius-xl)', border: `var(--border-1) solid var(--color-border-light)` }}>
              <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-3)', marginTop: 0, display: 'flex', alignItems: 'center' }}>
                <svg style={{ ...iconSize, marginRight: 'var(--spacing-2)', color: 'var(--color-danger)' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                End Date
              </h4>
              <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>
                {new Date(leave.endDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>

          {/* Duration */}
          <div style={{ backgroundColor: 'var(--color-info-bg-light)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-xl)', border: `var(--border-1) solid var(--color-info-bg)` }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <svg style={{ ...iconSizeLg, color: 'var(--color-info)', marginRight: 'var(--spacing-2)' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-info-text)' }}>Duration: {Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) + 1} day(s)</span>
            </div>
          </div>

          {/* Reason */}
          <div>
            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-3)', marginTop: 0, display: 'flex', alignItems: 'center' }}>
              <svg style={{ ...iconSize, marginRight: 'var(--spacing-2)', color: 'var(--color-text-tertiary)' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              Reason for Leave
            </h4>
            <div style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-xl)', border: `var(--border-1) solid var(--color-border-light)`, color: 'var(--color-text-body)', lineHeight: 'var(--line-height-relaxed)' }}>{leave.reason}</div>
          </div>

          {/* Join Information - Only show if joined */}
          {isJoined && leave.joinInfo && (
            <div>
              <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-3)', marginTop: 0, display: 'flex', alignItems: 'center' }}>
                <svg style={{ ...iconSize, marginRight: 'var(--spacing-2)', color: 'var(--color-info)' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Join Information
              </h4>
              <div style={{ backgroundColor: 'var(--color-info-bg-light)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-xl)', border: `var(--border-1) solid var(--color-info-bg)` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <div style={{ flexShrink: 0 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: 'var(--badge-padding-xs)', borderRadius: 'var(--radius-full)', fontSize: 'var(--badge-font-xs)', fontWeight: 'var(--font-weight-medium)', backgroundColor: 'var(--color-info-bg)', color: 'var(--color-info-text)', border: `var(--border-1) solid var(--color-info-bg)` }}>Joined</span>
                  </div>
                  <div style={{ marginLeft: 'var(--spacing-3)', flex: 1 }}>
                    <p style={{ color: 'var(--color-info-text)', lineHeight: 'var(--line-height-relaxed)', margin: 0 }}>{leave.joinInfo}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: 'var(--gap-sm)', paddingTop: 'var(--spacing-6)', borderTop: `var(--border-1) solid var(--color-border-primary)`, flexWrap: 'wrap' }}>
            <button onClick={onClose} style={{ padding: 'var(--button-padding-md)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-bg-primary)', border: `var(--border-1) solid var(--color-border-input)`, borderRadius: 'var(--radius-lg)', outline: 'none', transition: 'var(--transition-all)', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-hover)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-bg-primary)'}
              onFocus={(e) => e.target.style.boxShadow = 'var(--shadow-focus)'}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
            >
              Close
            </button>

            {canJoinLeave && (
              <button onClick={() => setShowJoinModal(true)}
                style={{
                  padding: 'var(--button-padding-md)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-white)',
                  backgroundColor: 'var(--color-info)',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  outline: 'none',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'var(--transition-all)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1
                }}
                onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = 'var(--color-info-hover)')}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-info)'}
                onFocus={(e) => e.target.style.boxShadow = 'var(--shadow-focus-primary)'}
                onBlur={(e) => e.target.style.boxShadow = 'var(--shadow-sm)'}
                disabled={loading}
              >
                <svg style={{ ...iconSize, marginRight: 'var(--spacing-2)', display: 'inline' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Join Leave
              </button>
            )}

            {canModifyStatus && (
              <>
                <button onClick={() => openDecisionModal("reject")}
                  style={{
                    padding: 'var(--button-padding-md)',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-white)',
                    backgroundColor: 'var(--color-danger)',
                    border: 'none',
                    borderRadius: 'var(--radius-lg)',
                    outline: 'none',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'var(--transition-all)',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = 'var(--color-danger-hover)')}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-danger)'}
                  onFocus={(e) => e.target.style.boxShadow = 'var(--shadow-focus-danger)'}
                  onBlur={(e) => e.target.style.boxShadow = 'var(--shadow-sm)'}
                  disabled={loading}
                >
                  <svg style={{ ...iconSize, marginRight: 'var(--spacing-2)', display: 'inline' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Reject
                </button>
                <button onClick={() => openDecisionModal("approve")}
                  style={{
                    padding: 'var(--button-padding-md)',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-white)',
                    backgroundColor: 'var(--color-success)',
                    border: 'none',
                    borderRadius: 'var(--radius-lg)',
                    outline: 'none',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'var(--transition-all)',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = 'var(--color-success-hover)')}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-success)'}
                  onFocus={(e) => e.target.style.boxShadow = 'var(--shadow-focus-success)'}
                  onBlur={(e) => e.target.style.boxShadow = 'var(--shadow-sm)'}
                  disabled={loading}
                >
                  <svg style={{ ...iconSize, marginRight: 'var(--spacing-2)', display: 'inline' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Approve
                </button>
              </>
            )}
          </div>
        </div>
      </Modal>

      {/* Decision Modal (Approve/Reject) */}
      {showDecisionModal && (
        <Modal title={ <div style={{ display: 'flex', alignItems: 'center' }}>
              {decisionType === "approve" ? (
                <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-success-text)' }}>
                  <svg style={{ ...iconSizeLg, marginRight: 'var(--spacing-2)' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Approve Leave Request
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-danger-text)' }}>
                  <svg style={{ ...iconSizeLg, marginRight: 'var(--spacing-2)' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Reject Leave Request
                </div>
              )}
            </div>
          }
          onClose={() => setShowDecisionModal(false)}
          width={650}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
            {decisionError && (
              <div style={{ backgroundColor: 'var(--color-danger-bg-light)', border: `var(--border-1) solid var(--color-danger-border)`, padding: 'var(--spacing-4)', borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'flex-start' }}>
                <div style={{ flexShrink: 0 }}>
                  <svg style={{ ...iconSizeLg, color: 'var(--color-danger)' }} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div style={{ marginLeft: 'var(--spacing-3)' }}>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-danger-text)', margin: 0 }}>{decisionError}</p>
                </div>
              </div>
            )}

            {/* Leave Summary */}
            <div style={{ padding: 'var(--spacing-4)', borderRadius: 'var(--radius-xl)', border: `var(--border-1) solid ${decisionType === "approve" ? 'var(--color-success-bg)' : 'var(--color-danger-border)'}`, backgroundColor: decisionType === "approve" ? 'var(--color-success-bg-light)' : 'var(--color-danger-bg-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)', margin: 0 }}>{leave.requestedBy?.name || leave.user?.name || leave.userId?.name || "User"}</h4>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)', marginTop: 'var(--spacing-1)', marginBottom: 0 }}>
                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', margin: 0 }}>{Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) + 1} day(s)</p>
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-3)' }}>
                <svg style={{ ...iconSize, marginRight: 'var(--spacing-2)', color: 'var(--color-text-tertiary)' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                {decisionType === "approve" ? "Approval Notes" : "Reason for Rejection"}
              </label>
              <textarea style={{ width: '100%', padding: 'var(--spacing-4)', border: `var(--border-1) solid var(--color-border-input)`, borderRadius: 'var(--radius-xl)', outline: 'none', transition: 'var(--transition-all)', resize: 'none', height: '8rem', color: 'var(--color-text-body)', fontFamily: 'inherit' }} placeholder={decisionType === "approve" ? "Add any notes or conditions for this approval..." : "Please provide a clear reason for rejecting this leave request..."} value={decisionText} onChange={(e) => setDecisionText(e.target.value)}
                onFocus={(e) => {
                  e.target.style.boxShadow = 'var(--input-focus-ring)';
                  e.target.style.borderColor = 'var(--input-border-focus)';
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = 'none';
                  e.target.style.borderColor = 'var(--color-border-input)';
                }}
                required
              />
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-2)', marginBottom: 0 }}>{decisionType === "approve" ? "This note will be shared with the employee along with the approval." : "This reason will help the employee understand why their request was declined."}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: 'var(--gap-sm)', paddingTop: 'var(--spacing-6)', borderTop: `var(--border-1) solid var(--color-border-primary)`, flexWrap: 'wrap' }}>
              <button type="button" style={{ padding: 'var(--button-padding-md)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-bg-primary)', border: `var(--border-1) solid var(--color-border-input)`, borderRadius: 'var(--radius-lg)', outline: 'none', transition: 'var(--transition-all)', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-hover)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-bg-primary)'}
                onFocus={(e) => e.target.style.boxShadow = 'var(--shadow-focus)'}
                onBlur={(e) => e.target.style.boxShadow = 'none'}
                onClick={() => setShowDecisionModal(false)}
              >
                Cancel
              </button>
              <button type="button" style={{ padding: 'var(--button-padding-md)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-white)', backgroundColor: decisionType === "approve" ? 'var(--color-success)' : 'var(--color-danger)', borderRadius: 'var(--radius-lg)', outline: 'none', boxShadow: 'var(--shadow-sm)', transition: 'var(--transition-all)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: decisionLoading ? 'not-allowed' : 'pointer', opacity: decisionLoading ? 0.6 : 1 }} onMouseEnter={(e) => !decisionLoading && (e.target.style.backgroundColor = decisionType === "approve" ? 'var(--color-success-hover)' : 'var(--color-danger-hover)')}
                onMouseLeave={(e) => e.target.style.backgroundColor = decisionType === "approve" ? 'var(--color-success)' : 'var(--color-danger)'}
                onFocus={(e) => e.target.style.boxShadow = decisionType === "approve" ? 'var(--shadow-focus-success)' : 'var(--shadow-focus-danger)'}
                onBlur={(e) => e.target.style.boxShadow = 'var(--shadow-sm)'}
                onClick={submitDecision}
                disabled={decisionLoading}
              >
                {decisionLoading ? (
                  <>
                    <div style={{ width: 'var(--icon-md)', height: 'var(--icon-md)', border: '2px solid var(--color-white)', borderTopColor: 'transparent', borderRadius: 'var(--radius-full)', animation: 'spin 1s linear infinite', marginRight: 'var(--spacing-2)' }}></div>
                    Processing...
                  </>
                ) : (
                  <>
                    {decisionType === "approve" ? (
                      <svg style={{ ...iconSize, marginRight: 'var(--spacing-2)' }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg style={{ ...iconSize, marginRight: 'var(--spacing-2)' }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                    {decisionType === "approve" ? "Confirm Approval" : "Confirm Rejection"}
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Join Modal */}
      {showJoinModal && (
        <Modal title={ <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-info-text)' }}>
              <svg style={{ ...iconSizeLg, marginRight: 'var(--spacing-2)' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Join Leave Request
            </div>
          }
          onClose={() => setShowJoinModal(false)}
          width={600}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
            {joinError && (
              <div style={{ backgroundColor: 'var(--color-danger-bg-light)', border: `var(--border-1) solid var(--color-danger-border)`, padding: 'var(--spacing-4)', borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'flex-start' }}>
                <div style={{ flexShrink: 0 }}>
                  <svg style={{ ...iconSizeLg, color: 'var(--color-danger)' }} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div style={{ marginLeft: 'var(--spacing-3)' }}>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-danger-text)', margin: 0 }}>{joinError}</p>
                </div>
              </div>
            )}

            {/* Leave Summary */}
            <div style={{ padding: 'var(--spacing-4)', borderRadius: 'var(--radius-xl)', border: `var(--border-1) solid var(--color-info-bg)`, backgroundColor: 'var(--color-info-bg-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)', margin: 0 }}>Join Your Leave</h4>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)', marginTop: 'var(--spacing-1)', marginBottom: 0 }}>
                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', padding: 'var(--badge-padding-xs)', borderRadius: 'var(--radius-full)', fontSize: 'var(--badge-font-xs)', fontWeight: 'var(--font-weight-medium)', backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success-text)', border: `var(--border-1) solid var(--color-success-bg)` }}>Approved</span>
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-3)' }}>
                <svg style={{ ...iconSize, marginRight: 'var(--spacing-2)', color: 'var(--color-text-tertiary)' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                Join Information
              </label>
              <textarea style={{ width: '100%', padding: 'var(--spacing-4)', border: `var(--border-1) solid var(--color-border-input)`, borderRadius: 'var(--radius-xl)', outline: 'none', transition: 'var(--transition-all)', resize: 'none', height: '8rem', color: 'var(--color-text-body)', fontFamily: 'inherit' }} placeholder="Please provide information about joining this leave (e.g., actual dates, location, additional details)..." value={joinInfo} onChange={(e) => setJoinInfo(e.target.value)}
                onFocus={(e) => {
                  e.target.style.boxShadow = 'var(--input-focus-ring)';
                  e.target.style.borderColor = 'var(--input-border-focus)';
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = 'none';
                  e.target.style.borderColor = 'var(--color-border-input)';
                }}
                required
              />
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-2)', marginBottom: 0 }}>This information will be recorded with your leave request and may be used for administrative purposes.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: 'var(--gap-sm)', paddingTop: 'var(--spacing-6)', borderTop: `var(--border-1) solid var(--color-border-primary)`, flexWrap: 'wrap' }}>
              <button type="button" style={{ padding: 'var(--button-padding-md)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-bg-primary)', border: `var(--border-1) solid var(--color-border-input)`, borderRadius: 'var(--radius-lg)', outline: 'none', transition: 'var(--transition-all)', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-hover)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-bg-primary)'}
                onFocus={(e) => e.target.style.boxShadow = 'var(--shadow-focus)'}
                onBlur={(e) => e.target.style.boxShadow = 'none'}
                onClick={() => setShowJoinModal(false)}
              >
                Cancel
              </button>
              <button type="button" style={{ padding: 'var(--button-padding-md)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-white)', backgroundColor: 'var(--color-info)', borderRadius: 'var(--radius-lg)', outline: 'none', boxShadow: 'var(--shadow-sm)', transition: 'var(--transition-all)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: joinLoading ? 'not-allowed' : 'pointer', opacity: joinLoading ? 0.6 : 1 }} onMouseEnter={(e) => !joinLoading && (e.target.style.backgroundColor = 'var(--color-info-hover)')}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-info)'}
                onFocus={(e) => e.target.style.boxShadow = 'var(--shadow-focus-primary)'}
                onBlur={(e) => e.target.style.boxShadow = 'var(--shadow-sm)'}
                onClick={submitJoinLeave}
                disabled={joinLoading}
              >
                {joinLoading ? (
                  <>
                    <div style={{ width: 'var(--icon-md)', height: 'var(--icon-md)', border: '2px solid var(--color-white)', borderTopColor: 'transparent', borderRadius: 'var(--radius-full)', animation: 'spin 1s linear infinite', marginRight: 'var(--spacing-2)' }}></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg style={{ ...iconSize, marginRight: 'var(--spacing-2)' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Confirm Join
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

export default LeaveDetailModal
