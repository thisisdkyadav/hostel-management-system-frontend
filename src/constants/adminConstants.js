export const WARDEN_FILTER_TABS = [
  { label: "All Wardens", value: "all", color: "[#1360AB]" },
  { label: "Active", value: "active", color: "green-500" },
  { label: "Unassigned", value: "unassigned", color: "orange-500" },
  { label: "Inactive", value: "inactive", color: "gray-500" },
]

{
  /* <div className="flex space-x-4">
<button onClick={() => setFilterStatus("all")} className={`px-4 py-2 rounded-xl ${filterStatus === "all" ? "bg-[#1360AB] text-white" : "bg-white"}`}>
  All
</button>
<button onClick={() => setFilterStatus("Pending")} className={`px-4 py-2 rounded-xl ${filterStatus === "Pending" ? "bg-blue-500 text-white" : "bg-white"}`}>
  Pending
</button>
<button onClick={() => setFilterStatus("In Progress")} className={`px-4 py-2 rounded-xl ${filterStatus === "In Progress" ? "bg-yellow-500 text-white" : "bg-white"}`}>
  In Progress
</button>
<button onClick={() => setFilterStatus("Resolved")} className={`px-4 py-2 rounded-xl ${filterStatus === "Resolved" ? "bg-green-500 text-white" : "bg-white"}`}>
  Resolved
</button>
<button onClick={() => setFilterStatus("Closed")} className={`px-4 py-2 rounded-xl ${filterStatus === "Closed" ? "bg-gray-500 text-white" : "bg-white"}`}>
  Closed
</button>
</div>  */
}

export const COMPLAINT_FILTER_TABS = [
  { label: "All Complaints", value: "all", color: "[#1360AB]" },
  { label: "Pending", value: "Pending", color: "[#1360AB]" },
  { label: "In Progress", value: "In Progress", color: "[#1360AB]" },
  { label: "Resolved", value: "Resolved", color: "[#1360AB]" },
]

export const HOSTEL_FILTER_TABS = [
  { label: "All Hostels", value: "all", color: "[#1360AB]" },
  { label: "Boys", value: "boys", color: "[#1360AB]" },
  { label: "Girls", value: "girls", color: "[#1360AB]" },
  { label: "Special", value: "special", color: "[#1360AB]" },
]
