import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Page } from "hzero"
import { CalendarCheck, ClipboardList, Radio } from "lucide-react"
import PageHeader from "../../components/common/PageHeader"
import DiningInsights from "@/components/dining/admin-insights/DiningInsights"
import { greetingFor } from "@/components/dining/caterer/dashboard/dashboardHelpers"
import { diningOfficeApi } from "../../service"
import { queryKeys } from "@/lib/query"
import { useAuth } from "@/contexts/AuthProvider"

const REFRESH_MS = 60_000

/**
 * Dining Office (wardens and hall supervisors): the same one-screen dining view as the
 * admin Dining dashboard, with shortcuts to every caterer's meal records and live scans.
 */
const DashboardPage = () => {
  const { user } = useAuth()
  // Pending rebates and billing for the ribbon; the dashboard still works without them.
  const officeQuery = useQuery({
    queryKey: queryKeys.diningOffice.dashboard(),
    queryFn: () => diningOfficeApi.getDashboard(),
    refetchInterval: REFRESH_MS,
    refetchOnWindowFocus: false,
    retry: 1,
  })
  const firstName = String(user?.name || "").trim().split(/\s+/)[0]

  return (
    <Page>
      <PageHeader title="Dining" subtitle={`${greetingFor(new Date().getHours() * 60 + new Date().getMinutes())}${firstName ? `, ${firstName}` : ""}`}>
        <div className="dxi-office-actions">
          <Link to="/dining-office/daily-meals" className="dxi-office-link">
            <CalendarCheck size={16} aria-hidden="true" /> Daily meals
          </Link>
          <Link to="/dining-office/meal-records" className="dxi-office-link">
            <ClipboardList size={16} aria-hidden="true" /> Meal records
          </Link>
          <Link to="/dining-office/live" className="dxi-office-link" data-live>
            <span className="dxi-office-pulse" aria-hidden="true" />
            <Radio size={16} aria-hidden="true" /> Watch live
          </Link>
        </div>
      </PageHeader>

      <Page.Body padded={false} className="p-[var(--spacing-5)] dxi-body">
        <DiningInsights basePath="/dining-office" billing={officeQuery.data?.billing} rebates={officeQuery.data?.rebates} />
      </Page.Body>
    </Page>
  )
}

export default DashboardPage
