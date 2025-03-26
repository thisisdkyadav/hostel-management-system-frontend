export const filterVisitors = (visitors, filterStatus, filterDate, searchTerm) => {
  if (!visitors) return []
  return visitors.filter((visitor) => {
    if (filterStatus !== "all" && visitor.status !== filterStatus) {
      return false
    }
    // DateTime:"2025-03-20T13:43:40.247Z " sample date in visitor.DateTime
    const visitorDate = new Date(visitor.DateTime).toISOString().split("T")[0]
    if (filterDate && visitorDate !== filterDate) {
      return false
    }
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return visitor?.name?.toLowerCase().includes(searchLower) || visitor?.phone?.includes(searchLower) || visitor?.roomNumber?.toLowerCase().includes(searchLower)
    }

    return true
  })
}

export const getVisitorStatusColor = (status) => {
  switch (status) {
    case "Checked In":
      return "bg-green-100 text-green-700"
    case "Checked Out":
      return "bg-gray-100 text-gray-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}
