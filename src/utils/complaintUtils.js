export const getPrintableComplaintData = (complaint) => ({
  title: complaint.title,
  category: complaint.category,
  date: new Date(complaint.date).toLocaleDateString(),
  description: complaint.description,
  location: complaint.location,
  status: complaint.status,
  priority: complaint.priority,
});