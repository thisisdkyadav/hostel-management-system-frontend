/**
 * Gymkhana Dashboard Page
 * Overview for GS/President with pending items and quick actions
 */

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "czero/react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/layout"
import { Badge, StatCard, StatCards } from "@/components/ui/data-display"
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/feedback"
import { CalendarDays, FileText, Clock, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/AuthProvider"
import gymkhanaEventsApi from "@/service/modules/gymkhanaEvents.api"

const DashboardPage = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [stats, setStats] = useState({
        totalEvents: 0,
        pendingProposals: 0,
        upcomingEvents: 0,
        currentCalendar: null,
    })

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            setLoading(true)
            setError(null)

            // Fetch academic years and pending proposals in parallel
            const [calendarsRes, pendingRes] = await Promise.all([
                gymkhanaEventsApi.getAcademicYears(),
                gymkhanaEventsApi.getPendingProposals(21),
            ])

            // Get current year's calendar details
            const yearsList = calendarsRes.data?.years || calendarsRes.years || []
            const currentYear = yearsList[0]
            let currentCalendar = null
            let totalEvents = 0
            if (currentYear?.academicYear) {
                try {
                    const calendarRes = await gymkhanaEventsApi.getCalendarByYear(currentYear.academicYear)
                    currentCalendar = calendarRes.data?.calendar || calendarRes.calendar || null
                    totalEvents = currentCalendar?.events?.length || 0
                } catch (err) {
                    if (err.status !== 404) {
                        throw err
                    }
                }
            }

            setStats({
                totalEvents,
                pendingProposals: pendingRes.data?.events?.length || pendingRes.events?.length || 0,
                upcomingEvents: 0, // Would need events query
                currentCalendar,
            })
        } catch (err) {
            setError(err.message || "Failed to load dashboard data")
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <LoadingState message="Loading dashboard..." />
    }

    if (error) {
        return <ErrorState message={error} onRetry={fetchDashboardData} />
    }

    const isGS = user?.subRole === "GS Gymkhana"
    const isPresident = user?.subRole === "President Gymkhana"

    return (
        <div style={{ padding: "var(--spacing-6)" }}>
            {/* Header */}
            <div style={{ marginBottom: "var(--spacing-6)" }}>
                <h1 style={{
                    fontSize: "var(--font-size-2xl)",
                    fontWeight: "var(--font-weight-semibold)",
                    color: "var(--color-text-heading)",
                    marginBottom: "var(--spacing-2)"
                }}>
                    Welcome, {user?.name || "Gymkhana Member"}
                </h1>
                <p style={{ color: "var(--color-text-muted)" }}>
                    {user?.subRole || "Gymkhana"} Dashboard
                </p>
            </div>

            {/* Stats */}
            <StatCards
                stats={[
                    {
                        title: "Academic Year",
                        value: stats.currentCalendar?.academicYear || "—",
                        icon: <CalendarDays />,
                        color: "var(--color-primary)",
                    },
                    {
                        title: "Calendar Status",
                        value: stats.currentCalendar?.status?.replace(/_/g, " ") || "No Calendar",
                        icon: <FileText />,
                        color: stats.currentCalendar?.isLocked ? "var(--color-warning)" : "var(--color-success)",
                    },
                    {
                        title: "Pending Proposals",
                        value: stats.pendingProposals,
                        icon: <Clock />,
                        color: stats.pendingProposals > 0 ? "var(--color-warning)" : "var(--color-success)",
                    },
                    {
                        title: "Upcoming Events",
                        value: stats.upcomingEvents,
                        icon: <CalendarDays />,
                        color: "var(--color-info)",
                    },
                ]}
                columns={4}
            />

            {/* Quick Actions */}
            <Card style={{ marginTop: "var(--spacing-6)" }}>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div style={{ display: "flex", gap: "var(--spacing-3)", flexWrap: "wrap" }}>
                        <Button onClick={() => navigate("/gymkhana/events")}>
                            <CalendarDays size={16} style={{ marginRight: "8px" }} />
                            View Events Calendar
                        </Button>

                        {(isGS || isPresident) && stats.pendingProposals > 0 && (
                            <Button variant="secondary" onClick={() => navigate("/gymkhana/events")}>
                                <AlertCircle size={16} style={{ marginRight: "8px" }} />
                                Pending Proposals ({stats.pendingProposals})
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Calendar Lock Status */}
            {stats.currentCalendar && (
                <Card style={{ marginTop: "var(--spacing-4)" }}>
                    <CardContent>
                        <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-3)" }}>
                            <span style={{ color: "var(--color-text-body)" }}>
                                Calendar {stats.currentCalendar.academicYear}:
                            </span>
                            <Badge variant={stats.currentCalendar.isLocked ? "warning" : "success"}>
                                {stats.currentCalendar.isLocked ? "Locked" : "Editable"}
                            </Badge>
                            {stats.currentCalendar.isLocked && isGS && (
                                <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                                    Request amendments through the Events page
                                </span>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

export default DashboardPage
