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

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "Rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
    }
  }

  return (
    <>
      <Modal title="Leave Request Details" onClose={onClose} width={800}>
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Header with status */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Leave Request</h3>
              <p className="text-sm text-gray-500 mt-1">Submitted on {new Date(leave.createdAt || Date.now()).toLocaleDateString()}</p>
            </div>
            <div className="mt-3 sm:mt-0">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(leave.status || "Pending")}`}>{leave.status || "Pending"}</span>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100">
            <h4 className="text-sm font-semibold text-[#1360AB] mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Requested By
            </h4>
            <div className="text-gray-900 font-medium">{leave.requestedBy?.name || leave.user?.name || leave.userId?.name || "Me"}</div>
            {leave.userId?.email && <div className="text-sm text-gray-600 mt-1">{leave.userId.email}</div>}
          </div>

          {/* Leave Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                Start Date
              </h4>
              <div className="text-lg font-medium text-gray-900">
                {new Date(leave.startDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>

            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                End Date
              </h4>
              <div className="text-lg font-medium text-gray-900">
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
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-blue-800">Duration: {Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) + 1} day(s)</span>
            </div>
          </div>

          {/* Reason */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              Reason for Leave
            </h4>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-800 leading-relaxed">{leave.reason}</div>
          </div>

          {/* Join Information - Only show if joined */}
          {isJoined && leave.joinInfo && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Join Information
              </h4>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">Joined</span>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-blue-800 leading-relaxed">{leave.joinInfo}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
            <button onClick={onClose} className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200">
              Close
            </button>

            {canJoinLeave && (
              <button
                onClick={() => setShowJoinModal(true)}
                className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-all duration-200"
                disabled={loading}
              >
                <svg className="w-4 h-4 mr-2 inline" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Join Leave
              </button>
            )}

            {canModifyStatus && (
              <>
                <button
                  onClick={() => openDecisionModal("reject")}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-sm transition-all duration-200"
                  disabled={loading}
                >
                  <svg className="w-4 h-4 mr-2 inline" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Reject
                </button>
                <button
                  onClick={() => openDecisionModal("approve")}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-sm transition-all duration-200"
                  disabled={loading}
                >
                  <svg className="w-4 h-4 mr-2 inline" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Approve
                </button>
              </>
            )}
          </div>
        </div>
      </Modal>
      {showDecisionModal && (
        <Modal
          title={
            <div className="flex items-center">
              {decisionType === "approve" ? (
                <div className="flex items-center text-green-700">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Approve Leave Request
                </div>
              ) : (
                <div className="flex items-center text-red-700">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
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
          <div className="space-y-6">
            {decisionError && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{decisionError}</p>
                </div>
              </div>
            )}

            {/* Leave Summary */}
            <div className={`p-4 rounded-xl border ${decisionType === "approve" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{leave.requestedBy?.name || leave.user?.name || leave.userId?.name || "User"}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">{Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) + 1} day(s)</p>
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-center text-gray-700 text-sm font-semibold mb-3">
                <svg className="w-4 h-4 mr-2 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                {decisionType === "approve" ? "Approval Notes" : "Reason for Rejection"}
              </label>
              <textarea
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all resize-none h-32 text-gray-800"
                placeholder={decisionType === "approve" ? "Add any notes or conditions for this approval..." : "Please provide a clear reason for rejecting this leave request..."}
                value={decisionText}
                onChange={(e) => setDecisionText(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500 mt-2">{decisionType === "approve" ? "This note will be shared with the employee along with the approval." : "This reason will help the employee understand why their request was declined."}</p>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
              <button type="button" className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200" onClick={() => setShowDecisionModal(false)}>
                Cancel
              </button>
              <button
                type="button"
                className={`px-6 py-2.5 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm transition-all duration-200 flex items-center justify-center ${
                  decisionType === "approve" ? "bg-green-600 hover:bg-green-700 focus:ring-green-500" : "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                }`}
                onClick={submitDecision}
                disabled={decisionLoading}
              >
                {decisionLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    {decisionType === "approve" ? (
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
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

      {showJoinModal && (
        <Modal
          title={
            <div className="flex items-center text-blue-700">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Join Leave Request
            </div>
          }
          onClose={() => setShowJoinModal(false)}
          width={600}
        >
          <div className="space-y-6">
            {joinError && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{joinError}</p>
                </div>
              </div>
            )}

            {/* Leave Summary */}
            <div className="p-4 rounded-xl border bg-blue-50 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Join Your Leave</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">Approved</span>
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-center text-gray-700 text-sm font-semibold mb-3">
                <svg className="w-4 h-4 mr-2 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                Join Information
              </label>
              <textarea
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all resize-none h-32 text-gray-800"
                placeholder="Please provide information about joining this leave (e.g., actual dates, location, additional details)..."
                value={joinInfo}
                onChange={(e) => setJoinInfo(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500 mt-2">This information will be recorded with your leave request and may be used for administrative purposes.</p>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
              <button type="button" className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200" onClick={() => setShowJoinModal(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-all duration-200 flex items-center justify-center"
                onClick={submitJoinLeave}
                disabled={joinLoading}
              >
                {joinLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
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
