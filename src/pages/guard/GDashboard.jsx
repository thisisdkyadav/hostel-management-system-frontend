import React, { useState } from "react"
import Sidebar from "../../components/guard/Sidebar"
import DashboardHeader from "../../components/guard/DashboardHeader"
import NewEntryForm from "../../components/guard/NewEntryForm"
import EntriesTable from "../../components/guard/EntriesTable"
import ViewMoreSection from "../../components/guard/ViewMoreSection"
import { useSecurity } from "../../contexts/SecurityProvider"

const Dashboard = () => {
  const { securityInfo = {} } = useSecurity()

  const [showViewMore, setShowViewMore] = useState(false)
  const [entries, setEntries] = useState([
    { id: 1, name: "Raj Kumar", room: "106 E1", time: "10:00 PM", date: "2025-03-20", status: "Checked Out" },
    { id: 2, name: "Ankit Singh", room: "203 B2", time: "09:15 PM", date: "2025-03-20", status: "Checked Out" },
    { id: 3, name: "Priya Sharma", room: "112 E1", time: "11:30 PM", date: "2025-03-20", status: "Checked In" },
    { id: 4, name: "Vikram Patel", room: "305 C3", time: "08:45 PM", date: "2025-03-20", status: "Checked Out" },
    { id: 5, name: "Neha Gupta", room: "217 D2", time: "10:20 PM", date: "2025-03-20", status: "Checked In" },
  ])

  const toggleViewMore = () => {
    setShowViewMore(!showViewMore)
  }

  const addEntry = (newEntry) => {
    setEntries([...entries, { ...newEntry, id: entries.length + 1 }])
  }

  const deleteEntry = (id) => {
    setEntries(entries.filter((entry) => entry.id !== id))
  }

  return (
    <div className="flex-1 h-screen overflow-auto p-6">
      <DashboardHeader />

      <NewEntryForm onAddEntry={addEntry} />

      <EntriesTable entries={entries} toggleViewMore={toggleViewMore} />

      {showViewMore && <ViewMoreSection entries={entries} onDelete={deleteEntry} />}
    </div>
  )
}

export default Dashboard
