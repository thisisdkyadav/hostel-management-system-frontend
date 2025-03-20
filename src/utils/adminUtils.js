export const filterWardens = (wardens, filterStatus, searchTerm) => {
  return wardens
    .filter((warden) => {
      if (filterStatus === "all") return true
      return warden.status === filterStatus
    })
    .filter((warden) => {
      return warden.name.toLowerCase().includes(searchTerm.toLowerCase()) || (warden.department && warden.department.toLowerCase().includes(searchTerm.toLowerCase())) || (warden.hostelAssigned && warden.hostelAssigned.toLowerCase().includes(searchTerm.toLowerCase()))
    })
}

export const filterStudents = (students, selectedHostel, selectedYear, selectedDepartment, selectedStatus, selectedGender, searchTerm, sortField, sortDirection) => {
  if (!students) return []
  return students
    .filter((student) => {
      return (
        (selectedHostel === "" || student.hostel === selectedHostel) &&
        (selectedYear === "" || student.year === selectedYear) &&
        (selectedDepartment === "" || student.department === selectedDepartment) &&
        (selectedStatus === "" || student.status === selectedStatus) &&
        (selectedGender === "" || student.gender === selectedGender) &&
        (searchTerm === "" || student.name.toLowerCase().includes(searchTerm.toLowerCase()) || student.id.toLowerCase().includes(searchTerm.toLowerCase()) || student.department.toLowerCase().includes(searchTerm.toLowerCase()) || student.email.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    })
    .sort((a, b) => {
      if (sortDirection === "asc") {
        return a[sortField].localeCompare(b[sortField])
      } else {
        return b[sortField].localeCompare(a[sortField])
      }
    })
}

export const filterHostels = (hostels, activeTab, searchTerm) => {
  if (!hostels) return []
  return hostels
    .filter((hostel) => {
      if (activeTab === "all") return true
      return hostel.gender.toLowerCase() === activeTab
    })
    .filter((hostel) => hostel.name.toLowerCase().includes(searchTerm.toLowerCase()))
}

export const filterComplaints = (complaints, filterStatus, filterPriority, filterCategory, filterHostel, searchTerm) => {
  if (!filterStatus && !filterPriority && !filterCategory && !filterHostel && !searchTerm) return complaints
  if (!complaints) return []
  return complaints.filter((complaint) => {
    if (filterStatus !== "all" && complaint.status !== filterStatus) return false
    if (filterPriority !== "all" && complaint.priority !== filterPriority) return false
    if (filterCategory !== "all" && complaint.category !== filterCategory) return false
    if (filterHostel !== "all" && complaint.hostel !== filterHostel) return false

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return complaint.title.toLowerCase().includes(searchLower) || complaint.id.toLowerCase().includes(searchLower) || complaint.roomNumber.toLowerCase().includes(searchLower) || complaint.reportedBy.name.toLowerCase().includes(searchLower)
    }
    return true
  })
}

export const filterSecurity = (securityStaff, filterStatus, searchTerm) => {
  return securityStaff
    .filter((staff) => {
      if (filterStatus === "assigned") return staff.hostelId
      if (filterStatus === "unassigned") return !staff.hostelId
      return true // "all" filter
    })
    .filter((staff) => {
      const searchLower = searchTerm.toLowerCase()
      return staff.name.toLowerCase().includes(searchLower) || (staff.email && staff.email.toLowerCase().includes(searchLower))
    })
}

export const getTimeSince = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
  } else {
    return "Just now"
  }
}

export const getStatusColor = (status) => {
  switch (status) {
    case "Pending":
      return "bg-blue-100 text-blue-700"
    case "In Progress":
      return "bg-yellow-100 text-yellow-700"
    case "Resolved":
      return "bg-green-100 text-green-700"
    case "Closed":
      return "bg-gray-100 text-gray-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

export const getPriorityColor = (priority) => {
  switch (priority) {
    case "Low":
      return "bg-green-100 text-green-700"
    case "Medium":
      return "bg-yellow-100 text-yellow-700"
    case "High":
      return "bg-red-100 text-red-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}
