import PageHeader from "../common/PageHeader"

const DashboardHeader = ({ title = "Admin Dashboard", children }) => {
  return (
    <PageHeader title={title}>
      {children}
    </PageHeader>
  )
}

export default DashboardHeader
