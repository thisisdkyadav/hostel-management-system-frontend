import React, { useState, useEffect } from "react"
import { FaQrcode, FaRegKeyboard, FaHistory, FaInfoCircle } from "react-icons/fa"
import StudentEntryTable from "../../components/guard/StudentEntryTable"
import { securityApi } from "../../services/apiService"
import NewEntryForm from "../../components/guard/NewEntryForm"
import QRScanner from "../../components/guard/QRScanner"
import { useSecurity } from "../../contexts/SecurityProvider"

const AddStudentEntry = () => {
  const { securityInfo } = useSecurity()
  const [activeTab, setActiveTab] = useState("manual")
  const [entries, setEntries] = useState([])
  const [scannedStudent, setScannedStudent] = useState(null)

  const fetchRecentEntries = async () => {
    try {
      const data = await securityApi.getRecentStudentEntries()
      console.log(data, "Recent Entries from API")
      setEntries(data)
    } catch (error) {
      console.error("Error fetching recent entries:", error)
    }
  }

  useEffect(() => {
    fetchRecentEntries()
  }, [])

  const handleAddEntry = async (newEntry) => {
    try {
      const entryToAdd = {
        ...newEntry,
        hostelId: securityInfo?.hostelId?._id,
      }

      const response = await securityApi.addStudentEntry(entryToAdd)
      if (response.success) {
        fetchRecentEntries()
        return true
      }
    } catch (error) {
      alert(error.message || "Failed to add student entry")
      return false
    }
  }

  const handleQRScanSuccess = (student) => {
    setScannedStudent(student)
  }

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8 bg-[#EFF3F4]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Student Entry Management</h1>
          <p className="text-gray-600">Record student check-ins and check-outs using the form or QR scanner.</p>
        </div>

        <div className="mb-6 bg-blue-50 p-4 rounded-lg border-l-4 border-[#1360AB] flex items-start">
          <FaInfoCircle className="text-[#1360AB] mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-700 font-medium mb-1">Two ways to record student entries:</p>
            <ul className="text-sm text-gray-600 list-disc list-inside">
              <li>Scan student QR codes for quick verification</li>
              <li>Manually enter student details</li>
            </ul>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 bg-white p-1 rounded-lg shadow-sm">
          <button onClick={() => setActiveTab("qr")} className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center ${activeTab === "qr" ? "bg-[#E4F1FF] text-[#1360AB]" : "text-gray-600 hover:bg-gray-100"}`}>
            <FaQrcode className="mr-2" /> QR Scanner
          </button>
          <button onClick={() => setActiveTab("manual")} className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center ${activeTab === "manual" ? "bg-[#E4F1FF] text-[#1360AB]" : "text-gray-600 hover:bg-gray-100"}`}>
            <FaRegKeyboard className="mr-2" /> Manual Entry
          </button>
        </div>

        {/* Content based on active tab */}
        <div className="mb-8">
          {activeTab === "qr" ? (
            <QRScanner onScanSuccess={handleQRScanSuccess} />
          ) : (
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="p-2.5 mr-3 rounded-xl bg-blue-100 text-[#1360AB]">
                  <FaRegKeyboard size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Manual Entry Form</h2>
              </div>
              <NewEntryForm onAddEntry={handleAddEntry} />
            </div>
          )}
        </div>

        {/* Recent entries section */}
        <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="p-2.5 mr-3 rounded-xl bg-blue-100 text-[#1360AB]">
              <FaHistory size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Recent Entry Records</h2>
          </div>
          <StudentEntryTable entries={entries} refresh={fetchRecentEntries} />
        </div>
      </div>
    </div>
  )
}

export default AddStudentEntry
