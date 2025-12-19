import React, { useState } from "react"
import { FaQrcode, FaExclamationTriangle, FaCheck, FaTimes, FaHistory, FaKeyboard, FaArrowDown, FaArrowRight, FaInfoCircle } from "react-icons/fa"
import { useQRScanner } from "../../contexts/QRScannerProvider"
import StatusBadge from "../../components/common/StatusBadge"
import { getMediaUrl } from "../../utils/mediaUtils"

const ScannerEntries = () => {
  const { scannerEntries, pendingCrossHostelEntries, loading, error, fetchScannerEntries, updateCrossHostelReason } = useQRScanner()

  const [reasonInputs, setReasonInputs] = useState({})
  const [updatingReasons, setUpdatingReasons] = useState({})

  const handleReasonChange = (entryId, reason) => {
    setReasonInputs((prev) => ({
      ...prev,
      [entryId]: reason,
    }))
  }

  const handleUpdateReason = async (entry) => {
    const reason = reasonInputs[entry._id]
    if (!reason || !reason.trim()) {
      alert("Please provide a reason for the cross-hostel entry")
      return
    }

    try {
      setUpdatingReasons((prev) => ({ ...prev, [entry._id]: true }))
      await updateCrossHostelReason(entry._id, reason.trim())

      // Clear the reason input
      setReasonInputs((prev) => {
        const newInputs = { ...prev }
        delete newInputs[entry._id]
        return newInputs
      })
    } catch (error) {
      alert("Failed to update reason: " + error.message)
    } finally {
      setUpdatingReasons((prev) => {
        const newUpdating = { ...prev }
        delete newUpdating[entry._id]
        return newUpdating
      })
    }
  }

  const formatDateTime = (dateTimeString) => {
    const dateTime = new Date(dateTimeString)
    return {
      date: dateTime.toLocaleDateString(),
      time: dateTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
  }

  const CrossHostelReasonCard = ({ entry }) => {
    const isUpdating = updatingReasons[entry._id]
    const currentReason = reasonInputs[entry._id] || ""

    return (
      <div className="bg-orange-50 border-2 border-orange-400 rounded-lg p-4 mb-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <FaExclamationTriangle className="h-6 w-6 text-orange-600 mt-0.5" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-lg font-semibold text-orange-800 mb-2">Cross-Hostel Entry Requires Reason</h3>

            {/* Student Info */}
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 mr-3">
                {entry.userId.profileImage ? (
                  <img src={getMediaUrl(entry.userId.profileImage)} alt={entry.userId.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-50">
                    <FaQrcode className="text-blue-600 w-6 h-6" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">{entry.userId.name}</p>
                <p className="text-sm text-gray-600">{entry.userId.rollNumber}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                  <span>
                    Room: {entry.room}
                    {entry.bed}
                  </span>
                  <StatusBadge status={entry.status} />
                </div>
              </div>
            </div>

            <p className="text-orange-700 text-sm mb-3">This student belongs to a different hostel. Please provide a reason for allowing this check-in entry.</p>

            <div className="space-y-3">
              <div>
                <label htmlFor={`reason-${entry._id}`} className="block text-sm font-medium text-orange-800 mb-1">
                  Reason for Cross-Hostel Check-In <span className="text-red-500">*</span>
                </label>
                <textarea id={`reason-${entry._id}`} value={currentReason} onChange={(e) => handleReasonChange(entry._id, e.target.value)}
                  placeholder="Enter reason for allowing this cross-hostel check-in..."
                  className="w-full px-3 py-2 border border-orange-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                  rows="3"
                  disabled={isUpdating}
                  data-no-scanner="true"
                />
              </div>

              <div className="flex space-x-3">
                <button onClick={() => handleUpdateReason(entry)}
                  disabled={!currentReason.trim() || isUpdating}
                  className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-orange-300 disabled:cursor-not-allowed text-sm"
                >
                  {isUpdating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <FaCheck className="mr-2" />
                      Add Check-In Reason
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8 bg-[#EFF3F4]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">External QR Scanner Entries</h1>
          <p className="text-gray-600">Entries recorded from external QR scanners with keyboard input.</p>
        </div>

        {/* Scanner Instructions */}
        <div className="mb-6 bg-blue-50 p-4 rounded-lg border-l-4 border-[#1360AB]">
          <div className="flex items-start">
            <FaInfoCircle className="text-[#1360AB] mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-700 font-medium mb-2">External QR Scanner Instructions:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <FaKeyboard className="mr-2 text-[#1360AB]" />
                  <span>Check-in Scanner: Ends with</span>
                  <FaArrowDown className="mx-2 text-green-600" />
                  <span>(Down Arrow)</span>
                </div>
                <div className="flex items-center">
                  <FaKeyboard className="mr-2 text-[#1360AB]" />
                  <span>Check-out Scanner: Ends with</span>
                  <FaArrowRight className="mx-2 text-orange-600 transform rotate-90" />
                  <span>(Tab Key)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-lg border-l-4 border-red-500 flex items-start">
            <FaTimes className="mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Pending Cross-Hostel Entries */}
        {pendingCrossHostelEntries.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FaExclamationTriangle className="text-orange-600 mr-2" />
              Pending Cross-Hostel Check-In Entries ({pendingCrossHostelEntries.length})
            </h2>
            {pendingCrossHostelEntries.map((entry) => (
              <CrossHostelReasonCard key={entry._id} entry={entry} />
            ))}
          </div>
        )}

        {/* Recent Entries */}
        <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-2.5 mr-3 rounded-xl bg-blue-100 text-[#1360AB]">
                <FaHistory size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Recent Scanner Entries</h2>
            </div>
            <button onClick={fetchScannerEntries} disabled={loading} className="flex items-center px-4 py-2 bg-[#1360AB] text-white rounded-lg hover:bg-[#0d4b86] transition-colors disabled:bg-blue-300">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Loading...
                </>
              ) : (
                <>
                  <FaHistory className="mr-2" />
                  Refresh
                </>
              )}
            </button>
          </div>

          {loading && scannerEntries.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-[#1360AB] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading scanner entries...</p>
            </div>
          ) : scannerEntries.length === 0 ? (
            <div className="text-center py-8">
              <FaQrcode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No scanner entries found</p>
              <p className="text-gray-400 text-sm mt-2">Entries will appear here when scanned with external QR scanners</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scanner</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cross-Hostel</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {scannerEntries.map((entry) => {
                    const { date, time } = formatDateTime(entry.dateAndTime)
                    return (
                      <tr key={entry._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 mr-3">
                              {entry.userId.profileImage ? (
                                <img src={getMediaUrl(entry.userId.profileImage)} alt={entry.userId.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-blue-50">
                                  <FaQrcode className="text-blue-600 w-5 h-5" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{entry.userId.name}</div>
                              <div className="text-sm text-gray-500">{entry.userId.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {entry.room}
                            {entry.bed}-{entry.unit}
                          </div>
                          <div className="text-xs text-gray-400">{entry.hostelName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{date}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{time}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={entry.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm">
                            {entry.scannerType === "checkin" ? (
                              <div className="flex items-center text-green-600">
                                <FaArrowDown className="mr-1" />
                                <span>Check-in</span>
                              </div>
                            ) : entry.scannerType === "checkout" ? (
                              <div className="flex items-center text-orange-600">
                                <FaArrowRight className="mr-1 transform rotate-90" />
                                <span>Check-out</span>
                              </div>
                            ) : (
                              <span className="text-gray-500">Auto</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {entry.isSameHostel === false ? (
                            <div className="flex items-center">
                              <FaExclamationTriangle className="text-orange-500 mr-1" />
                              <span className="text-sm text-orange-600">Yes</span>
                              {entry.reason && (
                                <div className="ml-2 text-xs text-gray-500" title={entry.reason}>
                                  (Reason provided)
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">No</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ScannerEntries
