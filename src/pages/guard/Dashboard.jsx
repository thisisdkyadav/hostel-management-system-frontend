import DashboardHeader from "../../components/guard/DashboardHeader"
import AddStudentEntry from "./AddStudentEntry"

const Dashboard = () => {
  return (
    <div className="flex-1 h-screen overflow-auto p-6">
      <DashboardHeader />

      <AddStudentEntry />
    </div>
  )
}

export default Dashboard
