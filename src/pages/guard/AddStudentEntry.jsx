import React, { useState, useEffect } from "react"
import StudentEntryTable from "../../components/guard/StudentEntryTable"
import { securityApi } from "../../services/apiService"
import NewEntryForm from "../../components/guard/NewEntryForm"
import { useSecurity } from "../../contexts/SecurityProvider"

const AddStudentEntry = () => {
  const { securityInfo } = useSecurity()

  const [entries, setEntries] = useState([])

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

  return (
    <div className="flex-1 px-10 pb-6 bg-[#EFF3F4]">
      <div className="mt-8">
        {/* <StudentEntryForm onAddEntry={handleAddEntry} /> */}
        <NewEntryForm onAddEntry={handleAddEntry} />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4 px-3">Recent Entry Records</h2>
        <StudentEntryTable entries={entries} refresh={fetchRecentEntries} />
      </div>
    </div>
  )
}

export default AddStudentEntry
