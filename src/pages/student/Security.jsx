import React, { useState } from "react"
import { FaQrcode, FaHistory, FaSignInAlt, FaSignOutAlt, FaCalendarAlt, FaClock } from "react-icons/fa"
import QRCodeGenerator from "../../components/QRCodeGenerator"

const Security = () => {
  const [activeTab, setActiveTab] = useState("all")

  const accessHistory = [
    { id: 1, type: "entry", location: "Main Gate", timestamp: "2023-07-01T08:30:00" },
    { id: 2, type: "exit", location: "Main Gate", timestamp: "2023-07-01T17:45:00" },
    { id: 3, type: "entry", location: "Hostel Gate", timestamp: "2023-07-02T09:15:00" },
    { id: 4, type: "exit", location: "Hostel Gate", timestamp: "2023-07-02T20:30:00" },
    { id: 5, type: "entry", location: "Main Gate", timestamp: "2023-07-03T08:45:00" },
    { id: 6, type: "exit", location: "Main Gate", timestamp: "2023-07-03T16:30:00" },
  ]

  const filteredHistory = activeTab === "all" ? accessHistory : accessHistory.filter((item) => item.type === activeTab)

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Campus Security Access</h1>
        <p className="text-gray-600">Generate your QR code for campus entry and exit, and view your access history.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* QR Code Section */}
        <div className="lg:col-span-1">
          <QRCodeGenerator />
        </div>

        {/* Access History Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 h-full">
            <div className="flex items-center mb-4">
              <div className="p-2.5 mr-3 rounded-xl bg-blue-100 text-[#1360AB]">
                <FaHistory size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Access History</h2>
            </div>

            {/* Tabs */}
            <div className="flex mb-5 bg-gray-100 p-1 rounded-lg">
              <button onClick={() => setActiveTab("all")} className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === "all" ? "bg-white text-[#1360AB] shadow-sm" : "text-gray-600 hover:bg-gray-200"}`}>
                All Activity
              </button>
              <button onClick={() => setActiveTab("entry")} className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === "entry" ? "bg-white text-[#1360AB] shadow-sm" : "text-gray-600 hover:bg-gray-200"}`}>
                Check-ins
              </button>
              <button onClick={() => setActiveTab("exit")} className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === "exit" ? "bg-white text-[#1360AB] shadow-sm" : "text-gray-600 hover:bg-gray-200"}`}>
                Check-outs
              </button>
            </div>

            {filteredHistory.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaHistory className="text-gray-400 text-xl" />
                </div>
                <h3 className="text-gray-700 font-medium mb-1">No history found</h3>
                <p className="text-gray-500 text-sm">There are no {activeTab !== "all" ? (activeTab === "entry" ? "check-in" : "check-out") : ""} records to display.</p>
              </div>
            ) : (
              <div className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredHistory.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`p-1.5 rounded-md ${item.type === "entry" ? "bg-green-100" : "bg-blue-100"} mr-2`}>{item.type === "entry" ? <FaSignInAlt className={`text-green-600 text-sm`} /> : <FaSignOutAlt className={`text-blue-600 text-sm`} />}</div>
                              <span className="text-sm font-medium text-gray-700">{item.type === "entry" ? "Check-in" : "Check-out"}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.location}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-700">
                              <FaCalendarAlt className="text-gray-400 mr-2 text-xs" />
                              {formatDate(item.timestamp)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-700">
                              <FaClock className="text-gray-400 mr-2 text-xs" />
                              {formatTime(item.timestamp)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Mobile view for history - only visible on smaller screens */}
            <div className="lg:hidden mt-4 space-y-3">
              {filteredHistory.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className={`p-1.5 rounded-md ${item.type === "entry" ? "bg-green-100" : "bg-blue-100"} mr-2`}>{item.type === "entry" ? <FaSignInAlt className={`text-green-600 text-sm`} /> : <FaSignOutAlt className={`text-blue-600 text-sm`} />}</div>
                      <span className="text-sm font-medium text-gray-700">{item.type === "entry" ? "Check-in" : "Check-out"}</span>
                    </div>
                    <span className="text-xs text-gray-500">{item.location}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center">
                      <FaCalendarAlt className="mr-1" />
                      {formatDate(item.timestamp)}
                    </div>
                    <div className="flex items-center">
                      <FaClock className="mr-1" />
                      {formatTime(item.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Security
